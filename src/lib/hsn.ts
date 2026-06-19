// HSN (Harmonized System of Nomenclature) code resolver.
// Provides reasonable defaults for categories in this marketplace so that
// invoice exports can populate the correct tax code when the seller has
// not entered one on the product itself.

type HsnInput = {
  categoryId?: string | null
  subcategoryId?: string | null
  name?: string | null
}

// Curated map of category → HSN code. Falls back to a generic print code.
const CATEGORY_HSN: Record<string, string> = {
  'visiting-cards': '4901',
  'business-cards': '4901',
  'cake-decorations': '4819',
  'cake-toppers': '4819',
  'paper-toppers': '4823',
  'premium-paper-cake-toppers': '4823',
  'luxury-acrylic-cake-toppers': '3926',
  'packaging': '4819',
  'marketing': '4911',
  'celebrations': '4901',
  'gifts': '4901',
  'butterflies': '4911',
}

const DEFAULT_PRINT_HSN = '4901'

export function resolveHsnCode(input: HsnInput): string {
  if (!input) return DEFAULT_PRINT_HSN

  const categoryId = input.categoryId?.toString().toLowerCase().trim()
  const subcategoryId = input.subcategoryId?.toString().toLowerCase().trim()

  if (subcategoryId && CATEGORY_HSN[subcategoryId]) {
    return CATEGORY_HSN[subcategoryId]
  }
  if (categoryId && CATEGORY_HSN[categoryId]) {
    return CATEGORY_HSN[categoryId]
  }

  // Heuristic: name-based fallback.
  const name = (input.name ?? '').toLowerCase()
  if (name.includes('cake topper') || name.includes('cake-topper')) return '4819'
  if (name.includes('acrylic')) return '3926'
  if (name.includes('packaging') || name.includes('box')) return '4819'
  if (name.includes('visiting card') || name.includes('business card')) return '4901'

  return DEFAULT_PRINT_HSN
}