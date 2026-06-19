export const resolveHsnCode = (input: {
  categoryId?: string | null
  subcategoryId?: string | null
  name?: string | null
}) => {
  const haystack = [
    input.categoryId,
    input.subcategoryId,
    input.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (!haystack) return undefined

  // Paper toppers / printed paper products
  if (haystack.includes('paper') && haystack.includes('topper')) return '4911'
  if (haystack.includes('paper-toppers') || haystack.includes('premium-paper')) return '4911'

  // Acrylic toppers / acrylic decor
  if (haystack.includes('acrylic')) return '3926'

  return undefined
}
