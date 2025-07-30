'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import { MessageCircle, Phone, Star, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Mock product data
const getProductData = (id: string) => {
  const products: Record<string, any> = {
    '1': {
      id: '1',
      name: 'Standard Visiting Cards',
      description: 'Professional business cards with premium quality printing. Perfect for networking and making a lasting first impression. Our standard visiting cards are printed on high-quality paper with crisp, clear text and vibrant colors.',
      longDescription: `Our Standard Visiting Cards are the perfect choice for professionals who want to make a great first impression. These cards are printed on premium 300gsm paper with a smooth matte finish that feels substantial in hand.

Key Features:
• Premium 300gsm paper stock
• High-resolution printing for crisp text and images
• Standard size: 3.5" x 2" (89mm x 51mm)
• Multiple design templates available
• Fast turnaround time
• Professional matte finish

Perfect for:
• Business professionals
• Entrepreneurs
• Sales representatives
• Consultants
• Anyone looking to network professionally

Our design team can help you create the perfect card that represents your brand and personality. We offer various customization options including different fonts, colors, and layouts to ensure your card stands out.`,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop'
      ],
      category: 'Visiting Cards',
      features: ['Premium Paper', 'Multiple Designs', 'Fast Delivery', 'Professional Finish'],
      specifications: {
        'Paper Weight': '300gsm',
        'Size': '3.5" x 2" (89mm x 51mm)',
        'Finish': 'Matte',
        'Printing': 'Full Color (CMYK)',
        'Turnaround': '3-5 business days'
      }
    },
    '2': {
      id: '2',
      name: 'Premium Visiting Cards',
      description: 'Luxury business cards with special finishes including spot UV, foil stamping, and premium paper options. Make an unforgettable impression with our premium collection.',
      longDescription: `Elevate your professional image with our Premium Visiting Cards. These luxury cards feature special finishes and premium materials that set you apart from the competition.

Premium Features:
• 400gsm premium paper stock
• Spot UV coating for selective shine
• Foil stamping options (gold, silver, copper)
• Embossed or debossed textures
• Premium finishes (matte, gloss, silk)
• Rounded corners available
• Luxury packaging included

Special Finishes Available:
• Spot UV - Adds a glossy coating to specific areas
• Foil Stamping - Metallic accents for logos and text
• Embossing - Raised elements for texture
• Debossing - Recessed elements for subtle elegance
• Soft-touch coating - Velvet-like feel

These cards are perfect for executives, luxury brands, and professionals who want to make a statement. Each card is carefully crafted to ensure the highest quality and attention to detail.`,
      images: [
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop',
        'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop'
      ],
      category: 'Visiting Cards',
      features: ['Spot UV', 'Foil Stamping', 'Thick Paper', 'Luxury Finish'],
      specifications: {
        'Paper Weight': '400gsm',
        'Size': '3.5" x 2" (89mm x 51mm)',
        'Finish': 'Multiple options available',
        'Special Features': 'Spot UV, Foil, Embossing',
        'Turnaround': '5-7 business days'
      }
    }
  }

  return products[id] || {
    id,
    name: 'Product Not Found',
    description: 'The requested product could not be found.',
    longDescription: 'Please check the product ID and try again.',
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop'],
    category: 'Unknown',
    features: [],
    specifications: {}
  }
}

export default function ProductPage() {
  const { user } = useAuth()
  const params = useParams()
  const productId = params.id as string
  const product = getProductData(productId)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  const handleWhatsAppEnquiry = () => {
    const message = `Hi! I'm interested in ${product.name}. Could you please provide more information about pricing, customization options, and delivery time?`
    const phoneNumber = '+918878380308'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCallEnquiry = () => {
    window.open('tel:+918878380308', '_self')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-teal-600">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/categories/visiting-cards" className="text-gray-500 hover:text-teal-600">{product.category}</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/categories/visiting-cards"
            className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-[4/3] bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200">
              <Image
                src={product.images[selectedImageIndex]}
                alt={product.name}
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index 
                      ? 'border-teal-500 ring-2 ring-teal-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-8">
            {/* Product Header */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-teal-100 text-teal-800 text-sm px-3 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-lg text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleWhatsAppEnquiry}
                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors duration-200"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp Enquiry</span>
                </button>
                
                <button
                  onClick={handleCallEnquiry}
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold transition-colors duration-200"
                >
                  <Phone className="w-5 h-5" />
                  <span>Call Now</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 text-center">
                Get instant quotes and personalized assistance from our experts
              </p>
            </div>

            {/* Contact Information */}
            <div className="bg-teal-50 rounded-xl p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">📞 Call us: <span className="font-medium">8878380308</span></p>
                <p className="text-gray-700">📧 Email: support@taitilgraphics.com</p>
                <p className="text-gray-700">⏰ Mon-Sat: 9:00 AM - 7:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div className="mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Details</h2>
            <div className="prose prose-gray max-w-none">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {product.longDescription}
              </div>
            </div>
          </div>
        </div>

        {/* Specifications */}
        {Object.keys(product.specifications).length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <span className="font-medium text-gray-900">{key}:</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      {user && <ChatWidget />}
    </div>
  )
}
