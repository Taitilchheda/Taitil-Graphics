import jwt from 'jsonwebtoken'

export type OtpTokenPayload = {
  email: string
  purpose: 'login' | 'register'
}

const getSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET or NEXTAUTH_SECRET must be set')
  }
  return secret
}

export const signOtpToken = (payload: OtpTokenPayload) => {
  const secret = getSecret()
  return jwt.sign(payload, secret, { expiresIn: '10m' })
}

export const verifyOtpToken = (token: string) => {
  const secret = getSecret()
  return jwt.verify(token, secret) as OtpTokenPayload
}
