'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'
import { Search, Filter } from 'lucide-react'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'

export default function AllProductsPage() {
  const { categories, allProducts } = useCatalog()
  const { logEvent } = useAnalytics()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popular')

  useEffect(() => {
    logEvent({ type: 'view', label: 'all-products' })
  }, [logEvent])

  const productsWithMeta = useMemo(
    () =>
      allProducts.map((product, index) => {
        const category = categories.find((cat) => cat.id === product.category)
        const subcategory = category?.subcategories.find((sub) => sub.id === product.subcategory)
        const fallbackCreatedAt = product.createdAt || `2024-01-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`
        return {
          ...product,
          categoryName: category?.name || product.category,
          subcategoryName: subcategory?.name || product.subcategory,
          rating: (product as any).rating || 4.8,
          reviews: (product as any).reviews || 120,
          isPopular: product.isRecommended,
          isBestSeller: product.isHotSeller,
          createdAt: fallbackCreatedAt,
        }
      }),
    [allProducts, categories]
  )

  const categoryNames = ['All', ...categories.map((cat) => cat.name)]

  const filteredProducts = productsWithMeta.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.categoryName === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'popular':
      default:
        return (b.reviews || 0) - (a.reviews || 0)
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600">
            Discover our complete range of printing and design services
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex-1 w-full max-w-xl">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products, materials, services..."
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value
                    setSearchQuery(value)
                    if (value.length > 2) {
                      logEvent({ type: 'click', label: 'search', meta: { query: value } })
                    }
                  }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-gray-50"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-60">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="name">Name A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Categories</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categoryNames.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm border transition-colors ${
                    selectedCategory === category
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sortedProducts.length} of {allProducts.length} products
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All')
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-stretch">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} showQuickAdd={true} showBuyNow={false} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        {sortedProducts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Load More Products
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
