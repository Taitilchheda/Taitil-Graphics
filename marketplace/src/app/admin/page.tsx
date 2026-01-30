'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import ProductCard from '@/components/ui/ProductCard'
import Link from 'next/link'
import { Eye, MousePointerClick, MessageSquare, PlusCircle } from 'lucide-react'

type DashboardTotals = {
  view: number
  click: number
  inquiry: number
  cart: number
  sale: number
  inventory: number
  productAdded: number
  orders: number
  paidOrders: number
  revenueCents: number
  refunds: number
  refundCents: number
}

type DashboardProductStat = {
  productId: string
  views: number
  clicks: number
  inquiries: number
  unitsSold: number
  revenueCents: number
}

type DashboardData = {
  totals: DashboardTotals
  productStats: DashboardProductStat[]
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

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { categories, allProducts } = useCatalog()
  const { summary } = useAnalytics()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!user?.token) return
    setDashboardLoading(true)
    fetch('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setDashboardData(data))
      .catch(() => setDashboardData(null))
      .finally(() => setDashboardLoading(false))
  }, [user?.token])

  const statsByProductId = useMemo(() => {
    const map: Record<string, DashboardProductStat> = {}
    dashboardData?.productStats?.forEach((stat) => {
      map[stat.productId] = stat
    })
    return map
  }, [dashboardData?.productStats])

  const productsWithCounts = useMemo(
    () =>
      allProducts.map((p) => {
        const stats = statsByProductId[p.id]
        return {
          ...p,
          views: stats?.views ?? summary.productCounts.views[p.id] ?? 0,
          clicks: stats?.clicks ?? summary.productCounts.clicks[p.id] ?? 0,
          inquiries: stats?.inquiries ?? 0,
          unitsSold: stats?.unitsSold ?? 0,
          revenueCents: stats?.revenueCents ?? 0,
        }
      }),
    [allProducts, statsByProductId, summary.productCounts.clicks, summary.productCounts.views]
  )

  const topViewed = useMemo(
    () => [...productsWithCounts].sort((a, b) => b.views - a.views).slice(0, 5),
    [productsWithCounts]
  )

  const topClicked = useMemo(
    () => [...productsWithCounts].sort((a, b) => b.clicks - a.clicks).slice(0, 5),
    [productsWithCounts]
  )

  const categoryPerformance = useMemo(() => {
    const performanceMap: Record<
      string,
      {
        name: string
        views: number
        clicks: number
      }
    > = {}

    categories.forEach((cat) => {
      performanceMap[cat.id] = { name: cat.name, views: 0, clicks: 0 }
    })

    productsWithCounts.forEach((product) => {
      const bucket = performanceMap[product.category]
      if (!bucket) return
      bucket.views += product.views || 0
      bucket.clicks += product.clicks || 0
    })

    return Object.values(performanceMap).sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
  }, [productsWithCounts, categories])

  const highMomentumSnapshot = useMemo(
    () =>
      [...productsWithCounts]
        .sort((a, b) => b.views + b.clicks - (a.views + a.clicks))
        .slice(0, 6),
    [productsWithCounts]
  )

  const topSold = useMemo(
    () => [...productsWithCounts].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5),
    [productsWithCounts]
  )

  const totalUnitsSold = useMemo(
    () => productsWithCounts.reduce((sum, product) => sum + (product.unitsSold || 0), 0),
    [productsWithCounts]
  )

  const analyticsTotals = useMemo(
    () => ({
      view: dashboardData?.totals.view ?? summary.totals.view,
      click: dashboardData?.totals.click ?? summary.totals.click,
      inquiry: dashboardData?.totals.inquiry ?? summary.totals.inquiry,
      productAdded: dashboardData?.totals.productAdded ?? summary.totals['product-added'],
    }),
    [dashboardData?.totals, summary.totals]
  )

  const orderTotals = useMemo(
    () => ({
      orders: dashboardData?.totals.orders ?? 0,
      paidOrders: dashboardData?.totals.paidOrders ?? 0,
      revenueCents: dashboardData?.totals.revenueCents ?? 0,
      refunds: dashboardData?.totals.refunds ?? 0,
      refundCents: dashboardData?.totals.refundCents ?? 0,
    }),
    [dashboardData?.totals]
  )

  const timeSeries = useMemo(
    () => dashboardData?.timeSeries ?? [],
    [dashboardData?.timeSeries]
  )

  const engagementSeries = useMemo(
    () => ({
      labels: timeSeries.map((point) => point.date.slice(5)),
      views: timeSeries.map((point) => point.views),
      clicks: timeSeries.map((point) => point.clicks),
      inquiries: timeSeries.map((point) => point.inquiries),
    }),
    [timeSeries]
  )

  const salesSeries = useMemo(
    () => ({
      labels: timeSeries.map((point) => point.date.slice(5)),
      orders: timeSeries.map((point) => point.orders),
      units: timeSeries.map((point) => point.unitsSold),
      revenue: timeSeries.map((point) => Math.round(point.revenueCents / 100)),
    }),
    [timeSeries]
  )

  const refundsSeries = useMemo(
    () => ({
      labels: timeSeries.map((point) => point.date.slice(5)),
      refunds: timeSeries.map((point) => point.refunds),
      amounts: timeSeries.map((point) => Math.round(point.refundCents / 100)),
    }),
    [timeSeries]
  )

  const maxClicks = Math.max(1, ...productsWithCounts.map((p) => p.clicks))
  const maxViews = Math.max(1, ...productsWithCounts.map((p) => p.views))
  const maxCategoryValue = Math.max(
    1,
    ...categoryPerformance.map((c) => c.views + c.clicks)
  )

  const sparkViews = useMemo(() => topViewed.map((item) => item.views), [topViewed])
  const sparkClicks = useMemo(() => topClicked.map((item) => item.clicks), [topClicked])
  const pieData = useMemo(() => {
    const views = analyticsTotals.view || 0
    const clicks = analyticsTotals.click || 0
    const inquiries = analyticsTotals.inquiry || 0
    const total = Math.max(1, views + clicks + inquiries)
    return [
      { label: 'Views', value: views, color: 'hsl(192, 85%, 55%)' },
      { label: 'Clicks', value: clicks, color: 'hsl(12, 83%, 62%)' },
      { label: 'Inquiries', value: inquiries, color: 'hsl(140, 55%, 55%)' },
    ].map((slice) => ({ ...slice, pct: (slice.value / total) * 100 }))
  }, [analyticsTotals])

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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-gray-500">Admin Dashboard</p>
          <h1 className="text-3xl font-bold text-gray-900">Control room</h1>
          <p className="text-gray-600">Track what people see and click, upload new items fast, and manage every listing.</p>
          {dashboardLoading ? (
            <p className="text-xs text-gray-500">Syncing analytics from the database...</p>
          ) : null}
          <div className="flex flex-wrap gap-2 pt-2">
            <a href="#sales" className="px-3 py-1 rounded-full bg-white border text-sm text-gray-700">Sales overview</a>
            <a href="#visuals" className="px-3 py-1 rounded-full bg-white border text-sm text-gray-700">Visuals</a>
            <a href="#snapshot" className="px-3 py-1 rounded-full bg-white border text-sm text-gray-700">Snapshot</a>
            <a href="#performance" className="px-3 py-1 rounded-full bg-white border text-sm text-gray-700">Product performance</a>
            <a href="#engagement" className="px-3 py-1 rounded-full bg-white border text-sm text-gray-700">Engagement</a>
          </div>
        </div>

        <section id="workflows" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 2</p>
              <h2 className="text-xl font-semibold text-gray-900">Workflows for big catalogs</h2>
              <p className="text-gray-600 text-sm">Most used first: jump straight to creating or editing with dedicated subpages.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/admin/new" className="group border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-primary-50/40">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Create a new listing</h3>
                <PlusCircle className="w-5 h-5 text-primary-700" />
              </div>
              <p className="text-sm text-gray-600">One simple form. No distractions. Save and move to the next product quickly.</p>
              <p className="text-xs text-primary-700 mt-2 group-hover:underline">Go to /admin/new</p>
            </Link>
            <Link href="/admin/listings" className="group border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Manage & edit listings</h3>
              </div>
              <p className="text-sm text-gray-600">Search, filter, paginate, and open a dedicated edit screen for any item.</p>
              <p className="text-xs text-primary-700 mt-2 group-hover:underline">Go to /admin/listings</p>
            </Link>
            <Link href="/admin/orders" className="group border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Monitor orders</h3>
              </div>
              <p className="text-sm text-gray-600">Track payment status, fulfillment progress, and update the order pipeline.</p>
              <p className="text-xs text-primary-700 mt-2 group-hover:underline">Go to /admin/orders</p>
            </Link>
            <Link href="/admin/inventory" className="group border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Inventory control</h3>
              </div>
              <p className="text-sm text-gray-600">Adjust stock, SKUs, and reorder points with instant updates.</p>
              <p className="text-xs text-primary-700 mt-2 group-hover:underline">Go to /admin/inventory</p>
            </Link>
            <Link href="/admin/reviews" className="group border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">Ratings & reviews</h3>
              </div>
              <p className="text-sm text-gray-600">Approve reviews, track verified purchases, and respond fast.</p>
              <p className="text-xs text-primary-700 mt-2 group-hover:underline">Go to /admin/reviews</p>
            </Link>
          </div>
        </section>

        <section id="sales" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 2</p>
              <h2 className="text-xl font-semibold text-gray-900">Sales overview</h2>
              <p className="text-gray-600 text-sm">Units sold, revenue, and order health pulled from the live database.</p>
            </div>
            <Link href="/admin/orders" className="text-sm text-primary-700 hover:text-primary-800">Open orders</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile label="Total orders" value={orderTotals.orders} />
            <MetricTile label="Paid orders" value={orderTotals.paidOrders} />
            <MetricTile label="Units sold" value={totalUnitsSold} />
            <MetricTile label="Revenue (INR)" value={Math.round(orderTotals.revenueCents / 100).toLocaleString('en-IN')} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Top sold products</h3>
              <div className="space-y-2">
                {topSold.map((product) => (
                  <BarRow
                    key={product.id}
                    label={product.name}
                    meta={product.category}
                    primary={product.unitsSold}
                    max={Math.max(1, topSold[0]?.unitsSold || 1)}
                    primaryLabel="Sold"
                    secondary={Math.round(product.revenueCents / 100)}
                    secondaryLabel="INR"
                    barColor="bg-emerald-300"
                  />
                ))}
                {topSold.length === 0 && <p className="text-sm text-gray-500">No sales data yet.</p>}
              </div>
            </div>
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Refunds</h3>
              <p className="text-sm text-gray-600">Refunded orders: {orderTotals.refunds}</p>
              <p className="text-sm text-gray-600">Refund amount: INR {Math.round(orderTotals.refundCents / 100).toLocaleString('en-IN')}</p>
              <p className="text-xs text-gray-500">Data updates when orders are marked refunded in Razorpay.</p>
            </div>
          </div>
        </section>

        <section id="visuals" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 1</p>
              <h2 className="text-xl font-semibold text-gray-900">Charts at a glance</h2>
              <p className="text-gray-600 text-sm">Line, bar, and pie snapshots to skim live activity.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/analytics" className="text-sm text-primary-700 hover:text-primary-800">Open analytics detail</Link>
              <Link href="/admin/listings" className="text-sm text-primary-700 hover:text-primary-800">Open listings</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-100 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-500">Top views trend</p>
              <Sparkline data={sparkViews} color="#0ea5e9" />
              <p className="text-xs text-gray-600">Using current most-seen items</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 space-y-2">
              <p className="text-xs text-gray-500">Top clicks trend</p>
              <Sparkline data={sparkClicks} color="#f97316" />
              <p className="text-xs text-gray-600">Using current most-clicked items</p>
            </div>
            <div className="border border-gray-100 rounded-lg p-4 space-y-3 flex items-center gap-3">
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


        


        


        <section id="sales-trends" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 2B</p>
              <h2 className="text-xl font-semibold text-gray-900">Sales trends (30 days)</h2>
              <p className="text-gray-600 text-sm">Orders, units sold, and revenue by day.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Orders" subtitle="Daily orders" data={salesSeries.orders} labels={salesSeries.labels} color="#6366f1" />
            <ChartCard title="Units sold" subtitle="Daily units" data={salesSeries.units} labels={salesSeries.labels} color="#0f766e" />
            <ChartCard title="Revenue (INR)" subtitle="Daily revenue" data={salesSeries.revenue} labels={salesSeries.labels} color="#16a34a" />
          </div>
        </section>

        <section id="refund-trends" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 2C</p>
              <h2 className="text-xl font-semibold text-gray-900">Refund trends (30 days)</h2>
              <p className="text-gray-600 text-sm">Refund volume and amount by day.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Refunds" subtitle="Daily refunds" data={refundsSeries.refunds} labels={refundsSeries.labels} color="#ef4444" />
            <ChartCard title="Refund amount (INR)" subtitle="Daily refund amount" data={refundsSeries.amounts} labels={refundsSeries.labels} color="#f97316" />
          </div>
        </section>

        {/* Workflow shortcuts */}
        

        {/* Snapshot */}
        <section id="snapshot" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 3</p>
              <h2 className="text-xl font-semibold text-gray-900">High-momentum listings</h2>
              <p className="text-gray-600 text-sm">Top items by combined views and clicks — quick pulse without loading everything.</p>
            </div>
            <Link href="/admin/listings" className="text-sm text-primary-700 hover:text-primary-800">Open full listings</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highMomentumSnapshot.map((product) => (
              <div key={product.id} className="border border-gray-100 rounded-xl shadow-sm p-3 bg-white space-y-2">
                <ProductCard product={product} showQuickAdd={false} />
                <div className="flex items-center justify-between text-xs text-gray-600 px-1">
                  <span>Views: {product.views}</span>
                  <span>Clicks: {product.clicks}</span>
                </div>
              </div>
            ))}
            {highMomentumSnapshot.length === 0 && (
              <p className="text-sm text-gray-500 p-4 bg-white border border-gray-100 rounded-xl shadow-sm">No momentum data yet.</p>
            )}
          </div>
        </section>

        <section id="performance" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 4</p>
              <h2 className="text-xl font-semibold text-gray-900">Product performance</h2>
              <p className="text-gray-600 text-sm">Clicks vs seen, side-by-side, with quick bars for context.</p>
            </div>
            <Link href="/admin/listings" className="text-sm text-primary-700 hover:text-primary-800">Open full listings</Link>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Most clicked</h3>
                <span className="text-xs text-gray-500">clicks with seen overlay</span>
              </div>
              <div className="space-y-2">
                {topClicked.map((product) => (
                  <BarRow
                    key={product.id}
                    label={product.name}
                    meta={product.category}
                    primary={product.clicks}
                    max={maxClicks}
                    secondary={product.views}
                    secondaryLabel="Seen"
                  />
                ))}
                {topClicked.length === 0 && <p className="text-sm text-gray-500 py-2">No click data yet.</p>}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Most seen</h3>
                <span className="text-xs text-gray-500">views with clicks overlay</span>
              </div>
              <div className="space-y-2">
                {topViewed.map((product) => (
                  <BarRow
                    key={product.id}
                    label={product.name}
                    meta={product.category}
                    primary={product.views}
                    max={maxViews}
                    primaryLabel="Seen"
                    secondary={product.clicks}
                    secondaryLabel="Clicks"
                    barColor="bg-primary-200"
                  />
                ))}
                {topViewed.length === 0 && <p className="text-sm text-gray-500 py-2">No view data yet.</p>}
              </div>
            </div>
          </div>
        </section>

        <section id="engagement" className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Section 5</p>
              <h2 className="text-xl font-semibold text-gray-900">Category engagement</h2>
              <p className="text-gray-600 text-sm">Click and view volume by category with proportional bars.</p>
            </div>
            <div className="flex gap-2">
              <MetricChip label="Views" value={analyticsTotals.view} icon={<Eye className="w-4 h-4" />} />
              <MetricChip label="Clicks" value={analyticsTotals.click} icon={<MousePointerClick className="w-4 h-4" />} />
              <MetricChip label="Inquiries" value={analyticsTotals.inquiry} icon={<MessageSquare className="w-4 h-4" />} />
              <MetricChip label="New" value={analyticsTotals.productAdded} icon={<PlusCircle className="w-4 h-4" />} />
            </div>
          </div>
          <div className="space-y-3">
            {categoryPerformance.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm text-gray-800">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-xs text-gray-500">Seen {cat.views} · Clicked {cat.clicks}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-primary-200"
                    style={{ width: `${Math.min(100, ((cat.views + cat.clicks) / maxCategoryValue) * 100)}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="inline-flex items-center gap-1"><Eye className="w-3 h-3 text-primary-600" /> {cat.views} views</span>
                  <span className="inline-flex items-center gap-1"><MousePointerClick className="w-3 h-3 text-primary-600" /> {cat.clicks} clicks</span>
                </div>
              </div>
            ))}
            {categoryPerformance.length === 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm text-sm text-gray-500">
                No engagement data yet.
              </div>
            )}
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

function MetricTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function MetricChip({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border text-sm text-gray-700 shadow-sm">
      {icon}
      <span className="font-medium">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </span>
  )
}

function BarRow({
  label,
  meta,
  primary,
  primaryLabel = 'Clicks',
  secondary,
  secondaryLabel = 'Seen',
  max,
  barColor = 'bg-primary-300',
}: {
  label: string
  meta?: string
  primary: number
  primaryLabel?: string
  secondary: number
  secondaryLabel?: string
  max: number
  barColor?: string
}) {
  const pct = Math.min(100, (primary / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm text-gray-800">
        <div>
          <p className="font-semibold text-gray-900 line-clamp-1">{label}</p>
          {meta && <p className="text-xs text-gray-500 capitalize">{meta}</p>}
        </div>
        <div className="text-xs text-gray-600 text-right">
          <p>
            {primaryLabel}: {primary}
          </p>
          <p>
            {secondaryLabel}: {secondary}
          </p>
        </div>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
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
