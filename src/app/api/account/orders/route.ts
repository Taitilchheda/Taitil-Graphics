import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) {
    return auth
  }

  const orders = await prisma.order.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      status: true,
      paymentStatus: true,
      totalCents: true,
      createdAt: true,
      shippingStatus: true,
      trackingId: true,
      trackingUrl: true,
      trackingHistory: true,
      shipmentUpdatedAt: true,
      address: true,
      items: {
        select: {
          id: true,
          quantity: true,
          priceCents: true,
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  })

  return NextResponse.json({ orders })
}
