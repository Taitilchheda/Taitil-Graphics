'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductGrid from '@/components/products/ProductGrid'
import ProductFilters from '@/components/products/ProductFilters'
import ChatWidget from '@/components/chat/ChatWidget'
import { Filter, Grid, List } from 'lucide-react'

export default function VisitingCardsPage() {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('popular')

  const products = [
    {
      id: 1,
      name: 'Standard Visiting Cards',
      description: 'Professional business cards with premium quality printing',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      rating: 4.5,
      reviews: 1250,
      category: 'Standard',
      features: ['Premium Paper', 'Multiple Designs', 'Fast Delivery']
    },
    {
      id: 2,
      name: 'Premium Visiting Cards',
      description: 'Luxury business cards with special finishes',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      rating: 4.8,
      reviews: 890,
      category: 'Premium',
      features: ['Spot UV', 'Foil Stamping', 'Thick Paper']
    },
    {
      id: 3,
      name: 'QR Code Visiting Cards',
      description: 'Modern business cards with QR code integration',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      rating: 4.6,
      reviews: 567,
      category: 'Digital',
      features: ['QR Code', 'Digital Integration', 'Modern Design']
    },
    {
      id: 4,
      name: 'Rounded Corner Cards',
      description: 'Stylish business cards with rounded corners',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      rating: 4.4,
      reviews: 423,
      category: 'Shaped',
      features: ['Rounded Corners', 'Unique Shape', 'Eye-catching']
    },
    {
      id: 5,
      name: 'NFC Visiting Cards',
      description: 'Smart business cards with NFC technology',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      rating: 4.9,
      reviews: 234,
      category: 'Smart',
      features: ['NFC Chip', 'Digital Contact', 'Tech-Forward']
    },
    {
      id: 6,
      name: 'Transparent Cards',
      description: 'Unique transparent business cards',
      image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      rating: 4.7,
      reviews: 345,
      category: 'Specialty',
      features: ['Transparent', 'Unique Material', 'Premium Look']
    }
  ]

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
            <ProductGrid products={products} viewMode={viewMode} />
          </div>
        </div>
      </main>

      <Footer />

      {/* Chat widget */}
      {user && <ChatWidget />}
    </div>
  )
}
