import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 400 })
  }

  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (expected != signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(body)
  const event = payload.event

  if (event == 'payment.captured') {
    const orderId = payload.payload.payment?.entity?.order_id
    if (orderId) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          razorpayPaymentId: payload.payload.payment.entity.id,
          paidAt: new Date(),
        },
      })
    }
  }

  if (event == 'refund.processed') {
    const paymentId = payload.payload.refund?.entity?.payment_id
    if (paymentId) {
      await prisma.order.updateMany({
        where: { razorpayPaymentId: paymentId },
        data: {
          paymentStatus: 'REFUNDED',
          refundedAt: new Date(),
          refundId: payload.payload.refund.entity.id,
        },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
