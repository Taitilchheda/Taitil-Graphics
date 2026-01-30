"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";

export default function FavouriteButton({
  productId,
  isActive = false,
}: {
  productId: number;
  isActive?: boolean;
}) {
  const { data: session } = useSession();
  const [active, setActive] = useState(isActive);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="absolute right-3 top-3 rounded-full border border-[var(--border)] bg-white/90 p-2 text-xs"
      disabled={isPending}
      onClick={() => {
        if (!session?.user) {
          window.location.href = "/auth/login";
          return;
        }
        startTransition(async () => {
          setActive((prev) => !prev);
          await fetch("/api/favourites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              action: active ? "remove" : "add",
            }),
          });
        });
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
