'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import ProductFilters from '@/components/products/ProductFilters'
import ChatWidget from '@/components/chat/ChatWidget'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { Filter, Grid, List } from 'lucide-react'

export default function VisitingCardsPage() {
  const { user } = useAuth()
  const { getProductsBySubcategory } = useCatalog()
  const { logEvent } = useAnalytics()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')

  const products = getProductsBySubcategory('business-essentials', 'visiting-cards')

  useEffect(() => {
    logEvent({ type: 'view', categoryId: 'business-essentials', subcategoryId: 'visiting-cards', label: 'visiting-cards-page' })
  }, [logEvent])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><a href="/" className="text-gray-500 hover:text-teal-600">Home</a></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">Visiting Cards</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Visiting Cards</h1>
          <p className="text-gray-600 max-w-3xl">
            Create professional business cards that make a lasting impression. Choose from our wide range of 
            designs, papers, and finishes to perfectly represent your brand.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <ProductFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 text-gray-700 hover:text-teal-600"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
                <span className="text-gray-600">{products.length} products</span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="popular">Most Popular</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-teal-100 text-teal-600' : 'text-gray-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as any}
                  className={viewMode === 'list' ? 'flex flex-row' : ''}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Chat widget */}
      {user && <ChatWidget />}
    </div>
  )
}
