'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import Header from '@/components/layout/Header'
import { User, Mail, Phone, MapPin, Edit, Save, Trash2, Package, ShieldCheck, MessageCircle } from 'lucide-react'
import Link from 'next/link'

export default function AccountPage() {
  const { user, logout, updateUser, deleteAccount, sendOtpForAccountDelete } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteOtp, setDeleteOtp] = useState('')
  const [deleteStatus, setDeleteStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [passwordOtp, setPasswordOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordPending, setPasswordPending] = useState(false)
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    isBusiness: user?.isBusiness || false,
    businessName: user?.businessName || '',
    gstNumber: user?.gstNumber || '',
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        isBusiness: user.isBusiness || false,
        businessName: user.businessName || '',
        gstNumber: user.gstNumber || '',
      })
    }
  }, [user])

  useEffect(() => {
    if (!user?.token) return
    let cancelled = false
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/account/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        if (!res.ok) return
        const payload = await res.json()
        if (!payload?.user || cancelled) return
        updateUser(payload.user)
        setFormData({
          name: payload.user.name || '',
          email: payload.user.email || user.email || '',
          phone: payload.user.phone || '',
          address: payload.user.address || '',
          isBusiness: payload.user.isBusiness || false,
          businessName: payload.user.businessName || '',
          gstNumber: payload.user.gstNumber || '',
        })
      } catch (err) {
        console.error('Failed to load profile', err)
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [user?.token])

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Required</h1>
            <p className="text-lg text-gray-600 mb-8">Please sign in to view your account.</p>
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleSave = async () => {
    if (!user?.token) return
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          isBusiness: formData.isBusiness,
          businessName: formData.businessName,
          gstNumber: formData.gstNumber,
        }),
      })
      if (!res.ok) {
        throw new Error('Unable to update profile')
      }
      const payload = await res.json().catch(() => ({}))
      if (payload.user) {
        updateUser(payload.user)
      }
      setIsEditing(false)
      setStatus({ type: 'success', message: 'Profile updated successfully.' })
    } catch (err) {
      console.error(err)
      setStatus({ type: 'error', message: 'Unable to update profile. Please try again.' })
    }
  }

  const handleDelete = async () => {
    if (!user || user.role === 'admin') return
    setDeleteStatus(null)
    if (!deleteOtp) {
      setDeleteStatus({ type: 'error', message: 'Enter the OTP sent to your email.' })
      return
    }
    const confirmed = window.confirm('Delete your account permanently? This cannot be undone.')
    if (!confirmed) return
    setIsDeleting(true)
    const ok = await deleteAccount(deleteOtp)
    setIsDeleting(false)
    if (ok) {
      setDeleteStatus({ type: 'success', message: 'Account deleted successfully.' })
      window.location.href = '/'
    } else {
      setDeleteStatus({ type: 'error', message: 'Unable to delete account. Check OTP and try again.' })
    }
  }

  const handleSendDeleteOtp = async () => {
    if (!user) return
    setDeleteStatus(null)
    const ok = await sendOtpForAccountDelete()
    if (ok) {
      setDeleteStatus({ type: 'success', message: 'OTP sent to your email.' })
    } else {
      setDeleteStatus({ type: 'error', message: 'Unable to send OTP. Please try again.' })
    }
  }

  const handleSendPasswordOtp = async () => {
    if (!user?.email) return
    setPasswordStatus(null)
    setPasswordPending(true)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, purpose: 'password' }),
      })
      if (!res.ok) {
        setPasswordStatus({ type: 'error', message: 'Unable to send OTP. Try again.' })
      } else {
        setPasswordStatus({ type: 'success', message: 'OTP sent to your email.' })
      }
    } catch (err) {
      console.error(err)
      setPasswordStatus({ type: 'error', message: 'Unable to send OTP. Try again.' })
    } finally {
      setPasswordPending(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!user?.token || !user?.email) return
    setPasswordStatus(null)

    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Password must be at least 6 characters.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Passwords do not match.' })
      return
    }
    if (!passwordOtp) {
      setPasswordStatus({ type: 'error', message: 'Enter the OTP sent to your email.' })
      return
    }

    setPasswordPending(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ email: user.email, otp: passwordOtp, newPassword }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}))
        setPasswordStatus({ type: 'error', message: payload.error || 'Unable to update password.' })
      } else {
        setPasswordStatus({ type: 'success', message: 'Password updated successfully.' })
        setPasswordOtp('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (err) {
      console.error(err)
      setPasswordStatus({ type: 'error', message: 'Unable to update password.' })
    } finally {
      setPasswordPending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Account</h1>
          <p className="text-gray-600">Manage your profile, addresses, and security settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card" id="profile-section">
              {status && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}
                >
                  {status.message}
                </div>
              )}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <button
                  onClick={() => {
                    if (isEditing) {
                      handleSave()
                    } else {
                      setStatus(null)
                      setIsEditing(true)
                    }
                  }}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700"
                >
                  {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                  <span>{isEditing ? 'Save' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="input-field pl-10 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className="input-field pl-10 disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                      className="input-field pl-10 disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card mt-6" id="security-section">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
                <ShieldCheck className="w-5 h-5 text-primary-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">Update your password using an OTP sent to your email.</p>
              {passwordStatus && (
                <div
                  className={`mb-4 rounded-lg border px-4 py-3 text-sm ${passwordStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-700'}`}
                >
                  {passwordStatus.message}
                </div>
              )}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleSendPasswordOtp}
                  disabled={passwordPending}
                  className="inline-flex items-center justify-center rounded-lg border border-primary-200 px-4 py-2 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50 disabled:opacity-50"
                >
                  {passwordPending ? 'Sending OTP...' : 'Send OTP'}
                </button>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                    <input
                      type="text"
                      value={passwordOtp}
                      onChange={(e) => setPasswordOtp(e.target.value)}
                      className="input-field"
                      placeholder="Enter OTP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="input-field"
                      placeholder="New password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      placeholder="Confirm password"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={passwordPending}
                  className="w-full sm:w-auto btn-primary disabled:opacity-50"
                >
                  {passwordPending ? 'Updating...' : 'Update password'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Shortcuts</h3>
              <div className="grid grid-cols-1 gap-3">
                <Link
                  href="/account/orders"
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <Package className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Your orders</div>
                    <p className="text-xs text-gray-600">Track payments, fulfillment, and invoices.</p>
                  </div>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <MessageCircle className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Customer support</div>
                    <p className="text-xs text-gray-600">Talk to us on WhatsApp or email.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/categories/all" className="block w-full rounded-lg border border-emerald-200 bg-white py-2 text-center font-semibold text-emerald-700 transition-colors hover:bg-emerald-50">
                  Continue Shopping
                </Link>
                <button
                  onClick={logout}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full flex items-center justify-center gap-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg py-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Delete account</h3>
                <p className="text-sm text-gray-600">This will permanently remove your account and data. This action cannot be undone.</p>
              </div>
              <div className="mt-4 space-y-3">
                {deleteStatus && (
                  <div
                    className={`rounded-lg border px-3 py-2 text-xs ${deleteStatus.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}
                  >
                    {deleteStatus.message}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSendDeleteOtp}
                  className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                >
                  Send OTP to delete
                </button>
                <input
                  type="text"
                  value={deleteOtp}
                  onChange={(e) => setDeleteOtp(e.target.value)}
                  className="input-field"
                  placeholder="Enter OTP"
                />
              </div>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteStatus(null)
                  }}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Confirm delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
