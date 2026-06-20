import { NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireAuth, invalidateUserSessions } from '@/lib/server-auth'
import { passwordChangeSchema } from '@/lib/validators'

const BCRYPT_COST = 12

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => null)
  const parsed = passwordChangeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { password: true },
  })
  if (!user?.password) {
    return NextResponse.json(
      { error: 'This account has no password set. Use the OTP flow to set one.' },
      { status: 400 },
    )
  }

  // Constant-time: always run bcrypt.
  let valid = false
  try {
    valid = await bcrypt.compare(currentPassword, user.password)
  } catch {
    valid = false
  }
  if (!valid) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST)
  await prisma.user.update({
    where: { id: auth.id },
    data: { password: passwordHash },
  })

  // Invalidate all existing sessions for this user so the change-out
  // isn't trivially bypassed by an attacker who already has a token.
  await invalidateUserSessions(auth.id)

  return NextResponse.json({ ok: true })
}
