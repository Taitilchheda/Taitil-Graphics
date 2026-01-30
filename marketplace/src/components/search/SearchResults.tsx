'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'

interface SearchResultsProps {
  initialQuery?: string
}

export default function SearchResults({ initialQuery = '' }: SearchResultsProps) {
  const { allProducts } = useCatalog()
  const { logEvent } = useAnalytics()
  const [query, setQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fallbackIndex = useMemo(() => allProducts, [allProducts])

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true)
      setError(null)

      if (!query.trim()) {
        setSearchResults([])
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/products/search?search=${encodeURIComponent(query)}&page=1&limit=24`)
        if (!res.ok) throw new Error('Search failed')
        const data = await res.json()
        const normalized = (data.products || []).map((product: any) => ({
          ...product,
          category: product.category?.id || product.category?.name || product.categoryId || product.category || '',
          subcategory: product.subcategory?.id || product.subcategory?.name || product.subcategoryId || product.subcategory || '',
        }))
        setSearchResults(normalized)
        logEvent({ type: 'click', label: 'search-results', meta: { query, hits: normalized.length } })
      } catch (err: any) {
        // Fallback to client-side search if API fails
        const searchTerms = query.toLowerCase().split(' ').filter((term) => term.length > 0)
        const results = fallbackIndex.filter((product: any) => {
          const searchableText = [
            product.name,
            product.description,
            product.category,
            product.subcategory,
            ...(product.features || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return searchTerms.some((term) => searchableText.includes(term))
        })
        setSearchResults(results)
        setError('Search API unavailable. Showing local results.')
      } finally {
        setIsLoading(false)
      }
    }

    const timeoutId = setTimeout(performSearch, 200)
    return () => clearTimeout(timeoutId)
  }, [query, fallbackIndex, logEvent])

  useEffect(() => {
    setQuery(initialQuery)
    if (initialQuery) {
      logEvent({ type: 'view', label: 'search-page', meta: { query: initialQuery } })
    }
  }, [initialQuery, logEvent])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Search className="w-4 h-4" />
          <span>Search results for:</span>
          <span className="font-medium text-gray-900">&quot;{query}&quot;</span>
        </div>

        {!isLoading && (
          <p className="text-gray-600">
            {searchResults.length === 0
              ? 'No products found'
              : `Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''}`}
          </p>
        )}
        {error && <p className="text-xs text-amber-600 mt-2">{error}</p>}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      )}

      {!isLoading && searchResults.length === 0 && query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">Try searching with different keywords or browse our categories.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Popular searches:</span>
            <a href="/search?q=business cards" className="text-sm text-teal-600 hover:text-teal-700">business cards</a>
            <span className="text-gray-300">-</span>
            <a href="/search?q=flyers" className="text-sm text-teal-600 hover:text-teal-700">flyers</a>
            <span className="text-gray-300">-</span>
            <a href="/search?q=t-shirts" className="text-sm text-teal-600 hover:text-teal-700">t-shirts</a>
            <span className="text-gray-300">-</span>
            <a href="/search?q=banners" className="text-sm text-teal-600 hover:text-teal-700">banners</a>
          </div>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
          <p className="text-gray-600 mb-6">Enter keywords to find the perfect printing solution for your needs.</p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Try searching for:</span>
            <a href="/search?q=business cards" className="text-sm text-teal-600 hover:text-teal-700">business cards</a>
            <span className="text-gray-300">-</span>
            <a href="/search?q=flyers" className="text-sm text-teal-600 hover:text-teal-700">flyers</a>
            <span className="text-gray-300">-</span>
            <a href="/search?q=brochures" className="text-sm text-teal-600 hover:text-teal-700">brochures</a>
            <span className="text-gray-300">-</span>
            <a href="/search?q=stationery" className="text-sm text-teal-600 hover:text-teal-700">stationery</a>
          </div>
        </div>
      )}
    </div>
  )
}
