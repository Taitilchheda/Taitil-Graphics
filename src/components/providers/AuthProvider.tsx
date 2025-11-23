'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role?: 'customer' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
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
      setUser(JSON.parse(savedUser))
    }
    if (savedDb) {
      try {
        setUserDb(JSON.parse(savedDb))
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
      const found = userDb.find((u) => u.email === email && (u as any).password === password)
      if (found) {
        setUser(found)
        localStorage.setItem('user', JSON.stringify(found))
        return true
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const userData = await response.json()
        const signedIn: User = { ...userData.user, role: userData.user.role || 'customer' }
        // Cache credentials locally for recurring users
        const cachedUser: User = { ...signedIn, ...(password ? { password } : {}) } as any
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
          registeredUser = { ...userData.user, role: userData.user.role || 'customer' }
        }
      } catch (apiErr) {
        console.error('API registration failed, falling back to local:', apiErr)
      }

      if (!registeredUser) {
        const exists = userDb.find((u) => u.email === email)
        if (exists) return false
        registeredUser = {
          id: `user-${Date.now()}`,
          email,
          name,
          role: 'customer',
          // @ts-expect-error local-only password storage
          password,
        }
      }

      const nextDb = [...userDb.filter((u) => u.email !== registeredUser!.email), registeredUser]
      persistDb(nextDb)
      setUser(registeredUser)
      localStorage.setItem('user', JSON.stringify(registeredUser))
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

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
