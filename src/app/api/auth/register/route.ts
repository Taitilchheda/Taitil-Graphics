import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, address } = await request.json()

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taitil.graphics'
    if (email === adminEmail) {
      return NextResponse.json({ error: 'Admin cannot be registered here' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const hashed = await bcrypt.hash(password, 10)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name,
        phone,
        role: Role.CUSTOMER,
      },
    })

    return NextResponse.json({
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role === Role.ADMIN ? 'admin' : 'customer',
        phone: newUser.phone,
      },
      message: 'Registration successful'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
