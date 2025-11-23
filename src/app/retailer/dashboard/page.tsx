'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Heart, Store, ShieldCheck, Phone, MessageCircle } from 'lucide-react'

export default function RetailerDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <Store className="w-4 h-4 text-primary-600" />
              Retailer workspace
            </p>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name || 'Retailer'}</h1>
            <p className="text-gray-600 text-sm">Save favourites and send enquiries via call/WhatsApp. Orders are finalized off-platform.</p>
          </div>
          {user.role === 'admin' && (
            <a href="/admin" className="text-sm text-primary-700 hover:text-primary-800 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Go to Admin
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-2xl font-semibold text-gray-900">Managed via WhatsApp</p>
            <p className="text-xs text-gray-500">Place enquiries directly</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">Enquiries</p>
            <p className="text-2xl font-semibold text-gray-900">Talk to us</p>
            <p className="text-xs text-gray-500">We confirm over call/WhatsApp</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500 flex items-center gap-1"><Heart className="w-4 h-4 text-pink-500" /> Favourites</p>
            <p className="text-2xl font-semibold text-gray-900">Saved locally</p>
            <a href="/liked-products" className="text-xs text-primary-700 hover:text-primary-800">View favourites</a>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Place an enquiry</h2>
          <p className="text-sm text-gray-600">Call or WhatsApp us with the items you saved. We’ll finalize details and pricing directly.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+917666247666"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 rounded-lg px-4 py-3 hover:border-primary-500 hover:text-primary-700"
            >
              <Phone className="w-4 h-4" /> Call us
            </a>
            <a
              href={`https://wa.me/917666247666?text=${encodeURIComponent('Hi! I want to confirm my order/enquiry.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 text-white rounded-lg px-4 py-3 hover:bg-primary-700"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp us
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
