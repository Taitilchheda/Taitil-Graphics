'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  image: string
  category: string
  description?: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  likedProducts: Product[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleLike: (product: Product) => void
  isLiked: (productId: string) => boolean
  cartTotal: number
  cartItemCount: number
  likedItemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [likedProducts, setLikedProducts] = useState<Product[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('taitil-cart')
    const savedLikes = localStorage.getItem('taitil-likes')
    
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
    
    if (savedLikes) {
      try {
        setLikedProducts(JSON.parse(savedLikes))
      } catch (error) {
        console.error('Error loading likes from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('taitil-cart', JSON.stringify(cartItems))
  }, [cartItems])

  // Save likes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('taitil-likes', JSON.stringify(likedProducts))
  }, [likedProducts])

  const addToCart = (product: Product, quantity: number = 1) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const toggleLike = (product: Product) => {
    setLikedProducts(prev => {
      const isAlreadyLiked = prev.some(item => item.id === product.id)
      if (isAlreadyLiked) {
        return prev.filter(item => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const isLiked = (productId: string) => {
    return likedProducts.some(item => item.id === productId)
  }

  const cartTotal = 0 // Pricing removed - contact for quotes
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const likedItemCount = likedProducts.length

  const value: CartContextType = {
    cartItems,
    likedProducts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleLike,
    isLiked,
    cartTotal,
    cartItemCount,
    likedItemCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
