'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Cake } from 'lucide-react'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import ProductCard from '@/components/ui/ProductCard'
import { useCatalog } from '@/components/providers/CatalogProvider'

type TopperType = 'paper' | 'acrylic'

interface TopperProduct {
  id: string
  name: string
  image: string
  description: string
  category: string
  subcategory: string
  badges?: string[]
}

const paperImages = [
  'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
]

const acrylicImages = [
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
]

const buildTopperList = (count: number, base: string, type: TopperType, pool: string[]): TopperProduct[] =>
  Array.from({ length: count }).map((_, idx) => ({
    id: `${type}-${idx + 1}`,
    name: `${base} #${idx + 1}`,
    image: pool[idx % pool.length],
    description: type === 'paper'
      ? 'Premium Paper topper with print/foil finish.'
      : 'Golden Mirror acrylic topper cut to a high finish.',
    category: 'cake-decorations',
    subcategory: type === 'paper' ? 'premium-paper-cake-toppers' : 'luxury-acrylic-cake-toppers',
    badges: [],
  }))

export default function CakeDecorationsPage() {
  const { logEvent } = useAnalytics()
  const { getProductsBySubcategory } = useCatalog()

  const paperFromCatalog = getProductsBySubcategory('cake-decorations', 'premium-paper-cake-toppers')
  const acrylicFromCatalog = getProductsBySubcategory('cake-decorations', 'luxury-acrylic-cake-toppers')

  const paperToppers = paperFromCatalog.length
    ? paperFromCatalog.map((prod) => ({
        ...prod,
        badges: [],
      }))
    : buildTopperList(100, 'Premium Paper Topper', 'paper', paperImages)

  const acrylicToppers = acrylicFromCatalog.length
    ? acrylicFromCatalog.map((prod) => ({
        ...prod,
        badges: [],
      }))
    : buildTopperList(200, 'Luxury Acrylic Topper', 'acrylic', acrylicImages)

  useEffect(() => {
    logEvent({ type: 'view', categoryId: 'cake-decorations', label: 'cake-decorations-landing' })
  }, [logEvent])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="space-y-3">
          <p className="inline-flex items-center text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
            <Cake className="w-4 h-4 mr-2" /> Cake Decorations
          </p>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            Paper & Acrylic Cake Toppers
          </h1>
          <p className="text-lg text-gray-700">
            Category: Cake Decoration → Premium Paper Cake Toppers / Luxury Acrylic Cake Toppers. Browse hundreds of designs and confirm on WhatsApp.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://wa.me/917666247666?text=Hi! I'd like to order cake toppers."
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp to order
            </a>
            <Link href="/categories/cake-decorations/premium-paper-cake-toppers" className="text-primary-700 font-semibold">
              Premium Paper Toppers
            </Link>
            <Link href="/categories/cake-decorations/luxury-acrylic-cake-toppers" className="text-primary-700 font-semibold">
              Luxury Acrylic Toppers
            </Link>
            <Link href="/butterflies" className="text-primary-700 font-semibold">See Butterfly Picks</Link>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Wide Range of Premium Paper Cake Toppers</h2>
            <p className="text-sm text-gray-600">Premium Paper topper with plain/foil finish.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paperToppers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Wide Range of Luxury Acrylic Cake Toppers</h2>
            <p className="text-sm text-gray-600">Golden Mirror acrylic toppers.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {acrylicToppers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
