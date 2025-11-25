'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const getStableId = (user: Partial<User>) => user.id || user.email ? `email-${user.email?.toLowerCase()}` : 'guest'

interface User {
  id: string
  email: string
  name: string
  password?: string
  role?: 'customer' | 'admin'
  phone?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string, phone?: string, address?: string) => Promise<boolean>
  logout: () => void
  deleteAccount: () => Promise<boolean>
  updateUser: (data: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        const parsed: User = JSON.parse(savedUser)
        const normalized: User = { ...parsed, id: getStableId(parsed), role: parsed.role || 'customer' }
        setUser(normalized)
        localStorage.setItem('user', JSON.stringify(normalized))
      } catch {
        setUser(null)
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        const signedIn: User = {
          ...userData.user,
          id: getStableId(userData.user),
          role: userData.user.role || 'customer',
        }
        setUser(signedIn)
        localStorage.setItem('user', JSON.stringify(signedIn))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string, phone?: string, address?: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, phone, address }),
      })

      if (response.ok) {
        const userData = await response.json()
        const registeredUser: User = {
          ...userData.user,
          id: getStableId(userData.user),
          role: userData.user.role || 'customer',
        }
        setUser(registeredUser)
        localStorage.setItem('user', JSON.stringify(registeredUser))
        return true
      }
      return false
    } catch (error) {
      console.error('Registration error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const deleteAccount = async (): Promise<boolean> => {
    if (!user || user.role === 'admin') return false
    try {
      try {
        await fetch('/api/auth/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        })
      } catch (err) {
        console.warn('API delete account not available, falling back to local removal')
      }

      const nextDb = userDb.filter((u) => u.email !== user.email)
      persistDb(nextDb)
      setUser(null)
      localStorage.removeItem('user')
      localStorage.removeItem(`taitil-cart-${getStableId(user)}`)
      localStorage.removeItem(`taitil-likes-${getStableId(user)}`)
      return true
    } catch (err) {
      console.error('Failed to delete account', err)
      return false
    }
  }

  const updateUser = (data: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next: User = { ...prev, ...data }
      localStorage.setItem('user', JSON.stringify(next))
      // Keep local DB in sync for retailer accounts
      const updatedDb = userDb.map((u) => (u.id === prev.id ? { ...u, ...data } : u))
      persistDb(updatedDb)
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
