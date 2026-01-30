'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
        <p className="text-gray-600">Taitil Graphics provides printing and décor services. Orders are confirmed after design approval and payment terms shared over email/WhatsApp. Turnaround times are estimates and depend on approvals and material availability.</p>
        <p className="text-gray-600">By using the site, you agree to our usage policies and consent to communication over phone/WhatsApp/email for order updates.</p>
      </main>
      <Footer />
    </div>
  )
}
