import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signAuthToken } from '@/lib/auth-token'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { registerSchema, otpVerifySchema } from '@/lib/validators'
import { verifyOtp } from '@/lib/otp'

const BCRYPT_COST = 12

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`otp-verify:${ip}`, RATE_LIMITS.otpVerify.limit, RATE_LIMITS.otpVerify.windowMs)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // 1. Validate the core OTP fields
  const otpParsed = otpVerifySchema.safeParse(body)
  if (!otpParsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: otpParsed.error.issues },
      { status: 400 },
    )
  }
  const { phone, code, purpose } = otpParsed.data

  // 2. For signup, also validate the registration fields
  let registrationData: z.infer<typeof registerSchema> | null = null
  if (purpose === 'register') {
    const regParsed = registerSchema.safeParse(body)
    if (!regParsed.success) {
      return NextResponse.json(
        { error: 'Invalid registration', issues: regParsed.error.issues },
        { status: 400 },
      )
    }
    registrationData = regParsed.data
  }

  // 3. Verify the code against the local OtpCode store
  const verifyResult = await verifyOtp({ phone, code, purpose })
  if (!verifyResult.ok) {
    if (verifyResult.reason === 'too-many-attempts') {
      return NextResponse.json(
        { error: 'Too many attempts. Request a new code.' },
        { status: 429 },
      )
    }
    if (verifyResult.reason === 'expired') {
      return NextResponse.json(
        { error: 'OTP expired. Request a new one.' },
        { status: 401 },
      )
    }
    if (verifyResult.reason === 'db-error') {
      return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Invalid OTP code.' }, { status: 401 })
  }

  // 4. Look up or create the user
  const userEmail = registrationData?.email ?? `${phone.replace(/\D/g, '')}@phone.taitil.graphics`
  let user = await prisma.user.findFirst({
    where: { OR: [{ email: userEmail }, { phone }] },
  })

  if (!user) {
    if (purpose !== 'register' && !registrationData) {
      return NextResponse.json(
        { error: 'Account not found. Please sign up first.' },
        { status: 404 },
      )
    }
    const passwordHash = registrationData?.password
      ? await bcrypt.hash(registrationData.password, BCRYPT_COST)
      : null
    user = await prisma.user.create({
      data: {
        email: userEmail,
        name: registrationData?.name ?? null,
        phone,
        password: passwordHash,
        role: 'CUSTOMER',
      },
    })
  } else {
    // If the user was created by phone-only and is now signing in
    // with a full registration, fill in missing fields.
    const updates: Record<string, unknown> = {}
    if (registrationData?.name && !user.name) updates.name = registrationData.name
    if (registrationData?.password && !user.password) {
      updates.password = await bcrypt.hash(registrationData.password, BCRYPT_COST)
    }
    if (!user.phone) updates.phone = phone
    if (Object.keys(updates).length > 0) {
      user = await prisma.user.update({ where: { id: user.id }, data: updates })
    }
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
  })
}
