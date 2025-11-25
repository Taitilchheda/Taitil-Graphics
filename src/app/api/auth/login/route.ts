import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taitil.graphics'
    const adminPassword = process.env.ADMIN_PASSWORD || 'Taitil@Admin2024'

    // Ensure admin exists and is up to date
    let user = await prisma.user.findUnique({ where: { email } })
    if (email === adminEmail && password === adminPassword) {
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
          where: { email },
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

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role === Role.ADMIN ? 'admin' : 'customer',
        phone: user.phone,
      },
      message: 'Login successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
