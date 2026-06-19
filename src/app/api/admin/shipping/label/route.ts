import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { fetchDelhiveryLabel } from '@/lib/delhivery'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }
  if (!order.trackingId) {
    return NextResponse.json({ error: 'No tracking ID for order' }, { status: 400 })
  }

  try {
    const label = await fetchDelhiveryLabel(order.trackingId)
    return new NextResponse(Buffer.from(label.buffer), {
      headers: {
        'Content-Type': label.contentType,
        'Content-Disposition': `inline; filename="label-${order.trackingId}.pdf"`,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch label' }, { status: 500 })
  }
}
