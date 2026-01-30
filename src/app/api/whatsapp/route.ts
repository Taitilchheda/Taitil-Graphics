import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { rateLimit } from '@/lib/rate-limit'

const whatsappSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().optional(),
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  customerEmail: z.string().email().optional(),
  message: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const limit = rateLimit(`whatsapp:${ip}`, 30, 60 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const payload = await request.json()
    const parsed = whatsappSchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid enquiry payload' }, { status: 400 })
    }

    const lead = await prisma.lead.create({
      data: {
        productId: parsed.data.productId ?? null,
        name: parsed.data.customerName.trim(),
        email: parsed.data.customerEmail?.toLowerCase().trim() ?? null,
        phone: parsed.data.customerPhone.trim(),
        subject: parsed.data.productName ? `WhatsApp enquiry: ${parsed.data.productName}` : 'WhatsApp enquiry',
        message: parsed.data.message ?? null,
        status: 'NEW',
        source: 'whatsapp',
      },
    })

    const whatsappMessage = `Hi! I'm interested in ${parsed.data.productName || 'your products'}.

Customer Details:
Name: ${parsed.data.customerName}
Phone: ${parsed.data.customerPhone}${parsed.data.customerEmail ? `
Email: ${parsed.data.customerEmail}` : ''}

Message: ${parsed.data.message || 'Please share details, pricing, and availability.'}

Lead ID: ${lead.id}`

    const phoneNumber = process.env.WHATSAPP_NUMBER || '917666247666'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`

    return NextResponse.json({
      success: true,
      whatsappUrl,
      enquiryId: lead.id,
      message: 'Enquiry processed successfully',
    })
  } catch (error) {
    console.error('WhatsApp enquiry error:', error)
    return NextResponse.json({ error: 'Failed to process enquiry' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const enquiryId = searchParams.get('enquiryId')

    if (!enquiryId) {
      return NextResponse.json({ error: 'Enquiry ID is required' }, { status: 400 })
    }

    const lead = await prisma.lead.findUnique({ where: { id: enquiryId } })
    if (!lead) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 })
    }

    return NextResponse.json({
      enquiryId: lead.id,
      status: lead.status,
      message: 'Enquiry status retrieved',
    })
  } catch (error) {
    console.error('WhatsApp enquiry status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
