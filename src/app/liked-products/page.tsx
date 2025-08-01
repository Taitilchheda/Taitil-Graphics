'use client'

import { useCart } from '@/components/providers/CartProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function LikedProductsPage() {
  const { likedProducts, toggleLike, addToCart, isLiked } = useCart()

  const handleAddToCart = (product: any) => {
    addToCart(product)
  }

  const handleRemoveFromLikes = (product: any) => {
    toggleLike(product)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Liked Products</h1>
          <p className="text-gray-600">
            {likedProducts.length === 0 
              ? "You haven't liked any products yet. Start browsing to find products you love!"
              : `You have ${likedProducts.length} liked product${likedProducts.length === 1 ? '' : 's'}`
            }
          </p>
        </div>

        {likedProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">No liked products yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Discover amazing products and save your favorites by clicking the heart icon on any product.
            </p>
            <Link
              href="/categories/all"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {likedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromLikes(product)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                    title="Remove from likes"
                  >
                    <Heart className="w-5 h-5 text-pink-500 fill-current" />
                  </button>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-teal-600">₹{product.price}</span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFromLikes(product)}
                      className="p-2 border border-gray-300 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
                      title="Remove from likes"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {likedProducts.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to order?</h3>
              <p className="text-gray-600 mb-6">
                Add your favorite products to cart and proceed to checkout for fast delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/cart"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  View Cart
                </Link>
                <Link
                  href="/categories/all"
                  className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
