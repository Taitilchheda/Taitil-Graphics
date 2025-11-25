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
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  deleteAccount: () => Promise<boolean>
  updateUser: (data: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ADMIN_EMAIL = 'admin@taitil.graphics'
const ADMIN_PASSWORD = 'Taitil@Admin2024'
const LOCAL_USER_KEY = 'taitil-user-db'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userDb, setUserDb] = useState<User[]>([])

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    const savedDb = localStorage.getItem(LOCAL_USER_KEY)
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
    if (savedDb) {
      try {
        const parsedDb: User[] = JSON.parse(savedDb)
        const normalizedDb = parsedDb.map((u) => ({ ...u, id: getStableId(u), role: u.role || 'customer' }))
        setUserDb(normalizedDb)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(normalizedDb))
      } catch (error) {
        console.error('Error parsing user database:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const persistDb = (next: User[]) => {
    setUserDb(next)
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(next))
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Admin hardcoded credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = { id: 'admin', email, name: 'Administrator', role: 'admin' }
        setUser(adminUser)
        localStorage.setItem('user', JSON.stringify(adminUser))
        return true
      }

      // Local retailer DB first (offline friendly)
      const found = userDb.find((u) => u.email === email && u.password === password)
      if (found) {
        const normalized = { ...found, id: getStableId(found), role: found.role || 'customer' }
        setUser(normalized)
        localStorage.setItem('user', JSON.stringify(normalized))
        return true
      }

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
        // Cache credentials locally for recurring users
        const cachedUser: User = { ...signedIn, ...(password ? { password } : {}) }
        persistDb([...userDb.filter((u) => u.email !== email), cachedUser])
        setUser(cachedUser)
        localStorage.setItem('user', JSON.stringify(cachedUser))
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      // Admin cannot be registered through UI
      if (email === ADMIN_EMAIL) {
        return false
      }

      let registeredUser: User | null = null

      // Try API; if it works, also cache locally
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        })

        if (response.ok) {
          const userData = await response.json()
          registeredUser = { ...userData.user, role: userData.user.role || 'customer', password }
        }
      } catch (apiErr) {
        console.error('API registration failed, falling back to local:', apiErr)
      }

      if (!registeredUser) {
        const exists = userDb.find((u) => u.email === email)
        if (exists) return false
        registeredUser = {
          id: getStableId({ email }),
          email,
          name,
          role: 'customer',
          // @ts-expect-error local-only password storage
          password,
        }
      }

      const normalizedUser = { ...registeredUser, id: getStableId(registeredUser) }
      const nextDb = [...userDb.filter((u) => u.email !== normalizedUser.email), normalizedUser]
      persistDb(nextDb)
      setUser(normalizedUser)
      localStorage.setItem('user', JSON.stringify(normalizedUser))
      return true
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
