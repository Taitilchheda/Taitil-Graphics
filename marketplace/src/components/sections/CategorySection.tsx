'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  Briefcase, 
  Package, 
  Palette, 
  Mail, 
  Gift, 
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface SubCategory {
  name: string
  href: string
  description: string
}

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  href: string
  subCategories: SubCategory[]
}

const categories: Category[] = [
  {
    id: 'business-essentials',
    name: 'Business Essentials',
    icon: <Briefcase className="w-8 h-8" />,
    description: 'Everything you need to run your business professionally',
    href: '/categories/business-essentials',
    subCategories: [
      { name: 'Business Cards', href: '/products/business-cards', description: 'Professional business cards' },
      { name: 'Letterheads', href: '/products/letterheads', description: 'Custom letterhead designs' },
      { name: 'Envelopes', href: '/products/envelopes', description: 'Branded envelope printing' },
      { name: 'Stamps & Seals', href: '/products/stamps', description: 'Official business stamps' },
    ]
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    icon: <Package className="w-8 h-8" />,
    description: 'Quality office supplies for your workplace',
    href: '/categories/office-supplies',
    subCategories: [
      { name: 'Stationery', href: '/products/stationery', description: 'Pens, pencils, notebooks' },
      { name: 'Filing Solutions', href: '/products/filing', description: 'Folders, binders, organizers' },
      { name: 'Desk Accessories', href: '/products/desk-accessories', description: 'Desk organizers, calendars' },
      { name: 'Printing Paper', href: '/products/paper', description: 'Various paper types and sizes' },
    ]
  },
  {
    id: 'design-logos',
    name: 'Design & Logos',
    icon: <Palette className="w-8 h-8" />,
    description: 'Creative design services for your brand',
    href: '/categories/design-logos',
    subCategories: [
      { name: 'Logo Design', href: '/products/logo-design', description: 'Custom logo creation' },
      { name: 'Brand Identity', href: '/products/brand-identity', description: 'Complete brand packages' },
      { name: 'Marketing Materials', href: '/products/marketing', description: 'Flyers, brochures, banners' },
      { name: 'Digital Graphics', href: '/products/digital-graphics', description: 'Social media graphics' },
    ]
  },
  {
    id: 'invitations',
    name: 'Invitations & Announcements',
    icon: <Mail className="w-8 h-8" />,
    description: 'Beautiful invitations for every occasion',
    href: '/categories/invitations',
    subCategories: [
      { name: 'Wedding Invitations', href: '/products/wedding-invitations', description: 'Elegant wedding cards' },
      { name: 'Event Invitations', href: '/products/event-invitations', description: 'Corporate and social events' },
      { name: 'Birth Announcements', href: '/products/birth-announcements', description: 'Welcome new arrivals' },
      { name: 'Save the Dates', href: '/products/save-dates', description: 'Pre-event announcements' },
    ]
  },
  {
    id: 'packaging',
    name: 'Packaging',
    icon: <Gift className="w-8 h-8" />,
    description: 'Custom packaging solutions for your products',
    href: '/categories/packaging',
    subCategories: [
      { name: 'Product Boxes', href: '/products/product-boxes', description: 'Custom product packaging' },
      { name: 'Shopping Bags', href: '/products/shopping-bags', description: 'Branded shopping bags' },
      { name: 'Labels & Stickers', href: '/products/labels', description: 'Product labels and stickers' },
      { name: 'Gift Wrapping', href: '/products/gift-wrapping', description: 'Premium gift packaging' },
    ]
  },
  {
    id: 'personalization',
    name: 'Personalization',
    icon: <Sparkles className="w-8 h-8" />,
    description: 'Personalized items and custom printing',
    href: '/categories/personalization',
    subCategories: [
      { name: 'Custom Mugs', href: '/products/custom-mugs', description: 'Personalized drinkware' },
      { name: 'T-Shirt Printing', href: '/products/tshirt-printing', description: 'Custom apparel printing' },
      { name: 'Photo Gifts', href: '/products/photo-gifts', description: 'Personalized photo products' },
      { name: 'Promotional Items', href: '/products/promotional', description: 'Branded promotional products' },
    ]
  },
]

export default function CategorySection() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const handleCategoryHover = (categoryId: string) => {
    setExpandedCategory(categoryId)
  }

  const handleCategoryLeave = () => {
    setExpandedCategory(null)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Our Services
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our comprehensive range of business services and products designed to help your business thrive.
          </p>
        </div>

        <div className="mb-8">
          <Link 
            href="/categories/all"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold text-lg"
          >
            View All Categories
            <ChevronRight className="w-5 h-5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="relative"
              onMouseEnter={() => handleCategoryHover(category.id)}
              onMouseLeave={handleCategoryLeave}
            >
              <div className="category-card group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-primary-600 group-hover:text-primary-700 transition-colors">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                      expandedCategory === category.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                
                <p className="text-gray-600 mb-4">
                  {category.description}
                </p>

                <Link
                  href={category.href}
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  Explore Category
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>

                {/* Expanded Sub-categories */}
                <div className={`mt-6 space-y-3 transition-all duration-300 ${
                  expandedCategory === category.id 
                    ? 'opacity-100 max-h-96' 
                    : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Popular Services:</h4>
                    <div className="space-y-2">
                      {category.subCategories.map((subCategory) => (
                        <Link
                          key={subCategory.name}
                          href={subCategory.href}
                          className="block p-2 rounded-lg hover:bg-gray-50 transition-colors group/sub"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900 group-hover/sub:text-primary-600">
                                {subCategory.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {subCategory.description}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover/sub:text-primary-600" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
