'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/layout/Header'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'

type Review = {
  id: string
  rating: number
  title?: string | null
  body?: string | null
  verified: boolean
  response?: string | null
  respondedAt?: string | null
  user?: { name?: string | null; email?: string | null }
  product?: { name?: string | null }
}

export default function ReviewsAdminPage() {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [showUnreplied, setShowUnreplied] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!user?.token) return
      const res = await fetch('/api/admin/reviews', { headers: { Authorization: `Bearer ${user.token}` } })
      const payload = await res.json().catch(() => ({}))
      setReviews(payload.reviews || [])
    }
    load()
  }, [user?.token])

  const sendResponse = async (id: string, clear = false) => {
    if (!user?.token) return
    const response = clear ? '' : (drafts[id] ?? '').trim()
    if (!clear && !response) return
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ id, response }),
    })
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, response: response || null, respondedAt: response ? new Date().toISOString() : null } : r)))
    setDrafts((prev) => ({ ...prev, [id]: '' }))
  }


  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase()
    return reviews.filter((review) => {
      if (showUnreplied && review.response) return false
      if (!query) return true
      const haystack = [
        review.product?.name,
        review.user?.name,
        review.user?.email,
        review.title,
        review.body,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [reviews, search, showUnreplied])

  const groupedReviews = useMemo(() => {
    const map = new Map<string, Review[]>()
    filteredReviews.forEach((review) => {
      const key = review.product?.name || 'Unassigned product'
      const list = map.get(key) || []
      list.push(review)
      map.set(key, list)
    })
    return Array.from(map.entries())
      .map(([productName, items]) => {
        const avg =
          items.reduce((sum, item) => sum + (item.rating || 0), 0) / Math.max(items.length, 1)
        return { productName, items, avg }
      })
      .sort((a, b) => a.productName.localeCompare(b.productName))
  }, [filteredReviews])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer reviews</h1>
            <p className="text-gray-600">Reply to customer reviews and track feedback.</p>
          </div>
          <Link href="/admin" className="btn-secondary">Back to admin</Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex-1 min-w-[220px]">
            <input
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              placeholder="Search by product, customer, or keyword"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`rounded-full px-3 py-2 text-xs font-semibold ${showUnreplied ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setShowUnreplied((prev) => !prev)}
          >
            Unreplied only
          </button>
          <div className="text-xs text-gray-500">{filteredReviews.length} reviews</div>
        </div>

        <div className="space-y-6">
          {groupedReviews.map((group) => (
            <div key={group.productName} className="rounded-xl border border-gray-100 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{group.productName}</p>
                  <p className="text-xs text-gray-500">{group.items.length} reviews ? Avg {group.avg.toFixed(1)}/5</p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">Product reviews</span>
              </div>

              <div className="divide-y divide-gray-100">
                {group.items.map((review) => (
                  <div key={review.id} className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.user?.name || review.user?.email || 'Customer'}</p>
                        <p className="text-xs text-gray-500">{review.verified ? 'Verified purchase' : 'Unverified'}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="rounded-full bg-gray-100 px-2 py-1">Rating {review.rating}/5</span>
                      </div>
                    </div>
                    {review.title ? <p className="mt-2 text-sm font-semibold text-gray-900">{review.title}</p> : null}
                    {review.body ? <p className="text-sm text-gray-600 mt-1">{review.body}</p> : null}

                    <div className="mt-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                      <p className="text-xs font-semibold text-gray-700">Admin response</p>
                      <textarea
                        className="mt-2 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        rows={3}
                        placeholder="Write a response to this review"
                        value={drafts[review.id] ?? review.response ?? ''}
                        onChange={(e) => setDrafts((prev) => ({ ...prev, [review.id]: e.target.value }))}
                      />
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">{review.respondedAt ? `Last replied ${new Date(review.respondedAt).toLocaleDateString()}` : 'Not replied yet'}</span>
                        <div className="flex items-center gap-2">
                          <button
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700"
                            onClick={() => sendResponse(review.id, true)}
                          >
                            Clear
                          </button>
                          <button
                            className="rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
                            onClick={() => sendResponse(review.id)}
                          >
                            Save reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
