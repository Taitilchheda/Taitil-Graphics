'use client'

import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/ui/ProductCard'

type Topper = {
  id: string
  name: string
  image: string
  description: string
  category: string
  subcategory: string
}

const topperImages = [
  'https://images.unsplash.com/photo-1527515545081-5db817172677?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
]

const buildTopperList = (): Topper[] => {
  const baseNames = [
    'Glitter Gold Name Topper',
    'Foil Monogram Topper',
    'Layered Age Topper',
    'Birthday Script Topper',
    'Minimal Serif Topper',
  ]

  // Generate 10 items using rotating base names and images
  return Array.from({ length: 10 }).map((_, idx) => ({
    id: `paper-${idx + 1}`,
    name: `${baseNames[idx % baseNames.length]} #${idx + 1}`,
    image: topperImages[idx % topperImages.length],
    description: 'Ready-made layered cardstock topper with shimmer/foil finish. No customization.',
    category: 'cake-decorations',
    subcategory: 'premium-paper-cake-toppers',
  }))
}

const toppers = buildTopperList()

export default function PaperToppersPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-primary-700 font-semibold">Cake Decoration / Cake Toppers / Premium Paper Cake Toppers</p>
          <h1 className="text-3xl font-bold text-gray-900">Premium Paper Cake Toppers (10)</h1>
          <p className="text-gray-600">Ready-made glitter/foil cardstock toppers. Tap a card to view details and WhatsApp enquiry.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {toppers.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
