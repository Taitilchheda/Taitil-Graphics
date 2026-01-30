'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import { useAuth } from '@/components/providers/AuthProvider'

type Lead = {
  id: string
  name: string
  phone: string
  requirement?: string | null
  budgetRange?: string | null
  timeline?: string | null
  status: string
  createdAt: string
  product?: { id: string; name: string } | null
}

export default function LeadsPage() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.token) return
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      const payload = await res.json().catch(() => ({}))
      setLeads(payload.leads || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!status) return leads
    return leads.filter((lead) => lead.status === status)
  }, [leads, status])

  const updateStatus = async (id: string, next: string) => {
    if (!user?.token) return
    setSaving(id)
    const res = await fetch('/api/admin/leads', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
      body: JSON.stringify({ id, status: next }),
    })
    if (res.ok) {
      setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status: next } : lead)))
    }
    setSaving(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Leads</h1>
            <p className="text-gray-600">Track and manage service inquiries from WhatsApp and the contact form.</p>
          </div>
          <Link href="/admin" className="btn-secondary">Back to admin</Link>
        </div>

        <div className="flex gap-2 text-sm">
          {['', 'NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'CLOSED'].map((value) => (
            <button
              key={value || 'ALL'}
              onClick={() => setStatus(value)}
              className={`px-3 py-1 rounded-full border ${status === value ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700'}`}
            >
              {value || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">Loading...</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((lead) => (
              <div key={lead.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-500">Lead #{lead.id.slice(0, 8).toUpperCase()}</div>
                    <div className="text-lg font-semibold text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-600">{lead.phone}</div>
                    {lead.product ? (
                      <div className="text-xs text-gray-500">Service: {lead.product.name}</div>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      disabled={saving === lead.id}
                    >
                      {['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'CLOSED'].map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600 grid gap-2 md:grid-cols-3">
                  <div><span className="font-medium">Requirement:</span> {lead.requirement || '-'}</div>
                  <div><span className="font-medium">Budget:</span> {lead.budgetRange || '-'}</div>
                  <div><span className="font-medium">Timeline:</span> {lead.timeline || '-'}</div>
                </div>
                <div className="mt-3 text-xs text-gray-400">Created {new Date(lead.createdAt).toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
