'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useEffect, useMemo } from 'react'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import ProductCard from '@/components/ui/ProductCard'

const butterflyImages = [
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
]

interface ButterflyProduct {
  id: string
  name: string
  image: string
  description: string
  category: string
  subcategory: string
}

const buildButterflies = (): ButterflyProduct[] =>
  Array.from({ length: 10 }).map((_, idx) => ({
    id: `butterfly-${idx + 1}`,
    name: `Butterfly Accent Kit #${idx + 1}`,
    image: butterflyImages[idx % butterflyImages.length],
    description: 'Metallic butterflies, palm leaves, and floral picks for cakes and decor.',
    category: 'cake-decorations',
    subcategory: 'butterfly-decoration',
  }))

export default function ButterfliesPage() {
  const { logEvent } = useAnalytics()
  const { getProductsBySubcategory } = useCatalog()

  const catalogProducts = getProductsBySubcategory('cake-decorations', 'butterfly-decoration')

  const products = useMemo(() => {
    if (catalogProducts.length) {
      return catalogProducts.map((prod) => ({ ...prod, badges: [] }))
    }
    return buildButterflies()
  }, [catalogProducts])

  useEffect(() => {
    logEvent({ type: 'view', categoryId: 'butterfly-decor', label: 'butterfly-page' })
  }, [logEvent])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Butterfly & Palm Leaf Picks</h1>
          <p className="text-gray-600">Curated butterfly accent kits for cakes and decor.</p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
