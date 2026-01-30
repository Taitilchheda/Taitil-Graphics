import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, purpose } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const baseUrl = process.env.OTP_SERVICE_URL
    if (!baseUrl) {
      return NextResponse.json({ error: 'OTP service not configured' }, { status: 500 })
    }

    const response = await fetch(`${baseUrl}/api/otp/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        type: 'numeric',
        organization: 'Taitil Graphics',
        subject: purpose === 'signup' ? 'Verify your email' : 'Your login code',
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      return NextResponse.json({ error: 'OTP service error', detail: text }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('OTP send error', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}
