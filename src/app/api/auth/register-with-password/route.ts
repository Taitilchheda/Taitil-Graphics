import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { signAuthToken } from '@/lib/auth-token'

// Password registration for retailers. The OTP service is offline for
// this deployment, so the OTP-based signup at /api/auth/otp/verify is
// not available. This endpoint replaces it for the customer sign-up
// flow at /auth/register.
//
// Validation: same constraints as `registerSchema` in validators.ts
// (10+ chars, mixed case, digit), plus optional business fields.

const BCRYPT_COST = 12

const registerBodySchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(200)
    .refine((p) => /[a-z]/.test(p), 'Password must contain a lowercase letter')
    .refine((p) => /[A-Z]/.test(p), 'Password must contain an uppercase letter')
    .refine((p) => /\d/.test(p), 'Password must contain a digit'),
  name: z.string().min(1).max(120).trim(),
  phone: z.string().regex(/^\+?\d{7,15}$/).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  isBusiness: z.boolean().optional().default(false),
  businessName: z.string().max(200).optional().nullable(),
  gstNumber: z.string().max(20).optional().nullable(),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`register:${ip}`, RATE_LIMITS.register.limit, RATE_LIMITS.register.windowMs)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many signups from this network. Try again later.' },
      { status: 429 },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = registerBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid signup details', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const data = parsed.data

  try {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in.' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(data.password, BCRYPT_COST)
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        password: passwordHash,
        role: 'CUSTOMER',
        isBusiness: data.isBusiness ?? false,
        businessName: data.businessName || null,
        gstNumber: data.gstNumber || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        phone: true,
        address: true,
        isBusiness: true,
        businessName: true,
        gstNumber: true,
      },
    })

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: 'customer',
    })

    return NextResponse.json({ user, token, message: 'Account created.' })
  } catch (error) {
    console.error('register-with-password error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
