import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuthToken } from '@/lib/auth-token'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || ''
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyAuthToken(token)
    const { email, otp } = await request.json()
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const normalizedEmail = String(email).toLowerCase()
    if (payload.email !== normalizedEmail) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
    }

    const baseUrl = process.env.OTP_SERVICE_URL
    if (!baseUrl) {
      return NextResponse.json({ error: 'OTP service not configured' }, { status: 500 })
    }

    const verifyResponse = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, otp }),
    })

    if (!verifyResponse.ok) {
      const text = await verifyResponse.text()
      return NextResponse.json({ error: 'Invalid OTP', detail: text }, { status: 401 })
    }

    await prisma.user.delete({ where: { email: normalizedEmail } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Account delete error', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
