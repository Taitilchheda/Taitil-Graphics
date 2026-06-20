import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth, invalidateUserSessions } from '@/lib/server-auth'

// Account deletion: requires the user to type the literal word "DELETE"
// in the body as a soft confirmation. This isn't strong protection
// (the user is already authenticated), but it stops casual API hits
// from accidentally nuking the account.
const deleteSchema = z.object({
  confirm: z.literal('DELETE'),
  password: z.string().min(1).max(200),
})

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => null)
  const parsed = deleteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Confirmation phrase and password are required.' },
      { status: 400 },
    )
  }

  // Re-verify password before destructive action.
  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: { password: true },
  })
  if (!user?.password) {
    return NextResponse.json({ error: 'No password on file to verify against.' }, { status: 400 })
  }
  // We only support bcrypt'd passwords here; plaintext legacy passwords
  // can be migrated by the user via the password-change flow first.
  if (!user.password.startsWith('$2')) {
    return NextResponse.json(
      { error: 'Set a password via the change-password flow first.' },
      { status: 400 },
    )
  }
  const bcrypt = await import('bcryptjs')
  const ok = await bcrypt.compare(parsed.data.password, user.password)
  if (!ok) {
    return NextResponse.json({ error: 'Password is incorrect.' }, { status: 401 })
  }

  // Soft-cascade: delete related rows that aren't set to cascade in the
  // schema (Cart, CartItem, Order, OrderItem, Review, Address, AdminAudit).
  // We use a transaction so the delete is atomic.
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { cart: { userId: auth.id } } }),
    prisma.cart.deleteMany({ where: { userId: auth.id } }),
    prisma.orderItem.deleteMany({ where: { order: { userId: auth.id } } }),
    prisma.order.deleteMany({ where: { userId: auth.id } }),
    prisma.review.deleteMany({ where: { userId: auth.id } }),
    prisma.address.deleteMany({ where: { userId: auth.id } }),
    prisma.adminAudit.deleteMany({ where: { adminId: auth.id } }),
    prisma.user.delete({ where: { id: auth.id } }),
  ])

  return NextResponse.json({ ok: true })
}
