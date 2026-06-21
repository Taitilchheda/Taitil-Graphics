// OTP generation, storage, and verification.
//
// The production design calls for SMS delivery via an upstream service
// (see OTP_SERVICE_URL in .env.example). That upstream has been
// intermittent, so we ship a local fallback that generates a code,
// stores its SHA-256 hash in the OtpCode Prisma model, and prints the
// plaintext to the server console. With OTP_DEV_FALLBACK=true (or
// whenever NODE_ENV !== 'production'), the same code is also returned
// in the response so the dev UI can show it.
//
// When a real provider is wired up later, only `sendOtp` needs to
// change — the verify path is provider-agnostic.

import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { prisma } from '@/lib/prisma'

const CODE_LENGTH = 6
const CODE_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

export type OtpPurpose = 'login' | 'register' | 'reset'

export const isOtpDevFallback = () =>
  process.env.OTP_DEV_FALLBACK === 'true' || process.env.NODE_ENV !== 'production'

const generateOtpCode = (): string => {
  // randomInt is unbiased across the full 0..1_000_000 range.
  // Zero-pad so 6-digit codes sort/display consistently.
  return String(randomInt(0, 10 ** CODE_LENGTH)).padStart(CODE_LENGTH, '0')
}

const hashCode = (code: string): string =>
  createHash('sha256').update(code, 'utf8').digest('hex')

const safeEqualHex = (a: string, b: string): boolean => {
  // timingSafeEqual requires equal-length buffers; the stored hash is
  // always 64 hex chars, so pad/truncate the input to match.
  const aBuf = Buffer.from(a, 'hex')
  const bBuf = Buffer.from(b, 'hex')
  if (aBuf.length !== bBuf.length) return false
  try {
    return timingSafeEqual(aBuf, bBuf)
  } catch {
    return false
  }
}

export type SendOtpResult =
  | { ok: true; code: string; expiresAt: Date }
  | { ok: false; reason: 'db-error' }

export const sendOtp = async (params: {
  phone: string
  purpose: OtpPurpose
}): Promise<SendOtpResult> => {
  const { phone, purpose } = params
  try {
    const code = generateOtpCode()
    const codeHash = hashCode(code)
    const expiresAt = new Date(Date.now() + CODE_TTL_MS)

    // Invalidate any prior unexpired code for this (phone, purpose)
    // pair so the latest code is the only valid one. We match on
    // expiresAt only — verified rows are deleted on successful verify,
    // so the only rows that survive are unverified.
    await prisma.otpCode.deleteMany({
      where: {
        phone,
        purpose,
        expiresAt: { gt: new Date() },
      },
    })

    await prisma.otpCode.create({
      data: { phone, purpose, codeHash, expiresAt },
    })

    // Always log to the server console so the operator can recover the
    // code even if the upstream channel is broken. In production this
    // line is the only place the plaintext exists; never echo it to a
    // client response unless OTP_DEV_FALLBACK is on.
    console.log(
      `[OTP] phone=${phone} purpose=${purpose} code=${code} expires=${expiresAt.toISOString()}`,
    )

    return { ok: true, code, expiresAt }
  } catch (error) {
    console.error('sendOtp error', error)
    return { ok: false, reason: 'db-error' }
  }
}

export type VerifyOtpResult =
  | { ok: true; otpId: string }
  | { ok: false; reason: 'expired' | 'invalid' | 'too-many-attempts' | 'db-error' }

export const verifyOtp = async (params: {
  phone: string
  code: string
  purpose: OtpPurpose
}): Promise<VerifyOtpResult> => {
  const { phone, code, purpose } = params
  try {
    // Find any unexpired row for this (phone, purpose). Verified rows
    // are deleted on success (see below), so presence in the result
    // set already implies "unverified". The expiresAt clause is the
    // single source of truth for "still valid".
    const row = await prisma.otpCode.findFirst({
      where: {
        phone,
        purpose,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!row) return { ok: false, reason: 'expired' }

    // Increment attempts first so the cap holds even if the request
    // crashes mid-compare.
    const updated = await prisma.otpCode.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    })

    if (updated.attempts > MAX_ATTEMPTS) {
      return { ok: false, reason: 'too-many-attempts' }
    }

    const candidate = hashCode(code)
    if (!safeEqualHex(candidate, row.codeHash)) {
      return { ok: false, reason: 'invalid' }
    }

    // Single-use: delete the row on success. Next verify call will
    // findFirst → row not found → "expired". This avoids the
    // Prisma+MongoDB "verifiedAt: null doesn't match" gotcha entirely.
    await prisma.otpCode.delete({ where: { id: row.id } })

    return { ok: true, otpId: row.id }
  } catch (error) {
    console.error('verifyOtp error', error)
    return { ok: false, reason: 'db-error' }
  }
}
