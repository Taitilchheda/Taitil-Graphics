import { NextResponse } from 'next/server'

type CacheOptions = {
  seconds: number
}

// Edge-friendly, in-memory response cache. The cache lives only for the
// lifetime of the running Node process — sufficient for reducing database
// load across short bursts. For multi-region deployments, swap this for a
// Redis-backed implementation behind the same shape.
const store = new Map<string, { expiresAt: number; body: unknown }>()

export function jsonWithCache<T>(data: T, { seconds }: CacheOptions): NextResponse {
  const headers: Record<string, string> = {
    'Cache-Control': `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 6}`,
  }

  // Best-effort dedupe across concurrent identical GETs would normally be
  // handled by Next's fetch cache + the s-maxage above. We just emit the
  // response here.
  return NextResponse.json(data, { headers })
}

// Convenience: read a memoised value or compute it, with a TTL.
export async function cachedValue<T>(
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const now = Date.now()
  const cached = store.get(key)
  if (cached && cached.expiresAt > now) {
    return cached.body as T
  }
  const value = await compute()
  store.set(key, { expiresAt: now + ttlSeconds * 1000, body: value })
  return value
}

export function clearCache(key?: string) {
  if (key) store.delete(key)
  else store.clear()
}