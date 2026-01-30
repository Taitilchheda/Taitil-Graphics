import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'

const leadSchema = z.object({
  productId: z.string().optional(),
  name: z.string().min(2),
  phone: z.string().min(7),
  requirement: z.string().optional(),
  budgetRange: z.string().optional(),
  timeline: z.string().optional(),
  source: z.string().optional(),
})

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const limit = rateLimit(`lead:${ip}`, 20, 60 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    const payload = await request.json()
    const parsed = leadSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid lead payload' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        productId: parsed.data.productId ?? null,
        name: parsed.data.name,
        phone: parsed.data.phone,
        requirement: parsed.data.requirement ?? null,
        budgetRange: parsed.data.budgetRange ?? null,
        timeline: parsed.data.timeline ?? null,
        source: parsed.data.source ?? null,
      },
    })

    await prisma.analyticsEvent.create({
    data: {
      type: 'INQUIRY',
      productId: parsed.data.productId ?? null,
      label: 'lead-created',
    },
  })

  return NextResponse.json({ leadId: lead.id })
  } catch (error) {
    console.error('Lead create error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
