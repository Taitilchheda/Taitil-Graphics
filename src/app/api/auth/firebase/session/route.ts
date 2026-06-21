import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signAuthToken } from '@/lib/auth-token'
import { firebaseSessionSchema } from '@/lib/validators'
import { rateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { getFirebaseAdminAuth } from '@/lib/firebase-admin'

// Exchange a Firebase Auth email-link ID token for our own HS256 JWT.
//
// Flow:
//   1. Browser finishes `signInWithEmailLink`, gets an ID token.
//   2. Browser POSTs `{ idToken, email }` here.
//   3. We verify the ID token with firebase-admin (catches tampering,
//      expiry, and wrong-project issues).
//   4. We upsert a MongoDB `User` by email. If the email matches the
//      seeded admin (`admin@taitil.graphics`), we promote the user to
//      ADMIN. Otherwise it's a CUSTOMER.
//   5. We issue our own HS256 JWT so the rest of the app keeps working
//      unchanged (the JWT is what `getAuthUser` checks, not Firebase).
//
// The admin bootstrap is intentionally a hard-coded email so it's not
// a privilege-escalation vector — only the seeded admin email can land
// in the ADMIN role via this path.
const DEFAULT_ADMIN_EMAIL = 'admin@taitil.graphics'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const ipLimit = rateLimit(`firebase-session-ip:${ip}`, RATE_LIMITS.login.limit, RATE_LIMITS.login.windowMs)
  if (!ipLimit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((ipLimit.retryAfterMs ?? 0) / 1000)) } },
    )
  }

  const body = await request.json().catch(() => null)
  const parsed = firebaseSessionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { idToken } = parsed.data

  try {
    // 1. Verify the ID token. This also checks signature, expiry, and
    //    that the token was minted by our Firebase project.
    const adminAuth = getFirebaseAdminAuth()
    const decoded = await adminAuth.verifyIdToken(idToken, true)

    const email = (decoded.email || '').toLowerCase().trim()
    if (!email) {
      return NextResponse.json(
        { error: 'Firebase token did not include an email address.' },
        { status: 401 },
      )
    }

    // 2. Per-email rate limit (slows down focused brute force on the
    //    verify path; the same key works for both password and magic
    //    link, which is the intent — both share the same abuse budget).
    const emailLimit = rateLimit(`firebase-session-email:${email}`, 10, 15 * 60 * 1000)
    if (!emailLimit.ok) {
      return NextResponse.json(
        { error: 'Too many attempts for this account. Try again later.' },
        { status: 429 },
      )
    }

    // 3. Upsert the MongoDB user. We don't write a password (magic-link
    //    users authenticate via Firebase) but we still need a row to
    //    attach addresses/orders/etc. to.
    const isAdminEmail = email === DEFAULT_ADMIN_EMAIL
    const existing = await prisma.user.findUnique({ where: { email } })

    let user = existing
    if (!user) {
      // First-time magic-link sign-in: create a row. The display name
      // comes from Firebase's profile if available, otherwise the local
      // part of the email.
      const displayName = (decoded.name && decoded.name.trim()) || email.split('@')[0]
      user = await prisma.user.create({
        data: {
          email,
          name: displayName,
          role: isAdminEmail ? 'ADMIN' : 'CUSTOMER',
          // Magic-link sign-in means there's no password set. The user
          // can still sign in via password later by setting one.
          password: null,
        },
      })
    } else if (isAdminEmail && user.role !== 'ADMIN') {
      // Promote the seeded admin email if it was somehow downgraded
      // (e.g. a previous password-signup test run). Defensive only.
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
      })
    }

    const role: 'admin' | 'customer' = user.role === 'ADMIN' ? 'admin' : 'customer'

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
      message: 'Sign-in successful.',
    })
  } catch (error: unknown) {
    // firebase-admin throws a wide variety of error types. The most
    // common cases are: expired token, wrong project, malformed JWT.
    // We log the raw error for debugging but only surface a generic
    // 401 to the client — we don't want to confirm/deny token validity
    // to a possible attacker.
    console.error('firebase/session verify error', error)
    return NextResponse.json(
      { error: 'Sign-in link is invalid or has expired. Please request a new one.' },
      { status: 401 },
    )
  }
}
