'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Search, Menu, ShoppingCart, HelpCircle } from 'lucide-react'

export default function Header() {
  const { user } = useAuth()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const cartItemCount = 0 // Placeholder for cart functionality

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleCartClick = () => {
    router.push('/cart')
  }

  const handleHelpClick = () => {
    window.open('tel:+918878380308', '_self')
  }

  const megaMenuData = {
    'View All': {
      href: '/categories/all',
      sections: [
        {
          title: 'Popular Categories',
          items: [
            { name: 'Business Cards', href: '/categories/visiting-cards' },
            { name: 'Marketing Materials', href: '/categories/marketing' },
            { name: 'Custom Apparel', href: '/categories/clothing' },
            { name: 'Promotional Items', href: '/categories/promotional' }
          ]
        },
        {
          title: 'Quick Links',
          items: [
            { name: 'Bulk Orders', href: '/categories/bulk-orders' },
            { name: 'Express Printing', href: '/categories/express' },
            { name: 'Design Services', href: '/categories/design' },
            { name: 'Corporate Solutions', href: '/categories/corporate' }
          ]
        }
      ]
    },
    'Visiting Cards': {
      href: '/categories/visiting-cards',
      sections: [
        {
          title: 'Standard Cards',
          items: [
            { name: 'Business Cards', href: '/products/business-cards' },
            { name: 'Premium Cards', href: '/products/premium-cards' },
            { name: 'Matte Finish', href: '/products/matte-finish-cards' },
            { name: 'Glossy Finish', href: '/products/glossy-finish-cards' }
          ]
        },
        {
          title: 'Special Cards',
          items: [
            { name: 'QR Code Cards', href: '/products/qr-code-cards' },
            { name: 'NFC Cards', href: '/products/nfc-cards' },
            { name: 'Transparent Cards', href: '/products/transparent-cards' },
            { name: 'Foil Stamped', href: '/products/foil-stamped-cards' }
          ]
        }
      ]
    },
    'Stationery, Letterheads & Notebooks': {
      href: '/categories/stationery',
      sections: [
        {
          title: 'Business Stationery',
          items: [
            { name: 'Letterheads', href: '/products/letterheads' },
            { name: 'Envelopes', href: '/products/envelopes' },
            { name: 'Compliment Slips', href: '/products/compliment-slips' },
            { name: 'Invoice Books', href: '/products/invoice-books' }
          ]
        },
        {
          title: 'Notebooks & Pads',
          items: [
            { name: 'Custom Notebooks', href: '/products/custom-notebooks' },
            { name: 'Notepads', href: '/products/notepads' },
            { name: 'Spiral Bound', href: '/products/spiral-bound' },
            { name: 'Hardcover Books', href: '/products/hardcover-books' }
          ]
        }
      ]
    },
    'Stamps and Ink': {
      href: '/categories/stamps',
      sections: [
        {
          title: 'Rubber Stamps',
          items: [
            { name: 'Self-Inking Stamps', href: '/products/self-inking-stamps' },
            { name: 'Traditional Stamps', href: '/products/traditional-stamps' },
            { name: 'Date Stamps', href: '/products/date-stamps' },
            { name: 'Address Stamps', href: '/products/address-stamps' }
          ]
        },
        {
          title: 'Ink & Accessories',
          items: [
            { name: 'Stamp Ink', href: '/products/stamp-ink' },
            { name: 'Ink Pads', href: '/products/ink-pads' },
            { name: 'Stamp Holders', href: '/products/stamp-holders' },
            { name: 'Custom Designs', href: '/products/custom-stamp-designs' }
          ]
        }
      ]
    },
    'Signs, Posters & Marketing Materials': {
      href: '/categories/marketing',
      sections: [
        {
          title: 'Signs and Posters',
          items: [
            { name: 'Standees', href: '/products/standees' },
            { name: 'Posters', href: '/products/posters' },
            { name: 'Bulk Posters', href: '/products/bulk-posters' },
            { name: 'Banners', href: '/products/banners' }
          ]
        },
        {
          title: 'Marketing Materials',
          items: [
            { name: 'Flyers', href: '/products/flyers' },
            { name: 'Brochures', href: '/products/brochures' },
            { name: 'Booklets', href: '/products/booklets' },
            { name: 'Bulk Flyers', href: '/products/bulk-flyers' }
          ]
        }
      ]
    },
    'Labels, Stickers & Packaging': {
      href: '/categories/labels',
      sections: [
        {
          title: 'Labels & Stickers',
          items: [
            { name: 'Custom Labels', href: '/products/custom-labels' },
            { name: 'Product Labels', href: '/products/product-labels' },
            { name: 'Address Labels', href: '/products/address-labels' },
            { name: 'Vinyl Stickers', href: '/products/vinyl-stickers' }
          ]
        },
        {
          title: 'Packaging',
          items: [
            { name: 'Custom Boxes', href: '/products/custom-boxes' },
            { name: 'Packaging Tape', href: '/products/packaging-tape' },
            { name: 'Bubble Wrap', href: '/products/bubble-wrap' },
            { name: 'Shipping Labels', href: '/products/shipping-labels' }
          ]
        }
      ]
    },
    'Clothing, Caps & Bags': {
      href: '/categories/clothing',
      sections: [
        {
          title: 'Clothing',
          items: [
            { name: 'Custom T-Shirts', href: '/products/custom-t-shirts' },
            { name: 'Polo Shirts', href: '/products/polo-shirts' },
            { name: 'Hoodies', href: '/products/hoodies' },
            { name: 'Uniforms', href: '/products/uniforms' }
          ]
        },
        {
          title: 'Accessories',
          items: [
            { name: 'Custom Caps', href: '/products/custom-caps' },
            { name: 'Tote Bags', href: '/products/tote-bags' },
            { name: 'Backpacks', href: '/products/backpacks' },
            { name: 'Laptop Bags', href: '/products/laptop-bags' }
          ]
        }
      ]
    },
    'Mugs, Albums & Gifts': {
      href: '/categories/gifts',
      sections: [
        {
          title: 'Drinkware',
          items: [
            { name: 'Custom Mugs', href: '/products/custom-mugs' },
            { name: 'Travel Mugs', href: '/products/travel-mugs' },
            { name: 'Water Bottles', href: '/products/water-bottles' },
            { name: 'Coffee Cups', href: '/products/coffee-cups' }
          ]
        },
        {
          title: 'Photo Gifts',
          items: [
            { name: 'Photo Albums', href: '/products/photo-albums' },
            { name: 'Photo Frames', href: '/products/photo-frames' },
            { name: 'Canvas Prints', href: '/products/canvas-prints' },
            { name: 'Photo Books', href: '/products/photo-books' }
          ]
        }
      ]
    },
    'Bulk Orders': {
      href: '/categories/bulk-orders',
      sections: [
        {
          title: 'Business Bulk',
          items: [
            { name: 'Bulk Business Cards', href: '/products/bulk-business-cards' },
            { name: 'Bulk Letterheads', href: '/products/bulk-letterheads' },
            { name: 'Bulk Envelopes', href: '/products/bulk-envelopes' },
            { name: 'Corporate Packages', href: '/products/corporate-packages' }
          ]
        },
        {
          title: 'Event Bulk',
          items: [
            { name: 'Wedding Invitations', href: '/products/wedding-invitations' },
            { name: 'Event Programs', href: '/products/event-programs' },
            { name: 'Conference Materials', href: '/products/conference-materials' },
            { name: 'Trade Show Prints', href: '/products/trade-show-prints' }
          ]
        }
      ]
    },
    'Custom Drinkware': {
      href: '/categories/drinkware',
      sections: [
        {
          title: 'Coffee & Tea',
          items: [
            { name: 'Ceramic Mugs', href: '/products/ceramic-mugs' },
            { name: 'Travel Tumblers', href: '/products/travel-tumblers' },
            { name: 'Tea Cups', href: '/products/tea-cups' },
            { name: 'Espresso Cups', href: '/products/espresso-cups' }
          ]
        },
        {
          title: 'Water & Sports',
          items: [
            { name: 'Sports Bottles', href: '/products/sports-bottles' },
            { name: 'Insulated Bottles', href: '/products/insulated-bottles' },
            { name: 'Glass Bottles', href: '/products/glass-bottles' },
            { name: 'Promotional Bottles', href: '/products/promotional-bottles' }
          ]
        }
      ]
    },
    'Custom Polo T-shirts': {
      href: '/categories/polo-shirts',
      sections: [
        {
          title: 'Business Polo',
          items: [
            { name: 'Corporate Polo', href: '/products/corporate-polo' },
            { name: 'Embroidered Polo', href: '/products/embroidered-polo' },
            { name: 'Printed Polo', href: '/products/printed-polo' },
            { name: 'Premium Polo', href: '/products/premium-polo' }
          ]
        },
        {
          title: 'Casual Polo',
          items: [
            { name: 'Cotton Polo', href: '/products/cotton-polo' },
            { name: 'Polyester Polo', href: '/products/polyester-polo' },
            { name: 'Blend Polo', href: '/products/blend-polo' },
            { name: 'Sports Polo', href: '/products/sports-polo' }
          ]
        }
      ]
    },
    'Umbrellas & Raincoats': {
      href: '/categories/rain-gear',
      sections: [
        {
          title: 'Umbrellas',
          items: [
            { name: 'Promotional Umbrellas', href: '/products/promotional-umbrellas' },
            { name: 'Golf Umbrellas', href: '/products/golf-umbrellas' },
            { name: 'Compact Umbrellas', href: '/products/compact-umbrellas' },
            { name: 'Beach Umbrellas', href: '/products/beach-umbrellas' }
          ]
        },
        {
          title: 'Rainwear',
          items: [
            { name: 'Custom Raincoats', href: '/products/custom-raincoats' },
            { name: 'Branded Ponchos', href: '/products/branded-ponchos' },
            { name: 'Rain Jackets', href: '/products/rain-jackets' },
            { name: 'Waterproof Gear', href: '/products/waterproof-gear' }
          ]
        }
      ]
    }
  }

  return (
    <div className="bg-white">
      {/* Top Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-2xl font-bold">
                  <span className="text-teal-600">Taitil</span>
                  <span className="text-orange-400 text-sm ml-1">Graphics</span>
                </div>
              </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for business cards, flyers, banners, invitations..."
                  className="w-full pl-4 pr-12 py-3 bg-gray-100 rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white focus:border-teal-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
                >
                  <Search className="w-5 h-5 text-gray-400" />
                </button>
              </form>
            </div>

            {/* Right - Help, Cart */}
            <div className="flex items-center space-x-4">
              {/* Help */}
              <button
                onClick={handleHelpClick}
                className="flex items-center space-x-1 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <div className="hidden md:block">
                  <span className="text-xs">Help is here</span>
                  <div className="font-medium">8878380308</div>
                </div>
              </button>

              {/* Cart */}
              <button
                onClick={handleCartClick}
                className="relative p-2 text-gray-700 hover:text-teal-600 transition-colors"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-md text-gray-700 hover:text-teal-600"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div className="bg-teal-50 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-teal-700 font-medium">
              We provide Designing and Printing Solutions
            </p>
          </div>
        </div>
      </header>

      {/* Navigation Bar with Hover Dropdowns */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-center space-x-1 py-4">
            {Object.entries(megaMenuData).map(([categoryName, categoryData]) => (
              <div
                key={categoryName}
                className="relative group"
                onMouseEnter={() => setHoveredCategory(categoryName)}
                onMouseLeave={() => setHoveredCategory(null)}
              >
                <Link
                  href={categoryData.href}
                  className={`text-gray-700 hover:text-teal-600 font-medium transition-all duration-200 text-sm py-3 px-4 whitespace-nowrap rounded-lg hover:bg-gray-50 border-b-2 ${
                    hoveredCategory === categoryName ? 'border-teal-500 text-teal-600 bg-gray-50' : 'border-transparent'
                  }`}
                >
                  {categoryName}
                </Link>

                {/* Mega Menu */}
                {hoveredCategory === categoryName && categoryData.sections.length > 0 && (
                  <div
                    className="fixed top-full left-0 w-full bg-white border-t border-gray-200 shadow-xl z-50 animate-in slide-in-from-top-2 duration-200"
                    style={{ top: '100%' }}
                  >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {categoryData.sections.map((section) => (
                          <div key={section.title} className="space-y-4">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider border-b-2 border-teal-500 pb-2 mb-4">
                              {section.title}
                            </h3>
                            <ul className="space-y-3">
                              {section.items.map((item) => (
                                <li key={item.name}>
                                  <Link
                                    href={item.href}
                                    className="text-gray-600 hover:text-teal-600 transition-colors text-sm block py-1 hover:pl-2 transition-all duration-200"
                                  >
                                    {item.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}

                        {/* Featured Section */}
                        <div className="bg-gradient-to-br from-teal-50 via-blue-50 to-orange-50 rounded-xl p-6 border border-gray-100">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <span className="text-teal-600 font-bold text-lg">★</span>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-3">Featured Products</h3>
                            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                              Discover our most popular {categoryName.toLowerCase()} with premium quality and fast delivery.
                            </p>
                            <Link
                              href={categoryData.href}
                              className="inline-flex items-center justify-center bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-200"
                            >
                              View All {categoryName} →
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Bottom section with contact info */}
                      <div className="mt-8 pt-6 border-t border-gray-200 bg-gray-50 -mx-8 px-8 rounded-b-lg">
                        <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
                          <div className="text-sm text-gray-600 text-center md:text-left">
                            Need help choosing? <span className="font-medium text-teal-600 hover:text-teal-700 cursor-pointer">Call us at 8878380308</span> or chat with our experts.
                          </div>
                          <div className="flex flex-wrap items-center justify-center space-x-6 text-sm">
                            <span className="text-gray-500 flex items-center">
                              <span className="text-green-500 mr-1">✓</span> Free Design Consultation
                            </span>
                            <span className="text-gray-500 flex items-center">
                              <span className="text-blue-500 mr-1">✓</span> Fast Delivery
                            </span>
                            <span className="text-gray-500 flex items-center">
                              <span className="text-purple-500 mr-1">✓</span> Quality Guaranteed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 space-y-3">
              {Object.entries(megaMenuData).map(([categoryName, categoryData]) => (
                <div key={categoryName} className="space-y-2">
                  <Link href={categoryData.href} className="block text-gray-700 hover:text-teal-600 font-medium" onClick={() => setIsMenuOpen(false)}>
                    {categoryName}
                  </Link>
                  {categoryData.sections.length > 0 && (
                    <div className="ml-4 space-y-2">
                      {categoryData.sections.map((section) => (
                        <div key={section.title} className="space-y-1">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {section.title}
                          </div>
                          {section.items.map((item) => (
                            <Link
                              key={item.name}
                              href={item.href}
                              className="block text-sm text-gray-600 hover:text-teal-600 ml-2"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {item.name}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
