'use client'

/**
 * Lightweight per-user state store backed by localStorage.
 * Everything is namespaced by stable userId so different logins never see each other's data.
 */
export type UserState = {
  cart?: any[]
  likes?: any[]
}

const STORAGE_KEY = 'taitil-user-state'

const safeParse = (raw: string | null): Record<string, UserState> => {
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch (err) {
    console.error('Failed to parse user state store', err)
    return {}
  }
}

const save = (data: Record<string, UserState>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to persist user state store', err)
  }
}

export function loadUserState(userId: string): UserState {
  const store = safeParse(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
  return store[userId] || {}
}

export function writeUserState(userId: string, state: UserState) {
  const store = safeParse(typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null)
  store[userId] = {
    cart: state.cart || [],
    likes: state.likes || [],
  }
  save(store)
}
