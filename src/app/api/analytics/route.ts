import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { analyticsEventSchema } from '@/lib/validators'

// Analytics accepts lowercase enum values from the client (matching
// the existing event names in the codebase) and translates to the
// uppercase stored values.
const clientEventSchema = analyticsEventSchema.extend({
  type: z.enum(['CLICK', 'VIEW', 'INQUIRY', 'CART', 'SALE', 'INVENTORY', 'PRODUCT_ADDED']),
})

const payloadSchema = z.union([
  clientEventSchema,
  z.object({ events: z.array(clientEventSchema).min(1).max(100) }),
])

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const limit = rateLimit(`analytics:${ip}`, RATE_LIMITS.analytics.limit, RATE_LIMITS.analytics.windowMs)
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = payloadSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid analytics payload', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const events = 'events' in parsed.data ? parsed.data.events : [parsed.data]

  try {
    await prisma.analyticsEvent.createMany({
      data: events.map((event) => ({
        type: event.type,
        productId: event.productId ?? null,
        categoryId: event.categoryId ?? null,
        subcategoryId: event.subcategoryId ?? null,
        label: event.label ?? null,
        quantity: event.quantity ?? null,
        value: event.value ?? null,
      })),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Analytics POST error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Stub GET so prefetch/probe requests (link previews, status checkers, etc.)
// don't return 405. Real analytics data is not exposed via GET.
export async function GET() {
  return new NextResponse(null, { status: 204 })
}
