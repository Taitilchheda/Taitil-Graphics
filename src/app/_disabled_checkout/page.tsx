"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useCart } from "@/components/cart/cart-provider";

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
          Checkout
        </p>
        <h1 className="font-display text-4xl font-semibold">
          Secure your order.
        </h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Complete your payment and receive instant access to your assets.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);
            if (items.length === 0) {
              setError("Your cart is empty.");
              return;
            }
            startTransition(async () => {
              const response = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                  })),
                }),
              });
              if (!response.ok) {
                const payload = await response.json();
                setError(payload?.error ?? "Unable to place order.");
                return;
              }
              const payload = await response.json();
              clear();
              router.push(`/order/confirmation?orderId=${payload.orderId}`);
            });
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">
              Full name
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                placeholder="Aarav Mehta"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              Email
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                placeholder="you@company.com"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm font-semibold">
            Company
            <input
              className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              placeholder="Company or studio name"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-semibold">
              City
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                placeholder="Mumbai"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              Phone
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                placeholder="+91 98765 43210"
              />
            </label>
          </div>
          <label className="space-y-2 text-sm font-semibold">
            Notes for seller
            <textarea
              className="min-h-[120px] w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
              placeholder="Share any key details about your project."
            />
          </label>
          <div className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" />
            <span className="text-xs text-[var(--ink-soft)]">
              I agree to the marketplace terms and digital delivery policy.
            </span>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
            disabled={isPending}
          >
            {isPending ? "Processing..." : "Pay securely"}
          </button>
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </div>
          ) : null}
        </form>

        <div className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
              Payment
            </p>
            <h2 className="font-display text-2xl font-semibold">
              Razorpay / Stripe
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              All transactions are encrypted and monitored for fraud. You will
              receive instant delivery after payment.
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--muted)]/60 p-6 text-sm text-[var(--ink-soft)]">
            <p className="font-semibold text-[var(--foreground)]">
              Order perks
            </p>
            <ul className="mt-3 space-y-2">
              <li>Instant asset access after payment</li>
              <li>Dedicated support within 24 hours</li>
              <li>Invoice sent to your registered email</li>
            </ul>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--accent-strong)]"
            href="/cart"
          >
            Back to cart
          </Link>
        </div>
      </div>
    </div>
  );
}
