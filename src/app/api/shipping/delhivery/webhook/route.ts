import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const extractWaybill = (payload: any) => {
  return (
    payload?.waybill ||
    payload?.Waybill ||
    payload?.Shipment?.Waybill ||
    payload?.ShipmentData?.[0]?.Shipment?.Waybill ||
    payload?.ShipmentData?.[0]?.Shipment?.Shipment?.Waybill ||
    null
  )
}

const extractStatus = (payload: any) => {
  return (
    payload?.status ||
    payload?.Status ||
    payload?.Shipment?.Status?.Status ||
    payload?.ShipmentData?.[0]?.Shipment?.Status?.Status ||
    payload?.ShipmentData?.[0]?.Shipment?.Status?.StatusCode ||
    null
  )
}

const mapOrderStatus = (shippingStatus: string) => {
  if (shippingStatus.includes('DELIVERED')) return 'DELIVERED'
  if (shippingStatus.includes('OUT') || shippingStatus.includes('IN TRANSIT') || shippingStatus.includes('DISPATCH')) return 'SHIPPED'
  return undefined
}

export async function POST(request: Request) {
  const secret = process.env.DELHIVERY_WEBHOOK_SECRET
  if (secret) {
    const provided = request.headers.get('x-delhivery-webhook-secret')
    if (!provided || provided !== secret) {
      return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
    }
  }

  const payload = await request.json().catch(() => ({}))
  const waybill = extractWaybill(payload)
  if (!waybill) {
    return NextResponse.json({ error: 'Missing waybill' }, { status: 400 })
  }

  const rawStatus = extractStatus(payload)
  const shippingStatus = rawStatus ? String(rawStatus).toUpperCase() : undefined
  const orderStatus = shippingStatus ? mapOrderStatus(shippingStatus) : undefined

  await prisma.order.updateMany({
    where: { trackingId: String(waybill) },
    data: {
      shippingStatus: shippingStatus || undefined,
      trackingHistory: payload,
      shipmentUpdatedAt: new Date(),
      ...(orderStatus ? { status: orderStatus } : {}),
    },
  })

  return NextResponse.json({ ok: true })
}
