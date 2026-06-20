import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { readFile } from 'node:fs/promises'
import path from 'node:path'


const gstRatePercent = Number(process.env.GST_RATE_PERCENT || 18)
const getTaxSplit = (subtotalCents: number, existingTaxCents: number, isIntra: boolean) => {
  const baseTax = existingTaxCents > 0
    ? existingTaxCents
    : Math.round((subtotalCents * gstRatePercent) / (100 + gstRatePercent))
  const cgst = isIntra ? Math.round(baseTax / 2) : 0
  const sgst = isIntra ? baseTax - cgst : 0
  const igst = isIntra ? 0 : baseTax
  return { cgst, sgst, igst, totalTax: baseTax }
}

const sellerInfo = {
  name: process.env.SELLER_NAME || 'Taitil Graphics',
  tagline: process.env.SELLER_TAGLINE || 'Studio-grade printing & celebration decor',
  gstin: process.env.SELLER_GSTIN || '',
  address: process.env.SELLER_ADDRESS || '',
  cityState: process.env.SELLER_CITY_STATE || '',
  contact: process.env.SELLER_CONTACT || '',
  logoUrl: process.env.SELLER_LOGO_URL || '/logo.svg',
}
const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } }, address: true, user: true },
  })

  if (!order || order.userId !== auth.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const sellerState = (process.env.SELLER_STATE || process.env.DELHIVERY_PICKUP_STATE || '').trim().toLowerCase()
  const customerState = (order.address?.state || '').trim().toLowerCase()
  const isIntra = sellerState && customerState ? sellerState == customerState : true
  const tax = getTaxSplit(order.subtotalCents || 0, order.taxCents || 0, isIntra)
  const taxableCents = Math.max(0, (order.subtotalCents || 0) - tax.totalTax)
  const gstRate = Number(process.env.GST_RATE_PERCENT || 18)
  const cgstRate = tax.cgst > 0 ? (gstRate / 2) : 0
  const sgstRate = tax.sgst > 0 ? (gstRate / 2) : 0
  const igstRate = tax.igst > 0 ? gstRate : 0

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
    .replace(/{{sellerName}}/g, escapeHtml(sellerInfo.name))
    .replace(/{{sellerTagline}}/g, escapeHtml(sellerInfo.tagline))
    .replace(/{{sellerGstin}}/g, escapeHtml(sellerInfo.gstin || '-'))
    .replace(/{{sellerAddress}}/g, escapeHtml(sellerInfo.address || '-'))
    .replace(/{{sellerCityState}}/g, escapeHtml(sellerInfo.cityState || '-'))
    .replace(/{{sellerContact}}/g, escapeHtml(sellerInfo.contact || '-'))
    .replace(/{{logoUrl}}/g, escapeHtml(sellerInfo.logoUrl))
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
    .replace(/{{taxable}}/g, `INR ${Math.round(taxableCents / 100).toLocaleString('en-IN')}`)
    .replace(/{{cgstRate}}/g, cgstRate.toFixed(2))
    .replace(/{{sgstRate}}/g, sgstRate.toFixed(2))
    .replace(/{{igstRate}}/g, igstRate.toFixed(2))
    .replace(/{{cgst}}/g, `INR ${Math.round(tax.cgst / 100).toLocaleString('en-IN')}`)
    .replace(/{{sgst}}/g, `INR ${Math.round(tax.sgst / 100).toLocaleString('en-IN')}`)
    .replace(/{{igst}}/g, `INR ${Math.round(tax.igst / 100).toLocaleString('en-IN')}`)
    .replace(/{{total}}/g, `INR ${Math.round(order.totalCents / 100).toLocaleString('en-IN')}`)
    .replace(/{{paymentMethod}}/g, escapeHtml('Manual / WhatsApp'))
    .replace(/{{paymentStatus}}/g, escapeHtml(order.paymentStatus))

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
