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

const resolveSender = () => ({
  name: process.env.SENDER_NAME || 'Taitil Graphics',
  line1: process.env.SENDER_LINE1 || 'Main Studio',
  line2: process.env.SENDER_LINE2 || 'Printing & Decor',
  city: process.env.SENDER_CITY || 'Mumbai',
  state: process.env.SENDER_STATE || 'MH',
  postal: process.env.SENDER_POSTAL || '400001',
  phone: process.env.SENDER_PHONE || '+91 7666247666',
})

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

  const templatePath = path.join(process.cwd(), 'templates', 'label-template.html')
  const template = await readFile(templatePath, 'utf-8')
  const sender = resolveSender()

  const itemSummary = order.items
    .map((item) => `${item.product?.name || 'Item'} x ${item.quantity}`)
    .join(', ')

  const html = template
    .replace(/{{fromName}}/g, escapeHtml(sender.name))
    .replace(/{{fromAddressLine1}}/g, escapeHtml(sender.line1))
    .replace(/{{fromAddressLine2}}/g, escapeHtml(sender.line2))
    .replace(/{{fromCity}}/g, escapeHtml(sender.city))
    .replace(/{{fromState}}/g, escapeHtml(sender.state))
    .replace(/{{fromPostal}}/g, escapeHtml(sender.postal))
    .replace(/{{fromPhone}}/g, escapeHtml(sender.phone))
    .replace(/{{toName}}/g, escapeHtml(order.address?.fullName || order.user?.email || 'Customer'))
    .replace(/{{toAddressLine1}}/g, escapeHtml(order.address?.line1 || '-'))
    .replace(/{{toAddressLine2}}/g, escapeHtml(order.address?.line2 || ''))
    .replace(/{{toCity}}/g, escapeHtml(order.address?.city || '-'))
    .replace(/{{toState}}/g, escapeHtml(order.address?.state || '-'))
    .replace(/{{toPostal}}/g, escapeHtml(order.address?.postal || '-'))
    .replace(/{{toPhone}}/g, escapeHtml(order.address?.phone || '-'))
    .replace(/{{orderId}}/g, escapeHtml(order.id))
    .replace(/{{itemSummary}}/g, escapeHtml(itemSummary || '-'))
    .replace(/{{barcode}}/g, escapeHtml(`ORDER-${order.id.slice(0, 10).toUpperCase()}`))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
