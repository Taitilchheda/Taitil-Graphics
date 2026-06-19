import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Shipping Policy</h1>
        <p className="text-gray-700">We process orders within 1-2 business days. Delivery timelines vary by location, typically 3-7 business days.</p>
        <div className="space-y-3 text-sm text-gray-600">
          <p>Shipping charges (if any) are shown at checkout.</p>
          <p>For bulk and service orders, timelines are confirmed over WhatsApp.</p>
          <p>Contact us for urgent delivery requests.</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
