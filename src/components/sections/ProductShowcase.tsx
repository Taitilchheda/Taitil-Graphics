'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MessageCircle, Phone } from 'lucide-react'

interface ProductShowcaseProps {
  category?: string
}

export default function ProductShowcase({ category = 'visiting-cards' }: ProductShowcaseProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I'm interested in Visiting Cards. Could you please provide more information about pricing and availability?`
    const phoneNumber = '+918878380308' // Replace with your actual WhatsApp number
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCallEnquiry = () => {
    window.open('tel:+917666247666', '_self')
  }

  // Mock product images
  const productImages = [
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop'
  ]

  if (category === 'grid-view') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Products</h2>
        
        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Large card */}
          <div className="md:col-span-1 lg:col-span-1 md:row-span-2">
            <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center">
              <span className="text-gray-500 text-lg">Product Image</span>
            </div>
          </div>
          
          {/* Medium cards */}
          <div className="bg-gray-200 rounded-2xl h-36 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          
          <div className="bg-gray-200 rounded-2xl h-36 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          
          <div className="bg-gray-200 rounded-2xl h-36 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
          
          <div className="bg-gray-200 rounded-2xl h-36 flex items-center justify-center">
            <span className="text-gray-500">Product Image</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Title */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Visiting Cards</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="bg-gray-200 rounded-2xl h-80 flex items-center justify-center overflow-hidden">
            <span className="text-gray-500 text-lg">Images here</span>
          </div>
          
          {/* Thumbnail Images */}
          <div className="grid grid-cols-4 gap-3">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`bg-gray-200 rounded-lg h-20 flex items-center justify-center overflow-hidden transition-all ${
                  selectedImageIndex === index ? 'ring-2 ring-teal-500' : 'hover:bg-gray-300'
                }`}
              >
                <span className="text-gray-500 text-xs">Img</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side - Description and Actions */}
        <div className="space-y-6">
          {/* Description Box */}
          <div className="bg-blue-400 rounded-2xl p-8 h-80 flex items-start">
            <div className="text-white">
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <p className="text-blue-100 leading-relaxed">
                description here
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleWhatsAppEnquiry}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-4 px-6 rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>whatsapp enquiry</span>
            </button>
            
            <button
              onClick={handleCallEnquiry}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-4 px-6 rounded-2xl transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Phone className="w-5 h-5" />
              <span>call enquiry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
