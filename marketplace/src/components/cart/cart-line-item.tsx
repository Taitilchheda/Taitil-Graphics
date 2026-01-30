"use client";

import Image from "next/image";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/utils";

export default function CartLineItem({
  id,
  name,
  price,
  seller,
  quantity,
  image,
}: {
  id: number;
  name: string;
  price: number;
  seller: string;
  quantity: number;
  image?: string;
}) {
  const { updateItem, removeItem } = useCart();

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-sm md:flex-row md:items-center">
      <Image
        src={image ?? "/images/product-visit-1.svg"}
        alt={name}
        width={120}
        height={120}
        sizes="80px"
        className="h-20 w-20 rounded-2xl object-contain bg-white"
      />
      <div className="flex-1">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          {seller}
        </p>
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          {formatCurrency(price)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-[var(--border)] text-lg"
          onClick={() => updateItem(id, Math.max(1, quantity - 1))}
        >
          -
        </button>
        <span className="min-w-8 text-center text-sm font-semibold">
          {quantity}
        </span>
        <button
          type="button"
          className="h-9 w-9 rounded-full border border-[var(--border)] text-lg"
          onClick={() => updateItem(id, quantity + 1)}
        >
          +
        </button>
      </div>
      <button
        type="button"
        className="text-sm font-semibold text-[var(--accent-strong)]"
        onClick={() => removeItem(id)}
      >
        Remove
      </button>
    </div>
  );
}
