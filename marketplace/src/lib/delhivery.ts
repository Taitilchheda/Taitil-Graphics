type DelhiveryConfig = {
  baseUrl: string
  token: string
  clientName?: string
  trackingUrlBase: string
  createEndpoint: string
  waybillEndpoint: string
  trackEndpoint: string
  labelEndpoint: string
  pickupEndpoint?: string
}

type PickupLocation = {
  name: string
  address: string
  city: string
  state: string
  country: string
  pincode: string
  phone: string
}

type ShipmentProductLine = {
  name: string
  sku?: string | null
  quantity: number
  priceCents: number
  hsnCode?: string | null
}

type ShipmentInput = {
  orderId: string
  customerName: string
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  country: string
  pincode: string
  phone: string
  weightKg: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  fragile?: boolean
  totalAmountCents: number
  items: ShipmentProductLine[]
  waybill?: string
}

type DelhiveryLabel = {
  contentType: string
  buffer: ArrayBuffer
}

const getConfig = (): DelhiveryConfig => {
  const token = process.env.DELHIVERY_API_TOKEN
  if (!token) {
    throw new Error('Delhivery API token is missing')
  }
  return {
    baseUrl: process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com',
    token,
    clientName: process.env.DELHIVERY_CLIENT_NAME,
    trackingUrlBase: process.env.DELHIVERY_TRACKING_URL_BASE || 'https://www.delhivery.com/track/package/',
    createEndpoint: process.env.DELHIVERY_CREATE_ENDPOINT || '/api/cmu/create.json',
    waybillEndpoint: process.env.DELHIVERY_WAYBILL_ENDPOINT || '/waybill/api/bulk/json/',
    trackEndpoint: process.env.DELHIVERY_TRACK_ENDPOINT || '/api/v1/packages/json/',
    labelEndpoint: process.env.DELHIVERY_LABEL_ENDPOINT || '/api/p/packing_slip',
    pickupEndpoint: process.env.DELHIVERY_PICKUP_ENDPOINT || undefined,
  }
}

const getPickupLocation = (): PickupLocation => {
  const required = [
    'DELHIVERY_PICKUP_NAME',
    'DELHIVERY_PICKUP_ADDRESS',
    'DELHIVERY_PICKUP_CITY',
    'DELHIVERY_PICKUP_STATE',
    'DELHIVERY_PICKUP_COUNTRY',
    'DELHIVERY_PICKUP_PIN',
    'DELHIVERY_PICKUP_PHONE',
  ]
  const missing = required.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing Delhivery pickup config: ${missing.join(', ')}`)
  }
  return {
    name: process.env.DELHIVERY_PICKUP_NAME || '',
    address: process.env.DELHIVERY_PICKUP_ADDRESS || '',
    city: process.env.DELHIVERY_PICKUP_CITY || '',
    state: process.env.DELHIVERY_PICKUP_STATE || '',
    country: process.env.DELHIVERY_PICKUP_COUNTRY || 'India',
    pincode: process.env.DELHIVERY_PICKUP_PIN || '',
    phone: process.env.DELHIVERY_PICKUP_PHONE || '',
  }
}

const buildUrl = (baseUrl: string, path: string, params?: Record<string, string | number | undefined>) => {
  const url = new URL(path, baseUrl)
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    url.searchParams.set(key, String(value))
  })
  return url.toString()
}

const delhiveryRequest = async <T>(
  path: string,
  options: { method?: string; headers?: Record<string, string>; body?: string; params?: Record<string, string | number | undefined> },
) => {
  const config = getConfig()
  const url = buildUrl(config.baseUrl, path, options.params)
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Token ${config.token}`,
      ...options.headers,
    },
    body: options.body,
  })
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Delhivery API error')
  }
  if (contentType.includes('application/json')) {
    return (await res.json()) as T
  }
  const text = await res.text()
  try {
    return JSON.parse(text) as T
  } catch {
    return text as unknown as T
  }
}

export const fetchWaybills = async (count = 1) => {
  const config = getConfig()
  const response = await delhiveryRequest<{ waybill?: string[]; data?: { waybill?: string[] } }>(config.waybillEndpoint, {
    params: {
      count,
      cl: config.clientName,
    },
  })
  const waybills = response?.waybill || response?.data?.waybill || []
  if (!Array.isArray(waybills) || waybills.length === 0) {
    throw new Error('Delhivery did not return a waybill')
  }
  return waybills
}

export const createDelhiveryShipment = async (shipment: ShipmentInput) => {
  const pickup = getPickupLocation()
  const config = getConfig()
  const payload = {
    pickup_location: {
      name: pickup.name,
      add: pickup.address,
      city: pickup.city,
      state: pickup.state,
      country: pickup.country,
      pin: pickup.pincode,
      phone: pickup.phone,
    },
    shipments: [
      {
        name: shipment.customerName,
        add: shipment.addressLine1,
        add2: shipment.addressLine2 || '',
        city: shipment.city,
        state: shipment.state,
        country: shipment.country,
        pin: shipment.pincode,
        phone: shipment.phone,
        order: shipment.orderId,
        payment_mode: 'Prepaid',
        total_amount: Math.round(shipment.totalAmountCents / 100),
        products_desc: shipment.items.map((item) => item.name).join(', '),
        quantity: shipment.items.reduce((sum, item) => sum + item.quantity, 0),
        weight: Math.max(0.1, Number(shipment.weightKg.toFixed(2))),
        length: shipment.lengthCm,
        width: shipment.widthCm,
        height: shipment.heightCm,
        fragile_shipment: shipment.fragile ?? false,
        hsn_code: shipment.items.map((item) => item.hsnCode).filter(Boolean).join(', '),
        waybill: shipment.waybill,
        seller_name: pickup.name,
        seller_add: pickup.address,
        seller_city: pickup.city,
        seller_state: pickup.state,
        seller_country: pickup.country,
        seller_pin: pickup.pincode,
        seller_phone: pickup.phone,
        return_name: pickup.name,
        return_add: pickup.address,
        return_city: pickup.city,
        return_state: pickup.state,
        return_country: pickup.country,
        return_pin: pickup.pincode,
        return_phone: pickup.phone,
      },
    ],
  }
  const formBody = new URLSearchParams({
    format: 'json',
    data: JSON.stringify(payload),
  }).toString()

  return delhiveryRequest<Record<string, any>>(config.createEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody,
  })
}

export const trackDelhiveryShipment = async (waybill: string) => {
  const config = getConfig()
  return delhiveryRequest<Record<string, any>>(config.trackEndpoint, {
    params: { waybill },
  })
}

export const fetchDelhiveryLabel = async (waybill: string): Promise<DelhiveryLabel> => {
  const config = getConfig()
  const url = buildUrl(config.baseUrl, config.labelEndpoint, { wbns: waybill })
  const res = await fetch(url, {
    headers: { Authorization: `Token ${config.token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || 'Failed to fetch Delhivery label')
  }
  const contentType = res.headers.get('content-type') || 'application/pdf'
  const buffer = await res.arrayBuffer()
  return { contentType, buffer }
}

export const requestDelhiveryPickup = async (payload: Record<string, unknown>) => {
  const config = getConfig()
  if (!config.pickupEndpoint) {
    throw new Error('Pickup endpoint not configured')
  }
  return delhiveryRequest<Record<string, any>>(config.pickupEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export const getTrackingUrl = (waybill: string) => {
  const config = getConfig()
  return `${config.trackingUrlBase}${waybill}`
}
