'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import { useAuth } from '@/components/providers/AuthProvider'
import { ArrowLeft, Package, Truck, CheckCircle, Clock } from 'lucide-react'

type OrderItem = {
  id: string
  quantity: number
  priceCents: number
  product: {
    id: string
    name: string
    image: string
  }
}

type Order = {
  id: string
  status: string
  paymentStatus: string
  totalCents: number
  createdAt: string
  address?: {
    fullName?: string | null
    line1?: string | null
    line2?: string | null
    city?: string | null
    state?: string | null
    postal?: string | null
  } | null
  items: OrderItem[]
}

const statusBadge = (status: string) => {
  const normalized = status.toUpperCase()
  if (normalized === 'DELIVERED') return 'bg-emerald-100 text-emerald-700'
  if (normalized === 'SHIPPED') return 'bg-sky-100 text-sky-700'
  if (normalized === 'PAID') return 'bg-amber-100 text-amber-700'
  if (normalized === 'CANCELLED') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

const statusIcon = (status: string) => {
  const normalized = status.toUpperCase()
  if (normalized === 'DELIVERED') return CheckCircle
  if (normalized === 'SHIPPED') return Truck
  if (normalized === 'PAID') return Package
  return Clock
}

export default function OrdersPage() {
  const { user, isLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState('')
  const inrSymbol = String.fromCharCode(8377)

  const totalOrders = orders.length
  const paidOrders = useMemo(
    () => orders.filter((order) => order.paymentStatus === 'PAID').length,
    [orders],
  )

  useEffect(() => {
    if (!user?.token) return

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/account/orders', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        if (!res.ok) {
          throw new Error('Unable to load orders')
        }
        const data = await res.json()
        setOrders(data.orders || [])
        setError('')
      } catch (err) {
        console.error(err)
        setError('Unable to load orders right now.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user?.token])

  const canCancel = (order: Order) => {
    const createdAt = new Date(order.createdAt).getTime()
    const withinWindow = Date.now() - createdAt <= 24 * 60 * 60 * 1000
    const blocked = ['SHIPPED', 'DELIVERED', 'CANCELLED']
    return withinWindow && !blocked.includes(order.status?.toUpperCase())
  }

  const handleCancel = async (orderId: string) => {
    if (!user?.token) return
    setCancellingId(orderId)
    setActionMessage('')
    try {
      const res = await fetch(`/api/account/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${user.token}` },
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Unable to cancel order')
      }
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'CANCELLED' } : o)))
      setActionMessage('Order cancelled successfully. Refunds are processed within 3-5 business days if applicable.')
    } catch (err: any) {
      setActionMessage(err.message || 'Unable to cancel order')
    } finally {
      setCancellingId(null)
    }
  }

  if (!isLoading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Sign in required</h1>
          <p className="text-gray-600">Please log in to view your orders.</p>
          <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 justify-center">
            Sign in
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link href="/account" className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to account
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Your Orders</h1>
            <p className="text-gray-600">Track payment status, fulfillment, and invoices.</p>
          </div>
          <Link href="/categories/all" className="btn-secondary">
            Continue shopping
          </Link>
        </div>

        {actionMessage ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
            {actionMessage}
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">Total orders</p>
            <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">Paid orders</p>
            <p className="text-2xl font-semibold text-gray-900">{paidOrders}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-sm text-gray-500">Support</p>
            <p className="text-sm text-gray-700">Need help? <Link href="/contact" className="text-primary-600">Contact us</Link></p>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center text-gray-500">
            Loading orders...
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-lg font-semibold text-gray-900">No orders yet</p>
            <p className="text-gray-600 mt-2">Once you place an order, it will show up here.</p>
            <Link href="/categories/all" className="btn-primary mt-4 inline-flex">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const Icon = statusIcon(order.status)
              return (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Order</p>
                        <p className="text-sm font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">Placed {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadge(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Order total</p>
                        <p className="text-lg font-semibold text-gray-900">{inrSymbol}{Math.round(order.totalCents / 100).toLocaleString('en-IN')}</p>
                      </div>
                      {canCancel(order) ? (
                        <button
                          onClick={() => handleCancel(order.id)}
                          disabled={cancellingId === order.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel order'}
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="px-5 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4">
                          <div className="relative h-14 w-14 rounded-lg border border-gray-100 bg-white overflow-hidden">
                            <Image
                              src={item.product.image || '/logo.svg'}
                              alt={item.product.name}
                              fill
                              sizes="56px"
                              className="object-contain"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Qty {item.quantity}</p>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            {inrSymbol}{Math.round((item.priceCents * item.quantity) / 100).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600 space-y-2">
                      <div className="font-semibold text-gray-900">Delivery address</div>
                      <div>{order.address?.fullName || user?.name || 'Customer'}</div>
                      <div>{order.address?.line1 || 'Address on file'}</div>
                      <div>{order.address?.line2 || ''}</div>
                      <div>
                        {[order.address?.city, order.address?.state, order.address?.postal]
                          .filter(Boolean)
                          .join(', ') || 'India'}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
