'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Contact</h1>
        <p className="text-gray-600">Reach us at +91 7666 24 7666 or taitilgraphics@gmail.com. Office: B 403, Saraswati Apartment, Dahisar East, Mumbai.</p>
      </main>
      <Footer />
    </div>
  )
}
