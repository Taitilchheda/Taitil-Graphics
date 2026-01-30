import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/server-auth"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth(request)
  if (auth instanceof NextResponse) return auth

  const orderId = params.id
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  })

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  if (order.userId !== auth.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const now = Date.now()
  const createdAt = order.createdAt.getTime()
  const withinWindow = now - createdAt <= 24 * 60 * 60 * 1000

  if (!withinWindow) {
    return NextResponse.json({ error: "Cancellation window has expired" }, { status: 400 })
  }

  const blockedStatuses = ["SHIPPED", "DELIVERED", "CANCELLED"]
  if (blockedStatuses.includes(order.status)) {
    return NextResponse.json({ error: "Order cannot be cancelled at this stage" }, { status: 400 })
  }

  if (order.shipmentCreatedAt) {
    return NextResponse.json({ error: "Order already queued for shipment" }, { status: 400 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        shippingStatus: order.shippingStatus ? "CANCELLED" : null,
        shipmentUpdatedAt: order.shippingStatus ? new Date() : null,
      },
    })

    if (order.inventoryAdjusted) {
      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } })
        if (product?.stock != null) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: product.stock + item.quantity },
          })
        }
      }
    }
  })

  return NextResponse.json({ ok: true })
}
