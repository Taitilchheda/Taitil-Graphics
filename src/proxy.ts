// Edge middleware (Next 16 calls this "proxy"). Adds CSRF protection +
// security headers to every request. Runs before route handlers, so
// route handlers don't need to repeat the boilerplate — they can trust
// the request is genuine (or the CSRF check returned 403 already).
//
// Caveat: this runs on the Edge runtime and can't import Prisma (Node
// only). For endpoints that need both CSRF + auth (e.g. checkout), we
// still do auth in the route handler; the proxy only does the cheap
// origin/CSRF check. This keeps the edge bundle tiny.

import { NextResponse, type NextRequest } from 'next/server'
import {
  applySecurityHeaders,
  csrfCookieName,
  csrfHeaderName,
  generateCsrfToken,
  isBearerAuthenticated,
} from '@/lib/csrf'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Public paths that don't need auth/CSRF. Most of /api/admin/* and
// /api/account/* require a session; auth/login and auth/register are
// the entry points and don't need CSRF (no cookie exists yet).
// Public read paths (/api/products, /api/categories) are GET only so
// they're already exempt from CSRF.
const CSRF_EXEMPT_PATHS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/otp/send',
  '/api/auth/otp/verify',
  '/api/auth/csrf',
  // Analytics is fire-and-forget; blocking it would break event tracking
  // for anonymous visitors (no CSRF cookie yet). Risk is bounded: the
  // endpoint only writes rows to a log table.
  '/api/analytics',
]

const isExempt = (pathname: string) => CSRF_EXEMPT_PATHS.some((p) => pathname.startsWith(p))

export const config = {
  // Match everything except Next internals + static assets.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|woff2)).*)'],
}

// Next 16 expects the exported function to be named `proxy`. We also
// export `middleware` for back-compat with any tooling that still
// reads the old name.
export const proxy = (request: NextRequest) => {
  const { pathname } = request.nextUrl
  const isApi = pathname.startsWith('/api/')
  const method = request.method
  const isStateChanging = !SAFE_METHODS.has(method)

  // 1. Issue a CSRF cookie on any /api/* request so the client has a
  //    token to send back on its next state-changing call. We previously
  //    only set this on safe methods, which meant the first state-changing
  //    POST (e.g. /api/leads from a Buy Now button) had no token to read.
  //    Issuing the cookie up front on every API request keeps the cookie
  //    reachable without weakening the header check below.
  let response = NextResponse.next()
  if (isApi && !request.cookies.has(csrfCookieName)) {
    const token = generateCsrfToken()
    response.cookies.set(csrfCookieName, token, {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
  }

  // 2. CSRF enforcement on state-changing API calls (except exempt).
  //    Bearer-authenticated requests are also exempt: the JWT is the
  //    CSRF check in that case (see lib/csrf.ts:isBearerAuthenticated).
  if (isApi && isStateChanging && !isExempt(pathname) && !isBearerAuthenticated(request)) {
    const cookieToken = request.cookies.get(csrfCookieName)?.value
    const headerToken = request.headers.get(csrfHeaderName)
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      const deny = NextResponse.json(
        { error: 'CSRF token missing or invalid. Reload the page and try again.' },
        { status: 403 },
      )
      return applySecurityHeaders(deny)
    }
  }

  // 3. Security headers on every response.
  return applySecurityHeaders(response)
}

export const middleware = proxy
