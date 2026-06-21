// WhatsApp link helpers. Shared between client and server, so this file
// CANNOT import @/lib/env (which validates JWT_SECRET / DATABASE_URL
// and would crash the browser bundle when client code pulls it in).
// Instead, we read WHATSAPP_NUMBER off process.env at call time — Next
// inlines process.env for client bundles, so any var referenced here
// will be substituted at build time. If WHATSAPP_NUMBER is unset we
// fall back to the Taitil business line so client-side callers always
// have something to link to.

const DEFAULT_WHATSAPP_NUMBER = '917666247666'

const digitsOnly = (value: string) => value.replace(/\D/g, '')

const getWhatsappNumber = (override?: string): string => {
  if (override) return digitsOnly(override)
  // process.env.WHATSAPP_NUMBER is replaced at build time when this
  // module is bundled for the client. On the server, it reads the
  // runtime env. If the var is missing entirely, fall back to the
  // Taitil business line.
  const fromEnv =
    typeof process !== 'undefined' && process.env && process.env.WHATSAPP_NUMBER
  return digitsOnly(fromEnv || DEFAULT_WHATSAPP_NUMBER)
}

// Build a wa.me link that pre-fills a message. The number is taken from
// the parameter, then env, then a hardcoded default. Always digits-only
// because wa.me rejects "+", "-", " " etc.
export const buildWhatsAppLink = (params: {
  phone?: string
  message: string
  number?: string
}) => {
  const number = getWhatsappNumber(params.number)
  const text = encodeURIComponent(params.message)
  return `https://wa.me/${number}?text=${text}`
}

// Build a wa.me link to a specific contact (for support replies). When
// the contact is supplied, the message is omitted to avoid leaking
// template content into the customer's app.
export const buildDirectWhatsAppLink = (phone: string) => {
  return `https://wa.me/${digitsOnly(phone)}`
}
