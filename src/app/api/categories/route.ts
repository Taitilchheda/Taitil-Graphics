import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jsonWithCache } from '@/lib/response-cache'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subcategories: {
          orderBy: { name: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    })

    return jsonWithCache({ categories }, { seconds: 120 })
  } catch (error) {
    console.error('Categories GET error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
