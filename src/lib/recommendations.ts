export type RecommendationEvent = {
  type: string
  productId?: string
  categoryId?: string
  subcategoryId?: string
  label?: string
  meta?: Record<string, any>
}

export type RecommendationProduct = {
  id: string
  name: string
  description?: string
  category?: string
  subcategory?: string
  categoryId?: string
  subcategoryId?: string
  isRecommended?: boolean
  isHotSeller?: boolean
}

type InterestProfile = {
  productScores: Record<string, number>
  categoryScores: Record<string, number>
  subcategoryScores: Record<string, number>
  termScores: Record<string, number>
}

const normalize = (value?: string) => value?.toLowerCase() || ''

const getEventWeight = (type: string) => {
  switch (type) {
    case 'sale':
      return 6
    case 'cart':
      return 4
    case 'inquiry':
      return 3
    case 'click':
      return 2
    case 'view':
      return 1
    default:
      return 1
  }
}

const extractTerms = (input: string) =>
  input
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.replace(/[^a-z0-9-]/g, ''))
    .filter((term) => term.length > 2)

const buildProfile = (events: RecommendationEvent[] = []): InterestProfile => {
  const profile: InterestProfile = {
    productScores: {},
    categoryScores: {},
    subcategoryScores: {},
    termScores: {},
  }

  events.forEach((event) => {
    const weight = getEventWeight(event.type)
    if (event.productId) {
      profile.productScores[event.productId] = (profile.productScores[event.productId] || 0) + weight
    }
    if (event.categoryId) {
      profile.categoryScores[event.categoryId] = (profile.categoryScores[event.categoryId] || 0) + weight
    }
    if (event.subcategoryId) {
      profile.subcategoryScores[event.subcategoryId] = (profile.subcategoryScores[event.subcategoryId] || 0) + weight
    }

    const query = event.meta?.query || event.meta?.search || ''
    if (query) {
      extractTerms(query).forEach((term) => {
        profile.termScores[term] = (profile.termScores[term] || 0) + 1
      })
    }
  })

  return profile
}

const scoreProduct = (product: RecommendationProduct, profile: InterestProfile) => {
  const categoryId = product.categoryId || product.category
  const subcategoryId = product.subcategoryId || product.subcategory

  let score = 0
  if (profile.productScores[product.id]) {
    score += profile.productScores[product.id] * 2
  }
  if (categoryId && profile.categoryScores[categoryId]) {
    score += profile.categoryScores[categoryId] * 1.5
  }
  if (subcategoryId && profile.subcategoryScores[subcategoryId]) {
    score += profile.subcategoryScores[subcategoryId] * 2
  }

  const haystack = [product.name, product.description, categoryId, subcategoryId]
    .map(normalize)
    .join(' ')

  Object.entries(profile.termScores).forEach(([term, weight]) => {
    if (haystack.includes(term)) {
      score += weight * 1.5
    }
  })

  if (product.isRecommended) score += 2
  if (product.isHotSeller) score += 3

  return score
}

const uniqueById = <T extends { id: string }>(items: T[]) => {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

export const getPersonalizedRecommendations = <T extends RecommendationProduct>(
  products: T[],
  events: RecommendationEvent[] = [],
  fallback: T[] = [],
  limit = 8
) => {
  if (!events.length) return fallback.slice(0, limit)
  const profile = buildProfile(events)
  const ranked = [...products]
    .map((product) => ({ product, score: scoreProduct(product, profile) }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product)

  const filtered = uniqueById(ranked)
  return filtered.slice(0, limit)
}

export const getPersonalizedHotSellers = <T extends RecommendationProduct>(
  products: T[],
  events: RecommendationEvent[] = [],
  fallback: T[] = [],
  limit = 8
) => {
  if (!events.length) return fallback.slice(0, limit)
  const profile = buildProfile(events)
  const ranked = [...products]
    .map((product) => {
      const base = scoreProduct(product, profile)
      const hotBoost = product.isHotSeller ? 2 : 0
      return { product, score: base + hotBoost }
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product)

  const filtered = uniqueById(ranked)
  return filtered.slice(0, limit)
}
