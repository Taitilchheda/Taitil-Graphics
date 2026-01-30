'use client'

import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type TopperType = 'paper' | 'acrylic'

interface Topper {
  id: string
  name: string
  type: TopperType
  image: string
  description: string
}

const paperImages = [
  'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
]

const acrylicImages = [
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
]

const buildTopperList = (count: number, base: string, type: TopperType, pool: string[]): Topper[] =>
  Array.from({ length: count }).map((_, idx) => ({
    id: `${type}-${idx + 1}`,
    name: `${base} #${idx + 1}`,
    type,
    image: pool[idx % pool.length],
    description: type === 'paper'
      ? 'Ready-made layered cardstock topper with shimmer/foil finish. No customization.'
      : 'Ready-made mirror/frosted acrylic topper. No customization.',
  }))

const toppers: Topper[] = [
  ...buildTopperList(10, 'Premium Paper Cake Topper', 'paper', paperImages),
  ...buildTopperList(10, 'Luxury Acrylic Cake Topper', 'acrylic', acrylicImages),
]

export default function CakeTopperDetailPage({ params }: { params: { id: string } }) {
  const topper = toppers.find((t) => t.id === params.id)
  if (!topper) return notFound()

  const handleWhatsApp = () => {
    const message = `Hi! I'm interested in: ${topper.name}\nType: ${topper.type} topper\nImage: ${topper.image}\nReady-made, no customization. Please confirm price and availability.`
    window.open(`https://wa.me/917666247666?text=${encodeURIComponent(message)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Link
          href={
            topper.type === 'paper'
              ? '/categories/cake-decorations/premium-paper-cake-toppers'
              : '/categories/cake-decorations/luxury-acrylic-cake-toppers'
          }
          className="inline-flex items-center text-primary-700 hover:text-primary-800 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to{' '}
          {topper.type === 'paper' ? 'Premium Paper Cake Toppers' : 'Luxury Acrylic Cake Toppers'}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <Image
              src={topper.image || '/logo.svg'}
              alt={topper.name}
              width={800}
              height={600}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-full object-contain bg-white"
            />
          </div>
          <div className="space-y-4">
            <p className="text-xs text-primary-700 font-semibold capitalize">{topper.type} topper</p>
            <h1 className="text-3xl font-bold text-gray-900">{topper.name}</h1>
            <p className="text-gray-700">{topper.description}</p>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700">
              Ready-made (no customization). Message us to confirm price/availability for this exact design.
            </div>
            <button
              onClick={handleWhatsApp}
              className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp enquiry
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
