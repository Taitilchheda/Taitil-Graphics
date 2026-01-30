import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logAdminAction } from '@/lib/audit'
import { getAllProducts } from '@/data/products'
import { requireAuth } from '@/lib/server-auth'

const computeDiscountPercent = (mrpCents: number, listingCents: number) => {
  if (mrpCents <= 0) return 0
  return Math.min(90, Math.max(0, Math.round((1 - listingCents / mrpCents) * 100)))
}

const ensureCategory = async (categoryId: string, categoryName?: string) => {
  const existing = await prisma.category.findUnique({ where: { id: categoryId } })
  if (existing) return existing
  return prisma.category.create({
    data: {
      id: categoryId,
      name: categoryName || categoryId,
      description: categoryName || categoryId,
    },
  })
}

const ensureSubcategory = async (subcategoryId: string, categoryId: string, subcategoryName?: string) => {
  if (!subcategoryId) return null
  const existing = await prisma.subcategory.findUnique({ where: { id: subcategoryId } })
  if (existing) return existing
  return prisma.subcategory.create({
    data: {
      id: subcategoryId,
      name: subcategoryName || subcategoryId,
      description: subcategoryName || subcategoryId,
      categoryId,
    },
  })
}


const seedCatalogIfEmpty = async () => {
  const existingCount = await prisma.product.count()
  if (existingCount > 0) return

  const baseProducts = getAllProducts()
  for (const product of baseProducts) {
    const category = await ensureCategory(product.category, product.category)
    const subcategory = await ensureSubcategory(product.subcategory, category.id, product.subcategory)
    const images = product.image ? [product.image] : []
    const listingPriceCents = product.listingPriceCents ?? product.priceCents ?? 0
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        image: product.image,
        images: images.length ? images : undefined,
        features: product.features || undefined,
        badges: product.badges || undefined,
        isNew: product.isNew ?? false,
        isRecommended: product.isRecommended ?? true,
        isHotSeller: product.isHotSeller ?? false,
        stock: product.stock ?? 0,
        priceCents: product.priceCents ?? 0,
        listingPriceCents,
        type: product.type || (category.id === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
        variants: product.variants ?? null,
        media: product.media ?? null,
        seoTitle: product.seoTitle ?? null,
        seoDescription: product.seoDescription ?? null,
        canonicalUrl: product.canonicalUrl ?? null,
        lowStockThreshold: product.reorderLevel ?? 5,
        sku: product.sku || null,
        reorderLevel: product.reorderLevel ?? 5,
        whatsappMsg: product.whatsappMessage || null,
      },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        image: product.image,
        images: images.length ? images : undefined,
        features: product.features || undefined,
        badges: product.badges || undefined,
        isNew: product.isNew ?? false,
        isRecommended: product.isRecommended ?? true,
        isHotSeller: product.isHotSeller ?? false,
        stock: product.stock ?? 0,
        priceCents: product.priceCents ?? 0,
        listingPriceCents,
        type: product.type || (category.id === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
        variants: product.variants ?? null,
        media: product.media ?? null,
        seoTitle: product.seoTitle ?? null,
        seoDescription: product.seoDescription ?? null,
        canonicalUrl: product.canonicalUrl ?? null,
        lowStockThreshold: product.reorderLevel ?? 5,
        sku: product.sku || null,
        reorderLevel: product.reorderLevel ?? 5,
        whatsappMsg: product.whatsappMessage || null,
      },
    })
  }
}

const updateSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).optional(),
  stock: z.number().int().min(0),
  reorderLevel: z.number().int().min(0).optional(),
  sku: z.string().optional(),
  priceCents: z.number().int().min(0).optional(),
  listingPriceCents: z.number().int().min(0).optional(),
  discountPercent: z.number().int().min(0).max(90).optional(),
  type: z.enum(['PHYSICAL', 'SERVICE']).optional(),
  variants: z.any().optional(),
  media: z.any().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  canonicalUrl: z.string().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
})

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await seedCatalogIfEmpty()

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      category: true,
      subcategory: true,
    },
  })

  return NextResponse.json({ products })
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json()
  const parsed = updateSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid inventory payload' }, { status: 400 })
  }

  const shouldUpdatePricing =
    typeof parsed.data.priceCents === 'number' ||
    typeof parsed.data.listingPriceCents === 'number' ||
    typeof parsed.data.discountPercent === 'number'
  let pricingUpdate: { priceCents?: number; listingPriceCents?: number; discountPercent?: number } = {}

  if (shouldUpdatePricing) {
    const existing = await prisma.product.findUnique({ where: { id: parsed.data.productId } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    const basePriceCents = typeof parsed.data.priceCents === 'number' ? parsed.data.priceCents : existing.priceCents
    const rawListingCents =
      typeof parsed.data.listingPriceCents === 'number'
        ? parsed.data.listingPriceCents
        : typeof parsed.data.discountPercent === 'number'
          ? Math.max(0, basePriceCents - Math.round(basePriceCents * (parsed.data.discountPercent / 100)))
          : existing.listingPriceCents
    const normalizedListingCents = basePriceCents > 0 ? Math.min(rawListingCents, basePriceCents) : rawListingCents
    const resolvedDiscountPercent =
      typeof parsed.data.listingPriceCents === 'number'
        ? computeDiscountPercent(basePriceCents, normalizedListingCents)
        : typeof parsed.data.discountPercent === 'number'
          ? parsed.data.discountPercent
          : existing.discountPercent
    pricingUpdate = {
      priceCents: basePriceCents,
      listingPriceCents: normalizedListingCents,
      discountPercent: resolvedDiscountPercent,
    }
  }

  const updated = await prisma.product.update({
    where: { id: parsed.data.productId },
    data: {
      name: parsed.data.name ?? undefined,
      stock: parsed.data.stock,
      reorderLevel: parsed.data.reorderLevel,
      sku: parsed.data.sku ?? undefined,
      ...pricingUpdate,
    },
    include: {
      category: true,
      subcategory: true,
    },
  })

  return NextResponse.json({ product: updated })
}

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role != 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existingCount = await prisma.product.count()
  if (existingCount === 0) {
    await seedCatalogIfEmpty()
  }

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      category: true,
      subcategory: true,
    },
  })

  return NextResponse.json({ products })
}
