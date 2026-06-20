import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { getAuthUser } from '@/lib/server-auth'
import { env } from '@/lib/env'
import { buildWhatsAppLink } from '@/lib/whatsapp'

// Checkout is now a "request a call back" / quote flow. Payment + shipping
// are handled manually after we get in touch. We persist the enquiry as
// a Lead so admin can pick it up from /admin/leads.
const checkoutSchema = z.object({
  address: z.object({
    fullName: z.string().min(2).max(120),
    line1: z.string().min(2).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    postal: z.string().min(4).max(12),
    phone: z.string().min(7).max(20),
  }),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1).max(1000),
      }),
    )
    .min(1)
    .max(50),
  notes: z.string().max(1000).optional(),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limit = rateLimit(`checkout:${ip}`, 10, 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const auth = await getAuthUser(request)

  const body = await request.json().catch(() => null)
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid checkout payload', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { address, items, notes } = parsed.data
  const productIds = items.map((item) => item.id)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 })
  }

  const stockMap = new Map(products.map((product) => [product.id, product.stock]))
  for (const item of items) {
    const stock = stockMap.get(item.id)
    if (stock != null && stock < item.quantity) {
      return NextResponse.json({ error: 'Insufficient stock for one or more items' }, { status: 409 })
    }
  }

  const summary = items
    .map((item) => {
      const p = products.find((pp) => pp.id === item.id)
      return `${p?.name || 'Item'} x ${item.quantity}`
    })
    .join(', ')

  const phoneDigits = address.phone.replace(/\D/g, '')

  // Create one Lead per enquiry. This is what admin reviews in /admin/leads.
  const lead = await prisma.lead.create({
    data: {
      name: address.fullName,
      phone: phoneDigits,
      email: auth?.email ?? null,
      subject: `Quote request: ${items.length} item(s)`,
      message: [
        `Address: ${address.line1}${address.line2 ? ', ' + address.line2 : ''}, ${address.city}, ${address.state} ${address.postal}`,
        `Items: ${summary}`,
        notes ? `Notes: ${notes}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
      requirement: summary,
      source: 'checkout',
      status: 'NEW',
    },
  })

  // Record analytics. No transaction needed — single document.
  await prisma.analyticsEvent.create({
    data: {
      type: 'INQUIRY',
      label: 'checkout-lead',
    },
  })

  const waMessage = encodeURIComponent(
    `Hi Taitil Graphics, I'd like to order:\n${summary}\n\nMy name is ${address.fullName} (${address.phone}). Please call me back to confirm.`,
  )
  const whatsappUrl = `https://wa.me/${env.whatsappNumber}?text=${waMessage}`

  return NextResponse.json({
    leadId: lead.id,
    whatsappUrl,
    message: "We've recorded your request. Tap the WhatsApp button to send us a message — we'll call you back to confirm pricing and arrange delivery.",
  })
}

// Back-compat alias for any callers expecting a builder helper.
export const buildCheckoutWhatsAppLink = buildWhatsAppLink