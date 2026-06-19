'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Business
            <span className="text-primary-600"> Solutions</span>
            <br />
            All in One Place
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            From business essentials to custom designs, we provide everything you need 
            to grow your business. Professional services, quality products, and expert support.
          </p>

          {/* Large Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What business service do you need today?"
                  className="w-full pl-16 pr-32 py-4 text-lg border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-full transition-colors duration-200 flex items-center space-x-2"
                >
                  <span>Search</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Business Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">10k+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Customer Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
