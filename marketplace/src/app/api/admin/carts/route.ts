import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const carts = await prisma.cart.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  const filtered = carts
    .filter((cart) => cart.items.length > 0)
    .map((cart) => {
      const subtotalCents = cart.items.reduce((sum, item) => {
        const price = item.product.listingPriceCents || item.product.priceCents || 0
        return sum + price * item.quantity
      }, 0)
      return {
        id: cart.id,
        user: {
          id: cart.user?.id,
          email: cart.user?.email,
          name: cart.user?.name,
          phone: cart.user?.phone,
        },
        items: cart.items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image,
          },
        })),
        itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
        subtotalCents,
        updatedAt: cart.updatedAt,
      }
    })

  return NextResponse.json({ carts: filtered })
}
