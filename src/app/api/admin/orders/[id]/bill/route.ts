import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: { include: { product: true } }, address: true, user: true },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const templatePath = path.join(process.cwd(), 'templates', 'bill-template.html')
  const template = await readFile(templatePath, 'utf-8')

  const itemsHtml = order.items
    .map((item) => {
      const mrpCents = item.product?.priceCents ?? item.priceCents
      const lineTotal = item.priceCents * item.quantity
      return `
        <tr>
          <td>${escapeHtml(item.product?.name || 'Item')}</td>
          <td>${escapeHtml(item.product?.sku || '-')}</td>
          <td>${item.quantity}</td>
          <td>INR ${Math.round(mrpCents / 100).toLocaleString('en-IN')}</td>
          <td>INR ${Math.round(item.priceCents / 100).toLocaleString('en-IN')}</td>
          <td>INR ${Math.round(lineTotal / 100).toLocaleString('en-IN')}</td>
        </tr>
      `.trim()
    })
    .join('')

  const html = template
    .replace(/{{invoiceNumber}}/g, escapeHtml(`TG-${order.id.slice(0, 8).toUpperCase()}`))
    .replace(/{{orderId}}/g, escapeHtml(order.id))
    .replace(/{{invoiceDate}}/g, new Date(order.createdAt).toLocaleDateString('en-IN'))
    .replace(/{{customerName}}/g, escapeHtml(order.address?.fullName || order.user?.email || 'Customer'))
    .replace(/{{customerEmail}}/g, escapeHtml(order.user?.email || '-'))
    .replace(/{{customerPhone}}/g, escapeHtml(order.address?.phone || '-'))
    .replace(/{{shippingLine1}}/g, escapeHtml(order.address?.line1 || '-'))
    .replace(/{{shippingLine2}}/g, escapeHtml(order.address?.line2 || ''))
    .replace(/{{shippingCity}}/g, escapeHtml(order.address?.city || '-'))
    .replace(/{{shippingState}}/g, escapeHtml(order.address?.state || '-'))
    .replace(/{{shippingPostal}}/g, escapeHtml(order.address?.postal || '-'))
    .replace(/{{items}}/g, itemsHtml)
    .replace(/{{subtotal}}/g, `INR ${Math.round(order.subtotalCents / 100).toLocaleString('en-IN')}`)
    .replace(/{{gst}}/g, 'INR 0')
    .replace(/{{total}}/g, `INR ${Math.round(order.totalCents / 100).toLocaleString('en-IN')}`)
    .replace(/{{paymentMethod}}/g, escapeHtml(order.paymentProvider || 'Razorpay'))
    .replace(/{{paymentStatus}}/g, escapeHtml(order.paymentStatus))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
