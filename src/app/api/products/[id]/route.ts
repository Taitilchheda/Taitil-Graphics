import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveHsnCode } from '@/lib/hsn'
import { jsonWithCache } from '@/lib/response-cache'
import { requireAdmin } from '@/lib/server-auth'

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

const ensureSubcategory = async (subcategoryId: string | null, categoryId: string, subcategoryName?: string) => {
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

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, subcategory: true },
    })
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return jsonWithCache({ product }, { seconds: 60 })
  } catch (error) {
    console.error('Product GET error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  const { id } = await context.params
  try {
    const body = await request.json()
    const {
      name,
      description,
      categoryId,
      categoryName,
      subcategoryId,
      subcategoryName,
      image,
      images,
      features,
      badges,
      isNew,
      isRecommended,
      isHotSeller,
      stock,
      priceCents,
      listingPriceCents,
      sku,
      reorderLevel,
      discountPercent,
      type,
      variants,
      media,
      seoTitle,
      seoDescription,
      canonicalUrl,
      lowStockThreshold,
      weightGrams,
      lengthCm,
      widthCm,
      heightCm,
      hsnCode,
      fragile,
    } = body

    const existing = await prisma.product.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Build a sparse patch: only include fields that were actually sent
    // (non-undefined). This is what makes PATCH truly partial — old
    // code passed every field with `?? undefined`, which still caused
    // ensureCategory(undefined) to crash.
    const data: Record<string, unknown> = {}

    if (typeof name === 'string') data.name = name
    if (typeof description === 'string') data.description = description

    if (typeof categoryId === 'string' && categoryId) {
      const category = await ensureCategory(categoryId, categoryName)
      data.categoryId = category.id
      if (typeof subcategoryId === 'string' && subcategoryId) {
        const subcategory = await ensureSubcategory(subcategoryId, category.id, subcategoryName)
        data.subcategoryId = subcategory ? subcategory.id : null
      } else if (subcategoryId === null) {
        data.subcategoryId = null
      }
    }

    if (typeof image === 'string') data.image = image
    if (Array.isArray(images)) data.images = images.length ? images : []

    if (Array.isArray(features)) data.features = features
    if (Array.isArray(badges)) data.badges = badges

    if (typeof isNew === 'boolean') data.isNew = isNew
    if (typeof isRecommended === 'boolean') data.isRecommended = isRecommended
    if (typeof isHotSeller === 'boolean') data.isHotSeller = isHotSeller
    if (typeof stock === 'number') data.stock = stock
    if (typeof sku === 'string' && sku.trim()) data.sku = sku.trim()
    if (typeof reorderLevel === 'number') data.reorderLevel = reorderLevel
    if (typeof type === 'string') data.type = type
    if (variants !== undefined) data.variants = variants
    if (media !== undefined) data.media = media
    if (typeof seoTitle === 'string') data.seoTitle = seoTitle
    if (typeof seoDescription === 'string') data.seoDescription = seoDescription
    if (typeof canonicalUrl === 'string') data.canonicalUrl = canonicalUrl
    if (typeof lowStockThreshold === 'number') data.lowStockThreshold = lowStockThreshold
    if (typeof weightGrams === 'number') data.weightGrams = weightGrams
    if (typeof lengthCm === 'number') data.lengthCm = lengthCm
    if (typeof widthCm === 'number') data.widthCm = widthCm
    if (typeof heightCm === 'number') data.heightCm = heightCm
    if (typeof hsnCode === 'string' && hsnCode.trim()) data.hsnCode = hsnCode.trim()
    if (typeof fragile === 'boolean') data.fragile = fragile

    // Pricing logic
    const shouldUpdatePricing =
      typeof priceCents === 'number' ||
      typeof listingPriceCents === 'number' ||
      typeof discountPercent === 'number'

    if (shouldUpdatePricing) {
      const basePriceCents = typeof priceCents === 'number' ? priceCents : existing.priceCents
      const rawListingCents =
        typeof listingPriceCents === 'number'
          ? listingPriceCents
          : typeof discountPercent === 'number'
            ? Math.max(0, basePriceCents - Math.round(basePriceCents * (discountPercent / 100)))
            : existing.listingPriceCents
      const normalizedListingCents = basePriceCents > 0 ? Math.min(rawListingCents, basePriceCents) : rawListingCents
      const resolvedDiscountPercent =
        typeof listingPriceCents === 'number'
          ? computeDiscountPercent(basePriceCents, normalizedListingCents)
          : typeof discountPercent === 'number'
            ? discountPercent
            : existing.discountPercent
      data.priceCents = basePriceCents
      data.listingPriceCents = normalizedListingCents
      data.discountPercent = resolvedDiscountPercent
    }

    // Image fallback: if neither image nor images were sent, keep existing.
    if (!('image' in data) && !Array.isArray(images)) {
      data.image = existing.image
    }

    // HSN fallback when not provided
    if (typeof hsnCode !== 'string' || !hsnCode.trim()) {
      const resolvedHsn = existing.hsnCode || resolveHsnCode({
        categoryId: (data.categoryId as string) || existing.categoryId,
        subcategoryId: (data.subcategoryId as string | null) ?? existing.subcategoryId,
        name: (data.name as string) || existing.name,
      })
      if (resolvedHsn) data.hsnCode = resolvedHsn
    }

    const updated = await prisma.product.update({
      where: { id },
      data,
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('Product PATCH error', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  const { id } = await context.params
  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Product DELETE error', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
