'use client'

import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'

export default function CategoryPage() {
  const params = useParams()
  const { categories, getProductsByCategory } = useCatalog()
  const { logEvent } = useAnalytics()
  const categoryId = params.category as string
  const category = categories.find(cat => cat.id === categoryId)
  const products = getProductsByCategory(categoryId)

  useEffect(() => {
    if (category) {
      logEvent({ type: 'view', categoryId, label: 'category-page' })
    }
  }, [category, categoryId, logEvent])

  const handleWhatsAppContact = () => {
    const message = `Hi! I'm interested in ${category?.name} products. Could you please provide more information?`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', categoryId, label: 'category-contact' })
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/categories/all"
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-teal-600">Home</Link>
          <span>/</span>
          <Link href="/categories/all" className="hover:text-teal-600">Categories</Link>
          <span>/</span>
          <span className="text-gray-900">{category.name}</span>
        </div>

        {/* Back Button */}
        <Link
          href="/categories/all"
          className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{category.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{category.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-teal-50 px-4 py-2 rounded-lg">
              <span className="text-teal-700 font-medium">✓ Premium Quality</span>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-medium">✓ Fast Delivery</span>
            </div>
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-700 font-medium">✓ Custom Design</span>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg">
              <span className="text-purple-700 font-medium">✓ Bulk Discounts</span>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {category.subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${category.id}/${subcategory.id}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{subcategory.name}</h3>
                <p className="text-gray-600 mb-4">{subcategory.description}</p>
                <div className="text-green-600 font-medium">
                  {subcategory.products.length} product{subcategory.products.length === 1 ? '' : 's'} available
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Products */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">All Products</h2>
          <p className="text-gray-600">
            Choose from our {products.length} product{products.length === 1 ? '' : 's'} in this category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need Custom Design?</h3>
          <p className="text-lg mb-6 opacity-90">
            Our design experts can help you create the perfect {category.name.toLowerCase()} for your business
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
