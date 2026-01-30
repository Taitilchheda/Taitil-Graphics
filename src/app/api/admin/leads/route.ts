import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'

const STATUS = ['NEW', 'CONTACTED', 'QUOTED', 'CONVERTED', 'CLOSED'] as const

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { id: true, name: true } } },
  })

  return NextResponse.json({ leads })
}

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.string().min(1),
})

export async function PATCH(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const payload = await request.json()
  const parsed = updateSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const normalized = parsed.data.status.toUpperCase()
  if (!STATUS.includes(normalized as any)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const updated = await prisma.lead.update({
    where: { id: parsed.data.id },
    data: { status: normalized },
  })

  return NextResponse.json({ lead: updated })
}
