import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { trackDelhiveryShipment, getTrackingUrl } from '@/lib/delhivery'

const schema = z.object({
  orderId: z.string().min(1),
})

const inferStatus = (payload: any) => {
  const status =
    payload?.ShipmentData?.[0]?.Shipment?.Status?.Status ||
    payload?.ShipmentData?.[0]?.Shipment?.Status?.StatusCode ||
    payload?.status ||
    payload?.Status ||
    ''
  return String(status || '').toUpperCase()
}

const mapOrderStatus = (shippingStatus: string) => {
  if (shippingStatus.includes('DELIVERED')) return 'DELIVERED'
  if (shippingStatus.includes('OUT') || shippingStatus.includes('IN TRANSIT') || shippingStatus.includes('DISPATCH')) return 'SHIPPED'
  return undefined
}

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
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  if (!order.trackingId) {
    return NextResponse.json({ error: 'No tracking ID for order' }, { status: 400 })
  }

  try {
    const tracking = await trackDelhiveryShipment(order.trackingId)
    const shippingStatus = inferStatus(tracking)
    const orderStatus = mapOrderStatus(shippingStatus)

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        shippingStatus: shippingStatus || order.shippingStatus,
        trackingHistory: tracking,
        trackingUrl: order.trackingId ? getTrackingUrl(order.trackingId) : order.trackingUrl,
        shipmentUpdatedAt: new Date(),
        ...(orderStatus ? { status: orderStatus } : {}),
      },
    })

    return NextResponse.json({ order: updated, tracking })
  } catch (error: any) {
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingError: error?.message || 'Tracking error' },
    })
    return NextResponse.json({ error: error?.message || 'Tracking error' }, { status: 500 })
  }
}
