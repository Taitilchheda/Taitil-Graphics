import jwt from 'jsonwebtoken'

export type AuthTokenPayload = {
  userId: string
  email: string
  role: 'customer' | 'admin'
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be set')
  }
  return secret
}

export const signAuthToken = (payload: AuthTokenPayload) => {
  const secret = getSecret()
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export const verifyAuthToken = (token: string) => {
  const secret = getSecret()
  return jwt.verify(token, secret) as AuthTokenPayload
}
