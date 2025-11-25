'use client'

import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/components/providers/CartProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { MessageCircle, ArrowLeft, Heart, ShoppingCart, Check, Star } from 'lucide-react'

export default function ProductPage() {
  const params = useParams()
  const { addToCart, toggleLike, isLiked } = useCart()
  const { getProductById, updateInventory } = useCatalog()
  const { logEvent } = useAnalytics()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const productId = params.id as string
  const product = getProductById(productId)
  const gallery = useMemo(() => {
    if (!product) return []
    if (product.images && product.images.length) return product.images
    return [product.image]
  }, [product])

  useEffect(() => {
    if (product) {
      logEvent({ type: 'view', productId, categoryId: product.category, subcategoryId: product.subcategory, label: 'product-page' })
    }
  }, [product, productId, logEvent])

  const handleWhatsAppEnquiry = () => {
    if (!product) return

    const shareableImage = gallery[selectedIndex] || gallery[0] || product.image || 'https://taitil.graphics/logo.svg'
    const productLink = typeof window !== 'undefined' ? `${window.location.origin}/products/${product.id}` : ''
    const message =
      product.whatsappMessage ||
      `Hi! I'm interested in: ${product.name}\nType: ${product.subcategory || product.category}\nImage: ${shareableImage}\nProduct page: ${productLink}\nNote: Ready-made, no customization.\nPlease confirm price and availability for this exact design.`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', productId: product.id, categoryId: product.category, label: 'product-whatsapp' })
  }

  const handleAddToCart = () => {
    if (!product) return

    const productForCart = {
      id: product.id,
      name: product.name,
      image: gallery[selectedIndex] || product.image,
      category: product.category,
      description: product.description
    }

    addToCart(productForCart, 1)
    updateInventory(product.id, -1)
    logEvent({ type: 'cart', productId: product.id, categoryId: product.category, subcategoryId: product.subcategory, quantity: 1, label: 'product-add-to-cart' })
    logEvent({ type: 'sale', productId: product.id, categoryId: product.category, subcategoryId: product.subcategory, quantity: 1, label: 'product-sale-intent' })
  }

  const handleToggleLike = () => {
    if (!product) return

    const productForLike = {
      id: product.id,
      name: product.name,
      image: gallery[selectedIndex] || product.image,
      category: product.category,
      description: product.description
    }

    toggleLike(productForLike)
    logEvent({ type: 'click', productId: product.id, label: 'product-like' })
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Link
              href="/categories/all"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href={`/categories/${product.category}`} className="text-gray-500 hover:text-primary-600">{product.category}</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/categories/${product.category}`}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {product.category}</span>
          </Link>
        </div>

        {/* Product Details - Vistaprint Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Product Images */}
          <div className="space-y-4">
            <div
              className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 group cursor-zoom-in relative"
              onClick={() => setShowLightbox(true)}
            >
              <Image
                src={gallery[selectedIndex]}
                alt={product.name}
                width={800}
                height={800}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-2 right-2 text-xs bg-white/80 text-gray-700 px-2 py-1 rounded">Click to zoom</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {gallery.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-square rounded border overflow-hidden ${selectedIndex === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-primary-300'} transition`}
                  title={`View image ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} view ${idx + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600">{product.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(4.8 out of 5 stars)</span>
            </div>



            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-6">
              <button
                onClick={handleWhatsAppEnquiry}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-lg font-semibold text-lg flex items-center justify-center space-x-2 transition-colors"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Get Quote on WhatsApp</span>
              </button>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleToggleLike}
                  className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                    isLiked(product.id)
                      ? 'bg-pink-100 text-pink-700 hover:bg-pink-200'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-current' : ''}`} />
                  <span>{isLiked(product.id) ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our design experts are here to help you create the perfect product for your needs.
              </p>
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-primary-600" />
                  <span>WhatsApp: +91 7666247666</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-4 h-4 text-primary-600">📧</span>
                  <span>Email: taitilgraphics@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="max-w-5xl w-full flex flex-col gap-3">
            <div className="flex justify-between items-center text-white text-sm">
              <span>{product.name}</span>
              <span className="opacity-80">Click anywhere to close</span>
            </div>
            <div className="relative bg-white rounded-lg overflow-hidden">
              <Image
                src={gallery[selectedIndex]}
                alt={product.name}
                width={1600}
                height={1200}
                className="w-full h-full object-contain max-h-[80vh] bg-black"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(idx)
                  }}
                  className={`h-16 w-16 rounded border overflow-hidden flex-shrink-0 ${selectedIndex === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}`}
                >
                  <Image src={img} alt={`thumb ${idx + 1}`} width={200} height={200} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
