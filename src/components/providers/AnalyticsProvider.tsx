'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

type EventType = 'click' | 'view' | 'inquiry' | 'cart' | 'sale' | 'inventory' | 'product-added'

export interface AnalyticsEvent {
  id: string
  type: EventType
  productId?: string
  categoryId?: string
  subcategoryId?: string
  label?: string
  quantity?: number
  value?: number
  meta?: Record<string, any>
  createdAt: string
}

interface AnalyticsSummary {
  totals: Record<EventType, number>
  recentEvents: AnalyticsEvent[]
  topProducts: Record<string, number>
  productCounts: {
    views: Record<string, number>
    clicks: Record<string, number>
  }
}

interface AnalyticsContextType {
  events: AnalyticsEvent[]
  summary: AnalyticsSummary
  logEvent: (event: Omit<AnalyticsEvent, 'id' | 'createdAt'>) => void
  logInquiry: (productId: string, label?: string) => void
  logSale: (productId: string, quantity?: number, value?: number) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)
const STORAGE_KEY = 'taitil-analytics-events'

const generateId = () => `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setEvents(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Unable to load analytics events', error)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const logEvent = useCallback((event: Omit<AnalyticsEvent, 'id' | 'createdAt'>) => {
    const entry: AnalyticsEvent = {
      ...event,
      id: generateId(),
      createdAt: new Date().toISOString(),
    }
    setEvents((prev) => [entry, ...prev].slice(0, 500))
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: event.type,
        productId: event.productId,
        categoryId: event.categoryId,
        subcategoryId: event.subcategoryId,
        label: event.label,
        quantity: event.quantity,
        value: event.value,
        meta: event.meta,
      }),
    }).catch(() => {})
  }, [])

  const logInquiry = useCallback(
    (productId: string, label?: string) => {
      logEvent({ type: 'inquiry', productId, label })
    },
    [logEvent]
  )

  const logSale = useCallback(
    (productId: string, quantity: number = 1, value?: number) => {
      logEvent({ type: 'sale', productId, quantity, value })
    },
    [logEvent]
  )

  const summary: AnalyticsSummary = useMemo(() => {
    const totals: Record<EventType, number> = {
      click: 0,
      view: 0,
      inquiry: 0,
      cart: 0,
      sale: 0,
      inventory: 0,
      'product-added': 0,
    }
    const topProducts: Record<string, number> = {}
    const viewCounts: Record<string, number> = {}
    const clickCounts: Record<string, number> = {}

    events.forEach((event) => {
      totals[event.type] = (totals[event.type] || 0) + 1
      if (event.productId) {
        topProducts[event.productId] = (topProducts[event.productId] || 0) + 1
        if (event.type === 'view') {
          viewCounts[event.productId] = (viewCounts[event.productId] || 0) + 1
        }
        if (event.type === 'click') {
          clickCounts[event.productId] = (clickCounts[event.productId] || 0) + 1
        }
      }
    })

    return {
      totals,
      recentEvents: events.slice(0, 15),
      topProducts,
      productCounts: {
        views: viewCounts,
        clicks: clickCounts,
      },
    }
  }, [events])

  const value: AnalyticsContextType = {
    events,
    summary,
    logEvent,
    logInquiry,
    logSale,
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider')
  }
  return context
}
