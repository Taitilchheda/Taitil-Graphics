'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { ListingForm, ListingFormState } from '@/components/admin/ListingForm'
import { ArrowLeft, CheckCircle, List } from 'lucide-react'

export default function NewListingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { categories, addProduct } = useCatalog()
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [formResetKey, setFormResetKey] = useState(0)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/auth/login')
    }
  }, [isLoading, user, router])

  const hasCategories = useMemo(() => categories.length > 0 && categories[0].subcategories.length > 0, [categories])

  const handleCreate = (data: ListingFormState) => {
    addProduct({
      name: data.name.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      image: data.images[0],
      images: data.images,
      features: data.features.split(',').map((f) => f.trim()).filter(Boolean),
      badges: ['New listing'],
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
    setSavedMessage('Saved. Add another or jump to listings.')
    setFormResetKey((prev) => prev + 1)
  }

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Link href="/admin" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to dashboard
            </Link>
            <p className="text-xs uppercase tracking-wide text-gray-500">Create</p>
            <h1 className="text-3xl font-bold text-gray-900">Add a new listing</h1>
            <p className="text-gray-600">Designed to be fast - fill the basics and save. Perfect for bulk uploads.</p>
          </div>
          <Link href="/admin/listings" className="inline-flex items-center gap-2 text-primary-700 text-sm hover:text-primary-800">
            <List className="w-4 h-4" />
            Manage listings
          </Link>
        </div>

        {savedMessage && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" /> {savedMessage}
          </div>
        )}

        {!hasCategories ? (
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 text-sm text-gray-600">
            Add a category and subcategory before creating products.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Step 1</p>
              <h2 className="text-xl font-semibold text-gray-900">Product basics</h2>
              <p className="text-gray-600 text-sm">Name, image, category, description, features - nothing else required.</p>
            </div>
            <ListingForm key={formResetKey} mode="create" categories={categories} onSubmit={handleCreate} primaryLabel="Save listing" />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
