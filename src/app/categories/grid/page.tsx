'use client'

import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import ProductShowcase from '@/components/sections/ProductShowcase'
import ChatWidget from '@/components/chat/ChatWidget'

export default function GridViewPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductShowcase category="grid-view" />
        
        {/* Scrollable indicator */}
        <div className="text-center mt-12 py-4">
          <p className="text-gray-500 font-medium">SCROLLABLE</p>
        </div>
      </main>

      {/* Chat widget - only show for logged in users */}
      {user && <ChatWidget />}
    </div>
  )
}
