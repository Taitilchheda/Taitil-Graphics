import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveHsnCode } from '@/lib/hsn'
import { requireAuth } from '@/lib/server-auth'

const safe = (value: string | number | null | undefined) => {
  if (value == null) return ''
  const text = String(value).replace(/\r?\n/g, ' ').trim()
  if (text.includes(',') || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const url = new URL(request.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const paidOnly = url.searchParams.get('paidOnly') !== 'false'
  const physicalOnly = url.searchParams.get('physicalOnly') !== 'false'
  const gstRatePercent = Number(process.env.GST_RATE_PERCENT || '18')

  const sellerState = (process.env.SELLER_STATE || process.env.DELHIVERY_PICKUP_STATE || '').trim().toLowerCase()
  const sellerGstin = process.env.SELLER_GSTIN || ''

  const where: any = {}
  if (paidOnly) {
    where.paymentStatus = 'PAID'
  }
  if (from || to) {
    where.createdAt = {}
    if (from) {
      const fromDate = new Date(from)
      fromDate.setHours(0, 0, 0, 0)
      where.createdAt.gte = fromDate
    }
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      user: true,
      address: true,
      items: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const header = [
    'Invoice No',
    'Invoice Date',
    'Order ID',
    'Customer Name',
    'Customer Email',
    'Customer Phone',
    'Customer State',
    'Customer GSTIN',
    'Seller GSTIN',
    'SKU',
    'Product',
    'HSN',
    'Quantity',
    'Taxable Value',
    'CGST',
    'SGST',
    'IGST',
    'Total',
    'Payment Status',
  ]

  const rows: string[] = []
  rows.push(header.map(safe).join(','))

  for (const order of orders) {
    const orderSubtotal = order.subtotalCents || 0
    const orderTax = order.taxCents && order.taxCents > 0
      ? order.taxCents
      : Math.round((orderSubtotal * gstRatePercent) / (100 + gstRatePercent))
    const customerState = order.address?.state || ''
    const isIntra = sellerState && customerState
      ? customerState.trim().toLowerCase() === sellerState
      : true

    for (const item of order.items) {
      if (physicalOnly && item.product?.type && item.product.type !== 'PHYSICAL') {
        continue
      }
      const lineBase = item.priceCents * item.quantity
      const share = orderSubtotal > 0 ? lineBase / orderSubtotal : 0
      const lineTax = Math.round(orderTax * share)
      const taxable = Math.max(0, lineBase - lineTax)
      const cgst = isIntra ? Math.round(lineTax / 2) : 0
      const sgst = isIntra ? lineTax - cgst : 0
      const igst = isIntra ? 0 : lineTax
      const total = lineBase

      rows.push([
        order.id,
        new Date(order.createdAt).toLocaleDateString('en-IN'),
        order.id,
        order.address?.fullName || order.user?.email || 'Customer',
        order.user?.email || '',
        order.address?.phone || order.user?.phone || '',
        customerState,
        order.address?.gstNumber || order.user?.gstNumber || '',
        sellerGstin,
        item.product?.sku || '',
        item.product?.name || '',
        item.product?.hsnCode || resolveHsnCode({
          categoryId: item.product?.categoryId,
          subcategoryId: item.product?.subcategoryId || undefined,
          name: item.product?.name,
        }) || '',
        item.quantity,
        (taxable / 100).toFixed(2),
        (cgst / 100).toFixed(2),
        (sgst / 100).toFixed(2),
        (igst / 100).toFixed(2),
        (total / 100).toFixed(2),
        order.paymentStatus,
      ].map(safe).join(','))
    }
  }

  const csv = rows.join('\n')
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename=\"taitil-gst-orders.csv\"',
      'X-Row-Count': String(Math.max(0, rows.length - 1)),
      'X-Orders-Count': String(orders.length),
    },
  })
}
