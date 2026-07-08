import 'server-only'
import { revalidateTag } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { categories as staticCategories, getAllProducts, type Product } from '@/data/products'

/**
 * Server-only catalog fetcher used by RSC pages and the /api/products
 * route.
 *
 * Two flavors:
 *  - getHomeCatalog() — only the slices the homepage needs (8 products
 *    + 6 categories). Stays well under Vercel's 2 MB ISR page limit.
 *  - getFullCatalog() — every product, every category. Used by
 *    /categories/all and /api/products. Cached but only via
 *    unstable_cache, not via page-level ISR.
 *
 * Admin POSTs call revalidateTag('catalog') to flush both.
 *
 * If Prisma is unavailable, we degrade to the static catalog shipped
 * in src/data/products.ts so the public site never goes blank.
 */

export type CatalogProduct = Product & {
  categoryId?: string
  subcategoryId?: string
  source?: 'db' | 'static'
}

export type HomeCatalog = {
  products: CatalogProduct[]
  newListings: CatalogProduct[]
  recommended: CatalogProduct[]
  hotSellers: CatalogProduct[]
  categories: typeof staticCategories
  degraded: boolean
}

export type FullCatalog = {
  products: CatalogProduct[]
  categories: typeof staticCategories
  degraded: boolean
}

const sortByCreatedDesc = (a: CatalogProduct, b: CatalogProduct) => {
  const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
  const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
  return bTime - aTime
}

// The DB stores base64 image blobs in `images` (Json?). They make every
// product row 400+ KB in JSON. The public site only ever needs the
// `image` URL, not the full image array — so we strip `images` from
// the normalized record before it leaves the server. (Admin pages that
// need the full array still read from Prisma directly.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stripHeavyFields = (p: any): any => {
  if (Array.isArray(p.images)) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { images, ...rest } = p
    return rest
  }
  return p
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeDbProduct = (p: any): CatalogProduct => {
  const priceCents = typeof p.priceCents === 'number' ? p.priceCents : 0
  const listingPriceCents =
    typeof p.listingPriceCents === 'number'
      ? p.listingPriceCents
      : priceCents
  const discountPercent =
    typeof p.discountPercent === 'number'
      ? p.discountPercent
      : priceCents > 0
        ? Math.min(90, Math.max(0, Math.round((1 - listingPriceCents / priceCents) * 100)))
        : 0

  const image = p.image && p.image.startsWith('data:') ? '/logo.svg' : p.image || '/logo.svg'
  const slimmer = stripHeavyFields(p)

  return {
    id: slimmer.id,
    name: slimmer.name,
    description: slimmer.description || '',
    category: slimmer.category?.id || slimmer.categoryId,
    subcategory: slimmer.subcategory?.id || slimmer.subcategoryId || '',
    image,
    images: [image],
    features: Array.isArray(slimmer.features) ? slimmer.features : [],
    badges: Array.isArray(slimmer.badges) ? slimmer.badges : [],
    priceCents,
    listingPriceCents,
    salePriceCents: listingPriceCents,
    discountPercent,
    isNew: !!slimmer.isNew,
    isRecommended: !!slimmer.isRecommended,
    isHotSeller: !!slimmer.isHotSeller,
    stock: typeof slimmer.stock === 'number' ? slimmer.stock : 30,
    type: slimmer.type || (slimmer.categoryId === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
    createdAt: slimmer.createdAt ? new Date(slimmer.createdAt).toISOString() : undefined,
    source: 'db',
  }
}

const staticProducts = (): CatalogProduct[] =>
  getAllProducts().map((p) => ({ ...p, source: 'static' as const }))

const buildHomeFromList = (products: CatalogProduct[], degraded: boolean): HomeCatalog => {
  const sorted = [...products].sort(sortByCreatedDesc)
  return {
    products,
    newListings: sorted.filter((p) => p.isNew).slice(0, 4),
    recommended: products.filter((p) => p.isRecommended).slice(0, 4),
    hotSellers: products.filter((p) => p.isHotSeller).slice(0, 4),
    categories: staticCategories,
    degraded,
  }
}

const buildFullFromList = (products: CatalogProduct[], degraded: boolean): FullCatalog => ({
  products,
  categories: staticCategories,
  degraded,
})

// Small DB read for the homepage. We deliberately do NOT wrap it in
// unstable_cache: even a 24-row slice can serialize to 10+ MB once
// images/Json columns are in scope, and Vercel's data cache caps each
// item at 2 MB. The page-level ISR (revalidate = 60) absorbs the
// repeat-hit traffic — Prisma's single round-trip to MongoDB is the
// only real cost on a cold load.
const homeDbFetch = async (): Promise<CatalogProduct[] | null> => {
  try {
    const rows = await prisma.product.findMany({
      where: { OR: [{ isNew: true }, { isRecommended: true }, { isHotSeller: true }] },
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        features: true,
        badges: true,
        priceCents: true,
        listingPriceCents: true,
        discountPercent: true,
        isNew: true,
        isRecommended: true,
        isHotSeller: true,
        stock: true,
        type: true,
        createdAt: true,
        categoryId: true,
        subcategoryId: true,
        category: { select: { id: true } },
        subcategory: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 24,
    })
    return rows.map(normalizeDbProduct)
  } catch (err) {
    console.warn('[catalog] home DB fetch failed', err)
    return null
  }
}

// Full DB read. NOT cached at the data layer — the payload routinely
// exceeds Vercel's 2 MB per-item limit when the catalog has hundreds
// of products with image arrays. Instead, the page-level ISR cache
// (revalidate = 60) absorbs repeat hits; this function just performs
// the single Prisma round-trip.
const fullDbFetch = async (): Promise<CatalogProduct[] | null> => {
  try {
    const rows = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        features: true,
        badges: true,
        priceCents: true,
        listingPriceCents: true,
        discountPercent: true,
        isNew: true,
        isRecommended: true,
        isHotSeller: true,
        stock: true,
        type: true,
        createdAt: true,
        categoryId: true,
        subcategoryId: true,
        category: { select: { id: true } },
        subcategory: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return rows.map(normalizeDbProduct)
  } catch (err) {
    console.warn('[catalog] full DB fetch failed', err)
    return null
  }
}

/** Small payload for the homepage. */
export const getHomeCatalog = async (): Promise<HomeCatalog> => {
  const db = await homeDbFetch()
  if (db && db.length > 0) return buildHomeFromList(db, false)
  return buildHomeFromList(staticProducts(), true)
}

/** Full payload for /api/products and /categories/all. */
export const getFullCatalog = async (): Promise<FullCatalog> => {
  const db = await fullDbFetch()
  if (db && db.length > 0) return buildFullFromList(db, false)
  return buildFullFromList(staticProducts(), true)
}

/**
 * Backward-compat alias. Returns the full catalog snapshot for callers
 * that only need products (e.g. /api/products).
 */
export const getCatalog = getFullCatalog

/** Invalidate the cached snapshot. Call from admin POST/PATCH/DELETE. */
export const invalidateCatalog = async () => {
  revalidateTag('catalog', 'max')
}
