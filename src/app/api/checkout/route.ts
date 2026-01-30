import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/rate-limit'
import { requireAuth } from '@/lib/server-auth'
import { getRazorpay } from '@/lib/razorpay'
import { sendTransactionalEmail, emailTemplates } from '@/lib/mailer'

const checkoutSchema = z.object({
  address: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(2),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    postal: z.string().min(4),
    phone: z.string().min(7),
  }),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().min(1),
      }),
    )
    .min(1),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const limit = rateLimit(`checkout:${ip}`, 10, 60 * 1000)
  if (!limit.ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const payload = await request.json()
  const parsed = checkoutSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 })
  }

  const { address, items } = parsed.data
  const productIds = items.map((item) => item.id)
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  })

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Invalid product in cart' }, { status: 400 })
  }

  if (products.some((product) => product.type !== 'PHYSICAL')) {
    return NextResponse.json({ error: 'Service items must be ordered via WhatsApp only' }, { status: 400 })
  }

  const priceMap = new Map(
    products.map((product) => {
      const mrpCents = product.priceCents || 0
      const listingCents =
        product.listingPriceCents && product.listingPriceCents > 0
          ? product.listingPriceCents
          : Math.max(0, mrpCents - Math.round((mrpCents * (product.discountPercent || 0)) / 100))
      return [product.id, listingCents]
    }),
  )
  const stockMap = new Map(products.map((product) => [product.id, product.stock]))

  for (const item of items) {
    const stock = stockMap.get(item.id)
    if (stock != null && stock < item.quantity) {
      return NextResponse.json({ error: 'Insufficient stock for one or more items' }, { status: 409 })
    }
  }

  const subtotalCents = items.reduce((total, item) => {
    const price = priceMap.get(item.id) || 0
    return total + price * item.quantity
  }, 0)
  const taxCents = 0
  const totalCents = subtotalCents + taxCents

  const savedAddress = await prisma.address.create({
    data: {
      userId: auth.id,
      fullName: address.fullName,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postal: address.postal,
      phone: address.phone,
    },
  })

  await prisma.analyticsEvent.create({
    data: {
      type: 'SALE',
      label: 'checkout-start',
      value: totalCents,
    },
  })

  const order = await prisma.order.create({
    data: {
      userId: auth.id,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      currency: 'INR',
      subtotalCents,
      taxCents,
      totalCents,
      paymentProvider: 'razorpay',
      addressId: savedAddress.id,
      shippingProvider: 'delhivery',
      shippingStatus: 'PENDING',
      items: {
        create: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          priceCents: priceMap.get(item.id) || 0,
        })),
      },
    },
  })

  const customerName = address.fullName
  const placedTemplate = emailTemplates.orderPlaced(customerName, order.id)
  await sendTransactionalEmail(auth.email, 'order-placed', placedTemplate.subject, placedTemplate.html, order.id)

  let razorpayOrder
  try {
    razorpayOrder = await getRazorpay().orders.create({
      amount: totalCents,
      currency: 'INR',
      receipt: order.id,
    })
  } catch (error) {
    console.error('Razorpay order failed', error)
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
  }

  await prisma.order.update({
    where: { id: order.id },
    data: {
      razorpayOrderId: razorpayOrder.id,
    },
  })

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: totalCents,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
  })
}
