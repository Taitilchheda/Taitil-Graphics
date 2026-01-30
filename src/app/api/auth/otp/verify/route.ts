import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signAuthToken } from '@/lib/auth-token'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const { email, otp, name, phone, address, isBusiness, businessName, gstNumber, password, purpose } = await request.json()
    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    let passwordHash: string | null = null
    if (password) {
      if (String(password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      passwordHash = await bcrypt.hash(String(password), 10)
    }

    const baseUrl = process.env.OTP_SERVICE_URL
    if (!baseUrl) {
      return NextResponse.json({ error: 'OTP service not configured' }, { status: 500 })
    }

    const verifyResponse = await fetch(`${baseUrl}/api/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    })

    if (!verifyResponse.ok) {
      const text = await verifyResponse.text()
      return NextResponse.json({ error: 'Invalid OTP', detail: text }, { status: 401 })
    }

    const normalizedEmail = String(email).toLowerCase()

    const flow = purpose === 'signup' ? 'signup' : 'login'

    let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      if (flow === 'login') {
        return NextResponse.json({ error: 'Account not found. Please create a new account.' }, { status: 404 })
      }
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: name || null,
          phone: phone || null,
          address: address || null,
          isBusiness: Boolean(isBusiness),
          businessName: businessName || null,
          gstNumber: gstNumber || null,
          role: Role.CUSTOMER,
          password: passwordHash || null,
        },
      })
    } else {
      if (flow === 'signup') {
        return NextResponse.json({ error: 'Account already exists. Please sign in.' }, { status: 409 })
      }
      const updates: Record<string, unknown> = {}
      if (name && !user.name) updates.name = name
      if (phone && !user.phone) updates.phone = phone
      if (address && !user.address) updates.address = address
      if (typeof isBusiness === 'boolean') updates.isBusiness = isBusiness
      if (businessName && !user.businessName) updates.businessName = businessName
      if (gstNumber && !user.gstNumber) updates.gstNumber = gstNumber
      if (passwordHash) {
        updates.password = passwordHash
      }
      if (Object.keys(updates).length > 0) {
        user = await prisma.user.update({ where: { email: normalizedEmail }, data: updates })
      }
    }

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
    })
  } catch (error) {
    console.error('OTP verify error', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
