'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Store } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'retailer' | 'admin'>('retailer')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const success = await login(email, password)
    
    if (success) {
      router.push(mode === 'admin' ? '/admin' : '/')
    } else {
      setError('Invalid credentials. For admin, use your assigned email and password.')
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

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
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
                  Don't have an account?{' '}
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
