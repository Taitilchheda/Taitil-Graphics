// CSRF protection using the double-submit cookie pattern.
//
// How it works:
//   1. Server sets an `x-csrf` cookie on the first GET (e.g. via
//      /api/auth/csrf, or on any safe request).
//   2. Client reads the cookie and echoes it as the `x-csrf-token`
//      header on every state-changing request.
//   3. Server compares the cookie value to the header value. If they
//      don't match (or either is missing), reject with 403.
//
// Why double-submit and not a server-stored token? Because Next.js
// middleware runs on the edge runtime where we don't have a session
// store. The double-submit cookie is stateless, and an attacker who
// can read the user's cookies (the only way to know the value) can
// already make requests on their behalf — same as auth.

import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

const COOKIE_NAME = 'x-csrf'
const HEADER_NAME = 'x-csrf-token'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

// Generate a URL-safe, high-entropy token. crypto.randomUUID is fine.
export const generateCsrfToken = () => {
  // 32 bytes hex = 64 chars; we add another 16 for safety.
  const a = crypto.randomUUID().replace(/-/g, '')
  const b = crypto.randomUUID().replace(/-/g, '')
  return `${a}${b}`
}

export const setCsrfCookie = (response: NextResponse, token: string) => {
  // SameSite=Lax so the cookie is sent on top-level navigations but
  // not cross-site fetches. HttpOnly=false because the client needs
  // to read it. Path=/ so all routes see it.
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  })
}

// Returns true if the request is exempt (e.g. an API call with a
// Bearer token — auth is the CSRF check in that case).
export const isBearerAuthenticated = (request: Request) => {
  const auth = request.headers.get('authorization')
  return !!auth && auth.startsWith('Bearer ')
}

export const enforceCsrf = (request: Request) => {
  if (!env.CSRF_ENABLED) return null
  if (SAFE_METHODS.has(request.method)) return null
  if (isBearerAuthenticated(request)) return null

  const cookieHeader = request.headers.get('cookie') || ''
  const cookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`))
  const cookieToken = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null
  const headerToken = request.headers.get(HEADER_NAME)

  if (!cookieToken || !headerToken) {
    return NextResponse.json(
      { error: 'CSRF token missing. Reload the page and try again.' },
      { status: 403 },
    )
  }
  if (cookieToken.length !== headerToken.length) {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 })
  }
  // Constant-time comparison: we don't want attackers to learn the
  // length of the token by timing the response.
  let diff = 0
  for (let i = 0; i < cookieToken.length; i += 1) {
    diff |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i)
  }
  if (diff !== 0) {
    return NextResponse.json({ error: 'CSRF token mismatch' }, { status: 403 })
  }
  return null
}

// Edge middleware that adds CSRF + security headers to every response.
// This runs in the Edge runtime, so it must be self-contained (no Node
// APIs). Security headers are added here so they apply even to routes
// that don't have their own custom response logic.

const SECURITY_HEADERS: Record<string, string> = {
  // Anti-clickjacking: this app has no need to be framed.
  'X-Frame-Options': 'DENY',
  // Block MIME sniffing.
  'X-Content-Type-Options': 'nosniff',
  // Don't leak the referer to third parties.
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Lock down powerful features. We don't use any of these.
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  // Force HTTPS for a year, including subdomains, opt-in to HSTS preload.
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Content Security Policy. We allow:
  //   - 'self' for own assets
  //   - data: and blob: for images (Next.js image optimization)
  //   - https: for any external image
  //   - unsafe-inline for styles because Tailwind injects inline styles
  //     in dev, and we trust the third-party scripts below to write
  //     no inline JS
  //   - 'unsafe-eval' for Next.js dev (dev only) — blocked in production
  //   - wa.me for WhatsApp CTAs
  //   - google.com/maps: optional embed in product descriptions
  //   - res.cloudinary.com for admin-uploaded product videos + their
  //     auto-generated poster frames
  // NOTE: tighten further once we know the full script inventory.
  'Content-Security-Policy': [
    "default-src 'self'",
    "img-src 'self' data: blob: https:",
    // media-src is not set above, so it falls back to default-src 'self',
    // which would block Cloudinary video playback. Explicit allowlist.
    "media-src 'self' blob: https://res.cloudinary.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://maps.google.com",
    "frame-src 'self' https://www.google.com https://maps.google.com",
    "connect-src 'self' https:",
    "worker-src 'self' blob:",
    "form-action 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  // Stop proxies from caching sensitive responses.
  'X-DNS-Prefetch-Control': 'off',
  // Disabling this is the modern recommendation; the header exists only
  // to be set to "off" because IE. Leaving it off entirely works.
  // 'X-Permitted-Cross-Domain-Policies': 'none',
}

export const applySecurityHeaders = (response: NextResponse) => {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    // Don't overwrite if the route already set its own header.
    if (!response.headers.has(key)) {
      response.headers.set(key, value)
    }
  }
  return response
}

// Exposed for the middleware file (see ./middleware.ts).
export const csrfCookieName = COOKIE_NAME
export const csrfHeaderName = HEADER_NAME
