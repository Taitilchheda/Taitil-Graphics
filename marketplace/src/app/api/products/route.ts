import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAllProducts } from '@/data/products'

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

export async function GET() {
  try {
    await seedCatalogIfEmpty()
    const products = await prisma.product.findMany({
      include: {
        category: true,
        subcategory: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ products })
  } catch (error) {
    console.error('Products GET error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
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

    const category = await ensureCategory(categoryId, categoryName)
    const subcategory = await ensureSubcategory(subcategoryId, category.id, subcategoryName)

    const resolvedPriceCents = priceCents ?? 0
    const rawListingCents =
      typeof listingPriceCents === 'number'
        ? listingPriceCents
        : Math.max(0, resolvedPriceCents - Math.round(resolvedPriceCents * ((discountPercent ?? 0) / 100)))
    const resolvedListingCents = resolvedPriceCents > 0 ? Math.min(rawListingCents, resolvedPriceCents) : rawListingCents
    const resolvedDiscount = computeDiscountPercent(resolvedPriceCents, resolvedListingCents)

    const created = await prisma.product.create({
      data: {
        id: id || undefined,
        name,
        description,
        categoryId: category.id,
        subcategoryId: subcategory ? subcategory.id : null,
        image,
        images: images ? images : undefined,
        features: features ? features : undefined,
        badges: badges ? badges : undefined,
        isNew: isNew ?? true,
        isRecommended: isRecommended ?? true,
        isHotSeller: isHotSeller ?? false,
        stock,
        priceCents: resolvedPriceCents,
        listingPriceCents: resolvedListingCents,
        sku: sku || null,
        reorderLevel: reorderLevel ?? 5,
        discountPercent: resolvedDiscount,
        type: type || (category.id === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
        variants: variants ?? null,
        media: media ?? null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        canonicalUrl: canonicalUrl || null,
        lowStockThreshold: lowStockThreshold ?? reorderLevel ?? 5,
        weightGrams: typeof weightGrams === 'number' ? weightGrams : null,
        lengthCm: typeof lengthCm === 'number' ? lengthCm : null,
        widthCm: typeof widthCm === 'number' ? widthCm : null,
        heightCm: typeof heightCm === 'number' ? heightCm : null,
        hsnCode: hsnCode || null,
        fragile: fragile ?? false,
      },
    })

    return NextResponse.json({ product: created }, { status: 201 })
  } catch (error) {
    console.error('Products POST error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
