'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Mail, Lock, ShieldCheck, Store, CheckCircle2 } from 'lucide-react'

// Login supports email magic links (Firebase Auth passwordless sign-in)
// for retailer accounts, and a password-based path for the admin. The
// admin can also use a magic link — the same email-link flow is wired
// to the admin email (admin@taitil.graphics) in /api/auth/firebase/session
// and the server promotes that email to the ADMIN role on the way in.
//
// What changed: the previous version used a phone-OTP flow that called
// a dead upstream service. It's been removed entirely; see
// src/lib/otp.ts and src/app/api/auth/otp/* (deleted in the same
// commit). Password sign-in is the only fallback — anyone whose email
// isn't reachable can still sign up with a password at /auth/register.

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [linkPending, setLinkPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState<'retailer' | 'admin'>('retailer')

  const { signInWithEmailLink, adminLogin, loginWithPassword } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!email) {
      setError('Enter your email to receive a sign-in link.')
      return
    }
    setLinkPending(true)
    const result = await signInWithEmailLink(email)
    setLinkPending(false)
    if (!result.ok) {
      setError(result.error || 'Could not send the sign-in link.')
      return
    }
    setSuccess(
      'Sign-in link sent. Check your email (and the spam folder) for a message from Firebase — click the link to sign in.',
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    let ok = false
    if (mode === 'admin') {
      ok = await adminLogin(email, password)
      if (!ok) {
        setError('Invalid credentials. For admin, use your assigned email and password.')
      }
    } else {
      // Retailer path: password login is the only password-based option
      // now. Magic-link sign-in happens in two clicks — first "Send
      // sign-in link" above, then clicking the link in the email.
      if (!password) {
        setError('Enter your password to continue, or use the magic-link button above.')
        setIsLoading(false)
        return
      }
      ok = await loginWithPassword(email, password)
      if (!ok) {
        setError('Invalid email or password.')
      }
    }

    if (ok) {
      const next = searchParams.get('next') || (mode === 'admin' ? '/admin' : '/')
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
      router.push(safeNext)
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 text-sm mb-4">
              <button
                type="button"
                onClick={() => setMode('retailer')}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 ${mode === 'retailer' ? 'bg-white shadow text-primary-700' : 'text-gray-500'}`}
              >
                <Store className="w-4 h-4" />
                <span>Retailer Login</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('admin')}
                className={`px-4 py-2 rounded-full flex items-center space-x-2 ${mode === 'admin' ? 'bg-white shadow text-primary-700' : 'text-gray-500'}`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Login</span>
              </button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {mode === 'admin' ? 'Admin Access' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {mode === 'admin' ? 'Secure login for Taitil Graphics admin' : 'Sign in to your retailer account'}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder={mode === 'admin' ? 'Admin email' : 'Enter your email'}
                  required
                />
              </div>
            </div>

            {mode === 'retailer' ? (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-gray-700">
                    <div className="font-semibold text-gray-900">Passwordless sign-in</div>
                    <p>We&apos;ll email you a one-tap sign-in link — no password to remember.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSendLink}
                  disabled={linkPending || !email}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Mail className="w-4 h-4" />
                  {linkPending ? 'Sending link…' : 'Send sign-in link'}
                </button>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative flex items-center">
                <div className="grow border-t border-gray-200" />
                <span className="mx-3 shrink-0 text-xs uppercase tracking-wide text-gray-400">
                  or use a password
                </span>
                <div className="grow border-t border-gray-200" />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Enter your password"
                    required={mode === 'admin'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? 'Lock' : 'unlock'}
                  </button>
                </div>
                {mode === 'retailer' ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Optional for retailers — only fill this in if you&apos;ve set a password via{' '}
                    <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 underline">
                      sign-up
                    </Link>
                    .
                  </p>
                ) : null}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          {mode === 'retailer' && (
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign up
                </Link>
              </p>
              <p className="text-xs text-gray-500 block mt-1">
                Your credentials are securely stored for retailer access.
              </p>
            </div>
          )}

          {mode === 'admin' && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Admin signup is disabled. Use the credentials shared with you to access the dashboard.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100" />}>
      <LoginPageContent />
    </Suspense>
  )
}
