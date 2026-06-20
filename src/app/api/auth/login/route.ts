import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { signAuthToken } from '@/lib/auth-token'
import { loginSchema } from '@/lib/validators'

// Login uses constant-time response: we always do a bcrypt compare even
// when the user doesn't exist, to avoid leaking which emails are
// registered. We also rate-limit per (IP, email) pair to slow down
// targeted brute-force attacks.
const BCRYPT_COST = 12

// Detect a login with the seeded admin credentials from
// `scripts/create-admin.js` so we can prompt the operator to rotate the
// password. The stored bcrypt hash uses a random salt each run, so we
// detect by comparing the just-submitted plaintext (already in scope
// from `parsed`) against this constant. The match only happens after
// bcrypt.compare has succeeded, so the constant is never used as an
// auth check itself.
const DEFAULT_ADMIN_EMAIL = 'admin@taitil.graphics'
const DEFAULT_ADMIN_PASSWORD = 'Taitil@Admin2026'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // 1. IP-wide rate limit
  const ipLimit = rateLimit(`login-ip:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs)
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((ipLimit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  // 2. Validate input
  const body = await request.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }
  const { email, password } = parsed.data

  // 3. Per-email rate limit (slows down focused brute force)
  const emailLimit = rateLimit(`login-email:${email}`, 10, 15 * 60 * 1000)
  if (!emailLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts for this account. Try again later.' },
      { status: 429 },
    )
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    // Constant-time: always run bcrypt against a known dummy hash if
    // the user doesn't exist. The dummy hash is generated at import
    // time so we don't pay the cost on every request.
    const DUMMY_HASH = '$2b$12$CwTycUXWue0Thq9StjUM0uJ8wGp8WnM1rVKl5wOjWQi8QjJ3Z8g1m'
    const hashToCompare = user?.password?.startsWith('$2') ? user.password : DUMMY_HASH
    let valid = false
    try {
      valid = await bcrypt.compare(password, hashToCompare)
    } catch {
      valid = false
    }

    if (!user || !user.password || !valid) {
      // Same error + same status for both cases.
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }

    // One-time reminder if this is the seeded admin account still using
    // its default password. Runs after auth has already succeeded, so
    // the constant isn't part of the authentication check.
    if (
      user.email === DEFAULT_ADMIN_EMAIL &&
      password === DEFAULT_ADMIN_PASSWORD &&
      user.role === 'ADMIN'
    ) {
      console.warn(
        '[auth/login] Default admin password in use for admin@taitil.graphics. ' +
          'Please change it from /account and update your password manager.',
      )
    }

    const role: 'admin' | 'customer' = user.role === 'ADMIN' ? 'admin' : 'customer'

    // If the stored password is a plaintext legacy password (no $2
    // prefix), opportunistically rehash it to bcrypt on next login.
    if (!user.password.startsWith('$2')) {
      const rehashed = await bcrypt.hash(password, BCRYPT_COST)
      await prisma.user.update({ where: { id: user.id }, data: { password: rehashed } })
    }

    const token = signAuthToken({
      userId: user.id,
      email: user.email,
      role,
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        phone: user.phone,
        address: user.address,
        isBusiness: user.isBusiness,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
      },
      token,
      message: 'Login successful',
    })
  } catch (error) {
    console.error('Login error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
