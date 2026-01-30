import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { rateLimit } from '@/lib/rate-limit'

const enquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  subject: z.string().min(2),
  message: z.string().min(5),
  productId: z.string().optional(),
  source: z.string().optional(),
})

const STATUS = ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'CLOSED'] as const

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const limit = rateLimit(`enquiry:${ip}`, 20, 60 * 60 * 1000)
    if (!limit.ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = enquirySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid enquiry payload' }, { status: 400 })
    }

    const enquiry = await prisma.lead.create({
      data: {
        productId: parsed.data.productId ?? null,
        name: parsed.data.name.trim(),
        email: parsed.data.email.toLowerCase().trim(),
        phone: parsed.data.phone.trim(),
        subject: parsed.data.subject.trim(),
        message: parsed.data.message.trim(),
        status: 'NEW',
        source: parsed.data.source ?? 'website',
      },
    })

    return NextResponse.json({
      success: true,
      enquiry: { id: enquiry.id, status: enquiry.status, createdAt: enquiry.createdAt },
      message: 'Enquiry submitted successfully',
    })
  } catch (error) {
    console.error('Enquiry creation error:', error)
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 })
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
    const statusParam = searchParams.get('status')
    const source = searchParams.get('source')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))

    const status = statusParam && statusParam !== 'all' ? statusParam.toUpperCase() : null
    const where: any = {}
    if (status && STATUS.includes(status as any)) where.status = status
    if (source && source !== 'all') where.source = source

    const [total, enquiries, grouped] = await Promise.all([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ])

    const stats = grouped.reduce((acc, row) => {
      acc.total += row._count._all
      acc[row.status.toLowerCase()] = row._count._all
      return acc
    }, { total: 0, new: 0, contacted: 0, quoted: 0, converted: 0, closed: 0 } as Record<string, number>)

    return NextResponse.json({
      enquiries,
      total,
      page,
      limit,
      hasMore: page * limit < total,
      stats,
    })
  } catch (error) {
    console.error('Get enquiries error:', error)
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) return auth
    if (auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, notes, assignedTo } = body || {}

    if (!id || !status) {
      return NextResponse.json({ error: 'Enquiry ID and status are required' }, { status: 400 })
    }

    const normalized = String(status).toUpperCase()
    if (!STATUS.includes(normalized as any)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    await prisma.lead.update({
      where: { id },
      data: {
        status: normalized,
        notes: typeof notes === 'string' ? notes : undefined,
        assignedTo: typeof assignedTo === 'string' ? assignedTo : undefined,
      },
    })

    return NextResponse.json({ success: true, message: 'Enquiry updated successfully' })
  } catch (error) {
    console.error('Update enquiry error:', error)
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 })
  }
}
