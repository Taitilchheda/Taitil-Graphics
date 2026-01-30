import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) {
    return auth
  }

  const orders = await prisma.order.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' },
    include: {
      address: true,
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
    },
  })

  return NextResponse.json({ orders })
}
