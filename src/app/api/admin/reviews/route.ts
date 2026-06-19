import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { logAdminAction } from '@/lib/audit'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } }, product: { select: { name: true } } },
  })

  return NextResponse.json({ reviews })
}

const updateSchema = z.object({
  id: z.string().min(1),
  response: z.string().optional(),
})

export async function PATCH(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json()
  const parsed = updateSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const trimmed = (parsed.data.response ?? '').trim()
  const updated = await prisma.review.update({
    where: { id: parsed.data.id },
    data: {
      response: trimmed || null,
      respondedAt: trimmed ? new Date() : null,
    },
  })

  await logAdminAction(auth.id, 'review-response', updated.id, { responded: !!trimmed })

  return NextResponse.json({ review: updated })
}
