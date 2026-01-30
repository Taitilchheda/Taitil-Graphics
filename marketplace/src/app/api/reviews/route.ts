import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

const createSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'Missing productId' }, { status: 400 })
  }

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  })

  return NextResponse.json({ reviews })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const payload = await request.json()
  const parsed = createSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid review' }, { status: 400 })
  }

  const hasPurchase = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: { userId: auth.id, paymentStatus: 'PAID' },
    },
  })

  const verified = !!hasPurchase
  const status = 'APPROVED'

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: auth.id,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body ?? null,
      verified,
      status,
    },
  })

  return NextResponse.json({ review })
}
