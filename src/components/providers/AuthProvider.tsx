'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { sendSignInLinkToEmail, type ActionCodeSettings } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase-client'

const getStableId = (user: Partial<User>) => (user.id ? user.id : user.email ? `email-${user.email?.toLowerCase()}` : 'guest')

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
  signInWithEmailLink: (email: string) => Promise<{ ok: boolean; error?: string }>
  loginWithPassword: (email: string, password: string) => Promise<boolean>
  adminLogin: (email: string, password: string) => Promise<boolean>
  registerWithPassword: (input: {
    email: string
    password: string
    name: string
    phone?: string
    address?: string
    isBusiness?: boolean
    businessName?: string
    gstNumber?: string
  }) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  deleteAccount: (password: string) => Promise<boolean>
  updateUser: (data: Partial<User>) => void
  setUser: (user: User | null) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Where the email link should land the user. In dev we point at
// localhost; in production we use the canonical www. host. Firebase
// Auth requires the host to be in the project's "Authorized domains"
// list — see the deployment notes in the plan.
const getContinueUrl = () => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/auth/finish`
}

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

  // Magic-link sign-in. We call Firebase's sendSignInLinkToEmail with
  // a continueUrl pointing at /auth/finish; the user clicks the link in
  // their email, lands on the finish page, and that page calls
  // signInWithEmailLink + POSTs the ID token to /api/auth/firebase/session
  // to exchange it for our own JWT.
  //
  // We stash the email in localStorage under the Firebase-documented
  // `emailForSignIn` key so the finish page can find it without us
  // threading it through the URL (the link only carries an oobCode).
  const signInWithEmailLink = async (email: string): Promise<{ ok: boolean; error?: string }> => {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return { ok: false, error: 'Enter your email address.' }
    try {
      const auth = getFirebaseAuth()
      const actionCodeSettings: ActionCodeSettings = {
        url: getContinueUrl(),
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(auth, trimmed, actionCodeSettings)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('emailForSignIn', trimmed)
      }
      return { ok: true }
    } catch (err: any) {
      // Surface the most useful Firebase error messages without
      // dumping the entire SDK error to the user.
      const code: string = err?.code || ''
      const message =
        code === 'auth/invalid-email'
          ? 'That email address is not valid.'
          : code === 'auth/too-many-requests'
            ? 'Too many requests. Please wait a minute and try again.'
            : code === 'auth/network-request-failed'
              ? 'Network error. Check your connection and try again.'
              : err?.message || 'Could not send the sign-in link. Please try again.'
      return { ok: false, error: message }
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

  // Password-based registration. Hits /api/auth/register-with-password
  // (CSRF-protected; we pre-fetch the token via /api/auth/csrf on
  // mount — see proxy.ts which also seeds the cookie).
  const registerWithPassword = async (input: {
    email: string
    password: string
    name: string
    phone?: string
    address?: string
    isBusiness?: boolean
    businessName?: string
    gstNumber?: string
  }): Promise<{ ok: boolean; error?: string }> => {
    try {
      let csrfToken: string | null = null
      if (typeof document !== 'undefined') {
        const match = document.cookie
          .split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('x-csrf='))
        if (match) csrfToken = match.slice('x-csrf='.length)
        if (!csrfToken) {
          try {
            await fetch('/api/auth/csrf', { credentials: 'same-origin' })
            const after = document.cookie
              .split(';')
              .map((c) => c.trim())
              .find((c) => c.startsWith('x-csrf='))
            if (after) csrfToken = after.slice('x-csrf='.length)
          } catch {
            // Non-fatal: the route also accepts unauthenticated POSTs since
            // the user doesn't have a session yet, but the proxy may still
            // 403 us. We try anyway.
          }
        }
      }

      const response = await fetch('/api/auth/register-with-password', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify(input),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        return { ok: false, error: payload.error || 'Sign-up failed.' }
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
      console.error('Register error:', error)
      return { ok: false, error: 'Sign-up failed. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const deleteAccount = async (password: string): Promise<boolean> => {
    if (!user || user.role === 'admin') return false
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: user.token ? `Bearer ${user.token}` : '' },
        body: JSON.stringify({ confirm: 'DELETE', password }),
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

  // setUser lets external flows (e.g. /auth/finish after a magic-link
  // exchange) push a fully-formed user object into context. We mirror
  // it to localStorage so a page reload doesn't drop the session.
  const setSessionUser = (next: User | null) => {
    if (next) {
      const normalized: User = { ...next, id: getStableId(next), role: next.role || 'customer' }
      localStorage.setItem('user', JSON.stringify(normalized))
      setUser(normalized)
    } else {
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, signInWithEmailLink, loginWithPassword, adminLogin, registerWithPassword, logout, deleteAccount, updateUser, setUser: setSessionUser, isLoading }}>
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
