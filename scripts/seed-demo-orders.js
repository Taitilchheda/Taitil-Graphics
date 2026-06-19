const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const loadEnv = () => {
  const envPath = path.join(__dirname, '..', '.env')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    let value = line.slice(idx + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

const gstRatePercent = Number(process.env.GST_RATE_PERCENT || 18)

const pick = (arr, count) => {
  const copy = [...arr]
  const out = []
  while (copy.length && out.length < count) {
    const idx = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

const main = async () => {
  loadEnv()
  const prisma = new PrismaClient()
  const products = await prisma.product.findMany({ where: { type: 'PHYSICAL' } })
  if (products.length < 4) {
    throw new Error('Need at least 4 physical products to seed demo orders.')
  }

  const demoCustomers = [
    {
      email: 'demo.customer1@taitilgraphics.com',
      name: 'Asha Mehta',
      phone: '9000000001',
      address: {
        fullName: 'Asha Mehta',
        line1: '12, Sunrise Towers',
        line2: 'Link Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal: '400068',
        phone: '9000000001',
      },
      items: 4,
    },
    {
      email: 'demo.customer2@taitilgraphics.com',
      name: 'Rohan Kulkarni',
      phone: '9000000002',
      address: {
        fullName: 'Rohan Kulkarni',
        line1: '88, Lotus Park',
        line2: 'MG Road',
        city: 'Pune',
        state: 'Maharashtra',
        postal: '411001',
        phone: '9000000002',
      },
      items: 2,
    },
    {
      email: 'demo.customer3@taitilgraphics.com',
      name: 'Priya Nair',
      phone: '9000000003',
      address: {
        fullName: 'Priya Nair',
        line1: '5, Lakeview Residency',
        line2: 'Sector 9',
        city: 'Navi Mumbai',
        state: 'Maharashtra',
        postal: '400701',
        phone: '9000000003',
      },
      items: 3,
    },
    {
      email: 'demo.customer4@taitilgraphics.com',
      name: 'Kunal Shah',
      phone: '9000000004',
      address: {
        fullName: 'Kunal Shah',
        line1: '44, Horizon Plaza',
        line2: 'SV Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal: '400067',
        phone: '9000000004',
      },
      items: 1,
    },
    {
      email: 'demo.customer5@taitilgraphics.com',
      name: 'Neha Desai',
      phone: '9000000005',
      address: {
        fullName: 'Neha Desai',
        line1: '17, Riviera Homes',
        line2: 'Baner Road',
        city: 'Pune',
        state: 'Maharashtra',
        postal: '411045',
        phone: '9000000005',
      },
      items: 2,
    },
    {
      email: 'demo.customer6@taitilgraphics.com',
      name: 'Sameer Joshi',
      phone: '9000000006',
      address: {
        fullName: 'Sameer Joshi',
        line1: '23, Green Acres',
        line2: 'Thane West',
        city: 'Thane',
        state: 'Maharashtra',
        postal: '400601',
        phone: '9000000006',
      },
      items: 3,
    },
  ]

  for (const customer of demoCustomers) {
    const user = await prisma.user.upsert({
      where: { email: customer.email },
      update: { name: customer.name, phone: customer.phone },
      create: { email: customer.email, name: customer.name, phone: customer.phone },
    })

    await prisma.order.deleteMany({ where: { userId: user.id, razorpayPaymentId: null } })

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        ...customer.address,
      },
    })

    const selected = pick(products, Math.min(customer.items, products.length))
    const orderItems = selected.map((product) => {
      const mrp = product.priceCents || 0
      const listing = product.listingPriceCents && product.listingPriceCents > 0
        ? product.listingPriceCents
        : Math.max(0, mrp - Math.round((mrp * (product.discountPercent || 0)) / 100))
      return {
        productId: product.id,
        quantity: Math.max(1, Math.floor(Math.random() * 3) + 1),
        priceCents: listing,
      }
    })

    const subtotalCents = orderItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0)
    const taxCents = Math.round((subtotalCents * gstRatePercent) / (100 + gstRatePercent))
    const totalCents = subtotalCents

    const createdAt = new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
    const paidAt = new Date(createdAt.getTime() + 60 * 60 * 1000)

    await prisma.order.create({
      data: {
        userId: user.id,
        status: 'PAID',
        paymentStatus: 'PAID',
        paymentProvider: 'razorpay',
        paymentMethod: 'card',
        currency: 'INR',
        subtotalCents,
        taxCents,
        totalCents,
        addressId: address.id,
        shippingProvider: 'delhivery',
        shippingStatus: 'PENDING',
        paidAt,
        createdAt,
        items: { create: orderItems },
      },
    })
  }

  await prisma.$disconnect()
  console.log('Demo paid orders created.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
