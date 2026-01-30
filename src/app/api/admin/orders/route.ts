import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit'
import { sendTransactionalEmail, emailTemplates } from '@/lib/mailer'
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

  return NextResponse.json({ orders })
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

  await logAdminAction(auth.id, "order-status", updated.id, { status: parsed.data.status })

  if (updated.user?.email) {
    if (parsed.data.status === 'SHIPPED') {
      const template = emailTemplates.shipped(updated.user.name || updated.user.email, updated.id)
      await sendTransactionalEmail(updated.user.email, 'order-shipped', template.subject, template.html, updated.id)
    }
    if (parsed.data.status === 'DELIVERED') {
      const template = emailTemplates.delivered(updated.user.name || updated.user.email, updated.id)
      await sendTransactionalEmail(updated.user.email, 'order-delivered', template.subject, template.html, updated.id)
    }
  }

  return NextResponse.json({ order: updated })
}
