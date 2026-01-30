'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { categories as baseCategories, Category, Product, Subcategory } from '@/data/products'

type CatalogProduct = Product & {
  createdAt?: string
  isNew?: boolean
  isRecommended?: boolean
  isHotSeller?: boolean
  stock?: number
  badges?: string[]
  images?: string[]
  categoryId?: string
  subcategoryId?: string
  priceCents?: number
  listingPriceCents?: number
  discountPercent?: number
  salePriceCents?: number
  type?: 'PHYSICAL' | 'SERVICE'
  variants?: any
  media?: any
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  lowStockThreshold?: number
  sku?: string
  reorderLevel?: number
  reserved?: number
  weightGrams?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  hsnCode?: string
  fragile?: boolean
}

interface NewProductInput {
  id?: string
  name: string
  description: string
  categoryId?: string
  categoryName?: string
  subcategoryId?: string
  subcategoryName?: string
  image?: string
  imageFile?: string
  imageFiles?: string[]
  images?: string[]
  features: string[]
  whatsappMessage?: string
  isRecommended?: boolean
  isHotSeller?: boolean
  stock?: number
  badges?: string[]
  priceCents?: number
  listingPriceCents?: number
  discountPercent?: number
  type?: 'PHYSICAL' | 'SERVICE'
  variants?: any
  media?: any
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  lowStockThreshold?: number
  sku?: string
  reorderLevel?: number
  weightGrams?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  hsnCode?: string
  fragile?: boolean
}

interface CatalogContextType {
  categories: Category[]
  allProducts: CatalogProduct[]
  newListings: CatalogProduct[]
  recommendedProducts: CatalogProduct[]
  hotSellers: CatalogProduct[]
  addProduct: (product: NewProductInput) => void
  updateProduct: (id: string, data: Partial<NewProductInput>) => void
  deleteProduct: (id: string) => void
  addCategory: (data: { name: string; description?: string }) => Category
  updateCategory: (id: string, data: Partial<Category>) => Category | null
  deleteCategory: (id: string) => void
  addSubcategory: (categoryId: string, data: { name: string; description?: string }) => Subcategory | null
  updateSubcategory: (categoryId: string, subcategoryId: string, data: Partial<Subcategory>) => Subcategory | null
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void
  getProductById: (id: string) => CatalogProduct | undefined
  getProductsByCategory: (categoryId: string) => CatalogProduct[]
  getProductsBySubcategory: (categoryId: string, subcategoryId: string) => CatalogProduct[]
  updateInventory: (productId: string, delta: number) => void
  getInventory: (productId: string) => number
}

const CatalogContext = createContext<CatalogContextType | undefined>(undefined)

const cloneCatalog = (): Category[] =>
  baseCategories.map((category) => ({
    ...category,
    subcategories: category.subcategories.map((sub) => ({
      ...sub,
      products: sub.products.map((product) => ({
        ...product,
      })),
    })),
  }))

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [customProducts, setCustomProducts] = useState<CatalogProduct[]>([])
  const [inventory, setInventory] = useState<Record<string, number>>({})

  const normalizeProduct = (p: any): CatalogProduct => {
    const priceCents = typeof p.priceCents === 'number' ? p.priceCents : typeof p.price === 'number' ? p.price : 0
    const listingPriceCents =
      typeof p.listingPriceCents === 'number'
        ? p.listingPriceCents
        : typeof p.salePriceCents === 'number'
          ? p.salePriceCents
          : priceCents > 0
            ? Math.max(0, priceCents - Math.round(priceCents * (p.discountPercent || 0) / 100))
            : 0
    const discountPercent =
      typeof p.discountPercent === 'number'
        ? p.discountPercent
        : priceCents > 0
          ? Math.min(90, Math.max(0, Math.round((1 - listingPriceCents / priceCents) * 100)))
          : 0

    return {
      ...p,
      images: p.images && Array.isArray(p.images) ? p.images : p.image ? [p.image] : ['/logo.svg'],
      features: p.features || [],
      badges: p.badges || [],
      priceCents,
      listingPriceCents,
      discountPercent,
      salePriceCents: listingPriceCents,
      type: p.type || (p.categoryId === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
      variants: p.variants ?? null,
      media: p.media ?? null,
      seoTitle: p.seoTitle ?? null,
      seoDescription: p.seoDescription ?? null,
      canonicalUrl: p.canonicalUrl ?? null,
      lowStockThreshold: p.lowStockThreshold ?? p.reorderLevel ?? 5,
      sku: p.sku || undefined,
      reorderLevel: p.reorderLevel ?? undefined,
      reserved: p.reserved ?? 0,
      weightGrams: p.weightGrams ?? undefined,
      lengthCm: p.lengthCm ?? undefined,
      widthCm: p.widthCm ?? undefined,
      heightCm: p.heightCm ?? undefined,
      hsnCode: p.hsnCode ?? undefined,
      fragile: p.fragile ?? undefined,
      category: typeof p.category === 'object' && p.category?.id ? p.category.id : p.category || p.categoryId,
      subcategory: typeof p.subcategory === 'object' && p.subcategory?.id ? p.subcategory.id : p.subcategory || p.subcategoryId,
    }
  }

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products')
        if (res.ok) {
          const data = await res.json()
          const dbProducts = (data.products || []).map(normalizeProduct)
          setCustomProducts(dbProducts)
        } else {
          setCustomProducts([])
        }
      } catch (error) {
        console.error('Failed to load products from DB', error)
        setCustomProducts([])
      }
    }
    loadProducts()
  }, [])

  const mergedCatalog = useMemo(() => {
    const catalog = cloneCatalog()

    customProducts.forEach((product) => {
      const categoryId = product.category || product.categoryId || 'general'
      const subcategoryId = product.subcategory || product.subcategoryId || 'general'

      let category = catalog.find((cat) => cat.id === categoryId)
      if (!category) {
        category = {
          id: categoryId,
          name: categoryId,
          description: 'Custom products',
          subcategories: [],
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.createdAt || new Date().toISOString(),
          products: [],
        }
        catalog.push(category)
      }

      const resolvedCategory = category!
      let subcategory = resolvedCategory.subcategories.find((sub) => sub.id === subcategoryId)
      if (!subcategory) {
        subcategory = {
          id: subcategoryId,
          name: subcategoryId,
          description: 'Custom products',
          products: [],
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.createdAt || new Date().toISOString(),
        }
        resolvedCategory.subcategories.push(subcategory)
      }

      subcategory!.products.push(product)
    })

    return catalog
  }, [customProducts])

  const allProducts: CatalogProduct[] = useMemo(() => {
    return mergedCatalog.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.products.map((product) => ({
          ...product,
          images: product.images && product.images.length > 0 ? product.images : [product.image],
          createdAt: product.createdAt,
          stock: inventory[product.id] ?? product.stock ?? 30,
          priceCents: product.priceCents ?? 0,
          listingPriceCents: product.listingPriceCents ?? product.salePriceCents ?? product.priceCents ?? 0,
          discountPercent: product.discountPercent ?? 0,
          salePriceCents: product.salePriceCents ?? product.listingPriceCents ?? product.priceCents ?? 0,
          sku: product.sku,
          reorderLevel: product.reorderLevel,
          reserved: product.reserved ?? 0,
          isHotSeller: product.isHotSeller,
          isRecommended: product.isRecommended,
          badges: product.badges,
        }))
      )
    )
  }, [mergedCatalog, inventory])

  const newListings = useMemo(() => allProducts.filter((product) => product.isNew).slice(0, 12), [allProducts])
  const recommendedProducts = useMemo(() => allProducts.filter((product) => product.isRecommended), [allProducts])
  const hotSellers = useMemo(() => allProducts.filter((product) => product.isHotSeller), [allProducts])

  const addProduct = (input: NewProductInput) => {
    const images =
      input.images && input.images.length > 0
        ? input.images
        : input.imageFiles && input.imageFiles.length > 0
          ? input.imageFiles
          : input.image
            ? [input.image]
            : ['/logo.svg']
    const features = input.features && input.features.length > 0 ? input.features : ['Premium finish', 'Fast delivery']

    const payload = {
      id: input.id,
      name: input.name,
      description: input.description,
      categoryId: input.categoryId || 'general',
      categoryName: input.categoryName,
      subcategoryId: input.subcategoryId || 'general',
      subcategoryName: input.subcategoryName,
      image: images[0],
      images,
      features,
      badges: input.badges || ['New listing'],
      isRecommended: input.isRecommended ?? true,
      isHotSeller: input.isHotSeller ?? false,
      isNew: true,
      stock: input.stock ?? 30,
      priceCents: input.priceCents ?? 0,
      listingPriceCents: input.listingPriceCents ?? 0,
      discountPercent: input.discountPercent ?? 0,
      sku: input.sku,
      reorderLevel: input.reorderLevel ?? 5,
      lowStockThreshold: input.lowStockThreshold ?? input.reorderLevel ?? 5,
      type: input.type,
      variants: input.variants,
      media: input.media,
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      canonicalUrl: input.canonicalUrl,
      weightGrams: input.weightGrams,
      lengthCm: input.lengthCm,
      widthCm: input.widthCm,
      heightCm: input.heightCm,
      hsnCode: input.hsnCode,
      fragile: input.fragile,
    }

    fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to save product')
        const data = await res.json()
        const normalized = normalizeProduct(data.product)
        setCustomProducts((prev) => [normalized, ...prev])
      })
      .catch((err) => console.error('Failed to persist product to DB', err))

    const tempId = `temp-${Date.now()}`
    const optimistic: CatalogProduct = {
      ...payload,
      id: payload.id || tempId,
      category: payload.categoryId,
      subcategory: payload.subcategoryId,
    }
    setCustomProducts((prev) => [optimistic, ...prev])
  }

  const updateProduct = (id: string, data: Partial<NewProductInput>) => {
    const images =
      data.images && data.images.length > 0
        ? data.images
        : data.imageFiles && data.imageFiles.length > 0
          ? data.imageFiles
          : undefined

    fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        images,
        image: images ? images[0] : undefined,
        priceCents: data.priceCents,
        listingPriceCents: data.listingPriceCents,
        discountPercent: data.discountPercent,
        sku: data.sku,
        reorderLevel: data.reorderLevel,
        lowStockThreshold: data.lowStockThreshold,
        type: data.type,
        variants: data.variants,
        media: data.media,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        weightGrams: data.weightGrams,
        lengthCm: data.lengthCm,
        widthCm: data.widthCm,
        heightCm: data.heightCm,
        hsnCode: data.hsnCode,
        fragile: data.fragile,
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to update product')
        const payload = await res.json()
        const normalized = normalizeProduct(payload.product)
        setCustomProducts((prev) => prev.map((p) => (p.id === id ? normalized : p)))
      })
      .catch((err) => console.error('Failed to update product in DB', err))

    setCustomProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod
        return {
          ...prod,
          ...data,
          images: images || prod.images,
          image: images ? images[0] : prod.image,
        }
      })
    )
  }

  const deleteProduct = (id: string) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== id))
    fetch(`/api/products/${id}`, { method: 'DELETE' }).catch((err) => console.error('Failed to delete product in DB', err))
  }

  const addCategory = (data: { name: string; description?: string }): Category => {
    const newCategory: Category = {
      id: data.name.toLowerCase().replace(/\s+/g, '-'),
      name: data.name,
      description: data.description || '',
      subcategories: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      products: [],
    }
    return newCategory
  }

  const updateCategory = (_id: string, _data: Partial<Category>): Category | null => {
    return null
  }

  const deleteCategory = (_id: string) => {}

  const addSubcategory = (_categoryId: string, data: { name: string; description?: string }): Subcategory | null => {
    const sub: Subcategory = {
      id: data.name.toLowerCase().replace(/\s+/g, '-'),
      name: data.name,
      description: data.description || '',
      products: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return sub
  }

  const updateSubcategory = (_categoryId: string, _subcategoryId: string, _data: Partial<Subcategory>): Subcategory | null => {
    return null
  }

  const deleteSubcategory = (_categoryId: string, _subcategoryId: string) => {}

  const getProductById = (id: string) => allProducts.find((p) => p.id === id)

  const getProductsByCategory = (categoryId: string) =>
    allProducts.filter((product) => product.category === categoryId || product.categoryId === categoryId)

  const getProductsBySubcategory = (categoryId: string, subcategoryId: string) =>
    allProducts.filter(
      (product) =>
        (product.category === categoryId || product.categoryId === categoryId) &&
        (product.subcategory === subcategoryId || product.subcategoryId === subcategoryId)
    )

  const updateInventory = (productId: string, delta: number) => {
    setInventory((prev) => {
      const next = { ...prev }
      next[productId] = (next[productId] || 0) + delta
      return next
    })
  }

  const getInventory = (productId: string) => inventory[productId] ?? 0

  return (
    <CatalogContext.Provider
      value={{
        categories: mergedCatalog,
        allProducts,
        newListings,
        recommendedProducts,
        hotSellers,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        getProductById,
        getProductsByCategory,
        getProductsBySubcategory,
        updateInventory,
        getInventory,
      }}
    >
      {children}
    </CatalogContext.Provider>
  )
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (context === undefined) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}
