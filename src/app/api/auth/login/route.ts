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
    const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
    }
    const { email, password, otpToken } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taitil.graphics'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Taitil@Admin2024'

    const normalizedEmail = String(email || "").trim().toLowerCase()
    const isAdminEmail = normalizedEmail === adminEmail
    const isAdminLogin = isAdminEmail && password === adminPassword

    if (!isAdminEmail && !password) {
      if (!otpToken) {
        return NextResponse.json({ error: 'OTP verification required' }, { status: 400 })
      }
      let otpPayload
      try {
        otpPayload = verifyOtpToken(otpToken)
      } catch {
        return NextResponse.json({ error: 'Invalid OTP token' }, { status: 400 })
      }
      if (otpPayload.purpose !== 'login' || otpPayload.email !== normalizedEmail) {
        return NextResponse.json({ error: 'OTP verification failed' }, { status: 400 })
      }
    }

    // Ensure admin exists and is up to date
    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (isAdminLogin) {
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: adminEmail,
            password: adminPassword,
            name: 'Administrator',
            role: Role.ADMIN,
          },
        })
      } else if (user.role !== Role.ADMIN || user.password !== adminPassword) {
        user = await prisma.user.update({
          where: { email: normalizedEmail },
          data: {
            role: Role.ADMIN,
            password: adminPassword,
            name: user.name || 'Administrator',
          },
        })
      }
    }

    if (!user || !user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    let valid = false
    if (user.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password)
    } else {
      valid = user.password === password
    }
    if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role: user.role === Role.ADMIN ? 'admin' : 'customer',
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role === Role.ADMIN ? 'admin' : 'customer',
        phone: user.phone,
        address: user.address,
        isBusiness: user.isBusiness,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
      },
      token,
      message: 'Login successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
