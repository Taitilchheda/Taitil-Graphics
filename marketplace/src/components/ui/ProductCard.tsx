'use client'

import { useCart } from '@/components/providers/CartProvider'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { Heart, ShoppingCart, Star, ArrowRight, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  image: string
  images?: string[]
  category: string
  description: string
  price?: string
  priceCents?: number
  listingPriceCents?: number
  discountPercent?: number
  rating?: number
  stock?: number
  reviews?: number
  isPopular?: boolean
  isBestSeller?: boolean
  isHotSeller?: boolean
  isRecommended?: boolean
  isNew?: boolean
  badges?: string[]
  features?: string[]
  type?: "PHYSICAL" | "SERVICE"
  variants?: any
  media?: any
}

interface ProductCardProps {
  product: Product
  showQuickAdd?: boolean
  showBuyNow?: boolean
  className?: string
}


const inrSymbol = String.fromCharCode(8377)

const formatInr = (cents: number) => `${inrSymbol}${Math.round(cents / 100).toLocaleString('en-IN')}`

export default function ProductCard({ product, showQuickAdd = true, showBuyNow = true, className = '' }: ProductCardProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const router = useRouter()
  const { addToCart, toggleLike, isLiked } = useCart()
  const { logEvent } = useAnalytics()
  const { updateInventory } = useCatalog()

  const mrpCents = product.priceCents || 0
  const listingCents =
    product.listingPriceCents && product.listingPriceCents > 0
      ? product.listingPriceCents
      : Math.max(0, mrpCents - Math.round(mrpCents * (product.discountPercent || 0) / 100))
  const discountPercent =
    mrpCents > 0 && listingCents > 0
      ? Math.min(90, Math.max(0, Math.round((1 - listingCents / mrpCents) * 100)))
      : 0
  const isPhysical = (product.type || (product.category === 'cake-decorations' ? 'PHYSICAL' : 'SERVICE')) === 'PHYSICAL'
  const showPricing = isPhysical && (listingCents > 0 || mrpCents > 0)
  const isOutOfStock = isPhysical && typeof product.stock === "number" && product.stock <= 0

  const handleBuyNow = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      toast.error('Out of stock')
      return
    }
    e.preventDefault()
    e.stopPropagation()
    if (!showPricing) {
      toast.error('This service is available via WhatsApp only.')
      return
    }
    addToCart(product)
    updateInventory(product.id, -1)
    logEvent({ type: 'cart', productId: product.id, categoryId: product.category, label: 'card-buy-now' })
    router.push('/checkout')
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    if (isOutOfStock) {
      toast.error('Out of stock')
      return
    }
    e.preventDefault()
    e.stopPropagation()
    if (!showPricing) {
      toast.error('This service is available via WhatsApp only.')
      return
    }
    addToCart(product)
    updateInventory(product.id, -1)
    logEvent({ type: 'cart', productId: product.id, categoryId: product.category, label: 'card-add' })
    toast.success(`${product.name} added to cart!`)
  }

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleLike(product)
    logEvent({ type: 'click', productId: product.id, label: 'card-like' })
    if (isLiked(product.id)) {
      toast.success('Removed from liked products')
    } else {
      toast.success('Added to liked products')
    }
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const message = `Hi! I'm interested in bulk ordering ${product.name}. Please share pricing and MOQ.`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', productId: product.id, categoryId: product.category, label: 'card-whatsapp' })
  }

  const primaryImage = product.images && product.images.length ? product.images[0] : product.image || '/logo.svg'

  return (
    <div
      className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col ${className}`}
    >
      <div className="relative overflow-hidden">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block w-full"
          aria-label="Zoom image"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            width={400}
            height={250}
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="w-full h-48 object-contain bg-white transition-transform duration-300 hover:scale-105"
          />
        </button>

        <button
          onClick={handleToggleLike}
          className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
            isLiked(product.id)
              ? 'bg-pink-500 text-white'
              : 'bg-white text-gray-600 hover:bg-pink-50 hover:text-pink-500'
          }`}
        >
          <Heart className={`w-5 h-5 ${isLiked(product.id) ? 'fill-current' : ''}`} />
        </button>
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b px-4 py-2 text-sm">
              <span className="font-medium">{product.name}</span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <div className="h-[80vh] overflow-auto p-4">
              <img
                src={primaryImage}
                alt={product.name}
                className="mx-auto max-h-none w-auto max-w-none"
              />
            </div>
            <div className="border-t px-4 py-2 text-xs text-gray-500">Scroll to pan. Use Ctrl + mouse wheel to zoom.</div>
          </div>
        </div>
      )}

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-teal-600 font-medium">{product.category}</span>
          {product.rating && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600">{product.rating}</span>
              {product.reviews && (
                <span className="text-sm text-gray-400">({product.reviews})</span>
              )}
            </div>
          )}
        </div>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-start justify-between text-sm text-gray-700 mb-4">
          {showPricing ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-0.5">MRP</span>
                <span className="line-through">{formatInr(mrpCents)}</span>
                {discountPercent > 0 ? (
                  <span className="rounded-full bg-primary-50 px-2 py-0.5 text-primary-700">{discountPercent}% off</span>
                ) : null}
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-gray-900">{formatInr(listingCents)}</span>
                <span className="text-xs text-gray-500">per item</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <span className="font-semibold text-gray-900">Request quote</span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">{product.description}</p>

        <div className="space-y-2">
          {showPricing ? (
            <>
              {showBuyNow ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="border border-primary-200 text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-lg font-medium transition-colors"
                  >
                    Buy Now
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-primary-500 hover:bg-primary-600 text-white px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              )}
              {showQuickAdd ? (
                <button
                  onClick={handleWhatsApp}
                  className="w-full border border-primary-200 text-primary-700 hover:bg-primary-50 px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp (Bulk Orders)</span>
                </button>
              ) : null}
            </>
          ) : (
            <button
              onClick={handleWhatsApp}
              className="w-full border border-primary-200 text-primary-700 hover:bg-primary-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Request quote</span>
            </button>
          )}
          <Link
            href={`/products/${product.id}`}
            className="w-full px-4 py-2 border border-gray-300 hover:border-primary-500 text-gray-700 hover:text-primary-600 rounded-lg transition-colors flex items-center justify-center"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
