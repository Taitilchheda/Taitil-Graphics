import { NextResponse } from 'next/server'
import { verifyAuthToken } from '@/lib/auth-token'
import { prisma } from '@/lib/prisma'

export type AuthUser = {
  id: string
  email: string
  role: 'customer' | 'admin'
  name?: string | null
  phone?: string | null
}

export const getAuthUser = async (request: Request): Promise<AuthUser | null> => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return null

  try {
    const payload = verifyAuthToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user || user.email !== payload.email) {
      return null
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role === 'ADMIN' ? 'admin' : 'customer',
      name: user.name,
      phone: user.phone,
    }
  } catch (error) {
    console.error('Auth token verification failed', error)
    return null
  }
}

export const requireAuth = async (request: Request) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return user
}
