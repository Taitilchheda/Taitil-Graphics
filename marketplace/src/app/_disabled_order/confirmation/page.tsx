import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { orderItems, orders, products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatCurrency } from "@/lib/utils";

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId ? Number(searchParams.orderId) : null;
  if (!orderId) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <h1 className="text-3xl font-semibold">Order not found</h1>
        <Link className="text-sm font-semibold text-[var(--accent-strong)]" href="/categories/all">
          Back to catalog
        </Link>
      </div>
    );
  }

  const [orderRow] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!orderRow) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 text-center">
        <h1 className="text-3xl font-semibold">Order not found</h1>
        <Link className="text-sm font-semibold text-[var(--accent-strong)]" href="/categories/all">
          Back to catalog
        </Link>
      </div>
    );
  }

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
      name: products.name,
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));

  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold">Order confirmed</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Thanks{session?.user?.name ? `, ${session.user.name}` : ""}! Your
          order #{orderRow.id} is now being prepared.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-lg font-semibold">Items</h2>
        <div className="mt-4 space-y-3 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>
                {formatCurrency((item.unitPriceCents * item.quantity) / 100)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-[var(--border)] pt-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(orderRow.subtotalCents / 100)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span>{formatCurrency(orderRow.taxCents / 100)}</span>
          </div>
          <div className="flex items-center justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(orderRow.totalCents / 100)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <Link
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
          href="/categories/all"
        >
          Continue shopping
        </Link>
        <Link
          className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold"
          href="/"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
