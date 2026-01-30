import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rate-limit'
import { signAuthToken } from '@/lib/auth-token'
import { verifyOtpToken } from '@/lib/otp-token'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.ip || 'unknown'
    const limit = rateLimit(`register:${ip}`, 3, 60 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }
    const { email, password, name, phone, address, isBusiness, businessName, gstNumber, otpToken } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taitil.graphics'
    const normalizedEmail = String(email || '').trim().toLowerCase()
    if (normalizedEmail === adminEmail) {
      return NextResponse.json({ error: 'Admin cannot be registered here' }, { status: 400 })
    }

    if (!otpToken) {
      return NextResponse.json({ error: 'OTP verification required' }, { status: 400 })
    }


    let otpPayload
    try {
      otpPayload = verifyOtpToken(otpToken)
    } catch {
      return NextResponse.json({ error: 'Invalid OTP token' }, { status: 400 })
    }

    if (otpPayload.purpose !== 'register' || otpPayload.email !== normalizedEmail) {
      return NextResponse.json({ error: 'OTP verification failed' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        name,
        phone: phone || null,
        address: address || null,
        isBusiness: Boolean(isBusiness),
        businessName: isBusiness ? businessName || null : null,
        gstNumber: isBusiness ? gstNumber || null : null,
        role: Role.CUSTOMER,
      },
    })

    const token = signAuthToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role === Role.ADMIN ? 'admin' : 'customer',
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role === Role.ADMIN ? 'admin' : 'customer',
        phone: newUser.phone,
        address: newUser.address,
        isBusiness: newUser.isBusiness,
        businessName: newUser.businessName,
        gstNumber: newUser.gstNumber,
      },
      token,
      message: 'Registration successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
