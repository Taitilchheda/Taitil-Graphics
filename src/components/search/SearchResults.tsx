'use client'

import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'

interface SearchResultsProps {
  initialQuery?: string
}

// Mock product database
const allProducts = [
  {
    id: 1,
    name: 'Standard Visiting Cards',
    description: 'Professional business cards with premium quality printing',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.5,
    reviews: 1250,
    category: 'Visiting Cards',
    features: ['Premium Paper', 'Multiple Designs', 'Fast Delivery'],
    keywords: ['business cards', 'visiting cards', 'professional', 'standard', 'cards']
  },
  {
    id: 2,
    name: 'Premium Visiting Cards',
    description: 'Luxury business cards with special finishes',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.8,
    reviews: 890,
    category: 'Visiting Cards',
    features: ['Spot UV', 'Foil Stamping', 'Thick Paper'],
    keywords: ['business cards', 'visiting cards', 'premium', 'luxury', 'foil', 'uv']
  },
  {
    id: 3,
    name: 'Custom Flyers',
    description: 'Eye-catching flyers for marketing campaigns',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.6,
    reviews: 567,
    category: 'Marketing',
    features: ['Custom Design', 'High Quality Print', 'Various Sizes'],
    keywords: ['flyers', 'marketing', 'promotional', 'advertising', 'leaflets']
  },
  {
    id: 4,
    name: 'Custom Brochures',
    description: 'Professional brochures for business promotion',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.7,
    reviews: 423,
    category: 'Marketing',
    features: ['Tri-fold', 'Bi-fold', 'Custom Design'],
    keywords: ['brochures', 'marketing', 'business', 'promotional', 'tri-fold', 'bi-fold']
  },
  {
    id: 5,
    name: 'Custom T-Shirts',
    description: 'Personalized t-shirts with your design',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.4,
    reviews: 789,
    category: 'Clothing',
    features: ['Cotton Material', 'Custom Print', 'Various Colors'],
    keywords: ['t-shirts', 'clothing', 'custom', 'apparel', 'shirts', 'cotton']
  },
  {
    id: 6,
    name: 'Letterheads',
    description: 'Professional letterheads for business correspondence',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.3,
    reviews: 345,
    category: 'Stationery',
    features: ['Premium Paper', 'Custom Logo', 'Professional Design'],
    keywords: ['letterheads', 'stationery', 'business', 'professional', 'correspondence']
  },
  {
    id: 7,
    name: 'Banners',
    description: 'Large format banners for events and advertising',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.6,
    reviews: 234,
    category: 'Marketing',
    features: ['Weather Resistant', 'Large Format', 'Vibrant Colors'],
    keywords: ['banners', 'advertising', 'large format', 'outdoor', 'events', 'signage']
  },
  {
    id: 8,
    name: 'Custom Mugs',
    description: 'Personalized mugs with your design or photo',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    rating: 4.5,
    reviews: 456,
    category: 'Gifts',
    features: ['Ceramic Material', 'Photo Print', 'Dishwasher Safe'],
    keywords: ['mugs', 'gifts', 'personalized', 'ceramic', 'photo', 'custom']
  }
]

export default function SearchResults({ initialQuery = '' }: SearchResultsProps) {
  const { allProducts } = useCatalog()
  const { logEvent } = useAnalytics()
  const [query, setQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<typeof allProducts>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const performSearch = () => {
      setIsLoading(true)

      if (!query.trim()) {
        setSearchResults([])
        setIsLoading(false)
        return
      }

      const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0)

      const results = allProducts.filter(product => {
        const searchableText = [
          product.name,
          product.description,
          product.category,
          ...product.features,
          ...product.keywords
        ].join(' ').toLowerCase()

        return searchTerms.some(term => searchableText.includes(term))
      })

      // Sort by relevance (number of matching terms)
      results.sort((a, b) => {
        const aMatches = searchTerms.filter(term => {
          const aText = [a.name, a.description, a.category, ...a.features, ...a.keywords].join(' ').toLowerCase()
          return aText.includes(term)
        }).length

        const bMatches = searchTerms.filter(term => {
          const bText = [b.name, b.description, b.category, ...b.features, ...b.keywords].join(' ').toLowerCase()
          return bText.includes(term)
        }).length

        return bMatches - aMatches
      })

      setSearchResults(results)
      setIsLoading(false)
      logEvent({ type: 'click', label: 'search-results', meta: { query, hits: results.length } })
    }

    // Simulate search delay
    const timeoutId = setTimeout(performSearch, 300)
    return () => clearTimeout(timeoutId)
  }, [query, allProducts, logEvent])

  useEffect(() => {
    setQuery(initialQuery)
    if (initialQuery) {
      logEvent({ type: 'view', label: 'search-page', meta: { query: initialQuery } })
    }
  }, [initialQuery, logEvent])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Search className="w-4 h-4" />
          <span>Search results for:</span>
          <span className="font-medium text-gray-900">"{query}"</span>
        </div>

        {!isLoading && (
          <p className="text-gray-600">
            {searchResults.length === 0
              ? 'No products found'
              : `Found ${searchResults.length} product${searchResults.length !== 1 ? 's' : ''}`
            }
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchResults.length === 0 && query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            Try searching with different keywords or browse our categories.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Popular searches:</span>
            <a href="/search?q=business cards" className="text-sm text-teal-600 hover:text-teal-700">business cards</a>
            <span className="text-gray-300">•</span>
            <a href="/search?q=flyers" className="text-sm text-teal-600 hover:text-teal-700">flyers</a>
            <span className="text-gray-300">•</span>
            <a href="/search?q=t-shirts" className="text-sm text-teal-600 hover:text-teal-700">t-shirts</a>
            <span className="text-gray-300">•</span>
            <a href="/search?q=banners" className="text-sm text-teal-600 hover:text-teal-700">banners</a>
          </div>
        </div>
      )}

      {/* Search Results */}
      {!isLoading && searchResults.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}

      {/* No Query */}
      {!query && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start your search</h3>
          <p className="text-gray-600 mb-6">
            Enter keywords to find the perfect printing solution for your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="text-sm text-gray-500">Try searching for:</span>
            <a href="/search?q=business cards" className="text-sm text-teal-600 hover:text-teal-700">business cards</a>
            <span className="text-gray-300">•</span>
            <a href="/search?q=flyers" className="text-sm text-teal-600 hover:text-teal-700">flyers</a>
            <span className="text-gray-300">•</span>
            <a href="/search?q=brochures" className="text-sm text-teal-600 hover:text-teal-700">brochures</a>
            <span className="text-gray-300">•</span>
            <a href="/search?q=stationery" className="text-sm text-teal-600 hover:text-teal-700">stationery</a>
          </div>
        </div>
      )}
    </div>
  )
}
