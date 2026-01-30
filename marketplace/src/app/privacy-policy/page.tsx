'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-gray-600">We collect basic contact details (name, email, phone) and order information to fulfil services. Data is stored securely and never sold to third parties.</p>
        <p className="text-gray-600">You can request deletion or updates to your data by emailing taitilgraphics@gmail.com.</p>
      </main>
      <Footer />
    </div>
  )
}
