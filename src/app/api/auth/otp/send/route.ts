import { NextResponse } from 'next/server'
import { otpSendSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { sendOtp, isOtpDevFallback } from '@/lib/otp'

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

  // The OTP_SERVICE_URL upstream has been unreliable; we now generate
  // the code locally and log it. The env var is left in place so a real
  // provider can be re-pointed here later.
  if (process.env.OTP_SERVICE_URL && process.env.NODE_ENV === 'production') {
    console.warn(
      '[otp/send] OTP_SERVICE_URL is set but unused — local generator is active. ' +
        'Set OTP_DEV_FALLBACK=false and rewire sendOtp in src/lib/otp.ts to re-enable the upstream.',
    )
  }

  const result = await sendOtp({ phone, purpose })
  if (!result.ok) {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }

  const devFallback = isOtpDevFallback()
  return NextResponse.json({
    ok: true,
    // Echo the code back in dev/fallback mode so the dev UI can show it.
    // Never returned in production unless OTP_DEV_FALLBACK is explicitly on.
    devCode: devFallback ? result.code : undefined,
    message: devFallback
      ? 'OTP generated. Check the server console (or the dev code above) to read it.'
      : 'OTP sent.',
  })
}
