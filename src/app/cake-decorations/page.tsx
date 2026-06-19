'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useEffect } from 'react'
import Link from 'next/link'
import { MessageCircle, Cake } from 'lucide-react'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import ProductCard from '@/components/ui/ProductCard'
import { useCatalog } from '@/components/providers/CatalogProvider'

export default function CakeDecorationsPage() {
  const { logEvent } = useAnalytics()
  const { getProductsBySubcategory } = useCatalog()

  const paperFromCatalog = getProductsBySubcategory('cake-decorations', 'premium-paper-cake-toppers')
  const acrylicFromCatalog = getProductsBySubcategory('cake-decorations', 'luxury-acrylic-cake-toppers')

  const paperToppers = paperFromCatalog
    .filter((prod) => prod && prod.id)
    .map((prod) => ({
      ...prod,
      badges: [],
    }))

  const acrylicToppers = acrylicFromCatalog
    .filter((prod) => prod && prod.id)
    .map((prod) => ({
      ...prod,
      badges: [],
    }))

  useEffect(() => {
    logEvent({ type: 'view', categoryId: 'cake-decorations', label: 'cake-decorations-landing' })
  }, [logEvent])

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <header className="bg-white rounded-lg shadow-md p-8 space-y-5">
          <p className="inline-flex items-center text-xs font-semibold text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
            <Cake className="w-4 h-4 mr-2" /> Cake Decorations
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Paper & Acrylic Cake Toppers</h1>
          <p className="text-lg text-gray-600">
            Category: Cake Decoration - Premium Paper Cake Toppers / Luxury Acrylic Cake Toppers. Browse curated sets and confirm on WhatsApp.
          </p>

          <div className="flex flex-wrap gap-3">
            <span className="bg-teal-50 px-4 py-2 rounded-lg text-teal-700 font-medium text-sm">Premium Quality</span>
            <span className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium text-sm">Fast Delivery</span>
            <span className="bg-green-50 px-4 py-2 rounded-lg text-green-700 font-medium text-sm">Custom Design</span>
            <span className="bg-purple-50 px-4 py-2 rounded-lg text-purple-700 font-medium text-sm">Bulk Discounts</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/categories/cake-decorations/premium-paper-cake-toppers" className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100">
              Premium Paper Toppers
            </Link>
            <Link href="/categories/cake-decorations/luxury-acrylic-cake-toppers" className="inline-flex items-center rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100">
              Luxury Acrylic Toppers
            </Link>
            <Link href="/butterflies" className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary-200">
              See Butterfly Picks
            </Link>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Curated Premium Paper Cake Toppers</h2>
            <p className="text-sm text-gray-600">Premium Paper topper with plain/foil finish.</p>
          </div>
          {paperToppers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paperToppers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
              No premium paper toppers are listed yet. Add products from the admin listings page to populate this section.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Curated Luxury Acrylic Cake Toppers</h2>
            <p className="text-sm text-gray-600">Golden Mirror acrylic toppers.</p>
          </div>
          {acrylicToppers.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {acrylicToppers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
              No luxury acrylic toppers are listed yet. Add products from the admin listings page to populate this section.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
