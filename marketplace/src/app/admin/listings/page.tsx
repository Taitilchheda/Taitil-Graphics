'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, MousePointerClick, Search, SlidersHorizontal, ArrowLeft, PlusCircle, FilterX, Sparkles } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import Image from 'next/image'

type SortOption = 'views' | 'clicks' | 'name' | 'recent'
type HighlightFilter = 'all' | 'recommended' | 'hot'

export default function ListingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { categories, allProducts, deleteProduct } = useCatalog()
  const { summary } = useAnalytics()

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('views')
  const [page, setPage] = useState(1)
  const pageSize = 24
  const [denseRows, setDenseRows] = useState(false)
  const [highlight, setHighlight] = useState<HighlightFilter>('all')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    setPage(1)
  }, [query, categoryFilter, sortBy, highlight])

  const handleReset = () => {
    setQuery('')
    setCategoryFilter('all')
    setSortBy('views')
    setHighlight('all')
    setPage(1)
  }

  const handleCsvImport = async (file: File | null) => {
    if (!file || !user?.token) return
    setImporting(true)
    setImportStatus(null)
    try {
      const csv = await file.text()
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/csv',
          Authorization: `Bearer ${user.token}`,
        },
        body: csv,
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload.error || 'Import failed')
      }
      setImportStatus(`Imported ${payload.created?.length || 0} products`)
    } catch (err: any) {
      setImportStatus(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const productsWithCounts = useMemo(
    () =>
      allProducts.map((p) => ({
        ...p,
        views: summary.productCounts.views[p.id] || 0,
        clicks: summary.productCounts.clicks[p.id] || 0,
      })),
    [allProducts, summary.productCounts.views, summary.productCounts.clicks]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return productsWithCounts
      .filter((p) => (categoryFilter === 'all' ? true : p.category === categoryFilter))
      .filter((p) => {
        if (highlight === 'recommended') return p.isRecommended
        if (highlight === 'hot') return p.isHotSeller
        return true
      })
      .filter((p) => {
        if (!q) return true
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => {
        if (sortBy === 'views') return b.views - a.views
        if (sortBy === 'clicks') return b.clicks - a.clicks
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return bCreated - aCreated
      })
  }, [productsWithCounts, categoryFilter, query, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize]
  )

  const maxViews = useMemo(() => Math.max(1, ...productsWithCounts.map((p) => p.views)), [productsWithCounts])
  const maxClicks = useMemo(() => Math.max(1, ...productsWithCounts.map((p) => p.clicks)), [productsWithCounts])
  const liveTop = useMemo(
    () =>
      [...productsWithCounts]
        .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
        .slice(0, 6),
    [productsWithCounts]
  )

  const sparkViews = useMemo(() => liveTop.map((p) => p.views), [liveTop])
  const sparkClicks = useMemo(() => liveTop.map((p) => p.clicks), [liveTop])
  const pieData = useMemo(() => {
    const views = summary.totals.view || 0
    const clicks = summary.totals.click || 0
    const inquiries = summary.totals.inquiry || 0
    const total = Math.max(1, views + clicks + inquiries)
    return [
      { label: 'Views', value: views, color: 'hsl(192, 85%, 55%)' },
      { label: 'Clicks', value: clicks, color: 'hsl(12, 83%, 62%)' },
      { label: 'Inquiries', value: inquiries, color: 'hsl(140, 55%, 55%)' },
    ].map((slice) => ({ ...slice, pct: (slice.value / total) * 100 }))
  }, [summary.totals.click, summary.totals.inquiry, summary.totals.view])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-gray-600">Redirecting to login...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to dashboard
            </Link>
            <p className="text-xs uppercase tracking-wide text-gray-500">Listings</p>
            <h1 className="text-3xl font-bold text-gray-900">All listings</h1>
            <p className="text-gray-600">Built for scale: search, filter, sort, paginate. Smooth even with 10,000+ items.</p>
          </div>
          <Link href="/admin/new" className="inline-flex items-center gap-2 text-primary-700 text-sm hover:text-primary-800">
            <PlusCircle className="w-4 h-4" />
            Add listing
          </Link>
      </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
              <Eye className="w-4 h-4 text-primary-700" /> Views: {summary.totals.view}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
              <MousePointerClick className="w-4 h-4 text-primary-700" /> Clicks: {summary.totals.click}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
              Listings: {productsWithCounts.length}
            </div>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 text-sm text-gray-700">
              Page size: {pageSize}
            </div>
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Visual pulse</p>
              <h2 className="text-lg font-semibold text-gray-900">Quick charts</h2>
              <p className="text-sm text-gray-600">Line, bar, and pie snapshots so you can skim what matters.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-100 rounded-lg p-3 space-y-2">
              <p className="text-xs text-gray-500">Top views trend</p>
              <Sparkline data={sparkViews} color="#0ea5e9" />
              <p className="text-xs text-gray-600">Using current top movers (views)</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-3 space-y-2">
              <p className="text-xs text-gray-500">Top clicks trend</p>
              <Sparkline data={sparkClicks} color="#f97316" />
              <p className="text-xs text-gray-600">Using current top movers (clicks)</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-3 space-y-3 flex items-center gap-3">
              <Donut pieData={pieData} />
              <div className="space-y-1 text-xs text-gray-700">
                {pieData.map((slice) => (
                  <div key={slice.label} className="flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-sm" style={{ background: slice.color }} />
                    <span className="font-medium">{slice.label}</span>
                    <span className="text-gray-500">{slice.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Live view</p>
              <h2 className="text-lg font-semibold text-gray-900">Realtime engagement pulse</h2>
              <p className="text-sm text-gray-600">Top movers by combined views + clicks. Bars scale live as traffic changes.</p>
            </div>
            <Link href="/admin" className="text-sm text-primary-700 hover:text-primary-800">Back to dashboard</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveTop.map((product) => {
              const pct = Math.min(100, ((product.views + product.clicks) / (maxViews + maxClicks)) * 100)
              return (
                <div key={product.id} className="border border-gray-100 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-800">
                    <span className="font-medium line-clamp-1">{product.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{product.category}</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-300 to-primary-500" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-primary-600" /> {product.views} seen</span>
                    <span className="inline-flex items-center gap-1"><MousePointerClick className="w-3 h-3 text-primary-600" /> {product.clicks} clicks</span>
                  </div>
                </div>
              )
            })}
            {liveTop.length === 0 && (
              <p className="text-sm text-gray-500">No traffic yet.</p>
            )}
          </div>
        </section>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                className="input-field flex-1"
                placeholder="Search by name, description, category..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                <select
                  className="input-field"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <select
                className="input-field text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
              >
                <option value="views">Sort by views</option>
                <option value="clicks">Sort by clicks</option>
                <option value="recent">Sort by newest</option>
                <option value="name">Sort by name</option>
              </select>
              <button
                onClick={() => setDenseRows((prev) => !prev)}
                className="px-3 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {denseRows ? 'Comfort view' : 'Compact view'}
              </button>
              <div className="flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <select
                  className="input-field text-sm"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value as HighlightFilter)}
                >
                  <option value="all">All listings</option>
                  <option value="recommended">Recommended only</option>
                  <option value="hot">Hot sellers only</option>
                </select>
              </div>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <FilterX className="w-4 h-4 text-gray-500" /> Reset
              </button>
            </div>
          </div>

          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-2 sticky top-0 z-10">
              <div className="col-span-5">Listing</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-3">Performance</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="divide-y divide-gray-100 max-h-[70vh] overflow-auto">
              {paged.map((product) => (
                <div
                  key={product.id}
                  className={`grid grid-cols-12 items-center px-4 ${denseRows ? 'py-1.5 text-xs gap-2' : 'py-3 text-sm'} text-gray-800 hover:bg-gray-50`}
                >
                  <div className="col-span-5 flex items-center gap-3">
                    <div className={`${denseRows ? 'h-10 w-10' : 'h-12 w-12'} rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0`}>
                      <Image src={product.image || '/logo.svg'} alt={product.name} width={48} height={48} sizes="48px" className="h-full w-full object-contain bg-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium text-gray-900 line-clamp-1 ${denseRows ? 'text-sm' : ''}`}>{product.name}</p>
                      <p className={`${denseRows ? 'text-[11px]' : 'text-xs'} text-gray-500 line-clamp-1`}>{product.description}</p>
                      {(product.badges?.length || product.isRecommended || product.isHotSeller) && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {product.badges?.map((badge) => (
                            <span key={badge} className="text-[10px] px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100">
                              {badge}
                            </span>
                          ))}
                          {product.isRecommended && <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">Recommended</span>}
                          {product.isHotSeller && <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full border border-orange-100">Hot</span>}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2 capitalize text-gray-700">{product.category}</div>
                  <div className="col-span-3">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-primary-600" /> {product.views}</span>
                      <span className="inline-flex items-center gap-1"><MousePointerClick className="w-3 h-3 text-primary-600" /> {product.clicks}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary-200"
                        style={{ width: `${Math.min(100, (product.views / maxViews) * 100)}%` }}
                      />
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden mt-1">
                      <div
                        className="h-full bg-primary-400"
                        style={{ width: `${Math.min(100, (product.clicks / maxClicks) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 capitalize line-clamp-1">{product.subcategory}</p>
                  </div>
                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/listings/${product.id}`}
                      className="text-primary-700 text-xs border border-primary-200 rounded-lg px-2 py-1 hover:bg-primary-50"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this listing?')) deleteProduct(product.id)
                      }}
                      className="text-red-600 text-xs border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {paged.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-gray-500">No listings match your filters.</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-700">
            <p>
              Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
              >
                Prev
              </button>
              <span>
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return <div className="text-xs text-gray-500">No data</div>
  const max = Math.max(...data, 1)
  const points = data
    .map((value, idx) => {
      const x = (idx / Math.max(1, data.length - 1)) * 100
      const y = 40 - (value / max) * 40
      return `${x},${y}`
    })
    .join(' ')
  return (
    <svg viewBox="0 0 100 40" className="w-full h-16">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

function Donut({ pieData }: { pieData: { label: string; value: number; color: string; pct: number }[] }) {
  const rotations = pieData.reduce<{ slices: string[]; current: number }>(
    (acc, slice) => {
      const next = acc.current + slice.pct * 3.6
      acc.slices.push(`${slice.color} ${acc.current}deg ${next}deg`)
      acc.current = next
      return acc
    },
    { slices: [], current: 0 }
  )
  const style = { background: `conic-gradient(${rotations.slices.join(', ')})` }
  return (
    <div className="relative h-16 w-16">
      <div className="h-16 w-16 rounded-full" style={style} />
      <div className="absolute inset-2 bg-white rounded-full border border-gray-100" />
    </div>
  )
}
