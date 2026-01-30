'use client'

import { useEffect, useMemo, useState } from 'react'
import { Category } from '@/data/products'
import { Save, PlusCircle, ImagePlus, ArrowUp, XCircle, Sparkles } from 'lucide-react'

export type ListingFormState = {
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  images: string[]
  features: string
  priceCents: number
  listingPriceCents: number
  discountPercent: number
  sku: string
  stock: number
  reorderLevel: number
  lowStockThreshold: number
  type: 'PHYSICAL' | 'SERVICE'
  variantsJson: string
  variants?: any
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
  weightGrams: number
  lengthCm: number
  widthCm: number
  heightCm: number
  hsnCode: string
  fragile: boolean
}

type ListingFormProps = {
  mode: 'create' | 'edit'
  categories: Category[]
  initialState?: ListingFormState
  onSubmit: (data: ListingFormState) => void
  primaryLabel?: string
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=420&fit=crop'

export function ListingForm({ mode, categories, initialState, onSubmit, primaryLabel }: ListingFormProps) {
  const firstCategory = categories[0]
  const firstSub = firstCategory?.subcategories[0]

  const clampPercent = (value: number) => Math.min(90, Math.max(0, value))
  const computeDiscountPercent = (mrpCents: number, listingCents: number) => {
    if (mrpCents <= 0) return 0
    return clampPercent(Math.round((1 - listingCents / mrpCents) * 100))
  }
  const computeListingFromDiscount = (mrpCents: number, discountPercent: number) =>
    Math.max(0, mrpCents - Math.round(mrpCents * (discountPercent || 0) / 100))

  const initialListingCents =
    typeof initialState?.listingPriceCents === 'number'
      ? initialState.listingPriceCents
      : initialState?.priceCents
        ? computeListingFromDiscount(initialState.priceCents, initialState.discountPercent ?? 0)
        : 0

  const baseState: ListingFormState = {
    name: '',
    description: '',
    categoryId: firstCategory?.id || '',
    subcategoryId: firstSub?.id || '',
    images:
      (initialState?.images && initialState.images.length
        ? initialState.images
        : (initialState as any)?.image
          ? [(initialState as any).image]
          : undefined) || [DEFAULT_IMAGE],
    features: 'Premium finish,Fast delivery,Custom design',
    priceCents: initialState?.priceCents ?? 0,
    listingPriceCents: initialListingCents,
    discountPercent: initialState?.discountPercent ?? 0,
    sku: initialState?.sku ?? '',
    stock: initialState?.stock ?? 30,
    reorderLevel: initialState?.reorderLevel ?? 5,
    lowStockThreshold: initialState?.lowStockThreshold ?? initialState?.reorderLevel ?? 5,
    type: (initialState as any)?.type || (initialState?.categoryId === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE'),
    variantsJson: initialState?.variants ? JSON.stringify(initialState.variants, null, 2) : '',
    seoTitle: initialState?.seoTitle ?? '',
    seoDescription: initialState?.seoDescription ?? '',
    canonicalUrl: initialState?.canonicalUrl ?? '',
    weightGrams: (initialState as any)?.weightGrams ?? 300,
    lengthCm: (initialState as any)?.lengthCm ?? 15,
    widthCm: (initialState as any)?.widthCm ?? 15,
    heightCm: (initialState as any)?.heightCm ?? 5,
    hsnCode: (initialState as any)?.hsnCode ?? '',
    fragile: (initialState as any)?.fragile ?? false,
    ...initialState,
  }

  const [form, setForm] = useState<ListingFormState>(baseState)

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...initialState,
      categoryId: initialState?.categoryId || categories[0]?.id || '',
      subcategoryId: initialState?.subcategoryId || categories.find((c) => c.id === (initialState?.categoryId || categories[0]?.id))?.subcategories[0]?.id || '',
      images: initialState?.images && initialState.images.length > 0 ? initialState.images : prev.images,
      listingPriceCents:
        typeof initialState?.listingPriceCents === 'number'
          ? initialState.listingPriceCents
          : initialState?.priceCents
            ? computeListingFromDiscount(initialState.priceCents, initialState.discountPercent ?? 0)
            : prev.listingPriceCents,
    }))
  }, [initialState, categories])

  const subcategories = useMemo(() => {
    return categories.find((cat) => cat.id === form.categoryId)?.subcategories || []
  }, [categories, form.categoryId])

  const listingPriceCents = Math.max(0, form.listingPriceCents || 0)

  const updateMrpCents = (value: number) => {
    setForm((p) => {
      const mrpCents = Math.max(0, Math.round(value * 100))
      const listingCents = p.listingPriceCents > 0 ? Math.min(p.listingPriceCents, mrpCents) : mrpCents
      const discountPercent = computeDiscountPercent(mrpCents, listingCents)
      return { ...p, priceCents: mrpCents, listingPriceCents: listingCents, discountPercent }
    })
  }

  const updateListingPrice = (value: number) => {
    setForm((p) => {
      const listingCents = Math.max(0, Math.round(value * 100))
      const mrpCents = p.priceCents > 0 ? p.priceCents : listingCents
      const discountPercent = computeDiscountPercent(mrpCents, listingCents)
      return { ...p, priceCents: mrpCents, listingPriceCents: listingCents, discountPercent }
    })
  }

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const readers = Array.from(fileList).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
          reader.onerror = () => resolve('')
          reader.readAsDataURL(file)
        }),
    )
    Promise.all(readers).then((urls) => {
      const valid = urls.filter(Boolean)
      if (!valid.length) return
      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...valid],
      }))
    })
  }

  const moveImage = (index: number, direction: 'up' | 'down') => {
    setForm((prev) => {
      const images = [...prev.images]
      const newIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(images.length - 1, index + 1)
      const [removed] = images.splice(index, 1)
      images.splice(newIndex, 0, removed)
      return { ...prev, images }
    })
  }

  const removeImage = (index: number) => {
    setForm((prev) => {
      const images = prev.images.filter((_, i) => i !== index)
      return { ...prev, images: images.length ? images : [DEFAULT_IMAGE] }
    })
  }

  const generateDescription = () => {
    const catName = categories.find((c) => c.id === form.categoryId)?.name || 'product'
    const subName = categories
      .find((c) => c.id === form.categoryId)
      ?.subcategories.find((s) => s.id === form.subcategoryId)?.name
    const featureHint = form.features.split(',').map((f) => f.trim()).filter(Boolean).slice(0, 3).join(', ')
    const desc = `${form.name || 'This product'} is part of our ${subName || catName} lineup with ${featureHint || 'premium details'}. Crafted for quick turnaround and consistent quality.`
    setForm((prev) => ({ ...prev, description: desc }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.description.trim()) return
    let parsedVariants: any = null
    if (form.variantsJson?.trim()) {
      try {
        parsedVariants = JSON.parse(form.variantsJson)
      } catch {
        parsedVariants = null
      }
    }
    onSubmit({ ...form, variants: parsedVariants })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Name</label>
          <input
            className="input-field"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Product name"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Primary image URL</label>
          <input
            className="input-field"
            value={form.images[0] || ''}
            onChange={(e) => setForm((p) => ({ ...p, images: [e.target.value || DEFAULT_IMAGE, ...p.images.slice(1)] }))}
            placeholder="https://..."
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">Description</label>
          <textarea
            className="input-field"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={3}
            required
          />
          <button
            type="button"
            onClick={generateDescription}
            className="inline-flex items-center gap-2 text-sm text-primary-700 hover:text-primary-800"
          >
            <Sparkles className="w-4 h-4" /> Auto-generate from name & image
          </button>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">MRP (INR)</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={Math.round(form.priceCents / 100)}
            onChange={(e) => updateMrpCents(Number(e.target.value || 0))}
            placeholder="MRP in rupees"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Listing price (INR)</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={Math.round(listingPriceCents / 100)}
            onChange={(e) => updateListingPrice(Number(e.target.value || 0))}
            placeholder="Listing price"
          />
          <p className="text-xs text-gray-500">Discount: {form.discountPercent}%</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">SKU</label>
          <input
            className="input-field"
            value={form.sku}
            onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
            placeholder="SKU-001"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Stock on hand</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm((p) => ({ ...p, stock: Math.max(0, Number(e.target.value || 0)) }))}
            placeholder="30"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Reorder level</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.reorderLevel}
            onChange={(e) => setForm((p) => ({ ...p, reorderLevel: Math.max(0, Number(e.target.value || 0)) }))}
            placeholder="5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Low stock threshold</label>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.lowStockThreshold}
            onChange={(e) => setForm((p) => ({ ...p, lowStockThreshold: Math.max(0, Number(e.target.value || 0)) }))}
            placeholder="5"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Product type</label>
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as 'PHYSICAL' | 'SERVICE' }))}
          >
            <option value="PHYSICAL">Physical</option>
            <option value="SERVICE">Service</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Category</label>
          <select
            className="input-field"
            value={form.categoryId}
            onChange={(e) => {
              const newCat = e.target.value
              const firstSub = categories.find((c) => c.id === newCat)?.subcategories[0]?.id || ''
              setForm((p) => ({ ...p, categoryId: newCat, subcategoryId: firstSub }))
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700">Subcategory</label>
          <select
            className="input-field"
            value={form.subcategoryId}
            onChange={(e) => setForm((p) => ({ ...p, subcategoryId: e.target.value }))}
          >
            {subcategories.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">Images (drag/drop or upload)</label>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFiles(e.dataTransfer.files)
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-gray-600">Primary image is first. Drag files here or upload to add more.</p>
              <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm cursor-pointer bg-white hover:bg-gray-100">
                <ImagePlus className="w-4 h-4 text-primary-600" />
                <span>Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative border rounded-lg overflow-hidden bg-white">
                  <img src={img || '/logo.svg'} alt={`Image ${idx + 1}`} loading="lazy" className="h-32 w-full object-cover object-center" />
                  <div className="absolute top-1 left-1">
                    <span className="px-2 py-1 rounded-full text-[10px] bg-white/80 text-gray-700 border">
                      {idx === 0 ? 'Primary' : `Image ${idx + 1}`}
                    </span>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-end gap-2 p-2">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(idx, 'up')}
                        className="p-1 bg-white/90 rounded-full shadow hover:bg-white"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-gray-700" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="p-1 bg-white/90 rounded-full shadow hover:bg-white"
                      title="Remove"
                    >
                      <XCircle className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">SEO title</label>
          <input
            className="input-field"
            value={form.seoTitle}
            onChange={(e) => setForm((p) => ({ ...p, seoTitle: e.target.value }))}
            placeholder="Meta title"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">SEO description</label>
          <textarea
            className="input-field"
            rows={2}
            value={form.seoDescription}
            onChange={(e) => setForm((p) => ({ ...p, seoDescription: e.target.value }))}
            placeholder="Meta description"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">Canonical URL</label>
          <input
            className="input-field"
            value={form.canonicalUrl}
            onChange={(e) => setForm((p) => ({ ...p, canonicalUrl: e.target.value }))}
            placeholder="https://taitilgraphics.com/products/..."
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">Variants (JSON)</label>
          <textarea
            className="input-field"
            rows={3}
            value={form.variantsJson}
            onChange={(e) => setForm((p) => ({ ...p, variantsJson: e.target.value }))}
            placeholder='[{"name":"Size","options":["Small","Large"]}]'
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm text-gray-700">Features (comma separated)</label>
          <input
            className="input-field"
            value={form.features}
            onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
            placeholder="Premium finish,Fast delivery"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <p className="text-sm text-gray-700 font-medium">Shipping details</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Weight (grams)</label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={form.weightGrams}
                onChange={(e) => setForm((p) => ({ ...p, weightGrams: Math.max(1, Number(e.target.value || 0)) }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Length (cm)</label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={form.lengthCm}
                onChange={(e) => setForm((p) => ({ ...p, lengthCm: Math.max(1, Number(e.target.value || 0)) }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Width (cm)</label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={form.widthCm}
                onChange={(e) => setForm((p) => ({ ...p, widthCm: Math.max(1, Number(e.target.value || 0)) }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Height (cm)</label>
              <input
                className="input-field"
                type="number"
                min="1"
                value={form.heightCm}
                onChange={(e) => setForm((p) => ({ ...p, heightCm: Math.max(1, Number(e.target.value || 0)) }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-600">HSN code</label>
              <input
                className="input-field"
                value={form.hsnCode}
                onChange={(e) => setForm((p) => ({ ...p, hsnCode: e.target.value }))}
                placeholder="HSN"
              />
            </div>
            <div className="space-y-1 flex items-center gap-2">
              <input
                id="fragile"
                type="checkbox"
                checked={form.fragile}
                onChange={(e) => setForm((p) => ({ ...p, fragile: e.target.checked }))}
                className="h-4 w-4"
              />
              <label htmlFor="fragile" className="text-xs text-gray-600">Fragile item</label>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" className="btn-primary inline-flex items-center gap-2">
          {mode === 'edit' ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {primaryLabel || (mode === 'edit' ? 'Save changes' : 'Add product')}
        </button>
      </div>
    </form>
  )
}
