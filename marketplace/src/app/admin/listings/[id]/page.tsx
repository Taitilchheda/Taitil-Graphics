'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { ListingForm, ListingFormState } from '@/components/admin/ListingForm'
import { ArrowLeft, CheckCircle, Trash2, Eye, MousePointerClick } from 'lucide-react'

export default function EditListingPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string

  const { user, isLoading } = useAuth()
  const { categories, getProductById, updateProduct, deleteProduct } = useCatalog()
  const { summary } = useAnalytics()
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  const product = useMemo(() => getProductById(productId), [getProductById, productId])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <p className="text-center text-gray-600">Redirecting to login...</p>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
          <Link href="/admin/listings" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to listings
          </Link>
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-sm text-gray-700">
            Listing not found.
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const initialState: ListingFormState = {
    name: product.name,
    description: product.description,
    categoryId: product.category,
    subcategoryId: product.subcategory,
    images: product.images && product.images.length ? product.images : [product.image],
    features: product.features.join(', '),
    priceCents: product.priceCents || 0,
    listingPriceCents: (product.listingPriceCents ?? product.salePriceCents ?? product.priceCents) || 0,
    discountPercent: product.discountPercent || 0,
    sku: product.sku || '',
    stock: product.stock ?? 0,
    reorderLevel: product.reorderLevel ?? 5,
    lowStockThreshold: product.lowStockThreshold ?? product.reorderLevel ?? 5,
    type: product.type || (product.category === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
    variantsJson: product.variants ? JSON.stringify(product.variants, null, 2) : '',
    variants: product.variants ?? null,
    seoTitle: product.seoTitle ?? '',
    seoDescription: product.seoDescription ?? '',
    canonicalUrl: product.canonicalUrl ?? '',
    weightGrams: product.weightGrams ?? 300,
    lengthCm: product.lengthCm ?? 15,
    widthCm: product.widthCm ?? 15,
    heightCm: product.heightCm ?? 5,
    hsnCode: product.hsnCode ?? '',
    fragile: product.fragile ?? false,
  }

  const handleUpdate = (data: ListingFormState) => {
    updateProduct(product.id, {
      name: data.name.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      image: data.images[0],
      images: data.images,
      features: data.features.split(',').map((f) => f.trim()).filter(Boolean),
      badges: product.badges || ['Updated listing'],
      priceCents: data.priceCents,
      listingPriceCents: data.listingPriceCents,
      discountPercent: data.discountPercent,
      sku: data.sku || undefined,
      stock: data.stock,
      reorderLevel: data.reorderLevel,
      lowStockThreshold: data.lowStockThreshold,
      type: data.type,
      variants: data.variants,
      media: null,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      canonicalUrl: data.canonicalUrl,
      weightGrams: data.weightGrams,
      lengthCm: data.lengthCm,
      widthCm: data.widthCm,
      heightCm: data.heightCm,
      hsnCode: data.hsnCode,
      fragile: data.fragile,
    })
    setStatus('Changes saved.')
  }

  const views = summary.productCounts.views[product.id] || 0
  const clicks = summary.productCounts.clicks[product.id] || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Link href="/admin/listings" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to listings
            </Link>
            <p className="text-xs uppercase tracking-wide text-gray-500">Edit</p>
            <h1 className="text-3xl font-bold text-gray-900">Edit listing</h1>
            <p className="text-gray-600">Focused edit screen with engagement stats alongside the form.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Delete this listing?')) {
                deleteProduct(product.id)
                router.push('/admin/listings')
              }
            }}
            className="inline-flex items-center gap-2 text-red-600 text-sm border border-red-200 rounded-lg px-3 py-2 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>

        {status && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" /> {status}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Details</p>
              <h2 className="text-xl font-semibold text-gray-900">Update listing</h2>
              <p className="text-gray-600 text-sm">Changes save to this listing only.</p>
            </div>
            <ListingForm
              mode="edit"
              categories={categories}
              initialState={initialState}
              onSubmit={handleUpdate}
              primaryLabel="Save changes"
            />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
            <p className="text-xs uppercase tracking-wide text-gray-500">Engagement</p>
            <div className="flex items-center justify-between text-sm text-gray-800">
              <span className="inline-flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary-700" /> Seen
              </span>
              <span className="font-semibold">{views}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-800">
              <span className="inline-flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-primary-700" /> Clicked
              </span>
              <span className="font-semibold">{clicks}</span>
            </div>
            <div className="text-xs text-gray-500">
              Product ID: <span className="font-mono text-gray-700">{product.id}</span>
            </div>
            <div className="text-xs text-gray-500">
              Category: <span className="capitalize text-gray-700">{product.category}</span>
            </div>
            <div className="text-xs text-gray-500">
              Subcategory: <span className="capitalize text-gray-700">{product.subcategory}</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
