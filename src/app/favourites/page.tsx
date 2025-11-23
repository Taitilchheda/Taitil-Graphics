'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import ProductCard from '@/components/ui/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

const mockFavorites = [
  {
    id: '1',
    name: 'Premium Business Cards',
    description: 'High-quality business cards with premium finishes. Perfect for making a lasting first impression.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $29',
    rating: 4.8,
    reviews: 124,
    category: 'Business Cards',
    features: ['Premium Paper', 'Multiple Finishes', 'Fast Delivery', 'Custom Design']
  },
  {
    id: '2',
    name: 'Custom Logo Design',
    description: 'Professional logo design services to establish your brand identity.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    price: 'From $199',
    rating: 4.9,
    reviews: 89,
    category: 'Design & Logos',
    features: ['Custom Design', 'Multiple Concepts', 'Vector Files', 'Brand Guidelines']
  }
]

export default function FavouritesPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h1>
            <p className="text-lg text-gray-600 mb-8">Please sign in to view your favourites.</p>
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favourites</h1>
          <p className="text-gray-600">Your saved products and services</p>
        </div>

        {mockFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favourites yet</h3>
            <p className="text-gray-600 mb-6">Start browsing and save items you like.</p>
            <Link href="/" className="btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockFavorites.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
