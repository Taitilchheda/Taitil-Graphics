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

  const baseState: ListingFormState = {
    name: '',
    description: '',
    categoryId: firstCategory?.id || '',
    subcategoryId: firstSub?.id || '',
    images:
      (initialState?.images && initialState.images.length
        ? initialState.images
        : initialState?.image
          ? [initialState.image]
          : undefined) || [DEFAULT_IMAGE],
    features: 'Premium finish,Fast delivery,Custom design',
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
    }))
  }, [initialState, categories])

  const subcategories = useMemo(() => {
    return categories.find((cat) => cat.id === form.categoryId)?.subcategories || []
  }, [categories, form.categoryId])

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const readers = Array.from(fileList).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
          reader.onerror = () => resolve('')
          reader.readAsDataURL(file)
        })
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
    onSubmit(form)
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
                  <img src={img} alt={`Image ${idx + 1}`} className="h-32 w-full object-cover" />
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
          <label className="text-sm text-gray-700">Features (comma separated)</label>
          <input
            className="input-field"
            value={form.features}
            onChange={(e) => setForm((p) => ({ ...p, features: e.target.value }))}
            placeholder="Premium finish,Fast delivery"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="btn-primary inline-flex items-center gap-2"
        >
          {mode === 'edit' ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
          {primaryLabel || (mode === 'edit' ? 'Save changes' : 'Add product')}
        </button>
      </div>
    </form>
  )
}
