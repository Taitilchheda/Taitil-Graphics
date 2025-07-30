import { NextRequest, NextResponse } from 'next/server'

// Mock product database
const products = [
  {
    id: '1',
    name: 'Premium Business Cards',
    description: 'High-quality business cards with premium finishes. Perfect for making a lasting first impression.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $29',
    rating: 4.8,
    reviews: 124,
    category: 'Business Cards',
    features: ['Premium Paper', 'Multiple Finishes', 'Fast Delivery', 'Custom Design']
  },
  {
    id: '2',
    name: 'Custom Logo Design',
    description: 'Professional logo design services to establish your brand identity.',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    price: 'From $199',
    rating: 4.9,
    reviews: 89,
    category: 'Design & Logos',
    features: ['Custom Design', 'Multiple Concepts', 'Vector Files', 'Brand Guidelines']
  },
  {
    id: '3',
    name: 'Wedding Invitations',
    description: 'Elegant wedding invitations for your special day.',
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop',
    price: 'From $89',
    rating: 4.7,
    reviews: 156,
    category: 'Invitations',
    features: ['Premium Paper', 'Custom Design', 'RSVP Cards', 'Envelope Addressing']
  },
  {
    id: '4',
    name: 'Office Stationery Set',
    description: 'Complete office stationery package for your business needs.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $49',
    rating: 4.5,
    reviews: 203,
    category: 'Office Supplies',
    features: ['Complete Set', 'Quality Materials', 'Bulk Pricing', 'Fast Shipping']
  },
  {
    id: '5',
    name: 'Custom Product Packaging',
    description: 'Professional packaging solutions for your products.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $79',
    rating: 4.6,
    reviews: 78,
    category: 'Packaging',
    features: ['Custom Design', 'Various Sizes', 'Eco-Friendly Options', 'Branding']
  },
  {
    id: '6',
    name: 'Personalized Mugs',
    description: 'Custom printed mugs for personal or promotional use.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    price: 'From $15',
    rating: 4.4,
    reviews: 312,
    category: 'Personalization',
    features: ['Photo Printing', 'Text Customization', 'Dishwasher Safe', 'Bulk Orders']
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    let filteredProducts = [...products]

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase().includes(category.toLowerCase())
      )
    }

    // Filter by search term
    if (search) {
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Pagination
    const paginatedProducts = filteredProducts.slice(offset, offset + limit)

    return NextResponse.json({
      products: paginatedProducts,
      total: filteredProducts.length,
      hasMore: offset + limit < filteredProducts.length
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    
    // In a real application, you would save this to a database
    const newProduct = {
      id: (products.length + 1).toString(),
      ...productData,
      rating: 0,
      reviews: 0
    }

    products.push(newProduct)

    return NextResponse.json({
      product: newProduct,
      message: 'Product created successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
