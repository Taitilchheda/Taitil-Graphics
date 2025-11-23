'use client'

import { useCart } from '@/components/providers/CartProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { Heart, ShoppingCart, Star, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  image: string
  category: string
  description: string
  price?: string
  rating?: number
  reviews?: number
  isPopular?: boolean
  isBestSeller?: boolean
  isHotSeller?: boolean
  isRecommended?: boolean
  isNew?: boolean
  badges?: string[]
  features?: string[]
}

interface ProductCardProps {
  product: Product
  showQuickAdd?: boolean
  className?: string
}

export default function ProductCard({ product, showQuickAdd = true, className = '' }: ProductCardProps) {
  const { addToCart, toggleLike, isLiked } = useCart()
  const { logEvent } = useAnalytics()
  const { updateInventory } = useCatalog()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    updateInventory(product.id, -1)
    logEvent({ type: 'cart', productId: product.id, categoryId: product.category, label: 'card-add' })
    toast.success(`${product.name} added to cart!`)
  }

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleLike(product)
    logEvent({ type: 'click', productId: product.id, label: 'card-like' })
    if (isLiked(product.id)) {
      toast.success(`Removed from liked products`)
    } else {
      toast.success(`Added to liked products`)
    }
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 ${className}`}
    >
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={250}
            className="w-full h-48 object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
        
        {/* Like Button */}
        <button
          onClick={handleToggleLike}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isLiked(product.id)
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-current' : ''}`} />
        </button>

      </div>

      {/* Product Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-teal-600 font-medium">{product.category}</span>
          {product.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
              {product.reviews && (
                <span className="text-sm text-gray-400">({product.reviews})</span>
              )}
            </div>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>
          <Link
            href={`/products/${product.id}`}
            className="px-4 py-2 border border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
