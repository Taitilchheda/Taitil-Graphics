// Client-side helpers for the double-submit CSRF cookie set by `src/proxy.ts`.
// The cookie is non-httpOnly so we can read it from `document.cookie` and
// echo it back as the `x-csrf-token` header on state-changing requests.

const COOKIE_NAME = 'x-csrf'

// Parse a single cookie value out of `document.cookie`. Returns null when
// the cookie isn't set (most common on the very first page load).
export const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null
  const target = `${COOKIE_NAME}=`
  const parts = document.cookie ? document.cookie.split(';') : []
  for (const raw of parts) {
    const trimmed = raw.trim()
    if (trimmed.startsWith(target)) {
      return trimmed.slice(target.length)
    }
  }
  return null
}

// Make sure a CSRF cookie exists before the caller tries to POST. The
// proxy will mint one on the next /api/* request, but we can't be sure
// the user has triggered one yet (e.g. first Buy Now click straight from
// a marketing landing page). Hitting /api/auth/csrf explicitly mints it.
export const ensureCsrfToken = async (): Promise<string | null> => {
  const existing = getCsrfToken()
  if (existing) return existing
  try {
    const res = await fetch('/api/auth/csrf', { method: 'GET', credentials: 'same-origin' })
    if (!res.ok) return null
  } catch {
    return null
  }
  return getCsrfToken()
}
