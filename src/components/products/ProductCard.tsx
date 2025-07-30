'use client'

import Image from 'next/image'
import { MessageCircle, Heart, Star } from 'lucide-react'
import { useState } from 'react'

interface Product {
  id: string
  name: string
  description: string
  image: string
  price: string
  rating: number
  reviews: number
  category: string
  features: string[]
}

interface ProductCardProps {
  product: Product
  viewMode?: 'grid' | 'list'
}

export default function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I'm interested in ${product.name}. Could you please provide more information about pricing and availability?`
    const phoneNumber = '+1234567890' // Replace with your actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const toggleFavorite = () => {
    setIsFavorited(!isFavorited)
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 flex">
        {/* Image Section */}
        <div className="relative w-48 h-32 bg-gray-100 flex-shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                {product.name}
              </h3>
              <div className="text-lg font-bold text-primary-600 ml-4">
                {product.price}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {product.features.slice(0, 4).map((feature, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between ml-4">
            <button
              onClick={toggleFavorite}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow mb-2"
            >
              <Heart
                className={`w-5 h-5 ${
                  isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'
                }`}
              />
            </button>

            <button
              onClick={handleWhatsAppEnquiry}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="product-card group">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
        >
          <Heart 
            className={`w-5 h-5 ${
              isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'
            }`}
          />
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
          {product.category}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
          <div className="text-lg font-bold text-primary-600">
            {product.price}
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {product.rating} ({product.reviews} reviews)
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        {/* Features */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{product.features.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* WhatsApp Enquiry Button */}
        <button
          onClick={handleWhatsAppEnquiry}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <MessageCircle className="w-5 h-5" />
          <span>WhatsApp Enquiry</span>
        </button>
      </div>
    </div>
  )
}
