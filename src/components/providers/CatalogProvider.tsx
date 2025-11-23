'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  categories as baseCategories,
  Category,
  Product,
  Subcategory,
} from '@/data/products'

type CatalogProduct = Product & {
  createdAt?: string
  isNew?: boolean
  isRecommended?: boolean
  isHotSeller?: boolean
  stock?: number
  badges?: string[]
  images?: string[]
}

interface NewProductInput {
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
  addProduct: (product: NewProductInput) => CatalogProduct
  updateProduct: (id: string, data: Partial<NewProductInput>) => CatalogProduct | null
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

const STORAGE_KEYS = {
  customProducts: 'taitil-custom-products',
  customCategories: 'taitil-custom-categories',
  inventory: 'taitil-inventory',
  analytics: 'taitil-analytics-events',
}

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

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [customProducts, setCustomProducts] = useState<CatalogProduct[]>([])
  const [inventory, setInventory] = useState<Record<string, number>>({})
  const [customCategories, setCustomCategories] = useState<Category[]>([])
  const [clickMap, setClickMap] = useState<Record<string, number>>({})
  const baseCreatedAt = useMemo(() => {
    const map: Record<string, string> = {}
    cloneCatalog().forEach((category) =>
      category.subcategories.forEach((sub) =>
        sub.products.forEach((product, index) => {
          map[product.id] =
            product.createdAt ||
            new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString()
        })
      )
    )
    return map
  }, [])

  useEffect(() => {
    try {
      const savedProducts = localStorage.getItem(STORAGE_KEYS.customProducts)
      const savedCategories = localStorage.getItem(STORAGE_KEYS.customCategories)
      const savedInventory = localStorage.getItem(STORAGE_KEYS.inventory)
      const savedAnalytics = localStorage.getItem(STORAGE_KEYS.analytics)

      if (savedProducts) {
        setCustomProducts(JSON.parse(savedProducts))
      }

      if (savedCategories) {
        setCustomCategories(JSON.parse(savedCategories))
      }

      if (savedInventory) {
        setInventory(JSON.parse(savedInventory))
      } else {
        // Seed inventory for base products so admin sees quantities immediately
        const seeded: Record<string, number> = {}
        cloneCatalog().forEach((category) =>
          category.subcategories.forEach((sub) =>
            sub.products.forEach((product) => {
              seeded[product.id] = product.stock || 40
            })
          )
        )
        setInventory(seeded)
      }

      if (savedAnalytics) {
        try {
          const events = JSON.parse(savedAnalytics) as { productId?: string; type: string }[]
          const clicks: Record<string, number> = {}
          events.forEach((evt) => {
            if (evt.productId && (evt.type === 'click' || evt.type === 'view' || evt.type === 'cart' || evt.type === 'sale')) {
              clicks[evt.productId] = (clicks[evt.productId] || 0) + 1
            }
          })
          setClickMap(clicks)
        } catch (error) {
          console.error('Failed to parse analytics for hot products', error)
        }
      }
    } catch (error) {
      console.error('Failed to load catalog data from storage', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customProducts, JSON.stringify(customProducts))
  }, [customProducts, customCategories])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customCategories, JSON.stringify(customCategories))
  }, [customCategories])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.inventory, JSON.stringify(inventory))
  }, [inventory])

  const addProduct = (input: NewProductInput): CatalogProduct => {
    const id = generateSlug(`${input.name}-${Date.now()}`)
    const { resolvedCategoryId, resolvedSubId } = ensureCategory(input.categoryId, input.subcategoryId)
    const images = input.images && input.images.length > 0
      ? input.images
      : input.imageFiles && input.imageFiles.length > 0
        ? input.imageFiles
        : input.imageFile
          ? [input.imageFile]
          : input.image
            ? [input.image]
            : ['/logo.svg']
    const image = images[0]

    const newProduct: CatalogProduct = {
      id,
      name: input.name,
      description: input.description,
      category: resolvedCategoryId,
      subcategory: resolvedSubId,
      image,
      images,
      features: input.features,
      whatsappMessage:
        input.whatsappMessage ||
        `Hi! I'm interested in ${input.name}. Could you share pricing and customization options?`,
      isNew: true,
      isRecommended: input.isRecommended ?? true,
      isHotSeller: input.isHotSeller ?? false,
      stock: input.stock,
      badges: input.badges || ['New listing'],
      createdAt: new Date().toISOString(),
    }

    setCustomProducts((prev) => [...prev, newProduct])
    setInventory((prev) => ({ ...prev, [id]: newProduct.stock || 25 }))

    return newProduct
  }

  const updateProduct = (id: string, data: Partial<NewProductInput>): CatalogProduct | null => {
    let updatedProduct: CatalogProduct | null = null
    setCustomProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== id) return prod
        const images = data.images && data.images.length > 0
          ? data.images
          : data.imageFiles && data.imageFiles.length > 0
            ? data.imageFiles
            : prod.images
        updatedProduct = {
          ...prod,
          ...data,
          images,
          image: images ? images[0] : prod.image,
        }
        return updatedProduct
      })
    )
    return updatedProduct
  }

  const deleteProduct = (id: string) => {
    setCustomProducts((prev) => prev.filter((p) => p.id !== id))
    setInventory((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const addCategory = (data: { name: string; description?: string }): Category => {
    const id = generateSlug(data.name)
    const category: Category = {
      id,
      name: data.name,
      description: data.description || 'Custom category',
      subcategories: [],
    }
    setCustomCategories((prev) => [...prev, category])
    return category
  }

  const updateCategory = (id: string, data: Partial<Category>): Category | null => {
    let updated: Category | null = null
    setCustomCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== id) return cat
        updated = { ...cat, ...data, subcategories: cat.subcategories }
        return updated
      })
    )
    return updated
  }

  const deleteCategory = (id: string) => {
    setCustomCategories((prev) => prev.filter((cat) => cat.id !== id))
    setCustomProducts((prev) => prev.filter((p) => p.category !== id))
  }

  const addSubcategory = (categoryId: string, data: { name: string; description?: string }): Subcategory | null => {
    const sub: Subcategory = {
      id: generateSlug(data.name),
      name: data.name,
      description: data.description || '',
      products: [],
    }
    setCustomCategories((prev) => {
      const existing = prev.find((cat) => cat.id === categoryId)
      if (existing) {
        return prev.map((cat) => (cat.id === categoryId ? { ...cat, subcategories: [...cat.subcategories, sub] } : cat))
      }
      const baseCat = cloneCatalog().find((c) => c.id === categoryId)
      const newCat: Category = baseCat
        ? { ...baseCat, subcategories: [...baseCat.subcategories, sub] }
        : { id: categoryId, name: categoryId, description: 'Custom category', subcategories: [sub] }
      return [...prev, newCat]
    })
    return sub
  }

  const updateSubcategory = (categoryId: string, subcategoryId: string, data: Partial<Subcategory>): Subcategory | null => {
    let updated: Subcategory | null = null
    setCustomCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) => {
            if (sub.id !== subcategoryId) return sub
            updated = { ...sub, ...data }
            return updated
          }),
        }
      })
    )
    return updated
  }

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCustomCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? { ...cat, subcategories: cat.subcategories.filter((sub) => sub.id !== subcategoryId) }
          : cat
      )
    )
    setCustomProducts((prev) => prev.filter((p) => !(p.category === categoryId && p.subcategory === subcategoryId)))
  }

  const mergedCatalog = useMemo(() => {
    const catalog = cloneCatalog()

    customCategories.forEach((cat) => {
      const existing = catalog.find((c) => c.id === cat.id)
      if (existing) {
        cat.subcategories.forEach((sub) => {
          const existsSub = existing.subcategories.find((s) => s.id === sub.id)
          if (!existsSub) existing.subcategories.push(sub)
        })
      } else {
        catalog.push(cat)
      }
    })

    customProducts.forEach((product) => {
      const categoryId = product.category
      const subcategoryId = product.subcategory || 'general'

      let category = catalog.find((cat) => cat.id === categoryId)
      if (!category) return

      let subcategory = category.subcategories.find((sub) => sub.id === subcategoryId)
      if (!subcategory) {
        subcategory = {
          id: subcategoryId,
          name: product.subcategory || 'General',
          description: 'Custom products',
          products: [],
        }
        category.subcategories.push(subcategory)
      }

      subcategory.products.push(product)
    })

    return catalog
  }, [customProducts])

  const ensureCategory = (categoryId?: string, subcategoryId?: string) => {
    const catalog = cloneCatalog().concat(customCategories)
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
          createdAt: product.createdAt || baseCreatedAt[product.id],
          stock: inventory[product.id] ?? product.stock ?? 30,
          isHotSeller: product.isHotSeller || (clickMap[product.id] || 0) >= 6,
          isRecommended: product.isRecommended || (clickMap[product.id] || 0) >= 3,
          badges:
            product.badges && product.badges.length > 0
              ? product.badges
              : (clickMap[product.id] || 0) >= 6
                ? ['Hot Seller']
                : (clickMap[product.id] || 0) >= 3
                  ? ['Trending']
                  : product.badges,
        }))
      )
    )
  }, [mergedCatalog, inventory, baseCreatedAt, clickMap])

  const getProductById = (id: string) => allProducts.find((product) => product.id === id)

  const getProductsByCategory = (categoryId: string) =>
    allProducts.filter((product) => product.category === categoryId)

  const getProductsBySubcategory = (categoryId: string, subcategoryId: string) =>
    allProducts.filter((product) => product.category === categoryId && product.subcategory === subcategoryId)

  const newListings = useMemo(() => {
    return [...allProducts]
      .sort(
        (a, b) =>
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      )
      .slice(0, 8)
  }, [allProducts])

  const recommendedProducts = useMemo(
    () =>
      allProducts
        .filter((product) => product.isRecommended || product.badges?.includes('Trending'))
        .slice(0, 12),
    [allProducts]
  )

  const hotSellers = useMemo(
    () =>
      allProducts
        .filter((product) => product.isHotSeller || product.badges?.includes('Hot Seller'))
        .slice(0, 12),
    [allProducts]
  )

  const updateInventory = (productId: string, delta: number) => {
    setInventory((prev) => {
      if (prev[productId] === undefined) return prev
      return {
        ...prev,
        [productId]: Math.max(0, (prev[productId] ?? 0) + delta),
      }
    })
  }

  const getInventory = (productId: string) => inventory[productId] ?? 0

  const value: CatalogContextType = {
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
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const context = useContext(CatalogContext)
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider')
  }
  return context
}
