// Database models and types for the application
// In production, replace with actual database implementation (Prisma, MongoDB, etc.)

export interface User {
  id: string
  email: string
  name: string
  password: string
  phone?: string
  address?: string
  role: 'customer' | 'admin'
  createdAt: Date
  updatedAt: Date
  isActive: boolean
  emailVerified: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  longDescription?: string
  image: string
  images: string[]
  price: string
  priceValue: number
  compareAtPrice?: number
  rating: number
  reviews: number
  category: string
  subcategory?: string
  features: string[]
  specifications?: Record<string, string>
  tags: string[]
  sku: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
  seoTitle?: string
  seoDescription?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Order {
  id: string
  userId: string
  orderNumber: string
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  tax: number
  shipping: number
  total: number
  shippingAddress: Address
  billingAddress: Address
  paymentMethod: string
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  notes?: string
  createdAt: Date
  updatedAt: Date
  estimatedDelivery?: Date
  trackingNumber?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
  total: number
  customizations?: Record<string, any>
}

export interface Address {
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderType: 'user' | 'admin'
  message: string
  messageType: 'text' | 'image' | 'file'
  attachments?: string[]
  isRead: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  userId: string
  adminId?: string
  status: 'open' | 'closed' | 'pending'
  subject?: string
  priority: 'low' | 'medium' | 'high'
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface Enquiry {
  id: string
  userId?: string
  productId?: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'closed'
  source: 'website' | 'whatsapp' | 'email' | 'phone'
  assignedTo?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title: string
  comment: string
  isVerified: boolean
  isApproved: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Wishlist {
  id: string
  userId: string
  productId: string
  createdAt: Date
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}

export interface CartItem {
  id: string
  productId: string
  quantity: number
  customizations?: Record<string, any>
  addedAt: Date
}

// Mock database implementation
class MockDatabase {
  private users: User[] = []
  private products: Product[] = []
  private categories: Category[] = []
  private orders: Order[] = []
  private chatMessages: ChatMessage[] = []
  private conversations: Conversation[] = []
  private enquiries: Enquiry[] = []
  private reviews: Review[] = []
  private wishlists: Wishlist[] = []
  private carts: Cart[] = []

  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.users.push(user)
    return user
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null
  }

  // Product methods
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const product: Product = {
      ...productData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.products.push(product)
    return product
  }

  async getProducts(filters?: any): Promise<Product[]> {
    return this.products.filter(product => product.isActive)
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find(product => product.id === id) || null
  }

  // Order methods
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'orderNumber'>): Promise<Order> {
    const order: Order = {
      ...orderData,
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.orders.push(order)
    return order
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter(order => order.userId === userId)
  }

  // Chat methods
  async createConversation(conversationData: Omit<Conversation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conversation> {
    const conversation: Conversation = {
      ...conversationData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.conversations.push(conversation)
    return conversation
  }

  async getConversationsByUserId(userId: string): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.userId === userId)
  }

  async createChatMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...messageData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.chatMessages.push(message)
    return message
  }

  async getChatMessagesByConversationId(conversationId: string): Promise<ChatMessage[]> {
    return this.chatMessages.filter(msg => msg.conversationId === conversationId)
  }

  async markMessagesAsRead(conversationId: string, messageIds?: string[]): Promise<void> {
    this.chatMessages = this.chatMessages.map(msg => {
      if (msg.conversationId === conversationId && (!messageIds || messageIds.includes(msg.id))) {
        return { ...msg, isRead: true }
      }
      return msg
    })
  }

  // Enquiry methods
  async createEnquiry(enquiryData: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt'>): Promise<Enquiry> {
    const enquiry: Enquiry = {
      ...enquiryData,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.enquiries.push(enquiry)
    return enquiry
  }

  async getEnquiries(filters?: any): Promise<Enquiry[]> {
    return this.enquiries
  }

  async getActiveConversations(): Promise<Conversation[]> {
    return this.conversations.filter(conv => conv.status === 'open')
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `ORD-${timestamp}-${random}`
  }
}

// Export singleton instance
export const db = new MockDatabase()

// Validation schemas (using Joi-like structure)
export const userValidation = {
  email: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  password: (password: string) => password.length >= 6,
  name: (name: string) => name.trim().length >= 2
}

export const productValidation = {
  name: (name: string) => name.trim().length >= 3,
  price: (price: number) => price > 0,
  description: (description: string) => description.trim().length >= 10
}
