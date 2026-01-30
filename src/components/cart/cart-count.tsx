"use client";

import { useCart } from "@/components/cart/cart-provider";

export default function CartCount() {
  const { itemCount } = useCart();

  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-white">
      {itemCount}
    </span>
  );
}
