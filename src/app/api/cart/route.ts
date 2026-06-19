import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

const cartSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })),
})

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role === 'admin') {
    return NextResponse.json({ items: [] })
  }

  const cart = await prisma.cart.findFirst({
    where: { userId: auth.id },
    include: { items: { include: { product: true } } },
  })

  if (!cart) {
    return NextResponse.json({ items: [] })
  }

  const items = cart.items.map((item) => ({
    id: item.product.id,
    name: item.product.name,
    image: item.product.image,
    category: item.product.categoryId,
    description: item.product.description,
    priceCents: item.product.priceCents,
    listingPriceCents: item.product.listingPriceCents,
    discountPercent: item.product.discountPercent,
    type: item.product.type,
    mrpCents: item.product.priceCents,
    quantity: item.quantity,
  }))

  return NextResponse.json({ items })
}

export async function PUT(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role === 'admin') {
    return NextResponse.json({ ok: true })
  }

  const payload = await request.json().catch(() => ({}))
  const parsed = cartSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid cart payload' }, { status: 400 })
  }

  const productIds = parsed.data.items.map((item) => item.productId)
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 })
  }

  let cart = await prisma.cart.findFirst({ where: { userId: auth.id } })
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: auth.id } })
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  if (parsed.data.items.length) {
    await prisma.cartItem.createMany({
      data: parsed.data.items.map((item) => ({
        cartId: cart.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    })
  }

  return NextResponse.json({ ok: true })
}
