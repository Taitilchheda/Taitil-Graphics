import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const parsePriceRange = (range: string | null) => {
  if (!range || range === 'all') return null
  if (range === '0-50') return { min: 0, max: 50 }
  if (range === '50-100') return { min: 50, max: 100 }
  if (range === '100-200') return { min: 100, max: 200 }
  if (range === '200+') return { min: 200, max: null }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = (searchParams.get('search') || '').trim()
    const category = searchParams.get('category') || 'all'
    const priceRange = searchParams.get('priceRange') || 'all'
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(48, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)))

    const where: any = {}

    if (category !== 'all') {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
        { subcategory: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const range = parsePriceRange(priceRange)
    if (range) {
      const minCents = range.min * 100
      const maxCents = range.max !== null ? range.max * 100 : null
      where.listingPriceCents = {
        gte: minCents,
        ...(maxCents ? { lte: maxCents } : {}),
      }
    }

    let orderBy: any = { createdAt: 'desc' }
    if (sortBy === 'price-low') orderBy = { listingPriceCents: 'asc' }
    if (sortBy === 'price-high') orderBy = { listingPriceCents: 'desc' }
    if (sortBy === 'newest') orderBy = { createdAt: 'desc' }

    const [total, products, categories] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: { category: true, subcategory: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.findMany({ select: { name: true } }),
    ])

    return NextResponse.json({
      products,
      total,
      page,
      limit,
      hasMore: page * limit < total,
      filters: {
        categories: categories.map((c) => c.name),
        priceRanges: ['0-50', '50-100', '100-200', '200+'],
      },
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
