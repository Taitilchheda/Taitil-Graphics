'use client'

import Header from '@/components/layout/Header'
import ProductCard from '@/components/ui/ProductCard'
import { useAuth } from '@/components/providers/AuthProvider'
import ChatWidget from '@/components/chat/ChatWidget'

const businessCardProducts = [
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
    name: 'Eco-Friendly Business Cards',
    description: 'Sustainable business cards made from recycled materials. Show your commitment to the environment.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $35',
    rating: 4.6,
    reviews: 89,
    category: 'Business Cards',
    features: ['Recycled Paper', 'Eco-Friendly', 'Biodegradable', 'Green Printing']
  },
  {
    id: '3',
    name: 'Luxury Foil Business Cards',
    description: 'Elegant business cards with gold or silver foil accents. Perfect for luxury brands and executives.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $59',
    rating: 4.9,
    reviews: 67,
    category: 'Business Cards',
    features: ['Foil Stamping', 'Luxury Feel', 'Premium Stock', 'Custom Colors']
  },
  {
    id: '4',
    name: 'Digital Business Cards',
    description: 'Modern NFC-enabled business cards that can share your contact info digitally with a simple tap.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $79',
    rating: 4.7,
    reviews: 45,
    category: 'Business Cards',
    features: ['NFC Technology', 'Digital Sharing', 'Contactless', 'Modern Design']
  },
  {
    id: '5',
    name: 'Minimalist Business Cards',
    description: 'Clean, simple designs that focus on essential information. Perfect for modern professionals.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $25',
    rating: 4.5,
    reviews: 156,
    category: 'Business Cards',
    features: ['Clean Design', 'Professional', 'Quick Turnaround', 'Affordable']
  },
  {
    id: '6',
    name: 'Creative Business Cards',
    description: 'Unique, eye-catching designs that help you stand out from the competition.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $45',
    rating: 4.8,
    reviews: 92,
    category: 'Business Cards',
    features: ['Creative Design', 'Unique Shapes', 'Bold Colors', 'Memorable']
  }
]

export default function BusinessCardsPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <nav className="text-sm text-gray-500 mb-4">
            <span>Home</span> / <span>Business Essentials</span> / <span className="text-gray-900">Business Cards</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Cards</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Make a lasting impression with our premium business cards. Choose from various styles, 
            finishes, and materials to perfectly represent your brand.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>All Styles</option>
            <option>Premium</option>
            <option>Eco-Friendly</option>
            <option>Luxury</option>
            <option>Digital</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Price Range</option>
            <option>Under $30</option>
            <option>$30 - $50</option>
            <option>$50 - $80</option>
            <option>Over $80</option>
          </select>
          
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option>Sort by</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
            <option>Highest Rated</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessCardProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="btn-primary">
            Load More Products
          </button>
        </div>
      </main>

      {/* Chat widget - only show for logged in users */}
      {user && <ChatWidget />}
    </div>
  )
}
