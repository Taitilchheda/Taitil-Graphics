'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-50 to-blue-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Professional Printing
                <span className="block text-teal-600">Made Simple</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                From business cards to banners, create professional marketing materials
                that make your business stand out. Fast delivery, premium quality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/categories/visiting-cards"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Start Designing
                </Link>
                <Link
                  href="/categories/all"
                  className="border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Categories</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Discover our most popular printing solutions for businesses of all sizes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Visiting Cards',
                  description: 'Professional business cards',
                  image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
                  href: '/categories/visiting-cards'
                },
                {
                  name: 'Flyers & Brochures',
                  description: 'Marketing materials',
                  image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
                  href: '/categories/marketing'
                },
                {
                  name: 'Custom T-Shirts',
                  description: 'Branded apparel',
                  image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
                  href: '/categories/clothing-gifts'
                },
                {
                  name: 'Banners & Signs',
                  description: 'Large format printing',
                  image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
                  href: '/categories/marketing'
                }
              ].map((category, index) => (
                <Link
                  key={index}
                  href={category.href}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                    <div className="flex items-center justify-end">
                      <span className="text-sm text-gray-500 group-hover:text-teal-600 transition-colors">
                        View Products →
                      </span>
                    </div>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🚀',
                  title: 'Fast Delivery',
                  description: 'Quick turnaround times without compromising on quality'
                },
                {
                  icon: '💎',
                  title: 'Premium Quality',
                  description: 'High-quality materials and professional printing standards'
                },
                {
                  icon: '💰',
                  title: 'Best Prices',
                  description: 'Competitive pricing with bulk order discounts'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Chat widget - only show for logged in users */}
      {user && <ChatWidget />}
    </div>
  )
}
