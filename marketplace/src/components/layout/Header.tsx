'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { useCart } from '@/components/providers/CartProvider'
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useCatalog } from '@/components/providers/CatalogProvider'
import { useAnalytics } from '@/components/providers/AnalyticsProvider'

export default function Header() {
  const { user, logout } = useAuth()
  const { cartItemCount, likedItemCount } = useCart()
  const { categories } = useCatalog()
  const { logEvent } = useAnalytics()
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<{ id: string; label: string; href: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isCondensed, setIsCondensed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      logEvent({ type: 'click', label: 'header-search', meta: { query: searchQuery } })
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (href: string, label: string) => {
    logEvent({ type: 'click', label: 'header-suggestion', meta: { suggestion: label } })
    setShowSuggestions(false)
    setSearchQuery(label)
    router.push(href)
  }

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const lower = searchQuery.toLowerCase()
    const matches: { id: string; label: string; href: string }[] = []

    categories.forEach((cat) => {
      if (cat.name.toLowerCase().includes(lower)) {
        matches.push({ id: cat.id, label: cat.name, href: `/categories/${cat.id}` })
      }
      cat.subcategories.forEach((sub) => {
        if (sub.name.toLowerCase().includes(lower)) {
          matches.push({ id: `${cat.id}-${sub.id}`, label: `${sub.name} - ${cat.name}`, href: `/categories/${cat.id}/${sub.id}` })
        }
        sub.products.forEach((product) => {
          const haystack = `${product.name} ${product.description} ${product.features.join(' ')}`.toLowerCase()
          if (haystack.includes(lower)) {
            matches.push({ id: product.id, label: product.name, href: `/products/${product.id}` })
          }
        })
      })
    })

    setSuggestions(matches.slice(0, 8))
    setShowSuggestions(true)
  }, [categories, searchQuery])

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    const updateViewport = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      setIsCondensed(mobile && window.scrollY > 60)
    }
    updateViewport()
    const handleScroll = () => {
      if (isMobile) setIsCondensed(window.scrollY > 60)
    }
    window.addEventListener('resize', updateViewport)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('resize', updateViewport)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile])

  return (
    <>
      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-200">
        <div className={`max-w-7xl mx-auto px-3 sm:px-4 lg:px-4 ${isMobile && isCondensed ? 'py-2' : 'py-3'}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Taitil Graphics"
                width={180}
                height={60}
                className={`${isMobile && isCondensed ? 'h-14' : 'h-24'} w-auto transition-all duration-200`}
              />
            </Link>

            {/* Search Bar */}
            <div className="w-full md:flex-1 md:max-w-2xl md:mx-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search for products, designs, or services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchQuery && setShowSuggestions(true)}
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.href, suggestion.label)}
                        className="w-full text-left px-3 py-2 hover:bg-primary-50 text-sm text-gray-800"
                      >
                        {suggestion.label}
                      </button>
                    ))}
                    <Link
                      href={`/search?q=${encodeURIComponent(searchQuery)}`}
                      onClick={() => {
                        setShowSuggestions(false)
                        logEvent({ type: 'click', label: 'header-suggestion-search', meta: { query: searchQuery } })
                      }}
                      className="block w-full text-left px-3 py-2 text-xs text-primary-700 border-t border-gray-100 bg-gray-50 hover:bg-primary-50"
                    >
                      Search for &quot;{searchQuery}&quot;
                    </Link>
                  </div>
                )}
              </form>
            </div>

            {/* Right Navigation */}
            <div className="flex items-center justify-between md:justify-start space-x-4 md:space-x-6 text-xs">
              {/* Favourites */}
              <Link
                href="/liked-products"
                className="flex flex-col items-center text-gray-600 hover:text-primary-600 transition-colors relative"
              >
                <Heart className="w-6 h-6" />
                <span className="text-xs mt-1">Favourites</span>
                {likedItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {likedItemCount > 9 ? '9+' : likedItemCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                href="/cart"
                className="flex flex-col items-center text-gray-600 hover:text-primary-600 transition-colors relative"
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="text-xs mt-1">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex flex-col items-center text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <User className="w-6 h-6" />
                    <span className="text-xs mt-1">Account</span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        My Account
                      </Link>
                      {user.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex flex-col items-center text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <User className="w-6 h-6" />
                  <span className="text-xs mt-1">Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-primary-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Category Navigation */}
      {(!isMobile || !isCondensed) && (
        <nav className="bg-[#ffe6cc] border-b border-[#ffe6cc] overflow-hidden md:overflow-visible">
          {/* Mobile: horizontal scroll within container */}
          <div className="md:hidden">
            <div className="max-w-7xl mx-auto px-3">
              <div className="flex items-center space-x-4 py-2 text-sm overflow-x-auto">
                <Link href="/categories/all" className="flex-shrink-0 text-gray-700 hover:text-primary-600 font-semibold">
                  View All
                </Link>
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="flex-shrink-0 text-gray-700 hover:text-primary-600 font-medium whitespace-nowrap"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          {/* Desktop dropdown */}
          <div className="hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-8 h-12">
                <Link
                  href="/categories/all"
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  View All
                </Link>
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="relative group"
                    onMouseEnter={() => setHoveredCategory(category.id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link
                      href={`/categories/${category.id}`}
                      className="flex items-center space-x-1 text-gray-700 hover:text-primary-600 font-medium transition-colors py-3"
                    >
                      <span>{category.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Link>
                    {hoveredCategory === category.id && (
                      <div className="absolute top-full left-0 mt-0 w-80 bg-white shadow-lg border border-gray-200 rounded-lg z-50">
                        <div className="p-6">
                          <h3 className="font-semibold text-gray-900 mb-4">{category.name}</h3>
                          <div className="grid grid-cols-1 gap-4">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id}>
                                <Link
                                  href={`/categories/${category.id}/${subcategory.id}`}
                                  className="block text-sm font-medium text-gray-700 hover:text-primary-600 mb-2"
                                >
                                  {subcategory.name}
                                </Link>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <Link
              href="/categories/all"
              className="block text-gray-700 hover:text-primary-600 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              View All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="block text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
