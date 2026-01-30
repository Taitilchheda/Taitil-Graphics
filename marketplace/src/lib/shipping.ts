import { createDelhiveryShipment, fetchWaybills, getTrackingUrl } from '@/lib/delhivery'

const numberFromEnv = (key: string, fallback: number) => {
  const value = Number(process.env[key])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

type OrderLine = {
  quantity: number
  priceCents: number
  product: {
    name: string
    sku?: string | null
    weightGrams?: number | null
    lengthCm?: number | null
    widthCm?: number | null
    heightCm?: number | null
    hsnCode?: string | null
    fragile?: boolean | null
  }
}

type OrderAddress = {
  fullName: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postal: string
  country?: string | null
  phone?: string | null
}

type OrderInput = {
  id: string
  totalCents: number
  address?: OrderAddress | null
  items: OrderLine[]
}

export const buildShipmentInputFromOrder = (order: OrderInput) => {
  if (!order.address) {
    throw new Error('Order has no shipping address')
  }

  const defaultWeightGrams = numberFromEnv('DELHIVERY_DEFAULT_WEIGHT_GRAMS', 300)
  const defaultLengthCm = numberFromEnv('DELHIVERY_DEFAULT_LENGTH_CM', 15)
  const defaultWidthCm = numberFromEnv('DELHIVERY_DEFAULT_WIDTH_CM', 15)
  const defaultHeightCm = numberFromEnv('DELHIVERY_DEFAULT_HEIGHT_CM', 5)

  const totalWeightGrams = order.items.reduce((sum, item) => {
    const weight = item.product.weightGrams ?? defaultWeightGrams
    return sum + weight * item.quantity
  }, 0)

  const lengths = order.items.map((item) => item.product.lengthCm || defaultLengthCm)
  const widths = order.items.map((item) => item.product.widthCm || defaultWidthCm)
  const heights = order.items.map((item) => item.product.heightCm || defaultHeightCm)

  const lengthCm = lengths.length ? Math.max(...lengths) : defaultLengthCm
  const widthCm = widths.length ? Math.max(...widths) : defaultWidthCm
  const heightCm = heights.length ? Math.max(...heights) : defaultHeightCm
  const fragile = order.items.some((item) => item.product.fragile)

  return {
    orderId: order.id,
    customerName: order.address.fullName,
    addressLine1: order.address.line1,
    addressLine2: order.address.line2 || '',
    city: order.address.city,
    state: order.address.state,
    country: order.address.country || 'India',
    pincode: order.address.postal,
    phone: order.address.phone || '',
    weightKg: Math.max(0.1, totalWeightGrams / 1000),
    lengthCm,
    widthCm,
    heightCm,
    fragile,
    totalAmountCents: order.totalCents,
    items: order.items.map((item) => ({
      name: item.product.name,
      sku: item.product.sku,
      quantity: item.quantity,
      priceCents: item.priceCents,
      hsnCode: item.product.hsnCode,
    })),
  }
}

export const createDelhiveryShipmentForOrder = async (order: OrderInput) => {
  const [waybill] = await fetchWaybills(1)
  const shipmentInput = buildShipmentInputFromOrder(order)
  const response = await createDelhiveryShipment({ ...shipmentInput, waybill })
  return {
    response,
    waybill,
    trackingUrl: getTrackingUrl(waybill),
  }
}
