export interface Product {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  image: string
  features: string[]
  specifications?: Record<string, string>
  whatsappMessage?: string
  badges?: string[]
  type?: "PHYSICAL" | "SERVICE"
  variants?: any
  media?: any
  seoTitle?: string
  seoDescription?: string
  canonicalUrl?: string
  isRecommended?: boolean
  isHotSeller?: boolean
  isNew?: boolean
  stock?: number
  priceCents?: number
  listingPriceCents?: number
  salePriceCents?: number
  reserved?: number
  images?: string[]
  weightGrams?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  hsnCode?: string
  fragile?: boolean
  discountPercent?: number
  sku?: string
  reorderLevel?: number
  createdAt?: string
  updatedAt?: string
}

export interface Category {
  id: string
  name: string
  description: string
  subcategories: Subcategory[]
  products?: Product[]
  createdAt?: string
  updatedAt?: string
}

export interface Subcategory {
  id: string
  name: string
  description: string
  products: Product[]
  createdAt?: string
  updatedAt?: string
}

export const categories: Category[] = [
  {
    id: 'business-essentials',
    name: 'Business Essentials',
    description: 'Professional business stationery and essentials',
    subcategories: [
      {
        id: 'visiting-cards',
        name: 'Visiting Cards',
        description: 'Professional business cards in various styles and finishes',
        products: []
      },
      {
        id: 'letterheads',
        name: 'Letterheads',
        description: 'Professional letterheads for business correspondence',
        products: []
      },
      {
        id: 'envelopes',
        name: 'Envelopes',
        description: 'Custom printed envelopes for business use',
        products: []
      },
      {
        id: 'lanyards',
        name: 'Lanyards',
        description: 'Custom printed lanyards for events and offices',
        products: []
      },
      {
        id: 'id-cards',
        name: 'ID Cards',
        description: 'Paper ID cards for identification purposes',
        products: []
      },
      {
        id: 'certificates',
        name: 'Custom Certificates',
        description: 'Professional certificates for awards and recognition',
        products: []
      }
    ]
  },
  {
    id: 'celebrations',
    name: 'Celebrations',
    description: 'Wedding and celebration invitations and cards',
    subcategories: [
      {
        id: 'wedding-cards',
        name: 'Wedding Cards',
        description: 'Beautiful wedding invitations and related stationery',
        products: []
      },
      {
        id: 'invitation-cards',
        name: 'Invitation Cards',
        description: 'Various invitation cards for different occasions',
        products: []
      }
    ]
  },
  {
    id: 'marketing-material',
    name: 'Marketing Material',
    description: 'Promotional materials for marketing campaigns',
    subcategories: [
      {
        id: 'standees-posters',
        name: 'Standees & Posters',
        description: 'Eye-catching standees and posters for promotions',
        products: []
      },
      {
        id: 'banners-flyers',
        name: 'Banners & Flyers',
        description: 'Promotional banners and flyers for marketing',
        products: []
      }
    ]
  },
  {
    id: 'packaging',
    name: 'Packaging',
    description: 'Custom packaging solutions for businesses',
    subcategories: [
      {
        id: 'boxes-bags',
        name: 'Boxes & Bags',
        description: 'Custom boxes and shopping bags',
        products: []
      }
    ]
  },
  {
    id: 'gift-articles',
    name: 'Gift Articles',
    description: 'Personalized gift items and photo products',
    subcategories: [
      {
        id: 'photo-products',
        name: 'Photo Products',
        description: 'Custom photo albums, prints, and frames',
        products: []
      }
    ]
  },
  {
    id: 'cake-decorations',
    name: 'Cake Decoration',
    description: 'Statement cake toppers and celebration decor for parties and events',
    subcategories: [
      {
        id: 'premium-paper-cake-toppers',
        name: 'Premium Paper Cake Toppers',
        description: '10 ready-made layered cardstock toppers with foil/glitter finish. No customization.',
        products: []
      },
      {
        id: 'luxury-acrylic-cake-toppers',
        name: 'Luxury Acrylic Cake Toppers',
        description: '10 ready-made mirror/frosted acrylic toppers in premium finishes. No customization.',
        products: []
      },
      {
        id: 'butterfly-decoration',
        name: 'Butterfly & Leaf Picks',
        description: 'Colorful butterfly accent kits to pair with toppers and celebration decor.',
        products: []
      },
      {
        id: 'party-decor',
        name: 'Other Decorations',
        description: 'Decor kits that pair perfectly with toppers for a complete celebration look',
        products: []
      }
    ]
  }
]

// Helper function to get all products
export const getAllProducts = (): Product[] => {
  return categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => subcategory.products)
  )
}

// Helper function to get product by ID
export const getProductById = (id: string): Product | undefined => {
  return getAllProducts().find(product => product.id === id)
}

// Helper function to get products by category
export const getProductsByCategory = (categoryId: string): Product[] => {
  const category = categories.find(cat => cat.id === categoryId)
  if (!category) return []
  
  return category.subcategories.flatMap(subcategory => subcategory.products)
}

// Helper function to get products by subcategory
export const getProductsBySubcategory = (categoryId: string, subcategoryId: string): Product[] => {
  const category = categories.find(cat => cat.id === categoryId)
  if (!category) return []
  
  const subcategory = category.subcategories.find(sub => sub.id === subcategoryId)
  if (!subcategory) return []
  
  return subcategory.products
}
