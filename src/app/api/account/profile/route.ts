import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(3).optional(),
  address: z.string().min(3).optional(),
  isBusiness: z.boolean().optional(),
  businessName: z.string().optional(),
  gstNumber: z.string().optional(),
})

export async function PATCH(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const payload = await request.json().catch(() => ({}))
  const parsed = updateSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile data" }, { status: 400 })
  }

  const data = parsed.data
  const updated = await prisma.user.update({
    where: { id: auth.id },
    data: {
      name: data.name ?? undefined,
      phone: data.phone ?? undefined,
      address: data.address ?? undefined,
      isBusiness: data.isBusiness ?? undefined,
      businessName: data.isBusiness ? (data.businessName || null) : null,
      gstNumber: data.isBusiness ? (data.gstNumber || null) : null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      role: true,
      isBusiness: true,
      businessName: true,
      gstNumber: true,
    },
  })

  return NextResponse.json({ user: updated })
}


export async function GET(request: Request) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      role: true,
      isBusiness: true,
      businessName: true,
      gstNumber: true,
    },
  })

  return NextResponse.json({ user })
}
