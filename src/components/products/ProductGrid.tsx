'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Heart, ShoppingCart, MessageCircle, Phone } from 'lucide-react'

interface Product {
  id: number
  name: string
  description: string
  image: string
  rating: number
  reviews: number
  category: string
  features: string[]
}

interface ProductGridProps {
  products: Product[]
  viewMode: 'grid' | 'list'
}

export default function ProductGrid({ products, viewMode }: ProductGridProps) {
  const [favorites, setFavorites] = useState<number[]>([])
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)

  const toggleFavorite = (productId: number) => {
    setFavorites(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleWhatsAppEnquiry = (productName: string) => {
    const message = `Hi! I'm interested in ${productName}. Could you please provide more information about pricing and customization options?`
    const phoneNumber = '+918878380308'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCallEnquiry = () => {
    window.open('tel:+918878380308', '_self')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
            ? 'text-yellow-400 fill-current opacity-50' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Product Image */}
              <div className="md:w-48 flex-shrink-0">
                <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden">
                  <button type="button" onClick={() => setLightboxImage(product.image || '/logo.svg')} className="block w-full h-full">
                    <Image
                      src={product.image || '/logo.svg'}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 20vw, 60vw"
                      className="object-contain bg-white"
                    />
                  </button>
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        <Link href={`/products/${product.id}`} className="hover:text-teal-600">
                          {product.name}
                        </Link>
                      </h3>
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        {product.category}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{product.description}</p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {product.features.map((feature, index) => (
                        <span key={index} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded">
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 min-w-[120px] bg-teal-600 hover:bg-teal-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleWhatsAppEnquiry(product.name)}
                      className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={handleCallEnquiry}
                      className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b px-4 py-2 text-sm">
              <span className="font-medium">Preview</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <div className="h-[80vh] overflow-auto p-4">
              <img
                src={lightboxImage}
                alt="Product preview"
                className="mx-auto max-h-none w-auto max-w-none"
              />
            </div>
            <div className="border-t px-4 py-2 text-xs text-gray-500">Scroll to pan. Use Ctrl + mouse wheel to zoom.</div>
          </div>
        </div>
      )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          {/* Product Image */}
          <div className="relative aspect-[4/3] bg-gray-100">
            <button type="button" onClick={() => setLightboxImage(product.image || '/logo.svg')} className="block w-full h-full">
              <Image
                src={product.image || '/logo.svg'}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-contain bg-white"
              />
            </button>
            <button
              onClick={() => toggleFavorite(product.id)}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
            </button>
            <div className="absolute top-2 left-2">
              <span className="bg-white text-gray-700 text-xs px-2 py-1 rounded">
                {product.category}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              <Link href={`/products/${product.id}`} className="hover:text-teal-600">
                {product.name}
              </Link>
            </h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

            {/* Features */}
            <div className="flex flex-wrap gap-1 mb-3">
              {product.features.slice(0, 2).map((feature, index) => (
                <span key={index} className="bg-teal-50 text-teal-700 text-xs px-2 py-1 rounded">
                  {feature}
                </span>
              ))}
              {product.features.length > 2 && (
                <span className="text-gray-500 text-xs">+{product.features.length - 2} more</span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mb-3">
              <div className="flex items-center">
                {renderStars(product.rating)}
              </div>
              <span className="text-sm text-gray-600">
                ({product.reviews})
              </span>
            </div>



            {/* Action Buttons */}
            <div className="space-y-2">
              <Link
                href={`/products/${product.id}`}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-center py-2 px-4 rounded-lg transition-colors block"
              >
                View Details
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleWhatsAppEnquiry(product.name)}
                  className="flex items-center justify-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={handleCallEnquiry}
                  className="flex items-center justify-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    </>
  )
}
