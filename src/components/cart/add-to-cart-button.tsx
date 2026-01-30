"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/cart-provider";
import type { CartProduct } from "@/lib/catalog-types";

export default function AddToCartButton({
  product,
  className,
  label,
}: {
  product: CartProduct;
  className?: string;
  label?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      className={
        className ??
        "inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
      }
      onClick={() => {
        addItem(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1200);
      }}
    >
      {added ? "Added" : label ?? "Add to cart"}
    </button>
  );
}
