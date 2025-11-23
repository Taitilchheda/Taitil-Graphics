'use client'

import { useEffect, useMemo, useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  Activity,
  BarChart2,
  MousePointerClick,
  MessageSquare,
  ShoppingBag,
  Layers,
  TrendingUp,
  Inbox,
  CheckCircle2,
  Users,
  Package,
  ClipboardList,
  Wand2,
  Trash2,
  Edit3,
  FolderPlus,
  Upload,
} from 'lucide-react'
import { categories as baseCatalog } from '@/data/products'

interface FormState {
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  image: string
  features: string
  isRecommended: boolean
  isHotSeller: boolean
  imageFile?: string
}

export default function AdminPortalPage() {
  const {
    categories,
    allProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    getInventory,
    getProductById,
  } = useCatalog()
  const { events, summary, logEvent } = useAnalytics()
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'accounts' | 'structure'>('overview')
  const [orders, setOrders] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [structureCategory, setStructureCategory] = useState({ name: '', description: '' })
  const [structureSubcategory, setStructureSubcategory] = useState({ categoryId: '', name: '', description: '' })
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [customProductIds, setCustomProductIds] = useState<string[]>([])
  const baseCategoryIds = useMemo(() => new Set(baseCatalog.map((c) => c.id)), [])
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [editingSubcategory, setEditingSubcategory] = useState<{ categoryId: string; subcategoryId: string } | null>(null)

  const [formState, setFormState] = useState<FormState>({
    name: '',
    description: '',
    categoryId: categories[0]?.id || '',
    subcategoryId: categories[0]?.subcategories[0]?.id || '',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=420&fit=crop',
    features: 'Premium finish,Fast delivery,Custom design',
    isRecommended: true,
    isHotSeller: false,
    imageFile: undefined,
    imageFiles: [],
  })

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        subcategories: category.subcategories,
      })),
    [categories]
  )

  const recentInquiries = events.filter((event) => event.type === 'inquiry').slice(0, 6)
  const recentClicks = events.filter((event) => event.type === 'click').slice(0, 6)
  const topInventory = [...allProducts]
    .sort((a, b) => getInventory(b.id) - getInventory(a.id))
    .slice(0, 6)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  useEffect(() => {
    if (!structureSubcategory.categoryId && categories.length) {
      setStructureSubcategory((prev) => ({ ...prev, categoryId: categories[0].id }))
    }
  }, [categories, structureSubcategory.categoryId])

  useEffect(() => {
    const seedOrders = [
      { id: 'ord-1001', customer: 'Riya Shah', product: 'Standard Visiting Cards', status: 'Pending', createdAt: new Date().toISOString(), channel: 'Website' },
      { id: 'ord-1002', customer: 'Cafe Bloom', product: 'Product Boxes', status: 'In Production', createdAt: new Date(Date.now() - 86400000).toISOString(), channel: 'WhatsApp' },
    ]
    const seedAccounts = [
      { id: 'acct-1', name: 'Riya Shah', email: 'riya@example.com', tier: 'Retailer', phone: '+91 99999 99999' },
      { id: 'acct-2', name: 'Cafe Bloom', email: 'hello@cafebloom.com', tier: 'Business', phone: '+91 88888 88888' },
    ]
    const storedOrders = localStorage.getItem('taitil-orders')
    const storedAccounts = localStorage.getItem('taitil-accounts')
    const storedCustomProducts = localStorage.getItem('taitil-custom-products')
    setOrders(storedOrders ? JSON.parse(storedOrders) : seedOrders)
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts))
    } else {
      const userDb = localStorage.getItem('taitil-user-db')
      if (userDb) {
        try {
          const parsed = JSON.parse(userDb)
          const normalized = parsed.map((u: any) => ({
            id: u.id,
            name: u.name || u.email,
            email: u.email,
            tier: 'Retailer',
            phone: u.phone || '',
          }))
          setAccounts(normalized)
        } catch {
          setAccounts(seedAccounts)
        }
      } else {
        setAccounts(seedAccounts)
      }
    }

    if (storedCustomProducts) {
      try {
        const parsed = JSON.parse(storedCustomProducts)
        setCustomProductIds(parsed.map((p: any) => p.id))
      } catch {
        setCustomProductIds([])
      }
    }
  }, [])

  useEffect(() => {
    if (orders.length) localStorage.setItem('taitil-orders', JSON.stringify(orders))
  }, [orders])

  useEffect(() => {
    if (accounts.length) localStorage.setItem('taitil-accounts', JSON.stringify(accounts))
  }, [accounts])

  if (!user || user.role !== 'admin') {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formState.name || !formState.description) return

    if (editingProductId) {
      const updated = updateProduct(editingProductId, {
        name: formState.name,
        description: formState.description,
        categoryId: formState.categoryId,
        subcategoryId: formState.subcategoryId,
        image: formState.image,
        imageFile: formState.imageFile,
        imageFiles: formState.imageFiles,
        features: formState.features.split(',').map((f) => f.trim()).filter(Boolean),
        isRecommended: formState.isRecommended,
        isHotSeller: formState.isHotSeller,
      })
      if (updated) {
        logEvent({ type: 'product-added', productId: updated.id, categoryId: updated.category, subcategoryId: updated.subcategory, label: 'admin-edit-product' })
      }
      setEditingProductId(null)
    } else {
      const product = addProduct({
        name: formState.name,
        description: formState.description,
        categoryId: formState.categoryId,
        subcategoryId: formState.subcategoryId,
        image: formState.image,
        imageFile: formState.imageFile,
        imageFiles: formState.imageFiles,
        features: formState.features.split(',').map((f) => f.trim()).filter(Boolean),
        isRecommended: formState.isRecommended,
        isHotSeller: formState.isHotSeller,
        badges: ['New listing'],
      })
      setCustomProductIds((prev) => Array.from(new Set([...prev, product.id])))

      logEvent({
        type: 'product-added',
        productId: product.id,
        categoryId: product.category,
        subcategoryId: product.subcategory,
        label: 'admin-add-product',
      })
    }

    setFormState((prev) => ({
      ...prev,
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=420&fit=crop',
      features: 'Premium finish,Fast delivery,Custom design',
      imageFile: undefined,
      imageFiles: [],
    }))
  }

  const handleImageUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFormState((prev) => ({ ...prev, imageFile: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  const handleMultiImageUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const uploads: Promise<string>[] = Array.from(files).map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
    )
    Promise.all(uploads).then((results) => {
      setFormState((prev) => ({
        ...prev,
        imageFiles: [...(prev.imageFiles || []), ...results],
        imageFile: prev.imageFile || results[0],
      }))
    })
  }

  const handleGenerateDescription = () => {
    const name = formState.name || 'Product'
    const categoryName = categoryOptions.find((c) => c.id === formState.categoryId)?.name
    const subName = categoryOptions.find((c) => c.id === formState.categoryId)?.subcategories.find((s) => s.id === formState.subcategoryId)?.name
    const imageHint = formState.imageFile || formState.imageFiles?.[0] || formState.image
    const visualCue = imageHint ? ' Visual cues detected; ready for proofing.' : ''
    const featureSeed = formState.features || 'Premium quality,Fast delivery,Custom finish'
    const base = `High-quality ${name} crafted for ${categoryName || 'your category'}${subName ? ` (${subName})` : ''}. ${visualCue}`
    setFormState((prev) => ({
      ...prev,
      description: `${base} Contact us on WhatsApp for sizing, materials, and timeline.`,
      features: prev.features || featureSeed,
    }))
  }

  const handleCopyFromProduct = (productId: string) => {
    const source = allProducts.find((p) => p.id === productId)
    if (!source) return
    setFormState((prev) => ({
      ...prev,
      name: source.name,
      description: source.description,
      categoryId: source.category,
      subcategoryId: source.subcategory || prev.subcategoryId,
      image: source.image,
      images: source.images,
      features: source.features.join(', '),
      isRecommended: !!source.isRecommended,
      isHotSeller: !!source.isHotSeller,
    }))
  }

  const handleDeleteProduct = (productId: string) => {
    deleteProduct(productId)
    setCustomProductIds((prev) => prev.filter((id) => id !== productId))
  }

  const handleCreateCategory = () => {
    if (!structureCategory.name.trim()) return
    if (editingCategoryId) {
      updateCategory(editingCategoryId, { name: structureCategory.name, description: structureCategory.description })
      setEditingCategoryId(null)
    } else {
      const category = addCategory({ name: structureCategory.name, description: structureCategory.description })
      setStructureSubcategory((prev) => ({ ...prev, categoryId: category.id }))
    }
    setStructureCategory({ name: '', description: '' })
  }

  const handleCreateSubcategory = () => {
    if (!structureSubcategory.name.trim() || !structureSubcategory.categoryId) return
    if (editingSubcategory) {
      updateSubcategory(editingSubcategory.categoryId, editingSubcategory.subcategoryId, {
        name: structureSubcategory.name,
        description: structureSubcategory.description,
      })
      setEditingSubcategory(null)
    } else {
      addSubcategory(structureSubcategory.categoryId, { name: structureSubcategory.name, description: structureSubcategory.description })
    }
    setStructureSubcategory((prev) => ({ ...prev, name: '', description: '' }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-gray-500 uppercase tracking-wide">Admin Portal</p>
            <h1 className="text-3xl font-bold text-gray-900">Operational Dashboard</h1>
            <p className="text-gray-600">Monitor clicks, inquiries, sales intent, and keep inventory synced.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {(['overview', 'products', 'structure', 'orders', 'accounts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full border ${activeTab === tab ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200'}`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'products' && 'Catalog'}
              {tab === 'structure' && 'Catalog Structure'}
              {tab === 'orders' && 'Orders'}
              {tab === 'accounts' && 'Accounts'}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Clicks</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{summary.totals.click}</h3>
                    <p className="text-xs text-gray-500">Navigation + CTA taps</p>
                  </div>
                  <MousePointerClick className="w-10 h-10 text-primary-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Inquiries</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{summary.totals.inquiry}</h3>
                    <p className="text-xs text-gray-500">WhatsApp + quote requests</p>
                  </div>
                  <MessageSquare className="w-10 h-10 text-primary-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Sales intent</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{summary.totals.cart + summary.totals.sale}</h3>
                    <p className="text-xs text-gray-500">Add-to-cart & conversions</p>
                  </div>
                  <ShoppingBag className="w-10 h-10 text-primary-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Catalog updates</p>
                    <h3 className="text-2xl font-semibold text-gray-900">{summary.totals['product-added']}</h3>
                    <p className="text-xs text-gray-500">New products created</p>
                  </div>
                  <Layers className="w-10 h-10 text-primary-600" />
                </div>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-primary-600" />
                Live interactions
              </h3>
              <span className="text-xs text-gray-500">{summary.recentEvents.length} tracked</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                <p className="text-sm text-primary-800 font-semibold mb-2">Latest inquiries</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentInquiries.length === 0 && <p className="text-sm text-gray-500">No inquiries yet.</p>}
                  {recentInquiries.map((event) => (
                    <div key={event.id} className="flex items-start justify-between text-sm bg-white rounded-md px-3 py-2 shadow-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getProductById(event.productId || '')?.name || event.label || 'Product enquiry'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                      <Inbox className="w-4 h-4 text-primary-600" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-800 font-semibold mb-2">Recent clicks</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentClicks.length === 0 && <p className="text-sm text-gray-500">No clicks logged.</p>}
                  {recentClicks.map((event) => (
                    <div key={event.id} className="flex items-start justify-between text-sm bg-gray-50 rounded-md px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getProductById(event.productId || '')?.name || event.label || 'Site click'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                      <Activity className="w-4 h-4 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory spotlight */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                Hot products
              </h3>
            </div>
            <div className="space-y-3">
              {topInventory.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {product.isHotSeller && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700">Hot</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Recent activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-primary-600" />
                Live interactions
              </h3>
              <span className="text-xs text-gray-500">{summary.recentEvents.length} tracked</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                <p className="text-sm text-primary-800 font-semibold mb-2">Latest inquiries</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentInquiries.length === 0 && <p className="text-sm text-gray-500">No inquiries yet.</p>}
                  {recentInquiries.map((event) => (
                    <div key={event.id} className="flex items-start justify-between text-sm bg-white rounded-md px-3 py-2 shadow-sm">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getProductById(event.productId || '')?.name || event.label || 'Product enquiry'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                      <Inbox className="w-4 h-4 text-primary-600" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-lg p-3">
                <p className="text-sm text-gray-800 font-semibold mb-2">Recent clicks</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {recentClicks.length === 0 && <p className="text-sm text-gray-500">No clicks logged.</p>}
                  {recentClicks.map((event) => (
                    <div key={event.id} className="flex items-start justify-between text-sm bg-gray-50 rounded-md px-3 py-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {getProductById(event.productId || '')?.name || event.label || 'Site click'}
                        </p>
                        <p className="text-xs text-gray-500">{new Date(event.createdAt).toLocaleString()}</p>
                      </div>
                      <Activity className="w-4 h-4 text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory spotlight */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                Stock & hot sellers
              </h3>
            </div>
            <div className="space-y-3">
              {topInventory.map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">
                      {getInventory(product.id)} in stock
                    </span>
                    {product.isHotSeller && (
                      <span className="text-xs px-2 py-1 rounded-full bg-orange-50 text-orange-700">Hot</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'products' && (
          <>
            {/* New product intake */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Catalog control</p>
                  <h3 className="text-xl font-semibold text-gray-900">Add a new product</h3>
                  <p className="text-xs text-gray-500">Drop images, we auto-fill details. All pricing via WhatsApp.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Product name</label>
                        <p className="text-xs text-gray-500">Type a name and we’ll help fill the rest.</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Copy from</span>
                        <select
                          onChange={(e) => e.target.value && handleCopyFromProduct(e.target.value)}
                          defaultValue=""
                          className="border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="">Select</option>
                          {allProducts.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <input
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                      placeholder="Premium Acrylic Cake Topper"
                      required
                    />

                    <div className="flex items-center justify-between mt-2">
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <button
                        type="button"
                        onClick={handleGenerateDescription}
                        className="text-xs text-primary-700 flex items-center space-x-1"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Auto-fill</span>
                      </button>
                    </div>
                    <textarea
                      value={formState.description}
                      onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 h-28 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Key details, finish, sizing, or use-case"
                      required
                    />

                    <label className="block text-sm font-medium text-gray-700 mt-2">Features (comma separated)</label>
                    <input
                      value={formState.features}
                      onChange={(e) => setFormState({ ...formState, features: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Premium quality, Fast delivery, Custom finish"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                          value={formState.categoryId}
                          onChange={(e) => {
                            const categoryId = e.target.value
                            const nextSub = categories.find((c) => c.id === categoryId)?.subcategories[0]?.id || ''
                            setFormState({ ...formState, categoryId, subcategoryId: nextSub })
                          }}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {categoryOptions.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                        <select
                          value={formState.subcategoryId}
                          onChange={(e) => setFormState({ ...formState, subcategoryId: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          {categoryOptions
                            .find((cat) => cat.id === formState.categoryId)
                            ?.subcategories.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {sub.name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-center">
                      <Upload className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-700 font-semibold">Drop images here</p>
                      <p className="text-xs text-gray-500 mb-3">or click to browse</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleMultiImageUpload(e.target.files)}
                        className="w-full text-sm"
                      />
                      <p className="text-[11px] text-gray-500 mt-2">We’ll use images to suggest description and features.</p>
                    </div>
                    <label className="block text-sm font-medium text-gray-700">Or paste image URL</label>
                    <input
                      value={formState.image}
                      onChange={(e) => setFormState({ ...formState, image: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="https://images.unsplash.com/..."
                    />
                    {(formState.imageFile || formState.imageFiles?.length) && (
                      <div className="grid grid-cols-4 gap-2">
                        {[formState.imageFile, ...(formState.imageFiles || [])].filter(Boolean).map((src, idx) => (
                          <div key={idx} className="border rounded-lg overflow-hidden h-20 bg-gray-50">
                            <img src={src as string} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-sm text-gray-600">
                    Heat tags auto-assign from engagement (Trending/Hot). Stock/pricing handled via WhatsApp.
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="bg-primary-600 text-white rounded-lg py-3 px-5 font-semibold hover:bg-primary-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{editingProductId ? 'Save changes' : 'Add product'}</span>
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(null)
                          setFormState((prev) => ({
                            ...prev,
                            name: '',
                            description: '',
                            categoryId: categories[0]?.id || '',
                            subcategoryId: categories[0]?.subcategories[0]?.id || '',
                            image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=420&fit=crop',
                            features: 'Premium finish,Fast delivery,Custom design',
                            imageFile: undefined,
                            imageFiles: [],
                          }))
                        }}
                        className="bg-white border border-gray-200 text-gray-700 rounded-lg py-3 px-4 font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary-600" />
                  Catalog items
                </h3>
                <span className="text-xs text-gray-500">{allProducts.length} products</span>
              </div>
              <div className="text-xs text-gray-500 mb-3">Only custom listings can be edited/deleted here. Base catalog stays locked.</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[420px] overflow-y-auto">
                {allProducts.map((product) => (
                  <div key={product.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category} {product.subcategory ? `• ${product.subcategory}` : ''}</p>
                      </div>
                      {product.id.startsWith('user-') || product.id.startsWith('product') ? null : null}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {product.isRecommended && <span className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 rounded-full">Recommended</span>}
                      {product.isHotSeller && <span className="text-[10px] px-2 py-1 bg-orange-50 text-orange-700 rounded-full">Hot</span>}
                    </div>
                    {customProductIds.includes(product.id) && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProductId(product.id)
                            setFormState((prev) => ({
                              ...prev,
                              name: product.name,
                              description: product.description,
                              categoryId: product.category,
                              subcategoryId: product.subcategory || prev.subcategoryId,
                              image: product.images?.[0] || product.image,
                              imageFile: product.images?.[0],
                              imageFiles: product.images || [],
                              features: product.features.join(', '),
                              isRecommended: !!product.isRecommended,
                              isHotSeller: !!product.isHotSeller,
                            }))
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className="text-xs flex items-center space-x-1 text-blue-600"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-xs flex items-center space-x-1 text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'structure' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-1">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
                <FolderPlus className="w-5 h-5 mr-2 text-primary-600" />
                {editingCategoryId ? 'Edit category' : 'Create category'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    value={structureCategory.name}
                    onChange={(e) => setStructureCategory((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Event Décor"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={structureCategory.description}
                    onChange={(e) => setStructureCategory((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="w-full bg-primary-600 text-white rounded-lg py-2 font-semibold hover:bg-primary-700 transition-colors"
                >
                  {editingCategoryId ? 'Save category' : 'Add category'}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategoryId(null)
                      setStructureCategory({ name: '', description: '' })
                    }}
                    className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg py-2 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel edit
                  </button>
                )}
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Add subcategory</h4>
                <div className="space-y-3">
                  <select
                    value={structureSubcategory.categoryId}
                    onChange={(e) => setStructureSubcategory((prev) => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    value={structureSubcategory.name}
                    onChange={(e) => setStructureSubcategory((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Cake Toppers"
                  />
                  <textarea
                    value={structureSubcategory.description}
                    onChange={(e) => setStructureSubcategory((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-16 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Description"
                  />
                  <button
                    type="button"
                    onClick={handleCreateSubcategory}
                    className="w-full bg-white border border-primary-600 text-primary-700 rounded-lg py-2 font-semibold hover:bg-primary-50 transition-colors"
                  >
                    {editingSubcategory ? 'Save subcategory' : 'Add subcategory'}
                  </button>
                  {editingSubcategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSubcategory(null)
                        setStructureSubcategory((prev) => ({ ...prev, name: '', description: '' }))
                      }}
                      className="w-full bg-white border border-gray-200 text-gray-700 rounded-lg py-2 font-semibold hover:bg-gray-50 transition-colors"
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Categories & subcategories</h3>
                <span className="text-xs text-gray-500">{categories.length} categories</span>
              </div>
              <div className="space-y-4 max-h-[520px] overflow-y-auto">
                {categories.map((cat) => (
                  <div key={cat.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                        <p className="text-xs text-gray-500">{cat.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!baseCategoryIds.has(cat.id) && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryId(cat.id)
                                setStructureCategory({ name: cat.name, description: cat.description || '' })
                              }}
                              className="text-xs text-blue-600 flex items-center space-x-1"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteCategory(cat.id)}
                              className="text-xs text-red-600 flex items-center space-x-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {cat.subcategories.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between text-xs bg-gray-50 rounded px-2 py-1">
                          <div>
                            <span className="font-semibold text-gray-900">{sub.name}</span>
                            <span className="text-gray-500 ml-2">{sub.description}</span>
                          </div>
                          {!baseCategoryIds.has(cat.id) && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSubcategory({ categoryId: cat.id, subcategoryId: sub.id })
                                  setStructureSubcategory({ categoryId: cat.id, name: sub.name, description: sub.description || '' })
                                }}
                                className="text-blue-600 flex items-center space-x-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSubcategory(cat.id, sub.id)}
                                className="text-red-600 flex items-center space-x-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {cat.subcategories.length === 0 && <p className="text-xs text-gray-500">No subcategories yet.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClipboardList className="w-5 h-5 mr-2 text-primary-600" />
                Orders & enquiries
              </h3>
              <span className="text-xs text-gray-500">{orders.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Order ID</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Product</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Channel</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-semibold text-gray-900">{order.id}</td>
                      <td className="py-2 pr-4 text-gray-700">{order.customer}</td>
                      <td className="py-2 pr-4 text-gray-700">{order.product}</td>
                      <td className="py-2 pr-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700">{order.status}</span>
                      </td>
                      <td className="py-2 pr-4 text-gray-700">{order.channel}</td>
                      <td className="py-2 pr-4 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'accounts' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                Accounts
              </h3>
              <span className="text-xs text-gray-500">{accounts.length} customers</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acct) => (
                <div key={acct.id} className="border border-gray-100 rounded-lg p-3">
                  <p className="text-sm font-semibold text-gray-900">{acct.name}</p>
                  <p className="text-xs text-gray-500">{acct.email}</p>
                  <p className="text-xs text-gray-500">{acct.phone}</p>
                  <p className="text-[10px] inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full">{acct.tier}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
