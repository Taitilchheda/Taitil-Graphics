import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

const buildDailySeries = (days: number) => {
  const today = new Date()
  const series: { date: string; views: number; clicks: number; inquiries: number; orders: number; revenueCents: number; refunds: number; refundCents: number; unitsSold: number }[] = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    series.push({
      date: key,
      views: 0,
      clicks: 0,
      inquiries: 0,
      orders: 0,
      revenueCents: 0,
      refunds: 0,
      refundCents: 0,
      unitsSold: 0,
    })
  }
  return series
}

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 29)
  startDate.setHours(0, 0, 0, 0)

  const [ordersCount, paidOrders, refundedOrders, eventTotals, eventGroups, recentEvents, recentOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      where: { paymentStatus: 'PAID' },
      include: { items: true },
    }),
    prisma.order.findMany({
      where: { paymentStatus: 'REFUNDED' },
      select: { totalCents: true, refundedAt: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['type'],
      _count: { _all: true },
    }),
    prisma.analyticsEvent.groupBy({
      by: ['productId', 'type'],
      where: { productId: { not: null } },
      _count: { _all: true },
    }),
    prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: startDate } },
      select: { type: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: startDate } },
      include: { items: true },
    }),
  ])

  const totalsByType = eventTotals.reduce<Record<string, number>>((acc, entry) => {
    acc[entry.type] = entry._count._all
    return acc
  }, {})

  const unitsSoldByProduct: Record<string, { units: number; revenueCents: number }> = {}
  let revenueCents = 0

  paidOrders.forEach((order) => {
    order.items.forEach((item) => {
      revenueCents += item.priceCents * item.quantity
      unitsSoldByProduct[item.productId] ??= { units: 0, revenueCents: 0 }
      unitsSoldByProduct[item.productId].units += item.quantity
      unitsSoldByProduct[item.productId].revenueCents += item.priceCents * item.quantity
    })
  })

  const refundCents = refundedOrders.reduce((sum, order) => sum + order.totalCents, 0)

  const statsMap: Record<string, {
    productId: string
    views: number
    clicks: number
    inquiries: number
    unitsSold: number
    revenueCents: number
  }> = {}

  eventGroups.forEach((entry) => {
    if (!entry.productId) return
    const key = entry.productId
    statsMap[key] ??= {
      productId: key,
      views: 0,
      clicks: 0,
      inquiries: 0,
      unitsSold: 0,
      revenueCents: 0,
    }

    if (entry.type === 'VIEW') statsMap[key].views += entry._count._all
    if (entry.type === 'CLICK') statsMap[key].clicks += entry._count._all
    if (entry.type === 'INQUIRY') statsMap[key].inquiries += entry._count._all
  })

  Object.entries(unitsSoldByProduct).forEach(([productId, data]) => {
    statsMap[productId] ??= {
      productId,
      views: 0,
      clicks: 0,
      inquiries: 0,
      unitsSold: 0,
      revenueCents: 0,
    }
    statsMap[productId].unitsSold = data.units
    statsMap[productId].revenueCents = data.revenueCents
  })

  const productStats = Object.values(statsMap).sort(
    (a, b) => b.unitsSold + b.clicks + b.views - (a.unitsSold + a.clicks + a.views)
  )

  const daily = buildDailySeries(30)
  const dailyMap = daily.reduce<Record<string, typeof daily[number]>>((acc, entry) => {
    acc[entry.date] = entry
    return acc
  }, {})

  recentEvents.forEach((event) => {
    const key = event.createdAt.toISOString().slice(0, 10)
    const bucket = dailyMap[key]
    if (!bucket) return
    if (event.type === 'VIEW') bucket.views += 1
    if (event.type === 'CLICK') bucket.clicks += 1
    if (event.type === 'INQUIRY') bucket.inquiries += 1
  })

  recentOrders.forEach((order) => {
    const key = order.createdAt.toISOString().slice(0, 10)
    const bucket = dailyMap[key]
    if (!bucket) return
    bucket.orders += 1
    order.items.forEach((item) => {
      bucket.unitsSold += item.quantity
      bucket.revenueCents += item.priceCents * item.quantity
    })
  })

  refundedOrders.forEach((order) => {
    if (!order.refundedAt) return
    const key = order.refundedAt.toISOString().slice(0, 10)
    const bucket = dailyMap[key]
    if (!bucket) return
    bucket.refunds += 1
    bucket.refundCents += order.totalCents
  })

  return NextResponse.json({
    totals: {
      view: totalsByType.VIEW ?? 0,
      click: totalsByType.CLICK ?? 0,
      inquiry: totalsByType.INQUIRY ?? 0,
      cart: totalsByType.CART ?? 0,
      sale: totalsByType.SALE ?? 0,
      inventory: totalsByType.INVENTORY ?? 0,
      productAdded: totalsByType.PRODUCT_ADDED ?? 0,
      orders: ordersCount,
      paidOrders: paidOrders.length,
      revenueCents,
      refunds: refundedOrders.length,
      refundCents,
    },
    productStats,
    timeSeries: daily,
  })
}
