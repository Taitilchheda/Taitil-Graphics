import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

// Email-OTP "send" — proxies to the upstream
// https://github.com/sauravhathi/otp-service deployed at
// OTP_SERVICE_URL. The upstream generates the code, stores it in its
// own MongoDB, and emails it to the user. We just relay.
//
// Why proxy instead of generating locally? The upstream is what was
// working before (sender: speedjobalert2021@gmail.com). Re-implementing
// the SMTP path in this repo would mean a new Gmail app password and a
// risk of the same "intermittent upstream" issues we had earlier.
// Reusing the existing deployment is the safer bet.
//
// Threat model: we are a thin proxy. The rate limits below are
// the only thing standing between an attacker and OTP-spam. We bound
// them by IP (per-minute) and by email (per-15-min) so a single IP
// can't drain the upstream's rate budget for arbitrary addresses.

const ORG_NAME = 'Taitil Graphics'
const EMAIL_SUBJECT = 'Taitil Graphics'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ipLimit = rateLimit(`otp-send-ip:${ip}`, RATE_LIMITS.otpSend.limit, RATE_LIMITS.otpSend.windowMs)
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((ipLimit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const email: string | undefined = body?.email
  if (!email || typeof email !== 'string' || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  // Per-email cap: stops one attacker from spamming OTPs to a victim's
  // inbox. 3 per 5 min matches the upstream's MAX_ATTEMPTS=3.
  const emailLimit = rateLimit(`otp-send-email:${email.toLowerCase()}`, RATE_LIMITS.otpSend.limit, RATE_LIMITS.otpSend.windowMs)
  if (!emailLimit.ok) {
    return NextResponse.json(
      { error: 'Too many requests for this email. Please wait a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((emailLimit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const upstream = process.env.OTP_SERVICE_URL
  if (!upstream) {
    console.error('[auth/otp/send] OTP_SERVICE_URL is not set')
    return NextResponse.json(
      { error: 'OTP service is not configured. Please contact support.' },
      { status: 500 },
    )
  }

  try {
    const upstreamRes = await fetch(`${upstream.replace(/\/+$/, '')}/api/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Hard cap upstream time so a slow OTP service doesn't tie up
      // the route handler. 10s is generous — the upstream typically
      // responds in well under a second.
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        email,
        type: 'numeric',
        organization: ORG_NAME,
        subject: EMAIL_SUBJECT,
      }),
    })

    if (!upstreamRes.ok) {
      const payload = await upstreamRes.json().catch(() => ({} as any))
      // Pass through the upstream's error message if it has one — the
      // user will see something actionable ("Invalid email", "Maximum
      // attempts reached", etc.) instead of a generic 502.
      const message = payload?.error || 'Could not send the OTP. Please try again later.'
      return NextResponse.json({ error: message }, { status: upstreamRes.status === 400 ? 400 : 502 })
    }

    return NextResponse.json({ ok: true, message: 'OTP sent to your email.' })
  } catch (err: any) {
    // Network / timeout / DNS failures all land here.
    console.error('[auth/otp/send] upstream error', err)
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
}
