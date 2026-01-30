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

const paperTopperImages = [
  'https://images.unsplash.com/photo-1527515545081-5db817172677?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=400&fit=crop',
]

const acrylicTopperImages = [
  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop',
]

const butterflyImages = [
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop',
]

const STATIC_CREATED_AT = '2024-01-01T00:00:00.000Z'

const buildCakeTopperProducts = (type: 'paper' | 'acrylic', count: number): Product[] => {
  const isPaper = type === 'paper'
  const images = isPaper ? paperTopperImages : acrylicTopperImages
  const baseName = isPaper ? 'Premium Paper Cake Topper' : 'Luxury Acrylic Cake Topper'
  const subcategory = isPaper ? 'premium-paper-cake-toppers' : 'luxury-acrylic-cake-toppers'

  return Array.from({ length: count }).map((_, idx) => ({
    id: `${type}-${idx + 1}`,
    name: `${baseName} #${idx + 1}`,
    description: isPaper
      ? 'Ready-made layered cardstock topper with shimmer/foil finish. No customization.'
      : 'Ready-made mirror/frosted acrylic topper. No customization.',
    category: 'cake-decorations',
    subcategory,
    image: images[idx % images.length],
    features: isPaper
      ? ['300gsm shimmer cardstock', 'Multi-layer cut precision', 'Gold/silver foil finish', 'Custom names and ages']
      : ['3mm mirror acrylic', 'Laser-cut precision', 'Gold/rose gold/silver finishes', 'Reusable and easy to clean'],
    whatsappMessage: `Hi! I'm interested in ${baseName} #${idx + 1}. Ready-made (no customization). Please confirm price and availability.`,
    stock: isPaper ? 60 : 45,
    isRecommended: idx < 8,
    isHotSeller: !isPaper && idx < 12,
    badges: isPaper ? ['Recommended'] : ['Hot Seller'],
    type: "PHYSICAL",
    createdAt: STATIC_CREATED_AT,
  }))
}

const buildButterflyProducts = (count: number): Product[] =>
  Array.from({ length: count }).map((_, idx) => ({
    id: `butterfly-${idx + 1}`,
    name: `Butterfly Accent Kit #${idx + 1}`,
    description: 'Metallic butterflies, palm leaves, pampas, and floral picks for cakes and decor.',
    category: 'cake-decorations',
    subcategory: 'butterfly-decoration',
    image: butterflyImages[idx % butterflyImages.length],
    features: ['Metallic butterflies', 'Palm leaves + pampas', 'Floral picks', 'Food-safe picks'],
    whatsappMessage: `Hi! I'm interested in Butterfly Accent Kit #${idx + 1}. Please share options, pricing, and lead time.`,
    stock: 75,
    badges: ['New listing'],
    type: "PHYSICAL",
    isRecommended: idx < 10,
    createdAt: STATIC_CREATED_AT,
  }))

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
        products: [
          {
            id: 'standard-visiting-cards',
            name: 'Standard Visiting Cards',
            description: 'Classic business cards with professional finish',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['350gsm Premium Paper', 'Full Color Printing', 'Standard Size', 'Matte/Glossy Finish'],
            whatsappMessage: 'Hi! I\'m interested in Standard Visiting Cards. Could you please provide details about customization options?',
            isHotSeller: true,
            isRecommended: true,
            badges: ['Hot Seller'],
            stock: 120
          },
          {
            id: 'rounded-corner-cards',
            name: 'Rounded Corner Cards',
            description: 'Modern business cards with elegant rounded corners',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Rounded Corners', 'Premium Finish', 'Unique Design', 'Professional Look'],
            whatsappMessage: 'Hi! I\'m interested in Rounded Corner Visiting Cards. Please share details about design options.',
            isRecommended: true,
            badges: ['Recommended'],
            stock: 85
          },
          {
            id: 'square-cards',
            name: 'Square Cards',
            description: 'Unique square-shaped business cards that stand out',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Square Shape', 'Eye-catching Design', 'Premium Quality', 'Custom Printing'],
            whatsappMessage: 'Hi! I\'m interested in Square Visiting Cards. Could you provide information about sizes and customization?'
          },
          {
            id: 'qr-code-cards',
            name: 'QR Code Visiting Cards',
            description: 'Modern cards with integrated QR codes for digital connectivity',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['QR Code Integration', 'Digital Connectivity', 'Modern Design', 'Custom QR Content'],
            whatsappMessage: 'Hi! I\'m interested in QR Code Visiting Cards. Please share details about QR code customization.'
          },
          {
            id: 'custom-shape-cards',
            name: 'Custom Shape Cut Cards',
            description: 'Unique custom-shaped business cards that stand out',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Custom Die-Cut Shapes', 'Unique Design', 'Premium Quality', 'Eye-catching'],
            whatsappMessage: 'Hi! I\'m interested in Custom Shape Cut Visiting Cards. Please provide details about available shapes.'
          },
          {
            id: 'premium-texture-glossy',
            name: 'Premium Glossy Cards',
            description: 'High-quality glossy finish business cards',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Glossy Finish', 'Premium 350gsm Paper', 'Vibrant Colors', 'Professional Look'],
            whatsappMessage: 'Hi! I\'m interested in Premium Glossy Visiting Cards. Could you share design options?'
          },
          {
            id: 'premium-texture-matte',
            name: 'Premium Matte Cards',
            description: 'Elegant matte finish business cards',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Matte Finish', 'Premium 350gsm Paper', 'Elegant Look', 'Fingerprint Resistant'],
            whatsappMessage: 'Hi! I\'m interested in Premium Matte Visiting Cards. Please provide customization details.',
            isHotSeller: true,
            badges: ['Hot Seller'],
            stock: 90
          },
          {
            id: 'non-tearable-cards',
            name: 'Non-Tearable Cards',
            description: 'Durable non-tearable business cards',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Tear-Resistant Material', 'Waterproof', 'Long-lasting', 'Durable'],
            whatsappMessage: 'Hi! I\'m interested in Non-Tearable Visiting Cards. Could you provide details about the material?'
          },
          {
            id: 'spot-uv-cards',
            name: 'Spot-UV Cards',
            description: 'Premium cards with selective UV coating',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Spot UV Coating', 'Premium Finish', 'Raised Effect', 'Luxury Feel'],
            whatsappMessage: 'Hi! I\'m interested in Spot-UV Visiting Cards. Please share details about the UV coating options.'
          },
          {
            id: 'transparent-cards',
            name: 'Transparent Cards',
            description: 'Modern transparent business cards',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Transparent Material', 'Unique Design', 'Modern Look', 'Eye-catching'],
            whatsappMessage: 'Hi! I\'m interested in Transparent Visiting Cards. Could you provide information about design options?'
          },
          {
            id: 'magnetic-cards',
            name: 'Magnetic Cards',
            description: 'Business cards with magnetic backing',
            category: 'business-essentials',
            subcategory: 'visiting-cards',
            image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
            features: ['Magnetic Backing', 'Fridge-Friendly', 'Memorable', 'Functional'],
            whatsappMessage: 'Hi! I\'m interested in Magnetic Visiting Cards. Please share details about the magnetic backing.'
          }
        ]
      },
      {
        id: 'letterheads',
        name: 'Letterheads',
        description: 'Professional letterheads for business correspondence',
        products: [
          {
            id: 'standard-letterheads',
            name: 'Standard Letterheads',
            description: 'Professional letterheads for official correspondence',
            category: 'business-essentials',
            subcategory: 'letterheads',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            features: ['A4 Size', 'Premium Paper', 'Full Color Printing', 'Professional Design'],
            whatsappMessage: 'Hi! I\'m interested in Letterheads. Could you provide details for different quantities and paper options?'
          }
        ]
      },
      {
        id: 'envelopes',
        name: 'Envelopes',
        description: 'Custom printed envelopes for business use',
        products: [
          {
            id: 'business-envelopes',
            name: 'Business Envelopes',
            description: 'Professional envelopes with custom printing',
            category: 'business-essentials',
            subcategory: 'envelopes',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            features: ['Custom Printing', 'Various Sizes', 'Premium Paper', 'Professional Look'],
            whatsappMessage: 'Hi! I\'m interested in Business Envelopes. Could you provide details for different sizes and quantities?'
          }
        ]
      },
      {
        id: 'lanyards',
        name: 'Lanyards',
        description: 'Custom printed lanyards for events and offices',
        products: [
          {
            id: 'custom-lanyards',
            name: 'Custom Lanyards',
            description: 'Personalized lanyards for events and identification',
            category: 'business-essentials',
            subcategory: 'lanyards',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            features: ['Custom Printing', 'Durable Material', 'Various Colors', 'Metal Clips'],
            whatsappMessage: 'Hi! I\'m interested in Custom Lanyards. Please provide details about customization options and bulk orders.'
          }
        ]
      },
      {
        id: 'id-cards',
        name: 'ID Cards',
        description: 'Paper ID cards for identification purposes',
        products: [
          {
            id: 'paper-id-cards',
            name: 'Paper ID Cards',
            description: 'Professional paper ID cards for employees and events',
            category: 'business-essentials',
            subcategory: 'id-cards',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            features: ['Custom Design', 'Photo Printing', 'Laminated Finish', 'Standard Size'],
            whatsappMessage: 'Hi! I\'m interested in Paper ID Cards. Could you provide details for bulk orders and design options?'
          }
        ]
      },
      {
        id: 'certificates',
        name: 'Custom Certificates',
        description: 'Professional certificates for awards and recognition',
        products: [
          {
            id: 'custom-certificates',
            name: 'Custom Certificates',
            description: 'Professional certificates for awards, achievements, and recognition',
            category: 'business-essentials',
            subcategory: 'certificates',
            image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
            features: ['Premium Paper', 'Custom Design', 'Gold Foil Options', 'Professional Layout'],
            whatsappMessage: 'Hi! I\'m interested in Custom Certificates. Please share details about paper options and design customization.'
          }
        ]
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
        products: [
          {
            id: 'wedding-invitations',
            name: 'Wedding Invitations',
            description: 'Elegant wedding invitation cards with custom designs',
            category: 'celebrations',
            subcategory: 'wedding-cards',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            features: ['Custom Design', 'Premium Paper', 'Multiple Formats', 'Elegant Finish'],
            whatsappMessage: 'Hi! I\'m interested in Wedding Invitations. Could you share design options and details?'
          },
          {
            id: 'save-the-date-cards',
            name: 'Save the Date Cards',
            description: 'Beautiful save the date cards for your special day',
            category: 'celebrations',
            subcategory: 'wedding-cards',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            features: ['Custom Design', 'Photo Integration', 'Premium Quality', 'Various Sizes'],
            whatsappMessage: 'Hi! I\'m interested in Save the Date Cards. Please provide design options and information.'
          },
          {
            id: 'thank-you-cards',
            name: 'Thank You Cards',
            description: 'Elegant thank you cards for wedding guests',
            category: 'celebrations',
            subcategory: 'wedding-cards',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            features: ['Personalized Message', 'Premium Paper', 'Elegant Design', 'Custom Colors'],
            whatsappMessage: 'Hi! I\'m interested in Thank You Cards. Could you share customization options?'
          }
        ]
      },
      {
        id: 'invitation-cards',
        name: 'Invitation Cards',
        description: 'Various invitation cards for different occasions',
        products: [
          {
            id: 'party-invitations',
            name: 'Party Invitations',
            description: 'Fun and colorful party invitation cards',
            category: 'celebrations',
            subcategory: 'invitation-cards',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            features: ['Colorful Design', 'Custom Theme', 'Premium Paper', 'Various Sizes'],
            whatsappMessage: 'Hi! I\'m interested in Party Invitations. Could you share theme options and details?'
          },
          {
            id: 'birthday-invitations',
            name: 'Birthday Invitations',
            description: 'Special birthday invitation cards for all ages',
            category: 'celebrations',
            subcategory: 'invitation-cards',
            image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop',
            features: ['Age-Specific Designs', 'Photo Integration', 'Colorful Themes', 'Custom Text'],
            whatsappMessage: 'Hi! I\'m interested in Birthday Invitations. Please provide age-specific design options.'
          }
        ]
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
        products: [
          {
            id: 'standees',
            name: 'Standees',
            description: 'Professional standees for events and promotions',
            category: 'marketing-material',
            subcategory: 'standees-posters',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['Durable Material', 'Full Color Print', 'Various Sizes', 'Easy Setup'],
            whatsappMessage: 'Hi! I\'m interested in Standees. Could you provide size options and details?'
          },
          {
            id: 'posters',
            name: 'Posters',
            description: 'High-quality posters for advertising and promotions',
            category: 'marketing-material',
            subcategory: 'standees-posters',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['High Resolution Print', 'Various Sizes', 'Premium Paper', 'Vibrant Colors'],
            whatsappMessage: 'Hi! I\'m interested in Posters. Please provide size options and information.'
          }
        ]
      },
      {
        id: 'banners-flyers',
        name: 'Banners & Flyers',
        description: 'Promotional banners and flyers for marketing',
        products: [
          {
            id: 'banners',
            name: 'Banners',
            description: 'Large format banners for outdoor and indoor advertising',
            category: 'marketing-material',
            subcategory: 'banners-flyers',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['Weather Resistant', 'Large Format', 'Vibrant Colors', 'Durable Material'],
            whatsappMessage: 'Hi! I\'m interested in Banners. Could you provide size options and material details?'
          },
          {
            id: 'flyers',
            name: 'Flyers',
            description: 'Promotional flyers for marketing campaigns',
            category: 'marketing-material',
            subcategory: 'banners-flyers',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['High Quality Print', 'Various Sizes', 'Premium Paper', 'Fast Turnaround'],
            whatsappMessage: 'Hi! I\'m interested in Flyers. Please provide details for different quantities and sizes.'
          }
        ]
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
        products: [
          {
            id: 'product-boxes',
            name: 'Product Boxes',
            description: 'Custom product packaging boxes',
            category: 'packaging',
            subcategory: 'boxes-bags',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['Custom Size', 'Brand Printing', 'Durable Material', 'Various Styles'],
            whatsappMessage: 'Hi! I\'m interested in Product Boxes. Could you provide custom sizing options?'
          },
          {
            id: 'shopping-bags',
            name: 'Shopping Bags',
            description: 'Custom printed shopping bags',
            category: 'packaging',
            subcategory: 'boxes-bags',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['Custom Printing', 'Eco-Friendly Options', 'Various Sizes', 'Strong Handles'],
            whatsappMessage: 'Hi! I\'m interested in Shopping Bags. Please provide material options and bulk details.'
          }
        ]
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
        products: [
          {
            id: 'photo-albums',
            name: 'Photo Albums',
            description: 'Custom photo albums for memories',
            category: 'gift-articles',
            subcategory: 'photo-products',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['Custom Cover', 'High Quality Pages', 'Various Sizes', 'Personal Design'],
            whatsappMessage: 'Hi! I\'m interested in Photo Albums. Could you provide customization options?'
          },
          {
            id: 'canvas-prints',
            name: 'Canvas Prints',
            description: 'High-quality canvas prints of your photos',
            category: 'gift-articles',
            subcategory: 'photo-products',
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
            features: ['Canvas Material', 'High Resolution', 'Various Sizes', 'Ready to Hang'],
            whatsappMessage: 'Hi! I\'m interested in Canvas Prints. Please provide size options and details.'
          }
        ]
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
        products: buildCakeTopperProducts('paper', 10)
      },
      {
        id: 'luxury-acrylic-cake-toppers',
        name: 'Luxury Acrylic Cake Toppers',
        description: '10 ready-made mirror/frosted acrylic toppers in premium finishes. No customization.',
        products: buildCakeTopperProducts('acrylic', 10)
      },
      {
        id: 'butterfly-decoration',
        name: 'Butterfly & Leaf Picks',
        description: 'Colorful butterfly accent kits to pair with toppers and celebration decor.',
        products: buildButterflyProducts(10)
      },
      {
        id: 'party-decor',
        name: 'Other Decorations',
        description: 'Decor kits that pair perfectly with toppers for a complete celebration look',
        products: [
          {
            id: 'balloon-bouquets',
            name: 'Balloon Bouquets & Garlands',
            description: 'Coordinated balloon sets with chrome, confetti, and number balloons',
            category: 'cake-decorations',
            subcategory: 'party-decor',
            image: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=600&h=400&fit=crop',
            features: ['Chrome + confetti mix', 'Optional name stickers', 'Includes strip and glue dots', 'Set-up guide included'],
            whatsappMessage: 'Hi! I need a balloon garland to match my cake topper theme. Please help with colors and sizes.',
            badges: ['Recommended'],
            isRecommended: true,
            stock: 80,
            createdAt: STATIC_CREATED_AT
          }
        ]
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
