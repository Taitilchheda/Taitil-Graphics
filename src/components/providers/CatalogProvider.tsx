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

  const normalizeProduct = (p: any): CatalogProduct => ({
    ...p,
    images: p.images && Array.isArray(p.images) ? p.images : p.image ? [p.image] : ['/logo.svg'],
    features: p.features || [],
    badges: p.badges || [],
    category: typeof p.category === 'object' && p.category?.id ? p.category.id : p.category || p.categoryId,
    subcategory: typeof p.subcategory === 'object' && p.subcategory?.id ? p.subcategory.id : p.subcategory || p.subcategoryId,
  })

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

      let subcategory = category.subcategories.find((sub) => sub.id === subcategoryId)
      if (!subcategory) {
        subcategory = {
          id: subcategoryId,
          name: subcategoryId,
          description: 'Custom products',
          products: [],
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.createdAt || new Date().toISOString(),
        }
        category.subcategories.push(subcategory)
      }

      subcategory.products.push(product)
    })

    return catalog
  }, [customProducts])

  const ensureCategory = (categoryId?: string, subcategoryId?: string) => {
    const catalog = mergedCatalog
    const fallbackCategory = catalog[0]
    const resolvedCategoryId = categoryId && catalog.find((c) => c.id === categoryId) ? categoryId : fallbackCategory?.id
    const cat = catalog.find((c) => c.id === resolvedCategoryId)
    const fallbackSub = cat?.subcategories[0]
    const resolvedSubId = subcategoryId && cat?.subcategories.find((s) => s.id === subcategoryId) ? subcategoryId : fallbackSub?.id || 'general'
    return { resolvedCategoryId: resolvedCategoryId || 'general', resolvedSubId }
  }

  const allProducts: CatalogProduct[] = useMemo(() => {
    return mergedCatalog.flatMap((cat) =>
      cat.subcategories.flatMap((sub) =>
        sub.products.map((product) => ({
          ...product,
          images: product.images && product.images.length > 0 ? product.images : [product.image],
          createdAt: product.createdAt,
          stock: inventory[product.id] ?? product.stock ?? 30,
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

    const optimistic: CatalogProduct = {
      id: `temp-${Date.now()}`,
      ...payload,
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
