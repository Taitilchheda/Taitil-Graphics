import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAuthToken } from '@/lib/auth-token'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Email-OTP "verify" — proxies to the upstream, then on success does
// the same user-upsert + JWT issuance as the password-login path.
//
// The upstream confirms the OTP is correct (and consumes it — single
// use). Once it returns 200, we trust the email address is owned by
// whoever is hitting this endpoint, so we either find the matching
// User row or create a fresh one with role=CUSTOMER. The seeded
// admin email (admin@taitil.graphics) is promoted to ADMIN here too
// so it works the same way the password login did.
//
// Note: we deliberately use only the email + otp in the request — no
// name/phone/etc. — because the OTP confirms the email, and the
// retailer can fill in the rest on /account or the next checkout.

const DEFAULT_ADMIN_EMAIL = 'admin@taitil.graphics'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ipLimit = rateLimit(`otp-verify-ip:${ip}`, RATE_LIMITS.otpVerify.limit, RATE_LIMITS.otpVerify.windowMs)
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((ipLimit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const email: string | undefined = body?.email
  const code: string | undefined = body?.otp
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
  }
  if (!code || typeof code !== 'string' || !/^\d{4,8}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code from the email.' }, { status: 400 })
  }

  const normalisedEmail = email.toLowerCase().trim()
  const emailLimit = rateLimit(`otp-verify-email:${normalisedEmail}`, RATE_LIMITS.otpVerify.limit, RATE_LIMITS.otpVerify.windowMs)
  if (!emailLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts for this email. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((emailLimit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const upstream = process.env.OTP_SERVICE_URL
  if (!upstream) {
    console.error('[auth/otp/verify] OTP_SERVICE_URL is not set')
    return NextResponse.json(
      { error: 'OTP service is not configured. Please contact support.' },
      { status: 500 },
    )
  }

  // 1. Ask the upstream to verify + consume the code.
  let upstreamRes: Response
  try {
    upstreamRes = await fetch(`${upstream.replace(/\/+$/, '')}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({ email: normalisedEmail, otp: code }),
    })
  } catch (err: any) {
    console.error('[auth/otp/verify] upstream error', err)
    if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'OTP service timed out. Please try again in a minute.' },
        { status: 504 },
      )
    }
    return NextResponse.json(
      { error: 'Could not reach the OTP service. Please try again later.' },
      { status: 502 },
    )
  }

  if (!upstreamRes.ok) {
    const payload = await upstreamRes.json().catch(() => ({} as any))
    // Common cases: "Invalid OTP" (wrong code / expired), "Maximum
    // attempts reached" (upstream's 3-attempt cap).
    const message = payload?.error || 'Invalid or expired OTP. Please request a new one.'
    return NextResponse.json({ error: message }, { status: 401 })
  }

  // 2. Code is valid. Upsert the User.
  const isAdminEmail = normalisedEmail === DEFAULT_ADMIN_EMAIL
  try {
    let user = await prisma.user.findUnique({ where: { email: normalisedEmail } })
    if (!user) {
      const displayName = normalisedEmail.split('@')[0]
      user = await prisma.user.create({
        data: {
          email: normalisedEmail,
          name: displayName,
          role: isAdminEmail ? 'ADMIN' : 'CUSTOMER',
          password: null,
        },
      })
    } else if (isAdminEmail && user.role !== 'ADMIN') {
      // Defensive: promote the seeded admin email if a previous test
      // run downgraded it. Same convention as the password-login path.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      })
    }

    const role: 'admin' | 'customer' = user.role === 'ADMIN' ? 'admin' : 'customer'
    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        phone: user.phone,
        address: user.address,
        isBusiness: user.isBusiness,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
      },
      token,
      message: 'Sign-in successful.',
    })
  } catch (err) {
    console.error('[auth/otp/verify] user upsert error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
