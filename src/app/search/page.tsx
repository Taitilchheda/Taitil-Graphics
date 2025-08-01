'use client'

import { useSearchParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SearchResults from '@/components/search/SearchResults'
import { useAuth } from '@/components/providers/AuthProvider'
// import ChatWidget from '@/components/chat/ChatWidget'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <SearchResults initialQuery={query} />
      </main>

      <Footer />

      {/* Chat widget - only show for logged in users */}
      {/* {user && <ChatWidget />} */}
    </div>
  )
}
