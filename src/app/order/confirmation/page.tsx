'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">Order confirmed</h1>
      <p className="text-gray-600">Payment received. We will start processing your order right away.</p>
      {orderId && (
        <p className="text-sm text-gray-500">Order ID: {orderId}</p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/categories/all" className="btn-primary">Continue shopping</Link>
        <Link href="/admin/orders" className="btn-secondary">View orders</Link>
      </div>
    </main>
  )
}

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <OrderConfirmationContent />
      </Suspense>
      <Footer />
    </div>
  )
}
