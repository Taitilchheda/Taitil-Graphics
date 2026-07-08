'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Filter } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import type { Product } from '@/data/products'

type Props = {
  products: Product[]
  categories: { id: string; name: string }[]
}

const PAGE_SIZE = 24

export default function AllProductsClient({ products, categories }: Props) {
  const { logEvent } = useAnalytics()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popular')
  // Reset visibleCount to PAGE_SIZE implicitly by deriving it from the
  // filter key — avoids the setState-in-effect lint rule and the
  // cascading-render cost.
  const filterKey = `${searchQuery}|${selectedCategory}|${sortBy}`
  const [lastFilterKey, setLastFilterKey] = useState(filterKey)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey)
    setVisibleCount(PAGE_SIZE)
  }

  useEffect(() => {
    logEvent({ type: 'view', label: 'all-products' })
  }, [logEvent])

  const categoryNames = useMemo(() => ['All', ...categories.map((c) => c.name)], [categories])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const catName = categories.find((c) => c.id === p.category)?.name || p.category
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || catName === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [products, categories, searchQuery, selectedCategory])

  const sorted = useMemo(() => {
    const list = [...filtered]
    switch (sortBy) {
      case 'newest': {
        return list.sort((a, b) => {
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0
          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0
          return bTime - aTime
        })
      }
      case 'name':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      case 'popular':
      default:
        return list
    }
  }, [filtered, sortBy])

  const visible = sorted.slice(0, visibleCount)
  const hasMore = visible.length < sorted.length

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="text-gray-600">
            Discover our complete range of printing and design services
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Categories</span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categoryNames.map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedCategory(name)}
                  className={`shrink-0 px-4 py-2 rounded-full font-medium text-sm border transition-colors ${
                    selectedCategory === name
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-teal-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            Showing {sorted.length} of {products.length} products
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria</p>
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
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} showQuickAdd showBuyNow={false} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((c) => Math.min(c + PAGE_SIZE, sorted.length))}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Load more products
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
