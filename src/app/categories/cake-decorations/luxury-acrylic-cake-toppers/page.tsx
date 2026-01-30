'use client'

import { useMemo } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import { useCatalog } from '@/components/providers/CatalogProvider'

type TopperProduct = {
  id: string
  name: string
  image: string
  description: string
  category: string
  subcategory: string
  badges?: string[]
}

const topperImages = [
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=600&fit=crop',
]

const buildTopperList = (): TopperProduct[] => {
  const baseNames = [
    'Mirror Gold Script Topper',
    'Rose Gold Block Topper',
    'Frosted Acrylic Minimal',
    'Tinted Pastel Acrylic',
  ]

  return Array.from({ length: 10 }).map((_, idx) => ({
    id: `acrylic-${idx + 1}`,
    name: `${baseNames[idx % baseNames.length]} #${idx + 1}`,
    image: topperImages[idx % topperImages.length],
    description: 'Golden Mirror acrylic toppers.',
    category: 'cake-decorations',
    subcategory: 'luxury-acrylic-cake-toppers',
  }))
}

export default function LuxuryAcrylicCakeToppersPage() {
  const { getProductsBySubcategory } = useCatalog()
  const catalogProducts = getProductsBySubcategory('cake-decorations', 'luxury-acrylic-cake-toppers')

  const products = useMemo(() => {
    if (catalogProducts.length) {
      return catalogProducts.map((prod) => ({
        ...prod,
        badges: [],
      }))
    }
    return buildTopperList()
  }, [catalogProducts])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-primary-700 font-semibold">Cake Decoration / Cake Toppers / Luxury Acrylic Cake Toppers</p>
          <h1 className="text-3xl font-bold text-gray-900">Curated Acrylic Cake Toppers</h1>
          <p className="text-gray-600">Golden Mirror acrylic toppers. Tap a card to view details or add to cart.</p>
        </div>

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
