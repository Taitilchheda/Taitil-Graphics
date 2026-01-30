export const normalizePhone = (input: string) => {
  const trimmed = input.trim()
  if (!trimmed) return ''
  const cleaned = trimmed.replace(/[\s\-()]/g, '')
  if (cleaned.startsWith('+')) return cleaned
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`
  // Default to India country code if no prefix provided
  return `+91${cleaned}`
}

export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
