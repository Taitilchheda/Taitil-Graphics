import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveHsnCode } from '@/lib/hsn'
import { jsonWithCache } from '@/lib/response-cache'

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

    const category = await ensureCategory(categoryId, categoryName)
    const subcategory = await ensureSubcategory(subcategoryId, category.id, subcategoryName)

    const shouldUpdatePricing = typeof priceCents === 'number' || typeof listingPriceCents === 'number' || typeof discountPercent === 'number'
    let pricingUpdate: { priceCents?: number; listingPriceCents?: number; discountPercent?: number } = {}

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
      pricingUpdate = {
        priceCents: basePriceCents,
        listingPriceCents: normalizedListingCents,
        discountPercent: resolvedDiscountPercent,
      }
    }

    const resolvedHsn = (typeof hsnCode === 'string' && hsnCode.trim())
      ? hsnCode.trim()
      : existing.hsnCode || resolveHsnCode({ categoryId: category.id, subcategoryId: subcategory ? subcategory.id : null, name: name || existing.name })

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        image,
        images: images ? images : undefined,
        features: features ? features : undefined,
        badges: badges ? badges : undefined,
        isNew: isNew ?? undefined,
        isRecommended: isRecommended ?? undefined,
        isHotSeller: isHotSeller ?? undefined,
        stock,
        sku: sku ?? undefined,
        reorderLevel: reorderLevel ?? undefined,
        type: type ?? undefined,
        variants: variants ?? undefined,
        media: media ?? undefined,
        seoTitle: seoTitle ?? undefined,
        seoDescription: seoDescription ?? undefined,
        canonicalUrl: canonicalUrl ?? undefined,
        lowStockThreshold: lowStockThreshold ?? undefined,
        weightGrams: typeof weightGrams === 'number' ? weightGrams : undefined,
        lengthCm: typeof lengthCm === 'number' ? lengthCm : undefined,
        widthCm: typeof widthCm === 'number' ? widthCm : undefined,
        heightCm: typeof heightCm === 'number' ? heightCm : undefined,
        hsnCode: resolvedHsn ?? undefined,
        fragile: typeof fragile === 'boolean' ? fragile : undefined,
        ...pricingUpdate,
      },
    })

    return NextResponse.json({ product: updated })
  } catch (error) {
    console.error('Product PATCH error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  try {
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Product DELETE error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
