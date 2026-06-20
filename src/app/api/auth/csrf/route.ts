// CSRF token endpoint. Returns the current token from the cookie, or
// issues a new one if none exists. The client calls this on app boot
// to seed its in-memory copy of the token, then sends it as the
// `x-csrf-token` header on every state-changing request.
//
// In practice the middleware also sets the cookie on any safe API
// request, so most UIs never need to call this directly. We expose it
// as a public endpoint anyway so client apps can refresh the token
// at any time.

import { NextResponse } from 'next/server'
import { csrfCookieName, generateCsrfToken } from '@/lib/csrf'

export async function GET() {
  const token = generateCsrfToken()
  const response = NextResponse.json({ token })
  response.cookies.set(csrfCookieName, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })
  return response
}
