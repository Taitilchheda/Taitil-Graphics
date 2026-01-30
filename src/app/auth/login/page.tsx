'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Store } from 'lucide-react'

export default function LoginPage() {
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

  const { adminLogin, sendOtp, verifyOtp, loginWithPassword } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    let success = false
    let result: { ok: boolean; error?: string } | undefined
    if (mode === 'admin') {
      success = await adminLogin(email, password)
    } else {
      if (usePasswordLogin) {
        if (!password) {
          setError('Enter your password to continue.')
          setIsLoading(false)
          return
        }
        success = await loginWithPassword(email, password)
      } else {
        if (!otp) {
          setError('Enter the OTP sent to your email.')
          setIsLoading(false)
          return
        }
        result = await verifyOtp(email, otp, undefined, 'login')
        success = result.ok
      }
    }

    if (success) {
      router.push(mode === 'admin' ? '/admin' : '/')
    } else {
      setError(mode === 'admin' ? 'Invalid credentials. For admin, use your assigned email and password.' : (usePasswordLogin ? 'Invalid email or password.' : (typeof result !== 'undefined' && !result.ok ? (result.error || 'OTP verification failed. Please try again.') : 'OTP verification failed. Please try again.')))
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
    const ok = await sendOtp(email, 'login')
    setLinkPending(false)
    if (!ok) {
      setError('Unable to send OTP. Please try again.')
    } else {
      setSuccess('OTP sent to verified email id.')
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
                    <p className="text-sm text-gray-600">{usePasswordLogin ? 'Sign in with your account password.' : 'We will send a one-time password to your email.'}</p>
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
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
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
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                <span className="text-xs text-gray-500 block mt-1">Your credentials are securely stored for retailer access.</span>
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
