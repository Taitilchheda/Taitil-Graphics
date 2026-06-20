// Per-process in-memory rate limiter. Replace with Redis when traffic
// warrants: each Lambda cold start gets a fresh map, which means an
// attacker can effectively reset their counter by waiting for a cold
// start. Acceptable for low-traffic deployments; documented as a known
// limitation in README.

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Lazy cleanup: every 5 minutes, drop buckets that have expired.
let lastSweep = Date.now()
const SWEEP_INTERVAL = 5 * 60 * 1000

const sweep = () => {
  const now = Date.now()
  if (now - lastSweep < SWEEP_INTERVAL) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key)
  }
}

export type RateLimitResult = {
  ok: boolean
  remaining: number
  retryAfterMs?: number
}

export const rateLimit = (key: string, limit: number, windowMs: number): RateLimitResult => {
  sweep()
  const now = Date.now()
  const bucket = buckets.get(key)
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, remaining: limit - 1 }
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: bucket.resetAt - now }
  }
  bucket.count += 1
  return { ok: true, remaining: limit - bucket.count }
}

// Get the client IP from common proxy headers. We trust
// x-forwarded-for (Vercel sets this) but take only the first hop.
export const getClientIp = (request: Request) => {
  const xff = request.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const real = request.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'unknown'
}

// Per-endpoint rate limit presets. Conservative defaults — tighten
// if abuse is observed, loosen if legitimate users hit the cap.
export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 15 * 60 * 1000 }, // 5 / 15 min per IP+email
  register: { limit: 3, windowMs: 60 * 60 * 1000 }, // 3 / hour per IP
  otpSend: { limit: 3, windowMs: 5 * 60 * 1000 }, // 3 / 5 min per phone
  otpVerify: { limit: 10, windowMs: 15 * 60 * 1000 }, // 10 / 15 min per phone
  checkout: { limit: 10, windowMs: 60 * 1000 }, // 10 / min per IP
  lead: { limit: 10, windowMs: 60 * 60 * 1000 }, // 10 / hour per IP
  review: { limit: 3, windowMs: 24 * 60 * 60 * 1000 }, // 3 / day per user
  analytics: { limit: 200, windowMs: 60 * 1000 }, // 200 / min per IP
  generic: { limit: 60, windowMs: 60 * 1000 }, // 60 / min per IP
}

// Helper that returns a 429 NextResponse with a Retry-After header.
export const rateLimitResponse = (retryAfterMs: number) => {
  const seconds = Math.ceil(retryAfterMs / 1000)
  return new Response(
    JSON.stringify({ error: 'Too many requests. Please slow down.' }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(seconds),
      },
    },
  )
}
