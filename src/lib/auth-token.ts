import jwt from 'jsonwebtoken'

// JWT payload. We rely on the standard `iat` (issued-at) claim that
// jsonwebtoken sets automatically; declaring it here makes TypeScript
// aware of it so we can compare it against sessionInvalidatedAt in
// server-auth.ts.
export type AuthTokenPayload = {
  userId: string
  email: string
  role: 'customer' | 'admin'
  iat?: number
  exp?: number
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET must be set')
  }
  return secret
}

export const signAuthToken = (payload: AuthTokenPayload) => {
  const secret = getSecret()
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const secret = getSecret()
  return jwt.verify(token, secret) as AuthTokenPayload
}