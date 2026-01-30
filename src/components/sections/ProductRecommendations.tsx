'use client'

import ProductCard from '@/components/ui/ProductCard'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { getPersonalizedRecommendations } from '@/lib/recommendations'

export default function ProductRecommendations() {
  const { allProducts, recommendedProducts } = useCatalog()
  const { events } = useAnalytics()

  const personalized = getPersonalizedRecommendations(allProducts, events, recommendedProducts, 6)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recommended for You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored picks based on what you browse and search for most.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {personalized.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/categories/all"
            className="inline-flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            <span>View All Products</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
