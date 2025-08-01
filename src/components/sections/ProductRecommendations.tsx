'use client'

import ProductCard from '@/components/ui/ProductCard'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  description: string
  rating: number
  reviews: number
  originalPrice?: number
  discount?: number
  isPopular?: boolean
  isBestSeller?: boolean
}

const recommendedProducts: Product[] = [
  {
    id: 'rec-1',
    name: 'Premium Business Cards',
    price: 299,
    originalPrice: 399,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=250&fit=crop',
    category: 'Business Cards',
    description: 'Professional matte finish business cards with premium quality printing',
    rating: 4.8,
    reviews: 156,
    isPopular: true
  },
  {
    id: 'rec-2',
    name: 'Custom Letterheads',
    price: 199,
    originalPrice: 249,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop',
    category: 'Stationery',
    description: 'Professional letterheads for your business correspondence',
    rating: 4.7,
    reviews: 89,
    isBestSeller: true
  },
  {
    id: 'rec-3',
    name: 'Marketing Flyers',
    price: 149,
    originalPrice: 199,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    category: 'Marketing',
    description: 'Eye-catching flyers for your marketing campaigns',
    rating: 4.6,
    reviews: 234,
    isPopular: true
  },
  {
    id: 'rec-4',
    name: 'Custom T-Shirts',
    price: 399,
    originalPrice: 499,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=250&fit=crop',
    category: 'Clothing',
    description: 'High-quality custom printed t-shirts for your brand',
    rating: 4.9,
    reviews: 178,
    isBestSeller: true
  },
  {
    id: 'rec-5',
    name: 'Promotional Mugs',
    price: 249,
    originalPrice: 299,
    discount: 17,
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=250&fit=crop',
    category: 'Gifts',
    description: 'Custom printed ceramic mugs perfect for promotional gifts',
    rating: 4.5,
    reviews: 92,
    isPopular: true
  },
  {
    id: 'rec-6',
    name: 'Vinyl Banners',
    price: 599,
    originalPrice: 799,
    discount: 25,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
    category: 'Signage',
    description: 'Durable vinyl banners for outdoor advertising',
    rating: 4.8,
    reviews: 67,
    isBestSeller: true
  }
]

export default function ProductRecommendations() {

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Recommended for You
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most popular products loved by thousands of customers. 
            Premium quality, competitive prices, and fast delivery guaranteed.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
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
