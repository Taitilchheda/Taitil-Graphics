import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/server-auth'
import { addressSchema } from '@/lib/validators'

export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const addresses = await prisma.address.findMany({
    where: { userId: auth.id },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ addresses })
}

const createSchema = addressSchema

const updateSchema = addressSchema.partial().extend({
  id: z.string().min(1),
})

export async function POST(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid address', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  // Cap addresses per user so a hostile caller can't fill the DB.
  const existing = await prisma.address.count({ where: { userId: auth.id } })
  if (existing >= 25) {
    return NextResponse.json({ error: 'Too many saved addresses.' }, { status: 409 })
  }

  const created = await prisma.address.create({
    data: { ...parsed.data, userId: auth.id },
  })
  return NextResponse.json({ address: created })
}

export async function PATCH(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const body = await request.json().catch(() => null)
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid address', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { id, ...rest } = parsed.data
  // Make sure the address belongs to this user before we update it.
  const existing = await prisma.address.findFirst({
    where: { id, userId: auth.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }

  const updated = await prisma.address.update({ where: { id }, data: rest })
  return NextResponse.json({ address: updated })
}

export async function DELETE(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  const existing = await prisma.address.findFirst({
    where: { id, userId: auth.id },
  })
  if (!existing) {
    return NextResponse.json({ error: 'Address not found' }, { status: 404 })
  }
  await prisma.address.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
