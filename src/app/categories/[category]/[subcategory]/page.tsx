'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/components/providers/CartProvider'
import { categories } from '@/data/products'
import { ArrowLeft, MessageCircle, Heart, ShoppingCart } from 'lucide-react'

export default function SubcategoryPage() {
  const params = useParams()
  const { addToCart, toggleLike, isLiked } = useCart()
  
  const categoryId = params.category as string
  const subcategoryId = params.subcategory as string
  
  const category = categories.find(cat => cat.id === categoryId)
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId)

  const handleWhatsAppContact = () => {
    const message = `Hi! I'm interested in ${subcategory?.name} products. Could you please provide more information?`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleProductWhatsApp = (productName: string, productMessage?: string) => {
    const message = productMessage || `Hi! I'm interested in ${productName}. Could you please provide more details about customization options?`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleAddToCart = (product: any) => {
    const productForCart = {
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      description: product.description
    }
    addToCart(productForCart, 1)
  }

  const handleToggleLike = (product: any) => {
    const productForLike = {
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      description: product.description
    }
    toggleLike(productForLike)
  }

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you're looking for doesn't exist.</p>
            <Link
              href="/categories/all"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/categories/all" className="text-gray-500 hover:text-primary-600">Categories</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href={`/categories/${category.id}`} className="text-gray-500 hover:text-primary-600">{category.name}</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{subcategory.name}</li>
          </ol>
        </nav>

        {/* Back Button */}
        <Link
          href={`/categories/${category.id}`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {category.name}</span>
        </Link>

        {/* Subcategory Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{subcategory.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{subcategory.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-700 font-medium">✓ Premium Quality</span>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-medium">✓ Fast Delivery</span>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg">
              <span className="text-purple-700 font-medium">✓ Custom Design</span>
            </div>
            <div className="bg-orange-50 px-4 py-2 rounded-lg">
              <span className="text-orange-700 font-medium">✓ Bulk Discounts</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Products</h2>
          <p className="text-gray-600">
            Choose from our {subcategory.products.length} product{subcategory.products.length === 1 ? '' : 's'} in this category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {subcategory.products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
              <Link href={`/products/${product.id}`}>
                <div className="aspect-w-16 aspect-h-12">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-primary-600">
                    Contact for Quote
                  </span>
                  <button
                    onClick={() => handleToggleLike(product)}
                    className={`p-2 rounded-full transition-colors ${
                      isLiked(product.id)
                        ? 'bg-pink-100 text-pink-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked(product.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => handleProductWhatsApp(product.name, product.whatsappMessage)}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Enquiry</span>
                  </button>
                  
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need Custom Design?</h3>
          <p className="text-lg mb-6 opacity-90">
            Our design experts can help you create the perfect {subcategory.name.toLowerCase()} for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleWhatsAppContact}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Us
            </button>
            <button 
              onClick={() => window.open('tel:+917666247666', '_self')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Call 7666247666
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
