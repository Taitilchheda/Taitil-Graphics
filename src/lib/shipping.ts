import { createDelhiveryShipment, fetchWaybills, getTrackingUrl } from '@/lib/delhivery'

const numberFromEnv = (key: string, fallback: number) => {
  const value = Number(process.env[key])
  return Number.isFinite(value) && value > 0 ? value : fallback
}

const extractWaybill = (payload: any) => {
  return (
    payload?.packages?.[0]?.waybill ||
    payload?.packages?.[0]?.waybill_number ||
    payload?.ShipmentData?.[0]?.Shipment?.Waybill ||
    payload?.ShipmentData?.[0]?.Shipment?.Shipment?.Waybill ||
    payload?.waybill ||
    payload?.Waybill ||
    null
  )
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
  createdAt?: Date | string
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

  const orderDate = order.createdAt ? new Date(order.createdAt) : new Date()

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
    orderDate: orderDate.toISOString(),
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
  const shipmentInput = buildShipmentInputFromOrder(order)
  let waybill: string | null = null
  let response: any

  try {
    const [allocated] = await fetchWaybills(1)
    waybill = allocated
    response = await createDelhiveryShipment({ ...shipmentInput, waybill })
  } catch (error) {
    if (process.env.DELHIVERY_ALLOW_AUTO_WAYBILL === 'true') {
      response = await createDelhiveryShipment(shipmentInput)
      waybill = extractWaybill(response)
    } else {
      throw error
    }
  }

  if (!waybill) {
    throw new Error('Delhivery did not return a waybill. Please verify DELHIVERY_CLIENT_NAME and account settings.')
  }

  return {
    response,
    waybill,
    trackingUrl: getTrackingUrl(waybill),
  }
}
