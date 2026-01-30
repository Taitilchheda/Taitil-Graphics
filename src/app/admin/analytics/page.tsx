'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'

type DashboardData = {
  timeSeries: {
    date: string
    views: number
    clicks: number
    inquiries: number
    orders: number
    revenueCents: number
    refunds: number
    refundCents: number
    unitsSold: number
  }[]
}

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    if (!user?.token) return
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch(() => setDashboardData(null))
  }, [user?.token])

  const timeSeries = useMemo(
    () => dashboardData?.timeSeries ?? [],
    [dashboardData?.timeSeries]
  )

  const engagementSeries = useMemo(
    () => ({
      labels: timeSeries.map((point) => point.date),
      views: timeSeries.map((point) => point.views),
      clicks: timeSeries.map((point) => point.clicks),
      inquiries: timeSeries.map((point) => point.inquiries),
    }),
    [timeSeries]
  )

  const salesSeries = useMemo(
    () => ({
      labels: timeSeries.map((point) => point.date),
      orders: timeSeries.map((point) => point.orders),
      units: timeSeries.map((point) => point.unitsSold),
      revenue: timeSeries.map((point) => Math.round(point.revenueCents / 100)),
    }),
    [timeSeries]
  )

  const refundsSeries = useMemo(
    () => ({
      labels: timeSeries.map((point) => point.date),
      refunds: timeSeries.map((point) => point.refunds),
      amounts: timeSeries.map((point) => Math.round(point.refundCents / 100)),
    }),
    [timeSeries]
  )

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-800">Back to dashboard</Link>
            <h1 className="text-3xl font-bold text-gray-900">Detailed analytics</h1>
            <p className="text-gray-600">Daily trends for engagement, sales, and refunds.</p>
          </div>
        </div>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Engagement</p>
            <h2 className="text-xl font-semibold text-gray-900">Views, clicks, inquiries</h2>
            <p className="text-sm text-gray-600">30-day trend from analytics events.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Views" subtitle="Daily views" data={engagementSeries.views} labels={engagementSeries.labels} color="#0ea5e9" />
            <ChartCard title="Clicks" subtitle="Daily clicks" data={engagementSeries.clicks} labels={engagementSeries.labels} color="#f97316" />
            <ChartCard title="Inquiries" subtitle="Daily inquiries" data={engagementSeries.inquiries} labels={engagementSeries.labels} color="#22c55e" />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Sales</p>
            <h2 className="text-xl font-semibold text-gray-900">Orders, units, revenue</h2>
            <p className="text-sm text-gray-600">30-day sales velocity from paid orders.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Orders" subtitle="Daily orders" data={salesSeries.orders} labels={salesSeries.labels} color="#6366f1" />
            <ChartCard title="Units sold" subtitle="Daily units" data={salesSeries.units} labels={salesSeries.labels} color="#0f766e" />
            <ChartCard title="Revenue (INR)" subtitle="Daily revenue" data={salesSeries.revenue} labels={salesSeries.labels} color="#16a34a" />
          </div>
        </section>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Refunds</p>
            <h2 className="text-xl font-semibold text-gray-900">Refund count & amount</h2>
            <p className="text-sm text-gray-600">Daily refund volume and value.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Refunds" subtitle="Daily refunds" data={refundsSeries.refunds} labels={refundsSeries.labels} color="#ef4444" />
            <ChartCard title="Refund amount (INR)" subtitle="Daily refund amount" data={refundsSeries.amounts} labels={refundsSeries.labels} color="#f97316" />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function ChartCard({ title, subtitle, data, labels, color }: { title: string; subtitle: string; data: number[]; labels: string[]; color: string }) {
  const max = Math.max(1, ...data)
  const points = data.map((value, idx) => {
    const x = (idx / Math.max(1, data.length - 1)) * 100
    const y = 40 - (value / max) * 40
    return `${x},${y}`
  })
  const lastValue = data[data.length - 1] ?? 0
  return (
    <div className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">{subtitle}</p>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm font-semibold text-gray-900">{lastValue}</div>
      </div>
      <svg viewBox="0 0 100 40" className="w-full h-24">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points.join(' ')}
        />
      </svg>
      <div className="flex items-center justify-between text-[11px] text-gray-400">
        <span>{labels[0] || ''}</span>
        <span>{labels[labels.length - 1] || ''}</span>
      </div>
    </div>
  )
}
