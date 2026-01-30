import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit'
import { sendTransactionalEmail, emailTemplates } from '@/lib/mailer'
import { requireAuth } from '@/lib/server-auth'
import { getRazorpay } from '@/lib/razorpay'

const refundSchema = z.object({
  orderId: z.string().min(1),
  amountCents: z.number().int().min(1).optional(),
})

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json()
  const parsed = refundSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid refund payload' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId }, include: { user: true } })
  if (!order || !order.razorpayPaymentId) {
    return NextResponse.json({ error: 'Order not eligible for refund' }, { status: 400 })
  }

  const refund = await getRazorpay().payments.refund(order.razorpayPaymentId, {
    amount: parsed.data.amountCents ?? order.totalCents,
  })

  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: 'REFUNDED',
      refundedAt: new Date(),
      refundId: refund.id,
    },
  })

  await logAdminAction(auth.id, 'refund', order.id, { refundId: refund.id, amountCents: parsed.data.amountCents ?? order.totalCents })
  if (order.user?.email) {
    const template = emailTemplates.refundCompleted(order.user?.name || order.user?.email, order.id)
    await sendTransactionalEmail(order.user.email, 'refund-completed', template.subject, template.html, order.id)
  }

  return NextResponse.json({ ok: true, refundId: refund.id })
}
