'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Mail, Lock, ShieldCheck, Store } from 'lucide-react'

// Login supports email-OTP for retailer accounts (the path the user
// asked for: enter email, receive a 6-digit code, type it in) and
// password for the admin. We proxy the OTP request to the upstream
// at OTP_SERVICE_URL (sauravhathi/otp-service deployed on Vercel),
// which actually sends the email. We do not store any OTP locally.

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [linkPending, setLinkPending] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mode, setMode] = useState<'retailer' | 'admin'>('retailer')
  const [usePasswordLogin, setUsePasswordLogin] = useState(false)

  const { sendOtp, verifyOtp, loginWithPassword, adminLogin } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

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
      if (usePasswordLogin) {
        if (!password) {
          setError('Enter your password to continue.')
          setIsLoading(false)
          return
        }
        ok = await loginWithPassword(email, password)
        if (!ok) {
          setError('Invalid email or password.')
        }
      } else {
        if (!otp) {
          setError('Enter the 6-digit OTP sent to your email.')
          setIsLoading(false)
          return
        }
        const result = await verifyOtp(email, otp, undefined, 'login')
        if (!result.ok) {
          setError(result.error || 'OTP verification failed. Please try again.')
        }
        ok = result.ok
      }
    }

    if (ok) {
      const next = searchParams.get('next') || (mode === 'admin' ? '/admin' : '/')
      const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/'
      router.push(safeNext)
    }

    setIsLoading(false)
  }

  const handleSendOtp = async () => {
    setError('')
    setSuccess('')
    if (!email) {
      setError('Please enter your email first.')
      return
    }
    setLinkPending(true)
    const result = await sendOtp(email, 'login')
    setLinkPending(false)
    if (!result.ok) {
      setError(result.error || 'Unable to send OTP. Please try again.')
    } else {
      setSuccess(result.message || 'OTP sent to your email.')
    }
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

          <form onSubmit={handleSubmit} className="space-y-6">
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

            {mode === 'retailer' && (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{usePasswordLogin ? 'Password login' : 'Email OTP'}</div>
                    <p className="text-sm text-gray-600">{usePasswordLogin ? 'Sign in with your account password.' : 'We will email a 6-digit one-time password to your registered email.'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUsePasswordLogin(!usePasswordLogin)}
                    className="text-xs font-semibold text-primary-700 hover:text-primary-800"
                  >
                    {usePasswordLogin ? 'Use OTP instead' : 'Use password instead'}
                  </button>
                </div>
                {!usePasswordLogin && (
                  <>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={linkPending}
                        className="rounded-lg border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:opacity-50"
                      >
                        {linkPending ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="input-field"
                        placeholder="6-digit code"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {(mode === 'admin' || usePasswordLogin) && (
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
                    required={mode === 'admin' || usePasswordLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            )}

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
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

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
