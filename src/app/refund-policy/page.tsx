'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Refund & Cancellation Policy</h1>
        <p className="text-gray-600">Custom print jobs are non-refundable once approved for production. If there is a print or material defect, contact us within 48 hours for a reprint or resolution.</p>
        <p className="text-gray-600">Cancellations before production may be eligible for partial refunds depending on design effort completed.</p>
      </main>
      <Footer />
    </div>
  )
}
