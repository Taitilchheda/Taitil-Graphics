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

const compactCartItem = (item: any) => ({
  id: item?.id,
  name: item?.name,
  image: item?.image,
  category: item?.category,
  priceCents: item?.priceCents,
  listingPriceCents: item?.listingPriceCents,
  discountPercent: item?.discountPercent,
  type: item?.type,
  salePriceCents: item?.salePriceCents,
  mrpCents: item?.mrpCents,
  quantity: item?.quantity ?? 1,
})

const compactLikeItem = (item: any) => ({
  id: item?.id,
  name: item?.name,
  image: item?.image,
  category: item?.category,
  priceCents: item?.priceCents,
  listingPriceCents: item?.listingPriceCents,
  discountPercent: item?.discountPercent,
  type: item?.type,
  salePriceCents: item?.salePriceCents,
  mrpCents: item?.mrpCents,
})

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
  const compactCart = (state.cart || []).map(compactCartItem).filter((item) => item.id).slice(0, 200)
  const compactLikes = (state.likes || []).map(compactLikeItem).filter((item) => item.id).slice(0, 200)

  store[userId] = {
    cart: compactCart,
    likes: compactLikes,
  }
  save(store)
}
