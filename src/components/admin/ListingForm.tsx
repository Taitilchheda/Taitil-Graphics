'use client'

import { useEffect, useMemo, useState } from 'react'
import { Category } from '@/data/products'
import { Save, PlusCircle } from 'lucide-react'

export type ListingFormState = {
  name: string
  description: string
  categoryId: string
  subcategoryId: string
  image: string
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
    image: DEFAULT_IMAGE,
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
    }))
  }, [initialState, categories])

  const subcategories = useMemo(() => {
    return categories.find((cat) => cat.id === form.categoryId)?.subcategories || []
  }, [categories, form.categoryId])

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
          <label className="text-sm text-gray-700">Image URL</label>
          <input
            className="input-field"
            value={form.image}
            onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
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
