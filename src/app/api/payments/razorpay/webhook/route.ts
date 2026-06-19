import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createDelhiveryShipmentForOrder } from '@/lib/shipping'

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
      const paymentId = payload.payload.payment.entity.id
      const order = await prisma.order.findFirst({
        where: { razorpayOrderId: orderId },
        include: { items: { include: { product: true } }, address: true, user: true },
      })

      if (order) {
        const updatedOrder = await prisma.$transaction(async (tx) => {
          const freshOrder = await tx.order.findUnique({
            where: { id: order.id },
            include: { items: true },
          })

          if (!freshOrder) {
            return null
          }

          const transitionedToPaid = freshOrder.paymentStatus !== 'PAID'
          const shouldUpdatePaymentMeta =
            transitionedToPaid ||
            !freshOrder.razorpayPaymentId ||
            !freshOrder.paidAt

          if (shouldUpdatePaymentMeta) {
            await tx.order.update({
              where: { id: freshOrder.id },
              data: {
                status: 'PAID',
                paymentStatus: 'PAID',
                razorpayPaymentId: paymentId,
                paidAt: freshOrder.paidAt || new Date(),
              },
            })
          }

          if (!freshOrder.inventoryAdjusted) {
            for (const item of freshOrder.items) {
              const product = await tx.product.findUnique({ where: { id: item.productId } })
              if (product?.stock != null) {
                await tx.product.update({
                  where: { id: item.productId },
                  data: { stock: Math.max(0, product.stock - item.quantity) },
                })
              }
            }

            await tx.order.update({
              where: { id: freshOrder.id },
              data: { inventoryAdjusted: true },
            })
          }

          return tx.order.findUnique({
            where: { id: freshOrder.id },
            include: { items: { include: { product: true } }, address: true },
          })
        })

        const autoShipEnabled = process.env.DELHIVERY_AUTO_SHIP === 'true'
        if (updatedOrder && autoShipEnabled) {
          const hasPhysical = updatedOrder.items.some((item) => item.product?.type !== 'SERVICE')
          const alreadyHasAwb = !!updatedOrder.trackingId || updatedOrder.shippingStatus === 'CREATED'

          if (hasPhysical && !alreadyHasAwb && updatedOrder.address) {
            try {
              const { response, waybill, trackingUrl } = await createDelhiveryShipmentForOrder(updatedOrder)
              await prisma.order.update({
                where: { id: updatedOrder.id },
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
                where: { id: updatedOrder.id },
                data: { shippingError: error?.message || 'Delhivery error' },
              })
            }
          }
        }
      }
    }
  }


  if (event == 'payment.failed') {
    const orderId = payload.payload.payment?.entity?.order_id
    if (orderId) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: {
          paymentStatus: 'FAILED',
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
