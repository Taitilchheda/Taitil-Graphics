import { NextRequest, NextResponse } from 'next/server'

// Extended mock product database with more products
const products = [
  {
    id: '1',
    name: 'Premium Business Cards',
    description: 'High-quality business cards with premium finishes. Perfect for making a lasting first impression.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $29',
    priceValue: 29,
    rating: 4.8,
    reviews: 124,
    category: 'Business Cards',
    features: ['Premium Paper', 'Multiple Finishes', 'Fast Delivery', 'Custom Design'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Eco-Friendly Business Cards',
    description: 'Sustainable business cards made from recycled materials. Show your commitment to the environment.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $35',
    priceValue: 35,
    rating: 4.6,
    reviews: 89,
    category: 'Business Cards',
    features: ['Recycled Paper', 'Eco-Friendly', 'Biodegradable', 'Green Printing'],
    createdAt: '2024-01-10'
  },
  {
    id: '3',
    name: 'Custom Logo Design',
    description: 'Professional logo design services to establish your brand identity.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    price: 'From $199',
    priceValue: 199,
    rating: 4.9,
    reviews: 89,
    category: 'Design & Logos',
    features: ['Custom Design', 'Multiple Concepts', 'Vector Files', 'Brand Guidelines'],
    createdAt: '2024-01-12'
  },
  {
    id: '4',
    name: 'Wedding Invitations',
    description: 'Elegant wedding invitations for your special day.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    price: 'From $89',
    priceValue: 89,
    rating: 4.7,
    reviews: 156,
    category: 'Invitations',
    features: ['Premium Paper', 'Custom Design', 'RSVP Cards', 'Envelope Addressing'],
    createdAt: '2024-01-08'
  },
  {
    id: '5',
    name: 'Office Stationery Set',
    description: 'Complete office stationery package for your business needs.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $49',
    priceValue: 49,
    rating: 4.5,
    reviews: 203,
    category: 'Office Supplies',
    features: ['Complete Set', 'Quality Materials', 'Bulk Pricing', 'Fast Shipping'],
    createdAt: '2024-01-05'
  },
  {
    id: '6',
    name: 'Custom Product Packaging',
    description: 'Professional packaging solutions for your products.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $79',
    priceValue: 79,
    rating: 4.6,
    reviews: 78,
    category: 'Packaging',
    features: ['Custom Design', 'Various Sizes', 'Eco-Friendly Options', 'Branding'],
    createdAt: '2024-01-03'
  },
  {
    id: '7',
    name: 'Personalized Mugs',
    description: 'Custom printed mugs for personal or promotional use.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $15',
    priceValue: 15,
    rating: 4.4,
    reviews: 312,
    category: 'Personalization',
    features: ['Photo Printing', 'Text Customization', 'Dishwasher Safe', 'Bulk Orders'],
    createdAt: '2024-01-01'
  },
  {
    id: '8',
    name: 'Luxury Foil Business Cards',
    description: 'Elegant business cards with gold or silver foil accents.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $59',
    priceValue: 59,
    rating: 4.9,
    reviews: 67,
    category: 'Business Cards',
    features: ['Foil Stamping', 'Luxury Feel', 'Premium Stock', 'Custom Colors'],
    createdAt: '2024-01-20'
  },
  {
    id: '9',
    name: 'Corporate Brochures',
    description: 'Professional brochures for marketing and corporate communications.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $125',
    priceValue: 125,
    rating: 4.7,
    reviews: 94,
    category: 'Design & Logos',
    features: ['Professional Design', 'High-Quality Print', 'Multiple Formats', 'Fast Turnaround'],
    createdAt: '2024-01-18'
  },
  {
    id: '10',
    name: 'Event Invitations',
    description: 'Custom invitations for corporate events and celebrations.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    price: 'From $65',
    priceValue: 65,
    rating: 4.5,
    reviews: 128,
    category: 'Invitations',
    features: ['Event Themes', 'RSVP Management', 'Digital Options', 'Bulk Discounts'],
    createdAt: '2024-01-16'
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || 'all'
    const priceRange = searchParams.get('priceRange') || 'all'
    const rating = searchParams.get('rating') || 'all'
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    let filteredProducts = [...products]

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase()
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category.toLowerCase().includes(searchLower) ||
        product.features.some(feature => feature.toLowerCase().includes(searchLower))
      )
    }

    // Category filter
    if (category !== 'all') {
      filteredProducts = filteredProducts.filter(product => {
        const productCategory = product.category.toLowerCase().replace(/\s+/g, '-')
        return productCategory.includes(category.toLowerCase())
      })
    }

    // Price range filter
    if (priceRange !== 'all') {
      filteredProducts = filteredProducts.filter(product => {
        const price = product.priceValue
        switch (priceRange) {
          case '0-50':
            return price <= 50
          case '50-100':
            return price > 50 && price <= 100
          case '100-200':
            return price > 100 && price <= 200
          case '200+':
            return price > 200
          default:
            return true
        }
      })
    }

    // Rating filter
    if (rating !== 'all') {
      const minRating = parseFloat(rating.replace('+', ''))
      filteredProducts = filteredProducts.filter(product => product.rating >= minRating)
    }

    // Sorting
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.priceValue - b.priceValue
        case 'price-high':
          return b.priceValue - a.priceValue
        case 'rating':
          return b.rating - a.rating
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'relevance':
        default:
          // For relevance, prioritize exact matches in name, then description
          if (search.trim()) {
            const searchLower = search.toLowerCase()
            const aNameMatch = a.name.toLowerCase().includes(searchLower)
            const bNameMatch = b.name.toLowerCase().includes(searchLower)
            
            if (aNameMatch && !bNameMatch) return -1
            if (!aNameMatch && bNameMatch) return 1
            
            // If both or neither match name, sort by rating
            return b.rating - a.rating
          }
          return b.rating - a.rating
      }
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

    // Calculate relevance score for search results
    const productsWithScore = paginatedProducts.map(product => {
      let relevanceScore = 0
      if (search.trim()) {
        const searchLower = search.toLowerCase()
        if (product.name.toLowerCase().includes(searchLower)) relevanceScore += 10
        if (product.description.toLowerCase().includes(searchLower)) relevanceScore += 5
        if (product.category.toLowerCase().includes(searchLower)) relevanceScore += 8
        product.features.forEach(feature => {
          if (feature.toLowerCase().includes(searchLower)) relevanceScore += 3
        })
      }
      return { ...product, relevanceScore }
    })

    return NextResponse.json({
      products: productsWithScore,
      total: filteredProducts.length,
      page,
      limit,
      hasMore: endIndex < filteredProducts.length,
      filters: {
        categories: [...new Set(products.map(p => p.category))],
        priceRanges: ['0-50', '50-100', '100-200', '200+'],
        ratings: ['4+', '3+']
      }
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
