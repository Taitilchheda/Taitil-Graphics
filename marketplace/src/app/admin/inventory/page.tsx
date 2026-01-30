'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'

type InventoryCategory = {
  id?: string
  name: string
}

type InventoryProduct = {
  id: string
  name: string
  sku?: string | null
  stock?: number | null
  reorderLevel?: number | null
  priceCents?: number
  listingPriceCents?: number
  discountPercent?: number
  isRecommended?: boolean
  isHotSeller?: boolean
  updatedAt?: string
  image?: string | null
  category?: InventoryCategory | null
  subcategory?: InventoryCategory | null
}

export default function InventoryPage() {
  const { user, isLoading } = useAuth()
  const [products, setProducts] = useState<InventoryProduct[]>([])
  const [isSaving, setIsSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showLowStock, setShowLowStock] = useState(false)
  const [showOutOfStock, setShowOutOfStock] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated')
  const [listingTab, setListingTab] = useState<'all' | 'drafts' | 'active' | 'review'>('all')
  const [engagementFilter, setEngagementFilter] = useState<'all' | 'favorites' | 'frequent'>('all')
  const [statsMap, setStatsMap] = useState<Record<string, { views: number; clicks: number; inquiries: number; unitsSold: number; revenueCents: number }>>({})
  const [frequentIds, setFrequentIds] = useState<string[]>([])

  useEffect(() => {
    if (!user?.token) return
    setIsFetching(true)
    fetch('/api/admin/inventory', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setIsFetching(false))
  }, [user?.token])

  useEffect(() => {
    if (!user?.token) return
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const stats = (data.productStats || []) as {
          productId: string
          views: number
          clicks: number
          inquiries: number
          unitsSold: number
          revenueCents: number
        }[]
        const nextMap: Record<string, { views: number; clicks: number; inquiries: number; unitsSold: number; revenueCents: number }> = {}
        stats.forEach((entry) => {
          nextMap[entry.productId] = {
            views: entry.views || 0,
            clicks: entry.clicks || 0,
            inquiries: entry.inquiries || 0,
            unitsSold: entry.unitsSold || 0,
            revenueCents: entry.revenueCents || 0,
          }
        })
        setStatsMap(nextMap)

        const ranked = [...stats]
          .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
          .slice(0, 24)
          .map((entry) => entry.productId)
        setFrequentIds(ranked)
      })
      .catch(() => {
        setStatsMap({})
        setFrequentIds([])
      })
  }, [user?.token])

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return products
      .filter((product) => {
        const stockValue = product.stock ?? 0
        const reorderValue = product.reorderLevel ?? 5
        const categoryId = product.category?.id || product.category?.name || ''
        const isPriced = categoryId === 'cake-decorations'
        const listingCents = product.listingPriceCents ?? product.priceCents ?? 0
        const isDraft = isPriced && listingCents <= 0
        const needsReview = stockValue <= reorderValue || !product.sku || (isPriced && listingCents <= 0)

        if (listingTab === 'drafts' && !isDraft) return false
        if (listingTab === 'review' && !needsReview) return false
        if (listingTab === 'active' && stockValue <= 0) return false

        if (statusFilter === 'active' && stockValue <= 0) return false
        if (statusFilter === 'inactive' && stockValue > 0) return false

        if (showLowStock && stockValue > reorderValue) return false
        if (showOutOfStock && stockValue > 0) return false

        if (engagementFilter === 'favorites' && !(product.isRecommended || product.isHotSeller)) return false
        if (engagementFilter === 'frequent' && !frequentIds.includes(product.id)) return false

        if (!term) return true
        const haystack = [
          product.name,
          product.sku,
          product.category?.name,
          product.subcategory?.name,
          product.id,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(term)
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        if (sortBy === 'stock') return (a.stock ?? 0) - (b.stock ?? 0)
        const aUpdated = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bUpdated = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bUpdated - aUpdated
      })
  }, [
    products,
    searchTerm,
    showLowStock,
    showOutOfStock,
    statusFilter,
    sortBy,
    listingTab,
    engagementFilter,
    frequentIds,
  ])

  const summary = useMemo(() => {
    const total = products.length
    const lowStock = products.filter((product) => (product.stock ?? 0) <= (product.reorderLevel ?? 5)).length
    const outOfStock = products.filter((product) => (product.stock ?? 0) <= 0).length
    return { total, lowStock, outOfStock }
  }, [products])

  const updateProduct = async (productId: string, changes: InventoryProduct) => {
    if (!user?.token) return
    setIsSaving(productId)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          productId,
          name: changes.name,
          stock: changes.stock ?? 0,
          reorderLevel: changes.reorderLevel,
          sku: changes.sku ?? undefined,
          priceCents: changes.priceCents ?? undefined,
          listingPriceCents: changes.listingPriceCents ?? undefined,
          discountPercent: changes.discountPercent ?? undefined,
        }),
      })
      if (res.ok) {
        const payload = await res.json()
        setProducts((prev) => prev.map((p) => (p.id === productId ? payload.product : p)))
      }
    } finally {
      setIsSaving(null)
    }
  }


  const deleteProduct = async (productId: string) => {
    if (!user?.token) return
    const confirmed = window.confirm('Delete this listing?')
    if (!confirmed) return
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id != productId))
      }
    } catch {}
  }

  const seedCatalog = async () => {
    if (!user?.token) return
    setIsSeeding(true)
    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (res.ok) {
        const payload = await res.json()
        setProducts(payload.products || [])
      }
    } finally {
      setIsSeeding(false)
    }
  }

  const tabButtonClass = (active: boolean) =>
    `px-3 py-1.5 rounded-full border ${active ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-600'}`

  const quickFilterClass = (active: boolean) =>
    `px-2.5 py-1 rounded-full border ${active ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-600'}`

  if (!isLoading && (!user || user.role !== 'admin')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-gray-600">Admin access required.</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">Back to dashboard</Link>
            <h1 className="text-3xl font-bold text-gray-900">Manage All Inventory</h1>
            <p className="text-gray-600">Track listing status, inventory, pricing, and performance at once.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/admin/new" className="rounded-md bg-primary-600 text-white px-3 py-2">Add a product</Link>
            <Link href="/admin/listings" className="rounded-md border border-gray-200 px-3 py-2">Manage listings</Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
          <button
            className={tabButtonClass(listingTab === 'all')}
            onClick={() => {
              setListingTab('all')
              setStatusFilter('all')
            }}
          >
            All listings ({summary.total})
          </button>
          <button
            className={tabButtonClass(listingTab === 'drafts')}
            onClick={() => {
              setListingTab('drafts')
              setStatusFilter('all')
            }}
          >
            Complete drafts
          </button>
          <button
            className={tabButtonClass(listingTab === 'active')}
            onClick={() => {
              setListingTab('active')
              setStatusFilter('all')
            }}
          >
            Active listings ({summary.total - summary.outOfStock})
          </button>
          <button
            className={tabButtonClass(listingTab === 'review')}
            onClick={() => {
              setListingTab('review')
              setStatusFilter('all')
            }}
          >
            Review changes
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>Quick filters:</span>
            <button
              className={quickFilterClass(engagementFilter === 'all')}
              onClick={() => setEngagementFilter('all')}
            >
              All
            </button>
            <button
              className={quickFilterClass(engagementFilter === 'favorites')}
              onClick={() => setEngagementFilter('favorites')}
            >
              Favorites
            </button>
            <button
              className={quickFilterClass(engagementFilter === 'frequent')}
              onClick={() => setEngagementFilter('frequent')}
            >
              Frequently viewed
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 text-sm">
            <select
              className="rounded-md border border-gray-200 px-2 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Listing status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <div className="lg:col-span-2 flex items-center gap-2 border border-gray-200 rounded-md px-2">
              <span className="text-gray-500 text-xs">Search</span>
              <input
                className="flex-1 py-2 text-sm outline-none"
                placeholder="Search SKU, title, or keyword"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="rounded-md border border-gray-200 px-2 py-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="updated">Sort by: Updated</option>
              <option value="name">Sort by: Title</option>
              <option value="stock">Sort by: Stock</option>
            </select>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
              />
              Low stock only
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input
                type="checkbox"
                checked={showOutOfStock}
                onChange={(e) => setShowOutOfStock(e.target.checked)}
              />
              Out of stock
            </label>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">Total: {summary.total}</div>
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">Low stock: {summary.lowStock}</div>
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">Out of stock: {summary.outOfStock}</div>
            <div className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
              {isFetching ? 'Syncing inventory...' : 'Inventory up to date'}
            </div>
          </div>
        </div>

        {products.length === 0 && !isFetching ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
            <div className="text-lg font-semibold text-gray-900">No inventory items yet</div>
            <p className="text-sm text-gray-600">
              Import the starter catalog or create your first listing to start tracking stock.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={seedCatalog}
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50"
                disabled={isSeeding}
              >
                {isSeeding ? 'Importing...' : 'Import starter catalog'}
              </button>
              <Link
                href="/admin/new"
                className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700"
              >
                Add listing
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden text-sm">
            <div className="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-2">
              <div className="col-span-2">Listing status</div>
              <div className="col-span-4">Product details</div>
              <div className="col-span-2">Performance</div>
              <div className="col-span-2">Inventory</div>
              <div className="col-span-2">Price & cost</div>
            </div>
            <div className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const stockValue = product.stock ?? 0
                const reorderValue = product.reorderLevel ?? 5
                const mrpCents = product.priceCents ?? 0
                const listingCents =
                  product.listingPriceCents && product.listingPriceCents > 0
                    ? product.listingPriceCents
                    : Math.max(0, mrpCents - Math.round(mrpCents * ((product.discountPercent ?? 0) / 100)))
                const discountValue =
                  mrpCents > 0 && listingCents > 0
                    ? Math.min(90, Math.max(0, Math.round((1 - listingCents / mrpCents) * 100)))
                    : 0
                const updatedLabel = product.updatedAt ? new Date(product.updatedAt).toLocaleDateString('en-IN') : '-'
                const listingStatus = stockValue > 0 ? 'Active' : 'Inactive'
                const stats = statsMap[product.id] || { views: 0, clicks: 0, inquiries: 0, unitsSold: 0, revenueCents: 0 }

                return (
                  <div key={product.id} className="grid grid-cols-12 px-4 py-4">
                    <div className="col-span-2 text-xs text-gray-600 space-y-2">
                      <div className="font-semibold text-gray-900">{listingStatus}</div>
                      <div className="text-[11px] text-gray-400">Updated {updatedLabel}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateProduct(product.id, product)}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs"
                          disabled={isSaving === product.id}
                        >
                          {isSaving === product.id ? 'Saving' : 'Save'}
                        </button>
                        <Link
                          href={`/admin/listings/${product.id}`}
                          className="rounded-md border border-gray-200 px-2 py-1 text-xs"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="rounded-md border border-red-200 text-red-600 px-2 py-1 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="col-span-4 flex items-start gap-3">
                      <div className="h-16 w-16 rounded-md bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                        ) : (
                          <span className="text-xs text-gray-400">No image</span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <input
                          className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm font-medium text-gray-900"
                          value={product.name}
                          onChange={(e) => {
                            const name = e.target.value
                            setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, name } : p)))
                          }}
                        />
                        <div className="text-xs text-gray-500">
                          {product.category?.name || 'Uncategorized'}
                          {product.subcategory?.name ? ` / ${product.subcategory?.name}` : ''}
                        </div>
                        <div className="text-[11px] text-gray-400">SKU: {product.sku || '-'}</div>
                        <div className="text-[11px] text-gray-400">ID: {product.id}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 space-y-1">
                      <div>Sales: INR {Math.round(stats.revenueCents / 100).toLocaleString('en-IN')}</div>
                      <div>Units sold: {stats.unitsSold}</div>
                      <div>Page views: {stats.views}</div>
                      <div>Clicks: {stats.clicks}</div>
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 space-y-2">
                      <input
                        className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm"
                        value={product.sku ?? ''}
                        onChange={(e) => {
                          const sku = e.target.value
                          setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, sku } : p)))
                        }}
                      />
                      <input
                        className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        value={stockValue}
                        onChange={(e) => {
                          const stock = Number(e.target.value || 0)
                          setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock } : p)))
                        }}
                      />
                      <input
                        className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        value={reorderValue}
                        onChange={(e) => {
                          const reorderLevel = Number(e.target.value || 0)
                          setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, reorderLevel } : p)))
                        }}
                      />
                    </div>
                    <div className="col-span-2 text-xs text-gray-600 space-y-2">
                      <input
                        className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        placeholder="MRP"
                        value={Math.round(mrpCents / 100)}
                        onChange={(e) => {
                          const nextMrp = Math.max(0, Math.round(Number(e.target.value || 0) * 100))
                          const nextListing =
                            product.listingPriceCents && product.listingPriceCents > 0
                              ? Math.min(product.listingPriceCents, nextMrp)
                              : nextMrp
                          const nextDiscount =
                            nextMrp > 0 && nextListing > 0
                              ? Math.min(90, Math.max(0, Math.round((1 - nextListing / nextMrp) * 100)))
                              : 0
                          setProducts((prev) =>
                            prev.map((p) =>
                              p.id === product.id
                                ? { ...p, priceCents: nextMrp, listingPriceCents: nextListing, discountPercent: nextDiscount }
                                : p
                            )
                          )
                        }}
                      />
                      <input
                        className="w-full rounded-md border border-gray-200 px-2 py-1 text-sm"
                        type="number"
                        min={0}
                        placeholder="Listing"
                        value={Math.round(listingCents / 100)}
                        onChange={(e) => {
                          const nextListing = Math.max(0, Math.round(Number(e.target.value || 0) * 100))
                          const nextMrp = product.priceCents && product.priceCents > 0 ? product.priceCents : nextListing
                          const nextDiscount =
                            nextMrp > 0 && nextListing > 0
                              ? Math.min(90, Math.max(0, Math.round((1 - nextListing / nextMrp) * 100)))
                              : 0
                          setProducts((prev) =>
                            prev.map((p) =>
                              p.id === product.id
                                ? { ...p, priceCents: nextMrp, listingPriceCents: nextListing, discountPercent: nextDiscount }
                                : p
                            )
                          )
                        }}
                      />
                      <div className="text-[11px] text-gray-500">Discount: {discountValue}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
