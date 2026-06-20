import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

// Internal shipping label. Inlined rather than reading a template file
// because Vercel's serverless filesystem is read-only and /tmp is the
// only writable directory — keeping the template in source means we
// don't need a file lookup at request time.

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const resolveSender = () => ({
  name: process.env.SENDER_NAME || 'Taitil Graphics',
  line1: process.env.SENDER_LINE1 || 'Main Studio',
  line2: process.env.SENDER_LINE2 || 'Printing & Decor',
  city: process.env.SENDER_CITY || 'Mumbai',
  state: process.env.SENDER_STATE || 'MH',
  postal: process.env.SENDER_POSTAL || '400001',
  phone: process.env.SENDER_PHONE || '+91 7666247666',
})

const renderLabelHtml = (params: {
  fromName: string
  fromAddressLine1: string
  fromAddressLine2: string
  fromCity: string
  fromState: string
  fromPostal: string
  fromPhone: string
  toName: string
  toAddressLine1: string
  toAddressLine2: string
  toCity: string
  toState: string
  toPostal: string
  toPhone: string
  orderId: string
  itemSummary: string
  barcode: string
}) => `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Shipping label ${escapeHtml(params.orderId)}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #111; }
      .label { max-width: 720px; margin: 0 auto; border: 2px solid #111; padding: 24px; border-radius: 8px; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
      .section h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 8px; color: #555; }
      .section .name { font-size: 18px; font-weight: 700; }
      .section .addr { font-size: 14px; line-height: 1.4; white-space: pre-line; }
      .meta { margin-top: 24px; padding-top: 16px; border-top: 1px dashed #999; display: flex; justify-content: space-between; font-size: 12px; color: #555; }
      .barcode { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-size: 16px; letter-spacing: 0.4em; }
    </style>
  </head>
  <body>
    <div class="label">
      <div class="row">
        <div class="section">
          <h2>From</h2>
          <div class="name">${escapeHtml(params.fromName)}</div>
          <div class="addr">${escapeHtml(params.fromAddressLine1)}
${escapeHtml(params.fromAddressLine2)}
${escapeHtml(params.fromCity)}, ${escapeHtml(params.fromState)} ${escapeHtml(params.fromPostal)}
${escapeHtml(params.fromPhone)}</div>
        </div>
        <div class="section">
          <h2>Ship to</h2>
          <div class="name">${escapeHtml(params.toName)}</div>
          <div class="addr">${escapeHtml(params.toAddressLine1)}
${escapeHtml(params.toAddressLine2)}
${escapeHtml(params.toCity)}, ${escapeHtml(params.toState)} ${escapeHtml(params.toPostal)}
${escapeHtml(params.toPhone)}</div>
        </div>
      </div>
      <div class="meta">
        <span>Order ${escapeHtml(params.orderId)}</span>
        <span>${escapeHtml(params.itemSummary)}</span>
        <span class="barcode">${escapeHtml(params.barcode)}</span>
      </div>
    </div>
  </body>
</html>`

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, address: true, user: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const sender = resolveSender()
  const itemSummary = order.items
    .map((item) => `${item.product?.name || 'Item'} x ${item.quantity}`)
    .join(', ')

  const html = renderLabelHtml({
    fromName: sender.name,
    fromAddressLine1: sender.line1,
    fromAddressLine2: sender.line2,
    fromCity: sender.city,
    fromState: sender.state,
    fromPostal: sender.postal,
    fromPhone: sender.phone,
    toName: order.address?.fullName || order.user?.email || 'Customer',
    toAddressLine1: order.address?.line1 || '-',
    toAddressLine2: order.address?.line2 || '',
    toCity: order.address?.city || '-',
    toState: order.address?.state || '-',
    toPostal: order.address?.postal || '-',
    toPhone: order.address?.phone || '-',
    orderId: order.id,
    itemSummary: itemSummary || '-',
    barcode: `ORDER-${order.id.slice(0, 10).toUpperCase()}`,
  })

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}