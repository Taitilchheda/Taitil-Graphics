import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const addresses = await prisma.address.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ addresses })
}
