import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'

const eventSchema = z.object({
  type: z.enum(['click', 'view', 'inquiry', 'cart', 'sale', 'inventory', 'product-added']),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  label: z.string().optional(),
  quantity: z.number().int().optional(),
  value: z.number().int().optional(),
  meta: z.record(z.string(), z.any()).optional(),
})

const payloadSchema = z.union([
  eventSchema,
  z.object({ events: z.array(eventSchema).min(1).max(100) }),
])

const typeMap = {
  click: 'CLICK',
  view: 'VIEW',
  inquiry: 'INQUIRY',
  cart: 'CART',
  sale: 'SALE',
  inventory: 'INVENTORY',
  'product-added': 'PRODUCT_ADDED',
} as const

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const limit = rateLimit(`analytics:${ip}`, 120, 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const payload = await request.json()
    const parsed = payloadSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid analytics payload' }, { status: 400 })
    }

    const events = 'events' in parsed.data ? parsed.data.events : [parsed.data]

    await prisma.analyticsEvent.createMany({
      data: events.map((event) => ({
        type: typeMap[event.type],
        productId: event.productId ?? null,
        categoryId: event.categoryId ?? null,
        subcategoryId: event.subcategoryId ?? null,
        label: event.label ?? null,
        quantity: event.quantity ?? null,
        value: event.value ?? null,
        meta: event.meta ? (event.meta as Prisma.InputJsonValue) : undefined,
      })),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics POST error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
