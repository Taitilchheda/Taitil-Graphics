import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendTransactionalEmail, emailTemplates } from '@/lib/mailer'
import { requireAuth } from '@/lib/server-auth'
import { createDelhiveryShipmentForOrder } from '@/lib/shipping'

const verifySchema = z.object({
  orderId: z.string().min(1),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
})

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const payload = await request.json()
  const parsed = verifySchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payment payload' }, { status: 400 })
  }

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Razorpay is not configured' }, { status: 500 })
  }

  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex')

  if (expected !== razorpaySignature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true, address: true },
  })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (order.userId !== auth.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (order.paymentStatus === 'PAID') {
    const template = emailTemplates.paymentConfirmed(order.user?.name || order.user?.email || 'Customer', orderId)
    if (order.user?.email) {
      await sendTransactionalEmail(order.user.email, 'payment-confirmed', template.subject, template.html, orderId)
    }
    return NextResponse.json({ ok: true })
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paymentStatus: 'PAID',
        razorpayPaymentId,
        razorpaySignature,
        paidAt: new Date(),
      },
    })

    if (!order.inventoryAdjusted) {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (product?.stock != null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: Math.max(0, product.stock - item.quantity) },
          })
        }
      }
      await tx.order.update({
        where: { id: orderId },
        data: { inventoryAdjusted: true },
      })
    }
  })

  const template = emailTemplates.paymentConfirmed(order.user?.name || order.user?.email || 'Customer', orderId)
  if (order.user?.email) {
    await sendTransactionalEmail(order.user.email, 'payment-confirmed', template.subject, template.html, orderId)
  }

  if (process.env.DELHIVERY_AUTO_SHIP === 'true') {
    try {
      const { waybill, trackingUrl, response } = await createDelhiveryShipmentForOrder(order)
      await prisma.order.update({
        where: { id: orderId },
        data: {
          shippingProvider: 'delhivery',
          shippingStatus: 'CREATED',
          trackingId: waybill,
          trackingUrl,
          trackingHistory: response,
          shippingError: null,
          shipmentCreatedAt: new Date(),
          shipmentUpdatedAt: new Date(),
        },
      })
    } catch (error: any) {
      await prisma.order.update({
        where: { id: orderId },
        data: { shippingError: error?.message || 'Delhivery error' },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
