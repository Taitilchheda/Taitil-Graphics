'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { getPersonalizedHotSellers, getPersonalizedRecommendations } from '@/lib/recommendations'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Star,
  Users,
  Clock,
  Shield,
  MessageCircle,
  Flame,
  Sparkles,
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const { categories, newListings, recommendedProducts, hotSellers, allProducts } = useCatalog()
  const { logEvent, events } = useAnalytics()

  const [heroIndex, setHeroIndex] = useState(0)

  const personalizedRecommended = useMemo(() => {
    return getPersonalizedRecommendations(allProducts, events, recommendedProducts, 8)
  }, [allProducts, events, recommendedProducts])

  const personalizedHotSellers = useMemo(() => {
    const seed = getPersonalizedHotSellers(allProducts, events, hotSellers, 8)
    const deduped = seed.filter((product) => !personalizedRecommended.find((p) => p.id === product.id))
    return deduped.length ? deduped : seed
  }, [allProducts, events, hotSellers, personalizedRecommended])

  const heroImages = useMemo(() => {
    const products = [...newListings, ...personalizedRecommended, ...personalizedHotSellers]
    const urls: string[] = []
    for (const product of products) {
      if (product?.image) {
        urls.push(product.image)
      }
    }
    const unique: string[] = []
    const seen = new Set<string>()
    for (const url of urls) {
      if (!url || seen.has(url)) continue
      seen.add(url)
      unique.push(url)
    }
    return unique.length
      ? unique
      : [
          '/images/sweets box mockup 2.jpg',
          'https://images.unsplash.com/photo-1527515545081-5db817172677?w=400&h=240&fit=crop',
          'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=400&h=240&fit=crop',
        ]
  }, [newListings, personalizedRecommended, personalizedHotSellers])

  useEffect(() => {
    logEvent({ type: 'view', label: 'homepage' })
  }, [logEvent])

  useEffect(() => {
    if (!heroImages.length) return
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 5500)
    return () => clearInterval(timer)
  }, [heroImages.length])

  const heroCount = heroImages.length || 1
  const heroPrimary = heroImages[heroIndex % heroCount]
  const heroSecondary = heroImages[(heroIndex + 1) % heroCount]
  const heroTertiary = heroImages[(heroIndex + 2) % heroCount]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const handleWhatsAppContact = () => {
    const message = "Hi! I'm interested in your printing services. Could you please provide more information?"
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', label: 'whatsapp-home' })
  }

  const handleCategoryClick = (categoryId: string) => {
    logEvent({ type: 'click', categoryId, label: 'home-category-card' })
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-secondary-50 via-white to-primary-100 text-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="inline-flex items-center text-sm font-semibold text-primary-700 bg-white px-3 py-1 rounded-full shadow-sm mb-4">
                  <Sparkles className="w-4 h-4 mr-2" /> Everything for print, packaging & celebrations
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                  Professional Printing &{' '}
                  <span className="text-primary-700">Celebration Decor</span>
                  <span className="block text-2xl text-gray-600 mt-3">You think it  We make it.</span>
                </h1>
                <p className="text-lg mb-8 text-gray-700">
                  Studio-grade visiting cards, packaging, marketing kits, and now cake toppers and decor curated,
                  categorized, and ready to order fast.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/categories/all"
                    onClick={() => handleCategoryClick('all')}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                  >
                    Explore Catalog
                  </Link>
                  <Link
                    href="/categories/cake-decorations"
                    onClick={() => handleCategoryClick('cake-decorations')}
                    className="border-2 border-primary-600 text-primary-700 hover:bg-white hover:text-primary-700 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center"
                  >
                    Cake Decor Picks
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary-200 blur-3xl opacity-50 rounded-full" />
                <div className="relative bg-white rounded-2xl shadow-xl p-4 border border-primary-100">
                  <Image
                    src={heroPrimary}
                    alt="Premium packaging and print"
                    width={640}
                    height={440}
                    className="rounded-xl object-contain w-full h-[300px] sm:h-[360px] md:h-[380px] bg-white transition-opacity duration-700 ease-in-out"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Image
                      src={heroSecondary}
                      alt="Cake topper sample"
                      width={300}
                      height={200}
                      className="rounded-lg object-contain w-full h-32 sm:h-36 bg-white transition-opacity duration-700 ease-in-out"
                    />
                    <Image
                      src={heroTertiary}
                      alt="Decor bundle"
                      width={300}
                      height={200}
                      className="rounded-lg object-contain w-full h-32 sm:h-36 bg-white transition-opacity duration-700 ease-in-out"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore professional printing, packaging, and celebration decor grouped just like an enterprise storefront.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  onClick={() => handleCategoryClick(category.id)}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="aspect-w-16 aspect-h-9">
                    <Image
                      src={category.subcategories[0]?.products[0]?.image || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop'}
                      alt={category.name}
                      width={400}
                      height={250}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{category.description}</p>
                    <div className="flex items-center text-primary-600 font-medium">
                      <span>Explore Products</span>
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* New Listings */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">New Listings</h2>
                <p className="text-gray-600">Fresh drops from print essentials to cake toppers. Order via call/WhatsApp.</p>
              </div>
              <Link href="/categories/all" className="text-primary-700 font-semibold hover:text-primary-800 flex items-center">
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newListings.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                >
                  <div className="bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={320}
                      height={200}
                      className="w-full h-48 object-contain rounded-t-xl"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <span className="text-xs text-gray-500">
                      {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'Just added'}
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded-full">
                        {product.badges?.[0] || 'New'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    <div className="inline-flex items-center text-primary-700 text-sm font-semibold">
                      View details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Products</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Curated picks our customers love fast moving print staples and decor heroes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {personalizedRecommended.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="bg-gray-50">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-contain"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-600 font-semibold">Contact for Quote</span>
                      <span className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform">View Details</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Hot Sellers */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <Flame className="w-6 h-6 text-orange-500 mr-2" />
                  Hot Sellers
                </h2>
                <p className="text-gray-600">High volume SKUs we keep ready: toppers, cards, business essentials.</p>
              </div>
              <Link href="/categories/all" className="text-primary-700 font-semibold hover:text-primary-800 flex items-center">
                Browse everything <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {personalizedHotSellers.slice(0, 4).map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="bg-white/60 rounded-lg mb-4">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={280}
                      height={180}
                      className="w-full h-44 object-contain rounded-lg"
                    />
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-full flex items-center">
                      <Flame className="w-3 h-3 mr-1" /> Hot Seller
                    </span>
                    <span className="text-xs text-gray-500">Stock ready</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{product.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                  <div className="text-primary-700 text-sm font-semibold inline-flex items-center mt-3">
                    View details <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Taitil Graphics?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We&apos;re committed to delivering exceptional quality and service
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Premium Quality</h3>
                <p className="text-gray-600">High-quality materials and professional printing technology</p>
              </div>

              <div className="text-center">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick turnaround times without compromising quality</p>
              </div>

              <div className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
                <p className="text-gray-600">Professional design assistance and customer support</p>
              </div>

              <div className="text-center">
                <div className="bg-secondary-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Satisfaction Guaranteed</h3>
                <p className="text-gray-600">100% satisfaction guarantee on all our products</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Project?</h2>
            <p className="text-xl mb-8 opacity-90">
              Get in touch with us today for a free consultation and quote
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleWhatsAppContact}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp Us
              </button>
              <Link
                href="/categories/business-essentials"
                onClick={() => handleCategoryClick('business-essentials')}
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 px-8 py-3 rounded-lg font-semibold transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
