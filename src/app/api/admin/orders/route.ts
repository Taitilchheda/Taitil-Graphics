import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { jsonWithCache } from '@/lib/response-cache'
import { logAdminAction } from '@/lib/audit'
import { requireAuth } from '@/lib/server-auth'

const updateSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
})

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      items: { include: { product: true } },
      address: true,
      user: true,
    },
  })

  return jsonWithCache({ orders }, { seconds: 15 })
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json()
  const parsed = updateSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status payload' }, { status: 400 })
  }

  const updated = await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
    include: { user: true },
  })

  await logAdminAction(auth.id, 'order-status', updated.id, { status: parsed.data.status })

  // Note: emails and shipping notifications are no longer automated.
  // Admin should call the customer from /admin/orders to share status.
  return NextResponse.json({ order: updated })
}