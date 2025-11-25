'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { loadUserState, writeUserState } from '@/lib/userStateStore'

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
  const { user } = useAuth()

  const profileKey = useMemo(() => {
    if (user?.role === 'admin') return 'admin'
    if (user?.id) return user.id
    if (user?.email) return `email-${user.email.toLowerCase()}`
    return 'guest'
  }, [user?.email, user?.id, user?.role])

  // Load data for current user (includes migration from legacy keys)
  useEffect(() => {
    if (user?.role === 'admin') {
      setCartItems([])
      setLikedProducts([])
      return
    }

    const state = loadUserState(profileKey)
    setCartItems(state.cart || [])
    setLikedProducts(state.likes || [])

    // migrate legacy shared keys only once per user profile
    const legacyCart = localStorage.getItem('taitil-cart')
    const legacyLikes = localStorage.getItem('taitil-likes')
    if (legacyCart || legacyLikes) {
      const migratedCart = state.cart && state.cart.length ? state.cart : legacyCart ? JSON.parse(legacyCart) : []
      const migratedLikes = state.likes && state.likes.length ? state.likes : legacyLikes ? JSON.parse(legacyLikes) : []
      writeUserState(profileKey, { cart: migratedCart, likes: migratedLikes })
      if (legacyCart) localStorage.removeItem('taitil-cart')
      if (legacyLikes) localStorage.removeItem('taitil-likes')
      setCartItems(migratedCart)
      setLikedProducts(migratedLikes)
    }
  }, [profileKey, user?.role])

  // Persist combined state per user (non-admin only)
  useEffect(() => {
    if (user?.role === 'admin') return
    writeUserState(profileKey, { cart: cartItems, likes: likedProducts })
  }, [cartItems, likedProducts, profileKey, user?.role])

  // Clear state on logout to avoid flashing previous user data
  useEffect(() => {
    if (!user) {
      setCartItems([])
      setLikedProducts([])
    }
  }, [user])

  const addToCart = (product: Product, quantity: number = 1) => {
    if (user?.role === 'admin') return
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
    if (user?.role === 'admin') return
    setCartItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (user?.role === 'admin') return
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
    if (user?.role === 'admin') return
    setCartItems([])
  }

  const toggleLike = (product: Product) => {
    if (user?.role === 'admin') return
    setLikedProducts(prev => {
      const isAlreadyLiked = prev.some(item => item.id === product.id)
      if (isAlreadyLiked) {
        return prev.filter(item => item.id !== product.id)
      }
      return [...prev, product]
    })
  }

  const isLiked = (productId: string) => {
    if (user?.role === 'admin') return false
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
