import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { createDelhiveryShipmentForOrder } from '@/lib/shipping'

const schema = z.object({
  orderId: z.string().min(1),
})

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json().catch(() => ({}))
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: { include: { product: true } }, address: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (order.paymentStatus !== 'PAID') {
    return NextResponse.json({ error: 'Order is not paid yet' }, { status: 409 })
  }

  try {
    const { response, waybill, trackingUrl } = await createDelhiveryShipmentForOrder(order)

    const updated = await prisma.order.update({
      where: { id: order.id },
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

    return NextResponse.json({ order: updated, delhivery: response })
  } catch (error: any) {
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingError: error?.message || 'Delhivery error' },
    })
    return NextResponse.json({ error: error?.message || 'Delhivery error' }, { status: 500 })
  }
}
