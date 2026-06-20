// Zod validators grouped by domain. Keep these strict — every
// state-changing API route should `safeParse` against the matching schema
// and return 400 with field issues on failure. Treat the schemas as the
// public contract of the API: changing them is a breaking change for
// any client consuming the route.

import { z } from 'zod'

// ---------- Auth ----------

export const loginSchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
  password: z.string().min(1).max(200),
})

export const registerSchema = z.object({
  email: z.string().email().max(200).toLowerCase().trim(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(200)
    .refine((p) => /[a-z]/.test(p), 'Password must contain a lowercase letter')
    .refine((p) => /[A-Z]/.test(p), 'Password must contain an uppercase letter')
    .refine((p) => /\d/.test(p), 'Password must contain a digit'),
  name: z.string().min(1).max(120).trim(),
  phone: z.string().regex(/^\+?\d{7,15}$/).optional(),
})

export const otpSendSchema = z.object({
  phone: z.string().regex(/^\+?\d{7,15}$/),
  purpose: z.enum(['login', 'register', 'reset']).default('login'),
})

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^\+?\d{7,15}$/),
  code: z.string().regex(/^\d{4,8}$/),
  purpose: z.enum(['login', 'register', 'reset']).default('login'),
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(200)
    .refine((p) => /[a-z]/.test(p), 'Password must contain a lowercase letter')
    .refine((p) => /[A-Z]/.test(p), 'Password must contain an uppercase letter')
    .refine((p) => /\d/.test(p), 'Password must contain a digit'),
})

// ---------- Address ----------

export const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  line1: z.string().min(2).max(200),
  line2: z.string().max(200).optional().nullable(),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  postal: z.string().min(4).max(12),
  country: z.string().min(2).max(2).default('IN'),
  phone: z.string().regex(/^\+?\d{7,15}$/).optional().nullable(),
  isBusiness: z.boolean().optional().default(false),
  businessName: z.string().max(200).optional().nullable(),
  gstNumber: z.string().max(20).optional().nullable(),
})

// ---------- Product (admin) ----------

export const productCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().min(1).max(10000),
  categoryId: z.string().min(1),
  subcategoryId: z.string().min(1).optional().nullable(),
  image: z.string().url().or(z.literal('')).optional().default(''),
  images: z.array(z.string().url()).max(20).optional().nullable(),
  type: z.enum(['PHYSICAL', 'SERVICE']).default('PHYSICAL'),
  priceCents: z.coerce.number().int().min(0).max(100_000_00).default(0),
  listingPriceCents: z.coerce.number().int().min(0).max(100_000_00).optional().nullable(),
  discountPercent: z.coerce.number().int().min(0).max(100).default(0),
  sku: z.string().max(80).optional().nullable(),
  stock: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  reorderLevel: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  lowStockThreshold: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  isNew: z.boolean().default(true),
  isRecommended: z.boolean().default(true),
  isHotSeller: z.boolean().default(false),
  whatsappMsg: z.string().max(2000).optional().nullable(),
  seoTitle: z.string().max(200).optional().nullable(),
  seoDescription: z.string().max(500).optional().nullable(),
  canonicalUrl: z.string().url().optional().nullable(),
  hsnCode: z.string().max(20).optional().nullable(),
  weightGrams: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  lengthCm: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  widthCm: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  heightCm: z.coerce.number().int().min(0).max(1000).optional().nullable(),
  fragile: z.boolean().default(false),
  features: z.array(z.string().max(500)).max(50).optional().nullable(),
  badges: z.array(z.string().max(100)).max(20).optional().nullable(),
  variants: z.array(z.any()).max(100).optional().nullable(),
  media: z.array(z.any()).max(100).optional().nullable(),
})

// Product update accepts a partial of the create schema. We don't use
// .partial() wholesale because some fields (priceCents=0) need to be
// explicitly settable to 0; partial makes them optional which is fine.
export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1),
})

// ---------- Reviews ----------

export const reviewCreateSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(200).optional().nullable(),
  body: z.string().max(2000).optional().nullable(),
})

export const reviewModerationSchema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(['approve', 'reject', 'respond']),
  response: z.string().max(2000).optional().nullable(),
})

// ---------- Cart ----------

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(1000),
})

// ---------- Leads / Enquiry ----------

export const leadSchema = z.object({
  productId: z.string().min(1).optional().nullable(),
  name: z.string().min(2).max(120),
  phone: z.string().regex(/^\+?\d{7,15}$/),
  email: z.string().email().max(200).optional().nullable(),
  requirement: z.string().max(2000).optional().nullable(),
  budgetRange: z.string().max(80).optional().nullable(),
  timeline: z.string().max(80).optional().nullable(),
  source: z.string().max(80).optional().nullable(),
  subject: z.string().max(200).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
})

export const leadUpdateSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']),
  notes: z.string().max(2000).optional().nullable(),
})

// ---------- Analytics ----------

export const analyticsEventSchema = z.object({
  type: z.enum(['CLICK', 'VIEW', 'INQUIRY', 'CART', 'SALE', 'INVENTORY', 'PRODUCT_ADDED']),
  productId: z.string().min(1).optional().nullable(),
  categoryId: z.string().min(1).optional().nullable(),
  subcategoryId: z.string().min(1).optional().nullable(),
  label: z.string().max(200).optional().nullable(),
  quantity: z.coerce.number().int().min(0).max(1_000_000).optional().nullable(),
  value: z.coerce.number().int().min(0).max(1_000_000_00).optional().nullable(),
})

// ---------- Favourites ----------

export const favouriteSchema = z.object({
  productId: z.string().min(1),
  action: z.enum(['add', 'remove']),
})

// ---------- Profile ----------

export const profileUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().regex(/^\+?\d{7,15}$/).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  isBusiness: z.boolean().optional(),
  businessName: z.string().max(200).optional().nullable(),
  gstNumber: z.string().max(20).optional().nullable(),
})

// ---------- Generic helpers ----------

// Returns 400 NextResponse with structured issues, or null on success.
export const validate = <T>(schema: z.ZodType<T>, payload: unknown) => {
  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return {
      ok: false as const,
      response: Response.json(
        { error: 'Invalid request', issues: parsed.error.issues },
        { status: 400 },
      ),
    }
  }
  return { ok: true as const, data: parsed.data as T }
}