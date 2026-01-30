'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface SubCategory {
  name: string
  href: string
}

interface Category {
  id: string
  name: string
  href: string
  subCategories: SubCategory[]
}

const categories: Category[] = [
  {
    id: 'visiting-cards',
    name: 'Visiting Cards',
    href: '/categories/visiting-cards',
    subCategories: [
      { name: 'Standard Cards', href: '/products/standard-cards' },
      { name: 'Custom Shape Cards', href: '/products/custom-shape-cards' }
    ]
  },
  {
    id: 'business-essentials',
    name: 'Business Essentials',
    href: '/categories/business-essentials',
    subCategories: [
      { name: 'Brochures', href: '/products/brochures' },
      { name: 'Leaflets', href: '/products/leaflets' },
      { name: 'Flyers', href: '/products/flyers' },
      { name: 'Envelopes', href: '/products/envelopes' }
    ]
  },
  {
    id: 'office-supplies',
    name: 'Office Supplies',
    href: '/categories/office-supplies',
    subCategories: [
      { name: 'Id Cards', href: '/products/id-cards' },
      { name: 'Custom Certificates', href: '/products/custom-certificates' }
    ]
  }
]

export default function CategorySidebar() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>('visiting-cards')

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId)
  }

  return (
    <div className="bg-green-100 rounded-2xl p-6 h-fit">
      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.id} className="space-y-2">
            <button
              onClick={() => toggleCategory(category.id)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="font-semibold text-gray-900 text-lg">
                {category.name}
              </h3>
              {category.subCategories.length > 0 && (
                expandedCategory === category.id ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )
              )}
            </button>
            
            {expandedCategory === category.id && category.subCategories.length > 0 && (
              <div className="ml-4 space-y-2 animate-slide-up">
                {category.subCategories.map((subCategory, index) => (
                  <Link
                    key={index}
                    href={subCategory.href}
                    className="block text-gray-700 hover:text-teal-600 transition-colors text-sm"
                  >
                    {subCategory.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Scrollable indicator at bottom */}
      <div className="text-center mt-8 pt-4">
        <p className="text-gray-600 font-medium text-sm">SCROLLABLE</p>
      </div>
    </div>
  )
}
