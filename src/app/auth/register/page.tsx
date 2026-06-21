'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/providers/AuthProvider'
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [isBusiness, setIsBusiness] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [gstNumber, setGstNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { registerWithPassword, logout, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      logout()
    }
  }, [logout, user])

  // Surface password rules as the user types so they don't submit and
  // discover the failure. Mirrors the server-side Zod constraints in
  // registerBodySchema.
  const passwordRules = {
    length: password.length >= 10,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
  }
  const passwordOk = Object.values(passwordRules).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (!passwordOk) {
      setError('Password must be 10+ characters with lowercase, uppercase, and a digit.')
      setIsLoading(false)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsLoading(false)
      return
    }

    const result = await registerWithPassword({
      email: email.trim(),
      password,
      name: name.trim(),
      phone: phone.trim() || undefined,
      address: address.trim() || undefined,
      isBusiness,
      businessName: isBusiness ? businessName.trim() || undefined : undefined,
      gstNumber: isBusiness ? gstNumber.trim() || undefined : undefined,
    })

    if (result.ok) {
      setSuccess('Account created. You are now signed in.')
      setTimeout(() => router.push('/'), 800)
    } else {
      setError(result.error || 'Sign-up failed. Please try again.')
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 flex items-start lg:items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full">
        <div className="card">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">
              Join as a retailer to manage your orders and favourites. Orders are confirmed
              over WhatsApp — account is optional.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="space-y-4">
              <div className="text-sm font-semibold text-gray-900">Account details</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Create a password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Create a password"
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

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field pl-10 pr-10"
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
              </div>

              {password.length > 0 && (
                <ul className="grid gap-1 text-xs text-gray-600">
                  <li className={passwordRules.length ? 'text-emerald-600' : ''}>
                    {passwordRules.length ? '✓' : '○'} At least 10 characters
                  </li>
                  <li className={passwordRules.lower ? 'text-emerald-600' : ''}>
                    {passwordRules.lower ? '✓' : '○'} One lowercase letter
                  </li>
                  <li className={passwordRules.upper ? 'text-emerald-600' : ''}>
                    {passwordRules.upper ? '✓' : '○'} One uppercase letter
                  </li>
                  <li className={passwordRules.digit ? 'text-emerald-600' : ''}>
                    {passwordRules.digit ? '✓' : '○'} One digit
                  </li>
                </ul>
              )}
            </section>

            <section className="space-y-4">
              <div className="text-sm font-semibold text-gray-900">Contact details (optional)</div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field pl-10"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Used only for delivery contact.</p>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="input-field pl-10 min-h-[80px]"
                      placeholder="Full address"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={isBusiness}
                  onChange={(e) => setIsBusiness(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                I have a business (GST)
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="input-field"
                    placeholder="Your business name"
                    disabled={!isBusiness}
                  />
                </div>
                <div>
                  <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number
                  </label>
                  <input
                    id="gstNumber"
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="input-field"
                    placeholder="GSTIN"
                    disabled={!isBusiness}
                  />
                </div>
              </div>
            </section>

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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Prefer no password? Sign in with a magic link from the login page.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
