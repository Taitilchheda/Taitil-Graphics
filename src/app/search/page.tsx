'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchResults from '@/components/search/SearchResults'
import { useAuth } from '@/components/providers/AuthProvider'
// import ChatWidget from '@/components/chat/ChatWidget'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  return <SearchResults initialQuery={query} />
}

export default function SearchPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <Suspense fallback={
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        }>
          <SearchContent />
        </Suspense>
      </main>

      <Footer />

      {/* Chat widget - only show for logged in users */}
      {/* {user && <ChatWidget />} */}
    </div>
  )
}
