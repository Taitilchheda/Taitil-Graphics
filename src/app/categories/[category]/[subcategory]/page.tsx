'use client'

import { useParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'
import ProductCard from '@/components/ui/ProductCard'
import { ArrowLeft, MessageCircle } from 'lucide-react'

export default function SubcategoryPage() {
  const params = useParams()
  const { categories } = useCatalog()
  const { logEvent } = useAnalytics()
  
  const categoryId = params.category as string
  const subcategoryId = params.subcategory as string
  
  const category = categories.find(cat => cat.id === categoryId)
  const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId)

  useEffect(() => {
    if (category && subcategory) {
      logEvent({ type: 'view', categoryId, subcategoryId, label: 'subcategory-page' })
    }
  }, [category, subcategory, categoryId, subcategoryId, logEvent])

  const handleWhatsAppContact = () => {
    const message = `Hi! I'm interested in ${subcategory?.name || 'these'} products. Could you please provide more information?`
    const whatsappUrl = `https://wa.me/917666247666?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
    logEvent({ type: 'inquiry', categoryId, subcategoryId, label: 'subcategory-contact' })
  }

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
            <p className="text-gray-600 mb-8">The category you&apos;re looking for doesn&apos;t exist.</p>
            <Link
              href="/categories/all"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse All Categories
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-primary-600">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/categories/all" className="text-gray-500 hover:text-primary-600">Categories</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href={`/categories/${category.id}`} className="text-gray-500 hover:text-primary-600">{category.name}</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{subcategory.name}</li>
          </ol>
        </nav>

        {/* Back Button */}
        <Link
          href={`/categories/${category.id}`}
          className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {category.name}</span>
        </Link>

        {/* Subcategory Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{subcategory.name}</h1>
          <p className="text-lg text-gray-600 mb-6">{subcategory.description}</p>
          
          <div className="flex flex-wrap gap-4">
            <div className="bg-green-50 px-4 py-2 rounded-lg">
              <span className="text-green-700 font-medium">✓ Premium Quality</span>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-blue-700 font-medium">✓ Fast Delivery</span>
            </div>
            <div className="bg-purple-50 px-4 py-2 rounded-lg">
              <span className="text-purple-700 font-medium">✓ Custom Design</span>
            </div>
            <div className="bg-orange-50 px-4 py-2 rounded-lg">
              <span className="text-orange-700 font-medium">✓ Bulk Discounts</span>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Products</h2>
          <p className="text-gray-600">
            Choose from our {subcategory.products.length} product{subcategory.products.length === 1 ? '' : 's'} in this category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {subcategory.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-primary-500 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Need Custom Design?</h3>
          <p className="text-lg mb-6 opacity-90">
            Our design experts can help you create the perfect {subcategory.name.toLowerCase()} for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleWhatsAppContact}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp Us
            </button>
            <button 
              onClick={() => window.open('tel:+917666247666', '_self')}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-colors"
            >
              Call 7666247666
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

const paperImages = [
  'https://images.unsplash.com/photo-1527515545081-5db817172677-w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6-w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab-w=800&h=600&fit=crop',
]

const acrylicImages = [
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d-w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef-w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee-w=800&h=600&fit=crop',
]

const buildTopperList = (count: number, base: string, type: 'paper' | 'acrylic', pool: string[]) =>
  Array.from({ length: count }).map((_, idx) => ({
    id: `${type}-${idx + 1}`,
    name: `${base} #${idx + 1}`,
    type,
    image: pool[idx % pool.length],
    description: type === 'paper'
      ? 'Ready-made layered cardstock topper with shimmer/foil finish. No customization.'
      : 'Ready-made mirror/frosted acrylic topper. No customization.',
  }))

function CakeToppersView() {
  const paper = useMemo(() => buildTopperList(10, 'Premium Paper Cake Topper', 'paper', paperImages), [])
  const acrylic = useMemo(() => buildTopperList(10, 'Luxury Acrylic Cake Topper', 'acrylic', acrylicImages), [])

  const cards = [...paper, ...acrylic]

  return (
    <>
      <div className="mb-6">
        <nav className="mb-4 text-sm text-gray-500">
          <Link href="/" className="hover:text-primary-600">Home</Link> /
          <Link href="/categories/cake-decorations" className="ml-1 hover:text-primary-600"> Cake Decoration</Link> /
          <span className="ml-1 text-gray-900">Cake Toppers</span>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cake Toppers (Paper & Acrylic)</h1>
        <p className="text-gray-600">Curated ready-made toppers. Select a design and send a WhatsApp enquiry—no customization.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((item) => (
          <Link
            key={item.id}
            href={`/products/cake-topper/${item.id}`}
            className="border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden bg-white"
          >
            <Image
              src={item.image || '/logo.svg'}
              alt={item.name}
              width={400}
              height={260}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="w-full h-44 object-contain bg-white"
            />
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-primary-700">
                <span className="capitalize">{item.type} topper</span>
                <span className="text-gray-500">Ready-made</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
