'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'

const STATUS_OPTIONS = ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const
const PAYMENT_FILTERS = ['ALL', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const

type OrderItem = {
  id: string
  quantity: number
  priceCents: number
  product: { name: string }
}

type OrderAddress = {
  fullName: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postal: string
  country: string
  phone?: string | null
}

type Order = {
  id: string
  status: string
  paymentStatus: string
  totalCents: number
  subtotalCents: number
  taxCents: number
  createdAt: string
  paidAt?: string | null
  refundedAt?: string | null
  refundId?: string | null
  razorpayOrderId?: string | null
  razorpayPaymentId?: string | null
  shippingProvider?: string | null
  shippingStatus?: string | null
  trackingId?: string | null
  trackingUrl?: string | null
  labelUrl?: string | null
  pickupRequestId?: string | null
  shippingError?: string | null
  user: { email: string }
  items: OrderItem[]
  address?: OrderAddress | null
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [saving, setSaving] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL')
  const [refunding, setRefunding] = useState<string | null>(null)
  const [shippingAction, setShippingAction] = useState<string | null>(null)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [exportFrom, setExportFrom] = useState<string>('')
  const [exportTo, setExportTo] = useState<string>('')
  const [exportStatus, setExportStatus] = useState<string>('')
  const [exporting, setExporting] = useState(false)
  const [activeView, setActiveView] = useState<'orders' | 'carts'>('orders')
  const [carts, setCarts] = useState<any[]>([])
  const [cartsLoading, setCartsLoading] = useState(false)

  useEffect(() => {
    if (!user?.token) return
    fetch('/api/admin/orders', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
  }, [user?.token])

  useEffect(() => {
    if (!user?.token || activeView !== 'carts') return
    setCartsLoading(true)
    fetch('/api/admin/carts', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setCarts(data.carts || []))
      .catch(() => setCarts([]))
      .finally(() => setCartsLoading(false))
  }, [activeView, user?.token])

  const statusCounts = useMemo(() => {
    return orders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {})
  }, [orders])

  const deliveredCount = statusCounts['DELIVERED'] || 0
  const completedCount = deliveredCount
  const paidCount = orders.filter((order) => order.paymentStatus === 'PAID').length

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) return false
      if (paymentFilter !== 'ALL' && order.paymentStatus !== paymentFilter) return false
      if (!term) return true
      const haystack = [
        order.id,
        order.user?.email,
        order.razorpayPaymentId,
        order.razorpayOrderId,
        order.address?.fullName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [orders, paymentFilter, searchTerm, statusFilter])

  const updateStatus = async (orderId: string, status: string) => {
    if (!user?.token) return
    setSaving(orderId)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ orderId, status }),
      })
      if (res.ok) {
        const payload = await res.json()
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: payload.order.status } : o)))
      }
    } finally {
      setSaving(null)
    }
  }

  const openDocument = async (orderId: string, type: 'bill' | 'label') => {
    if (!user?.token) return
    const res = await fetch(`/api/admin/orders/${orderId}/${type}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
    if (!res.ok) return
    const html = await res.text()
    const win = window.open('', '_blank')
    if (!win) return
    win.document.open()
    win.document.write(html)
    win.document.close()
  }

  const openShippingLabel = async (orderId: string) => {
    if (!user?.token) return
    setShippingAction(orderId)
    setShippingError(null)
    try {
      const res = await fetch(`/api/admin/shipping/label?orderId=${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Failed to fetch label')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (err: any) {
      setShippingError(err?.message || 'Failed to fetch label')
    } finally {
      setShippingAction(null)
    }
  }

  const handleShippingAction = async (endpoint: string, orderId: string) => {
    if (!user?.token) return
    setShippingAction(orderId)
    setShippingError(null)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ orderId }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(payload.error || 'Shipping action failed')
      }
      if (payload.order) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...payload.order } : o)))
      }
    } catch (err: any) {
      setShippingError(err?.message || 'Shipping action failed')
    } finally {
      setShippingAction(null)
    }
  }

  const issueRefund = async (orderId: string, amountCents?: number) => {
    if (!user?.token) return
    const confirmed = window.confirm('Issue refund for this order?')
    if (!confirmed) return
    setRefunding(orderId)
    try {
      const res = await fetch('/api/admin/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ orderId, amountCents }),
      })
      if (res.ok) {
        const refreshed = await fetch('/api/admin/orders', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        const data = await refreshed.json()
        setOrders(data.orders || [])
      }
    } finally {
      setRefunding(null)
    }
  }

  const setQuickRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days + 1)
    setExportFrom(start.toISOString().slice(0, 10))
    setExportTo(end.toISOString().slice(0, 10))
  }

  const exportGstCsv = async () => {
    if (!user?.token) return
    setExportStatus('')
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (exportFrom) params.set('from', exportFrom)
      if (exportTo) params.set('to', exportTo)
      params.set('paidOnly', 'true')
      params.set('physicalOnly', 'true')
      const url = `/api/admin/orders/export${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!res.ok) {
        throw new Error('Export failed')
      }
      const rowCount = res.headers.get('X-Row-Count')
      const blob = await res.blob()
      const csvUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = csvUrl
      link.download = 'taitil-gst-orders.csv'
      link.click()
      setTimeout(() => URL.revokeObjectURL(csvUrl), 1000)
      setExportStatus(rowCount ? `Exported ${rowCount} lines.` : 'Export ready.')
    } catch (err) {
      setExportStatus('Export failed. Try again.')
    } finally {
      setExporting(false)
    }
  }

  const handleWhatsAppUpdate = (order: Order) => {
    const phone = order.address?.phone
    if (!phone) return
    const message = `Order ${order.id} status: ${order.status}`
    const whatsappUrl = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

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
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <Link href="/admin" className="text-xs font-semibold text-primary-700 hover:text-primary-800">
                ? Back to dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
              <p className="text-gray-600">Track order flow, payment status, and shipments.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 text-xs">
                <button
                  className={`px-4 py-1.5 rounded-full ${activeView === 'orders' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
                  onClick={() => setActiveView('orders')}
                >
                  Orders
                </button>
                <button
                  className={`px-4 py-1.5 rounded-full ${activeView === 'carts' ? 'bg-gray-900 text-white' : 'text-gray-500'}`}
                  onClick={() => setActiveView('carts')}
                >
                  Active Carts
                </button>
              </div>
              <div className="w-full sm:w-72">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Search order ID, customer, payment ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">GST CSV Export</h2>
              <p className="text-sm text-gray-600">Exports only PAID orders with physical products (no services).</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onClick={() => setQuickRange(1)}>Today</button>
              <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onClick={() => setQuickRange(7)}>Last 7</button>
              <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onClick={() => setQuickRange(30)}>Last 30</button>
              <button className="rounded-md border border-gray-200 px-3 py-1.5 text-xs" onClick={() => {
                const now = new Date()
                const start = new Date(now.getFullYear(), now.getMonth(), 1)
                setExportFrom(start.toISOString().slice(0,10))
                setExportTo(now.toISOString().slice(0,10))
              }}>This month</button>
            </div>
          </div>
          <div className="mt-3 flex flex-col lg:flex-row lg:items-end gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">From</label>
                <input type="date" value={exportFrom} onChange={(e) => setExportFrom(e.target.value)} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">To</label>
                <input type="date" value={exportTo} onChange={(e) => setExportTo(e.target.value)} className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={exportGstCsv}
                disabled={exporting}
                className="rounded-lg border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 disabled:opacity-50"
              >
                {exporting ? 'Exporting...' : 'Export GST CSV'}
              </button>
              {exportStatus ? <span className="text-xs text-gray-600">{exportStatus}</span> : null}
            </div>
          </div>
        </div>

        {activeView === 'orders' && (
          <>
        {shippingError ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {shippingError}
          </div>
        ) : null}

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Order overview</h2>
              <p className="text-sm text-gray-600">Live snapshot of current order activity.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="text-xs text-gray-500">Pending labels</div>
                <div className="text-xl font-semibold text-gray-900">{statusCounts['PENDING'] || 0}</div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="text-xs text-gray-500">Pending handover</div>
                <div className="text-xl font-semibold text-gray-900">{paidCount}</div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="text-xs text-gray-500">In transit</div>
                <div className="text-xl font-semibold text-gray-900">{statusCounts['SHIPPED'] || 0}</div>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-xl font-semibold text-gray-900">{completedCount}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
              <p className="text-xs text-gray-500">Narrow by status or payment state.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">Order status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                {PAYMENT_FILTERS.map((option) => (
                  <option key={option} value={option}>
                    {option === 'ALL' ? 'Payment status' : option}
                  </option>
                ))}
              </select>
              <button
                className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  setStatusFilter('ALL')
                  setPaymentFilter('ALL')
                  setSearchTerm('')
                }}
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>

                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden text-sm">
          <div className="grid grid-cols-12 gap-2 bg-gray-50 text-[11px] font-semibold uppercase tracking-wide text-gray-500 px-4 py-3">
            <div className="col-span-3">Order ID</div>
            <div className="col-span-3">Product information</div>
            <div className="col-span-2">Amount</div>
            <div className="col-span-2">Shipping</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const createdAt = new Date(order.createdAt).toLocaleDateString('en-IN')
              const total = Math.round(order.totalCents / 100).toLocaleString('en-IN')
              const primaryItem = order.items[0]
              const itemCount = order.items.length

              return (
                <div key={order.id} className="grid grid-cols-12 gap-2 px-4 py-4 hover:bg-gray-50/70 transition-colors">
                  <div className="col-span-3 space-y-1">
                    <div className="text-gray-900 font-semibold">{order.id}</div>
                    <div className="text-xs text-gray-500">Placed: {createdAt}</div>
                    <div className="text-xs text-gray-500">{order.user?.email || 'Customer'}</div>
                  </div>
                  <div className="col-span-3 text-xs text-gray-600 space-y-1">
                    <div className="text-gray-900 font-medium">{primaryItem?.product?.name || 'Item'}</div>
                    <div>Qty {primaryItem?.quantity || 0}</div>
                    {itemCount > 1 ? <div>{itemCount - 1} more item(s)</div> : null}
                  </div>
                  <div className="col-span-2 text-xs text-gray-700">
                    <div className="text-base font-semibold text-gray-900">? {total}</div>
                    <div className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600">{order.paymentStatus}</div>
                  </div>
                  <div className="col-span-2 text-xs text-gray-600 space-y-1">
                    <div className="text-gray-900 font-medium">{order.shippingStatus || 'Not shipped'}</div>
                    {order.trackingId ? (
                      <div className="text-[11px] text-gray-500">AWB: {order.trackingId}</div>
                    ) : null}
                    {order.trackingUrl ? (
                      <a className="text-[11px] text-primary-600 hover:text-primary-700" href={order.trackingUrl} target="_blank" rel="noreferrer">
                        Track shipment
                      </a>
                    ) : null}
                  </div>
                  <div className="col-span-2 flex flex-col items-end gap-2">
                    <select
                      className="w-full rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => openDocument(order.id, 'bill')}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Bill
                      </button>
                      <button
                        onClick={() => openDocument(order.id, 'label')}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Internal label
                      </button>
                      <button
                        onClick={() => openShippingLabel(order.id)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Delhivery label
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        onClick={() => handleShippingAction('/api/admin/shipping/create', order.id)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        disabled={shippingAction === order.id}
                      >
                        Create shipment
                      </button>
                      <button
                        onClick={() => handleShippingAction('/api/admin/shipping/track', order.id)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        disabled={!order.trackingId || shippingAction === order.id}
                      >
                        Track
                      </button>
                      <button
                        onClick={() => handleShippingAction('/api/admin/shipping/pickup', order.id)}
                        className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                        disabled={!order.trackingId || shippingAction === order.id}
                      >
                        Request pickup
                      </button>
                    </div>
                    <button
                      onClick={() => handleWhatsAppUpdate(order)}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      WhatsApp update
                    </button>
                    <button
                      onClick={() => issueRefund(order.id)}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      disabled={refunding === order.id || order.paymentStatus !== 'PAID'}
                    >
                      {refunding === order.id ? 'Refunding' : 'Issue refund'}
                    </button>
                    {saving === order.id ? <span className="text-[11px] text-gray-400">Saving...</span> : null}
                  </div>
                </div>
              )
            })}
{filteredOrders.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-gray-500">No orders to display.</div>
            ) : null}
          </div>
        </div>
          </>
        )}

        {activeView === 'carts' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Active carts</h2>
                <p className="text-sm text-gray-600">Users who added products but haven&apos;t checked out.</p>
              </div>
              <div className="text-xs text-gray-500">{carts.length} carts</div>
            </div>
            {cartsLoading ? (
              <div className="text-sm text-gray-500">Loading carts...</div>
            ) : carts.length === 0 ? (
              <div className="text-sm text-gray-500">No active carts.</div>
            ) : (
              <div className="divide-y divide-gray-100 text-sm">
                {carts.map((cart) => (
                  <div key={cart.id} className="py-3 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <div className="text-gray-900 font-medium">{cart.user?.email || 'Customer'}</div>
                      <div className="text-xs text-gray-500">Items: {cart.itemCount} ? Updated {new Date(cart.updatedAt).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="text-xs text-gray-600">Subtotal: ? {Math.round(cart.subtotalCents / 100).toLocaleString('en-IN')}</div>
                    <div className="flex flex-wrap gap-2">
                      {cart.items.slice(0, 3).map((item: any) => (
                        <span key={item.id} className="rounded-full border border-gray-200 px-2 py-1 text-xs">{item.product?.name} ? {item.quantity}</span>
                      ))}
                      {cart.items.length > 3 ? <span className="text-xs text-gray-500">+{cart.items.length - 3} more</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
      <Footer />
    </div>
  )
}
