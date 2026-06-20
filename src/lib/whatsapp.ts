import { env } from '@/lib/env'

const digitsOnly = (value: string) => value.replace(/\D/g, '')

// Build a wa.me link that pre-fills a message. The number is taken from
// env, with the number always normalized to digits-only (wa.me rejects
// "+", "-", " " etc.).
export const buildWhatsAppLink = (params: {
  phone?: string
  message: string
  number?: string
}) => {
  const number = digitsOnly(params.number || env.WHATSAPP_NUMBER)
  const text = encodeURIComponent(params.message)
  return `https://wa.me/${number}?text=${text}`
}

// Build a wa.me link to a specific contact (for support replies). When
// the contact is supplied, the message is omitted to avoid leaking
// template content into the customer's app.
export const buildDirectWhatsAppLink = (phone: string) => {
  return `https://wa.me/${digitsOnly(phone)}`
}