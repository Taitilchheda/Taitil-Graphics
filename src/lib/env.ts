// Centralized, validated env access. Throws loud on missing required vars
// so misconfigured deploys fail at startup rather than silently at request
// time. Optional vars return undefined; callers must handle that.

import { z } from 'zod'

const envSchema = z.object({
  // Required
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // Optional
  WHATSAPP_NUMBER: z.string().regex(/^\d{10,15}$/).optional().default('917666247666'),
  // Convenience: also expose as lowercase. We surface both so callers
  // can choose, but `whatsappNumber` is the recommended ergonomic form.
  whatsappNumber: z.string().optional(),
  OTP_SERVICE_URL: z.string().url().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  GST_RATE_PERCENT: z.coerce.number().int().min(0).max(100).optional().default(18),
  SELLER_NAME: z.string().optional().default('Taitil Graphics'),
  SELLER_GSTIN: z.string().optional(),
  SELLER_STATE: z.string().optional(),
  CSRF_ENABLED: z
    .union([z.literal('true'), z.literal('false'), z.literal('')])
    .optional()
    .default('true')
    .transform((v) => v !== 'false'),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
})

// Cache the parsed result so we don't re-validate on every call.
let cached: z.infer<typeof envSchema> | null = null

export const env = (() => {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`).join('\n')
    throw new Error(`Invalid environment configuration:\n${issues}`)
  }
  cached = { ...parsed.data, whatsappNumber: parsed.data.WHATSAPP_NUMBER }
  return cached
})()