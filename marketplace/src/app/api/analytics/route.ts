import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { rateLimit } from '@/lib/rate-limit'

const payloadSchema = z.object({
  type: z.enum(['click', 'view', 'inquiry', 'cart', 'sale', 'inventory', 'product-added']),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  label: z.string().optional(),
  quantity: z.number().int().optional(),
  value: z.number().int().optional(),
  meta: z.record(z.string(), z.any()).optional(),
})

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
    const limit = rateLimit(`analytics:${ip}`, 60, 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const payload = await request.json()
    const parsed = payloadSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid analytics payload' }, { status: 400 })
    }

    await prisma.analyticsEvent.create({
      data: {
        type: typeMap[parsed.data.type],
        productId: parsed.data.productId ?? null,
        categoryId: parsed.data.categoryId ?? null,
        subcategoryId: parsed.data.subcategoryId ?? null,
        label: parsed.data.label ?? null,
        quantity: parsed.data.quantity ?? null,
        value: parsed.data.value ?? null,
        meta: parsed.data.meta ? (parsed.data.meta as Prisma.InputJsonValue) : undefined,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics POST error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
