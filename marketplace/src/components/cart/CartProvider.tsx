'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'

interface CartItem {
  id: string
  productId: string
  name: string
  image: string
  price: number
  quantity: number
  customizations?: Record<string, any>
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: Omit<CartItem, 'id'>) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (newItem: Omit<CartItem, 'id'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(
        item => item.productId === newItem.productId && 
        JSON.stringify(item.customizations) === JSON.stringify(newItem.customizations)
      )

      if (existingItem) {
        return prevItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        const id = Math.random().toString(36).substr(2, 9)
        return [...prevItems, { ...newItem, id }]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const openCart = () => setIsOpen(true)
  const closeCart = () => setIsOpen(false)

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const total = items.reduce((total, item) => total + (item.price * item.quantity), 0)

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      total,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isOpen,
      openCart,
      closeCart
    }}>
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
