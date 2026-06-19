import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { requestDelhiveryPickup } from '@/lib/delhivery'

const schema = z.object({
  orderId: z.string().min(1),
})

const renderTemplate = (template: string, data: Record<string, string>) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '')

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
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (!order.trackingId) {
    return NextResponse.json({ error: 'No tracking ID for order' }, { status: 400 })
  }

  const pickupDate = new Date().toISOString().split('T')[0]
  const fallbackPayload = {
    pickup_location: process.env.DELHIVERY_PICKUP_NAME || 'Taitil Graphics',
    pickup_date: pickupDate,
    pickup_time: process.env.DELHIVERY_PICKUP_TIME || '10:00-18:00',
    expected_package_count: order.items.length,
    waybill: order.trackingId,
  }

  let pickupPayload: Record<string, unknown> = fallbackPayload
  const template = process.env.DELHIVERY_PICKUP_TEMPLATE_JSON
  if (template) {
    const rendered = renderTemplate(template, {
      orderId: order.id,
      waybill: order.trackingId,
      pickupDate,
      packages: String(order.items.length),
    })
    try {
      pickupPayload = JSON.parse(rendered)
    } catch {
      pickupPayload = fallbackPayload
    }
  }

  try {
    const response = await requestDelhiveryPickup(pickupPayload)
    const pickupId =
      response?.pickup_id ||
      response?.request_id ||
      response?.data?.pickup_id ||
      response?.data?.request_id ||
      order.pickupRequestId

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        pickupRequestId: pickupId ? String(pickupId) : order.pickupRequestId,
        shippingStatus: 'PICKUP_REQUESTED',
        trackingHistory: response,
        shipmentUpdatedAt: new Date(),
      },
    })

    return NextResponse.json({ order: updated, pickup: response })
  } catch (error: any) {
    await prisma.order.update({
      where: { id: order.id },
      data: { shippingError: error?.message || 'Pickup request error' },
    })
    return NextResponse.json({ error: error?.message || 'Pickup request error' }, { status: 500 })
  }
}
