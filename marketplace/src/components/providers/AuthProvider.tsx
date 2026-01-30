'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

const getStableId = (user: Partial<User>) => (user.id || user.email ? `email-${user.email?.toLowerCase()}` : 'guest')

interface User {
  id: string
  email: string
  name: string
  role?: 'customer' | 'admin'
  phone?: string
  address?: string
  isBusiness?: boolean
  businessName?: string
  gstNumber?: string
  password?: string
  token?: string
}

interface AuthContextType {
  user: User | null
  sendOtp: (email: string, purpose?: 'login' | 'signup') => Promise<boolean>
  verifyOtp: (email: string, otp: string, profile?: Partial<User>, purpose?: 'login' | 'signup') => Promise<{ ok: boolean; error?: string }>
  loginWithPassword: (email: string, password: string) => Promise<boolean>
  adminLogin: (email: string, password: string) => Promise<boolean>
  logout: () => void
  sendOtpForAccountDelete: () => Promise<boolean>
  deleteAccount: (otp: string) => Promise<boolean>
  updateUser: (data: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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

  const sendOtp = async (email: string, purpose: 'login' | 'signup' = 'login'): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      })
      return response.ok
    } catch (error) {
      console.error('Send OTP error:', error)
      return false
    }
  }

  const verifyOtp = async (email: string, otp: string, profile?: Partial<User>, purpose: 'login' | 'signup' = 'login'): Promise<{ ok: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose, ...profile }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        return { ok: false, error: payload.error || 'OTP verification failed.' }
      }
      const data = await response.json()
      const signedIn: User = {
        ...data.user,
        token: data.token,
        id: getStableId(data.user),
        role: data.user.role || 'customer',
      }
      setUser(signedIn)
      localStorage.setItem('user', JSON.stringify(signedIn))
      return { ok: true }
    } catch (error) {
      console.error('Verify OTP error:', error)
      return { ok: false, error: 'OTP verification failed.' }
    }
  }

  const loginWithPassword = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) return false
      const userData = await response.json()
      const signedIn: User = {
        ...userData.user,
        token: userData.token,
        id: getStableId(userData.user),
        role: userData.user.role || 'customer',
      }
      setUser(signedIn)
      localStorage.setItem('user', JSON.stringify(signedIn))
      return true
    } catch (error) {
      console.error('Password login error:', error)
      return false
    }
  }


  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!response.ok) return false
      const userData = await response.json()
      const signedIn: User = {
        ...userData.user,
        token: userData.token,
        id: getStableId(userData.user),
        role: userData.user.role || 'admin',
      }
      setUser(signedIn)
      localStorage.setItem('user', JSON.stringify(signedIn))
      return true
    } catch (error) {
      console.error('Admin login error:', error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const sendOtpForAccountDelete = async (): Promise<boolean> => {
    if (!user?.email) return false
    try {
      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, purpose: 'delete' }),
      })
      return response.ok
    } catch (error) {
      console.error('Send delete OTP error:', error)
      return false
    }
  }

  const deleteAccount = async (otp: string): Promise<boolean> => {
    if (!user || user.role === 'admin') return false
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: user.token ? `Bearer ${user.token}` : '' },
        body: JSON.stringify({ email: user.email, otp }),
      })
      if (!response.ok) {
        return false
      }
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
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ user, sendOtp, verifyOtp, loginWithPassword, adminLogin, logout, sendOtpForAccountDelete, deleteAccount, updateUser, isLoading }}>
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
