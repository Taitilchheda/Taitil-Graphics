'use client'

import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/components/providers/CartProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { MessageCircle, ArrowLeft, Heart, ShoppingCart, Check, Star } from 'lucide-react'

export default function ProductPage() {
  const params = useParams()
  const { addToCart, toggleLike, isLiked } = useCart()
  const { user } = useAuth()
  const { getProductById, updateInventory, getProductsByCategory } = useCatalog()
  const { logEvent } = useAnalytics()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: "", phone: "", requirement: "", budgetRange: "", timeline: "" })
  const [leadSubmitting, setLeadSubmitting] = useState(false)
  const [leadMessage, setLeadMessage] = useState<string | null>(null)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', body: '' })
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewMessage, setReviewMessage] = useState<string | null>(null)
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'VERIFIED'>('ALL')
  const [reviewSort, setReviewSort] = useState<'RECENT' | 'TOP'>('RECENT')

  const productId = params.id as string
  const product = getProductById(productId)

  const inrSymbol = String.fromCharCode(8377)
  const relatedProducts = useMemo(() => {
    if (!product) return []
    return getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4)
  }, [product, getProductsByCategory])

  const videoUrl = (product as any)?.media?.videoUrl || (product as any)?.videoUrl

  const gallery = useMemo(() => {
    if (!product) return []
    if (product.images && product.images.length) return product.images
    return [product.image]
  }, [product])

  useEffect(() => {
    if (product) {
      logEvent({ type: 'view', productId, categoryId: product.category, subcategoryId: product.subcategory, label: 'product-page' })
    }
  }, [product, productId, logEvent])

  useEffect(() => {
    if (!product) return
    const load = async () => {
      try {
        const reviewsRes = await fetch(`/api/reviews?productId=${product.id}`)
        const reviewsPayload = await reviewsRes.json().catch(() => ({}))
        setReviews(reviewsPayload.reviews || [])
      } catch (err) {
        console.error(err)
      }
    }
    load()
  }, [product])

  const handleReviewSubmit = async () => {
    if (!product) return
    if (!user?.token) {
      setReviewMessage('Please sign in to leave a review.')
      return
    }
    if (!reviewForm.rating) {
      setReviewMessage('Please select a star rating.')
      return
    }
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          body: reviewForm.body,
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Unable to submit review')
      }
      setReviewMessage('Thanks! Your review is live.')
      setReviewForm({ rating: 5, title: '', body: '' })
    } catch (err: any) {
      setReviewMessage(err.message || 'Unable to submit review')
    }
  }

  const reviewStats = useMemo(() => {
    if (!reviews.length) return { avg: 0, count: 0 }
    const total = reviews.reduce((sum, review) => sum + (review.rating || 0), 0)
    const avg = Math.round((total / reviews.length) * 10) / 10
    return { avg, count: reviews.length }
  }, [reviews])

  const filteredReviews = useMemo(() => {
    let data = reviews
    if (reviewFilter === 'VERIFIED') {
      data = data.filter((review) => review.verified)
    }
    if (reviewSort === 'TOP') {
      data = [...data].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    return data
  }, [reviews, reviewFilter, reviewSort])

  const ratingBreakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0]
    for (const review of reviews) {
      const rating = Math.min(5, Math.max(1, review.rating || 0))
      if (rating) counts[rating - 1] += 1
    }
    const total = counts.reduce((sum, value) => sum + value, 0) || 1
    return counts.map((count, idx) => ({
      stars: idx + 1,
      count,
      percent: Math.round((count / total) * 100),
    })).reverse()
  }, [reviews])


  const variantEntries = useMemo(() => {
    const variants = (product as any)?.variants
    if (!variants || typeof variants !== 'object') return []
    return Object.entries(variants)
  }, [product])


  const mrpCents = product?.priceCents || 0
  const listingCents =
    product?.listingPriceCents && product.listingPriceCents > 0
      ? product.listingPriceCents
      : Math.max(0, mrpCents - Math.round(mrpCents * (product?.discountPercent || 0) / 100))
  const discountPercent =
    mrpCents > 0 && listingCents > 0
      ? Math.min(90, Math.max(0, Math.round((1 - listingCents / mrpCents) * 100)))
      : 0
  const productType = product?.type || (product?.category === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE')
  const isPhysical = productType === 'PHYSICAL'
  const isPriced = isPhysical && (listingCents > 0 || mrpCents > 0)
  const isOutOfStock = isPhysical && typeof product?.stock === "number" && product.stock <= 0
  const liked = product ? isLiked(product.id) : false

  const handleWhatsAppEnquiry = () => {
    if (!product) return

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://taitilgraphics.com'
    const productLink = `${origin}/products/${product.id}`
    const message =
      product.whatsappMessage ||
      `Hi! I need bulk quantity of: ${product.name}\n` +
      `Type: ${product.subcategory || product.category}\n` +
      `Product: ${productLink}\n` +
      `Please share bulk pricing and MOQ.`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', productId: product.id, categoryId: product.category, label: 'product-whatsapp' })
  }

  const handleBuyNow = () => {
    if (!product || !isPriced || isOutOfStock) return

    const productForCart = {
      id: product.id,
      name: product.name,
      image: gallery[selectedIndex] || product.image,
      category: product.category,
      description: product.description,
      priceCents: mrpCents,
      listingPriceCents: listingCents,
      discountPercent,
      customizations: selectedVariants,
    }

    addToCart(productForCart, 1)
    updateInventory(product.id, -1)
    logEvent({ type: 'cart', productId: product.id, categoryId: product.category, subcategoryId: product.subcategory, quantity: 1, label: 'product-buy-now' })
    window.location.href = '/checkout'
  }

  const handleAddToCart = () => {
    if (!product || !isPriced || isOutOfStock) return

    const productForCart = {
      id: product.id,
      name: product.name,
      image: gallery[selectedIndex] || product.image,
      category: product.category,
      description: product.description,
      priceCents: mrpCents,
      listingPriceCents: listingCents,
      discountPercent: discountPercent,
      customizations: selectedVariants,
    }

    addToCart(productForCart, 1)
    updateInventory(product.id, -1)
    logEvent({ type: 'cart', productId: product.id, categoryId: product.category, subcategoryId: product.subcategory, quantity: 1, label: 'product-add-to-cart' })
    logEvent({ type: 'sale', productId: product.id, categoryId: product.category, subcategoryId: product.subcategory, quantity: 1, label: 'product-sale-intent' })
  }

  const handleLeadSubmit = async () => {
    if (!product) return
    if (!leadForm.name || !leadForm.phone) {
      setLeadMessage('Please provide your name and phone to continue.')
      return
    }
    setLeadSubmitting(true)
    setLeadMessage(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name: leadForm.name,
          phone: leadForm.phone,
          requirement: leadForm.requirement,
          budgetRange: leadForm.budgetRange,
          timeline: leadForm.timeline,
          source: 'service-pdp',
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        throw new Error(payload.error || 'Unable to submit request.')
      }
      const payload = await res.json()
      const leadId = payload.leadId
      logEvent({ type: 'inquiry', productId: product.id, categoryId: product.category, label: 'service-lead' })
      const message = `Hi! Lead ID: ${leadId}
Service: ${product.name}
Requirement: ${leadForm.requirement || '-'}
Budget: ${leadForm.budgetRange || '-'}
Timeline: ${leadForm.timeline || '-'}
Contact: ${leadForm.name} (${leadForm.phone})`
      const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
      logEvent({ type: 'inquiry', productId: product.id, categoryId: product.category, label: 'service-whatsapp' })
      setLeadMessage('Thanks! Your request was submitted. We will contact you soon.')
    } catch (err: any) {
      setLeadMessage(err.message || 'Unable to submit request.')
    } finally {
      setLeadSubmitting(false)
    }
  }

  const handleToggleLike = () => {
    if (!product) return

    const productForLike = {
      id: product.id,
      name: product.name,
      image: gallery[selectedIndex] || product.image,
      category: product.category,
      description: product.description,
      priceCents: mrpCents,
      listingPriceCents: listingCents,
      discountPercent: discountPercent,
      customizations: selectedVariants,
    }

    toggleLike(productForLike)
    logEvent({ type: 'click', productId: product.id, label: 'product-like' })
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/categories/all"
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse All Products
            </Link>
          </div>        </div>

        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href={`/categories/${product.category}`} className="text-gray-500 hover:text-primary-600">{product.category}</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{product.name}</li>
          </ol>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href={`/categories/${product.category}`}
            className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {product.category}</span>
          </Link>
        </div>

        {/* Product Details - Vistaprint Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Side - Product Images */}
          <div className="space-y-4">
            {videoUrl ? (
              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <video controls className="w-full rounded-lg">
                  <source src={videoUrl} />
                </video>
              </div>
            ) : null}
            <div
              className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 group cursor-zoom-in relative"
              onClick={() => setShowLightbox(true)}
            >
              <Image
                src={gallery[selectedIndex] || "/logo.svg"}
                alt={product.name}
                width={800}
                height={800}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="w-full h-full object-contain bg-white transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute bottom-2 right-2 text-xs bg-white/80 text-gray-700 px-2 py-1 rounded">Click to zoom</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {gallery.map((img, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className={`aspect-square rounded border overflow-hidden ${selectedIndex === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200 hover:border-primary-300'} transition`}
                  title={`View image ${idx + 1}`}
                >
                  <Image
                    src={img || "/logo.svg"}
                    alt={`${product.name} view ${idx + 1}`}
                    width={200}
                    height={200}
                    sizes="(min-width: 1024px) 12vw, 20vw"
                    className="w-full h-full object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= Math.round(reviewStats.avg) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span>{reviewStats.avg.toFixed(1)}</span>
                    <span className="text-gray-400">|</span>
                    <span>{reviewStats.count} reviews</span>
                  </div>
                  {product.subcategory ? (
                    <p className="mt-1 text-sm text-gray-500">{product.subcategory}</p>
                  ) : null}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPhysical ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {isPhysical ? (isOutOfStock ? 'Out of stock' : 'In stock') : 'Service'}
                </span>
              </div>

              {isPriced ? (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm text-gray-400 line-through">{inrSymbol}{Math.round(mrpCents / 100).toLocaleString('en-IN')}</span>
                    <span className="text-2xl font-semibold text-gray-900">{inrSymbol}{Math.round(listingCents / 100).toLocaleString('en-IN')}</span>
                    {discountPercent > 0 ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">{discountPercent}% off</span>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Contact us for a custom quote and turnaround.
                </div>
              )}

              {variantEntries.length ? (
                <div className="space-y-3">
                  {variantEntries.map(([label, options]) => (
                    <div key={label}>
                      <p className="text-sm font-semibold text-gray-900">{label}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {Array.isArray(options) ? options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setSelectedVariants((prev) => ({ ...prev, [label]: option }))}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${selectedVariants[label] === option ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'}`}
                          >
                            {option}
                          </button>
                        )) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {isPhysical ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 rounded-lg bg-orange-400 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-500"
                  >
                    Buy now
                  </button>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:border-primary-300"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to cart
                  </button>
                  <button
                    onClick={handleWhatsAppEnquiry}
                    className="flex items-center justify-center gap-2 rounded-lg border border-primary-400 bg-primary-500 px-4 py-3 text-sm font-semibold text-primary-100 hover:bg-primary-800"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp (Bulk orders)
                  </button>
                  <button
                    onClick={handleToggleLike}
                    className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold ${liked ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-700'}`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                    {liked ? 'Liked' : 'Like'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-2">
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Your name"
                      value={leadForm.name}
                      onChange={(e) => setLeadForm((prev) => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Phone number"
                      value={leadForm.phone}
                      onChange={(e) => setLeadForm((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    <textarea
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Tell us what you need"
                      value={leadForm.requirement}
                      onChange={(e) => setLeadForm((prev) => ({ ...prev, requirement: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={handleLeadSubmit}
                    disabled={leadSubmitting}
                    className="rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    {leadSubmitting ? 'Submitting...' : 'Request quote on WhatsApp'}
                  </button>
                  {leadMessage ? <p className="text-xs text-gray-600">{leadMessage}</p> : null}
                </div>
              )}
            </div>

            {product.features?.length ? (
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">Highlights</h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-600">
                  {product.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary-600 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600 mb-3">
                Our design experts are here to help you create the perfect product for your needs.
              </p>
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-primary-600" />
                  <span>WhatsApp: +91 7666247666</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-primary-600">Email:</span>
                  <span>taitilgraphics@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Customer reviews</h3>
                <p className="text-sm text-gray-500">See what buyers are saying about this product.</p>
              </div>
              <div className="text-sm text-gray-600">{reviewStats.count} reviews</div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setReviewFilter('ALL')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${reviewFilter === 'ALL' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  All reviews
                </button>
                <button
                  type="button"
                  onClick={() => setReviewFilter('VERIFIED')}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${reviewFilter === 'VERIFIED' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  Verified only
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>Sort by</span>
                <select
                  value={reviewSort}
                  onChange={(e) => setReviewSort(e.target.value as 'RECENT' | 'TOP')}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs"
                >
                  <option value="RECENT">Most recent</option>
                  <option value="TOP">Top rated</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_2.1fr]">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Average rating</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-3xl font-bold text-gray-900">{reviewStats.avg.toFixed(1)}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= Math.round(reviewStats.avg) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Based on verified customer ratings.</p>

                <div className="mt-4 space-y-2">
                  {ratingBreakdown.map((row) => (
                    <div key={row.stars} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className="w-8 text-gray-500">{row.stars}?</span>
                      <div className="h-2 flex-1 rounded-full bg-white border border-gray-200 overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${row.percent}%` }} />
                      </div>
                      <span className="w-10 text-right">{row.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900">Write a review</h4>
                  <div className="grid gap-3 mt-3">
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onFocus={() => setHoverRating(star)}
                          onBlur={() => setHoverRating(0)}
                          onClick={() => setReviewForm((prev) => ({ ...prev, rating: star }))}
                          className="transition"
                          aria-label={`Rate ${star} stars`}
                        >
                          <Star className={`w-5 h-5 ${star <= (hoverRating || reviewForm.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                        </button>
                      ))}
                      <span className="text-xs text-gray-500">{(hoverRating || reviewForm.rating) || 0}/5</span>
                    </div>
                    <input
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      placeholder="Title"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                    />
                    <textarea
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      rows={3}
                      placeholder="Share your experience"
                      value={reviewForm.body}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, body: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={handleReviewSubmit}
                      className="rounded-lg bg-primary-600 text-white px-4 py-2 text-sm font-semibold"
                    >
                      Submit review
                    </button>
                    {reviewMessage ? <p className="text-xs text-gray-600">{reviewMessage}</p> : null}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredReviews.length === 0 ? (
                    <p className="text-sm text-gray-500">No reviews yet.</p>
                  ) : (
                    filteredReviews.map((review) => (
                      <div key={review.id} className="rounded-lg border border-gray-100 bg-white p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900">{review.user?.name || 'Customer'}</p>
                          <span className="text-xs text-emerald-600">{review.verified ? 'Verified purchase' : 'Verified'}</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'}`} />
                          ))}
                          <span className="text-xs text-gray-500">{review.rating}/5</span>
                        </div>
                        {review.title ? <p className="text-sm font-semibold text-gray-900 mt-2">{review.title}</p> : null}
                        {review.body ? <p className="text-sm text-gray-600 mt-1">{review.body}</p> : null}
                        {review.response ? (
                          <div className="mt-3 rounded-xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-4 text-sm text-gray-700 shadow-sm">
                            <div className="flex items-center justify-between">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary-600">Response from Taitil Graphics</p>
                              <span className="rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold text-primary-700">Official</span>
                            </div>
                            <p className="mt-2 text-sm leading-relaxed text-gray-700">{review.response}</p>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {relatedProducts.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">You may also like</h2>
            <div className="flex gap-4 overflow-x-auto pb-3">
              {relatedProducts.map((item) => (
                <Link key={item.id} href={`/products/${item.id}`} className="min-w-[220px] sm:min-w-[240px] rounded-xl border border-gray-100 bg-white p-3 shadow-sm hover:shadow-md transition">
                  <div className="relative h-40 rounded-lg overflow-hidden bg-gray-50">
                    <Image src={item.image || '/logo.svg'} alt={item.name} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-contain" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-900 line-clamp-2">{item.name}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

      </main>

      {showLightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <div className="max-w-5xl w-full flex flex-col gap-3">
            <div className="flex justify-between items-center text-white text-sm">
              <span>{product.name}</span>
              <span className="opacity-80">Click anywhere to close</span>
            </div>
            <div className="relative bg-white rounded-lg overflow-hidden">
              <Image
                src={gallery[selectedIndex] || "/logo.svg"}
                alt={product.name}
                width={1600}
                height={1200}
                sizes="(min-width: 1024px) 80vw, 100vw"
                className="w-full h-full object-contain max-h-[80vh] bg-black"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(idx)
                  }}
                  className={`h-16 w-16 rounded border overflow-hidden flex-shrink-0 ${selectedIndex === idx ? 'border-primary-500 ring-2 ring-primary-200' : 'border-gray-200'}`}
                >
                  <Image
                    src={img || "/logo.svg"}
                    alt={`thumb ${idx + 1}`}
                    width={200}
                    height={200}
                    sizes="80px"
                    className="h-full w-full object-contain bg-white"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}


      {isPhysical ? (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-xs text-gray-500">Price</p>
              <p className="text-lg font-semibold text-gray-900">{inrSymbol}{Math.round(listingCents / 100).toLocaleString('en-IN')}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-900"
              >
                Add to cart
              </button>
              <button
                onClick={handleBuyNow}
                className="rounded-lg bg-orange-300 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-100"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <Footer />
    </div>
  )
}
