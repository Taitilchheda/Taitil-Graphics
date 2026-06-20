import { NextResponse } from 'next/server'
import { otpSendSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`otp-send:${ip}`, RATE_LIMITS.otpSend.limit, RATE_LIMITS.otpSend.windowMs)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many OTP requests. Try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = otpSendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const { phone, purpose } = parsed.data

  // Per-phone rate limit on top of the per-IP limit.
  const phoneLimit = rateLimit(`otp-send:${phone}`, 3, 5 * 60 * 1000)
  if (!phoneLimit.ok) {
    return NextResponse.json({ error: 'Too many OTP requests for this number.' }, { status: 429 })
  }

  const baseUrl = process.env.OTP_SERVICE_URL
  if (!baseUrl) {
    return NextResponse.json({ error: 'OTP service not configured' }, { status: 500 })
  }

  try {
    const response = await fetch(`${baseUrl}/api/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        type: 'numeric',
        organization: 'Taitil Graphics',
        subject: purpose === 'register' ? 'Verify your phone to create an account' : 'Your Taitil Graphics login code',
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('OTP service error', text)
      return NextResponse.json({ error: 'OTP service error' }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('OTP send error', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
