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

// getAuthUser returns the authenticated user, or null if the request
// has no/invalid token. We also reject tokens issued before the user's
// sessionInvalidatedAt timestamp — that's how logout, password change,
// and admin force-revoke invalidate sessions without tracking each
// one in a database.
export const getAuthUser = async (request: Request): Promise<AuthUser | null> => {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.replace('Bearer ', '').trim()
  if (!token) return null

  try {
    const payload = verifyAuthToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        sessionInvalidatedAt: true,
      },
    })
    if (!user || user.email !== payload.email) {
      return null
    }
    // Reject if the token was issued at or before the session was
    // invalidated. We compare seconds because that's JWT's resolution.
    if (
      user.sessionInvalidatedAt &&
      payload.iat &&
      Math.floor(user.sessionInvalidatedAt.getTime() / 1000) >= payload.iat
    ) {
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

export const requireAdmin = async (request: Request) => {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  return user
}

// Bump sessionInvalidatedAt to invalidate all existing tokens for the
// user. Call on logout, password change, or admin force-revoke.
export const invalidateUserSessions = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionInvalidatedAt: new Date() },
  })
}