"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";

export default function FavouriteButton({
  productId,
  isActive = false,
}: {
  productId: number | string;
  isActive?: boolean;
}) {
  const { user } = useAuth();
  const { isLiked, toggleLike } = useCart();
  const normalizedId = String(productId);

  const fallbackProduct = useMemo(
    () => ({
      id: normalizedId,
      name: `Product ${normalizedId}`,
      image: "/logo.svg",
      category: "general",
      description: "",
    }),
    [normalizedId]
  );

  const active = isLiked(normalizedId) || isActive;

  return (
    <button
      type="button"
      className="absolute right-3 top-3 rounded-full border border-[var(--border)] bg-white/90 p-2 text-xs"
      onClick={() => {
        if (!user) {
          window.location.href = "/auth/login";
          return;
        }
        toggleLike(fallbackProduct);
      }}
    >
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path d="M12 20.5l-7.2-7.2a4.5 4.5 0 016.4-6.4l.8.8.8-.8a4.5 4.5 0 116.4 6.4L12 20.5z" />
      </svg>
    </button>
  );
}
