import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { prisma } from '@/lib/prisma'
import { signAuthToken } from '@/lib/auth-token'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'Missing idToken' }, { status: 400 })
    }

    const decoded = await adminAuth().verifyIdToken(idToken)
    const email = decoded.email?.toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'Email not available' }, { status: 400 })
    }

    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: decoded.name || null,
          phone: decoded.phone_number || null,
          role: Role.CUSTOMER,
        },
      })
    } else if (decoded.phone_number && user.phone !== decoded.phone_number) {
      user = await prisma.user.update({
        where: { email },
        data: { phone: decoded.phone_number },
      })
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
        emailVerified: decoded.email_verified,
      },
      token,
    })
  } catch (error) {
    console.error('Firebase session error', error)
    return NextResponse.json({ error: 'Unable to verify token' }, { status: 401 })
  }
}
