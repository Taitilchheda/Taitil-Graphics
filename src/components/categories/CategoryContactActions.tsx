'use client'

import { useEffect } from 'react'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type Props = {
  categoryId: string
  categoryName: string
}

/** Small client island for the analytics log + WhatsApp/call CTAs. */
export default function CategoryContactActions({ categoryId, categoryName }: Props) {
  const { logEvent } = useAnalytics()

  useEffect(() => {
    logEvent({ type: 'view', categoryId, label: 'category-page' })
  }, [categoryId, logEvent])

  const handleWhatsAppContact = () => {
    const message = `Hi! I'm interested in ${categoryName} products. Could you please provide more information?`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', categoryId, label: 'category-contact' })
  }

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <div className="bg-teal-50 px-4 py-2 rounded-lg">
          <span className="text-teal-700 font-medium">✓ Premium Quality</span>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-blue-700 font-medium">✓ Fast Delivery</span>
        </div>
        <div className="bg-primary-50 px-4 py-2 rounded-lg">
          <span className="text-primary-700 font-medium">✓ Custom Design</span>
        </div>
        <div className="bg-purple-50 px-4 py-2 rounded-lg">
          <span className="text-purple-700 font-medium">✓ Bulk Discounts</span>
        </div>
      </div>

      <div className="bg-primary-600 rounded-lg p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Need Custom Design?</h3>
        <p className="text-lg mb-6 opacity-90">
          Our design experts can help you create the perfect {categoryName.toLowerCase()} for your business
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleWhatsAppContact}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            WhatsApp Us
          </button>
          <a
            href="tel:+917666247666"
            className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
          >
            Call 7666247666
          </a>
        </div>
      </div>

      <Link
        href="/categories/all"
        className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Products</span>
      </Link>
    </>
  )
}
