"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartProduct } from "@/lib/catalog-types";

export type CartItem = {
  id: number;
  name: string;
  price: number;
  seller: string;
  image?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  addItem: (product: CartProduct, quantity?: number) => void;
  updateItem: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "tg-marketplace-cart";

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored) as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);

    return {
      items,
      itemCount,
      addItem: (product, quantity = 1) => {
        setItems((prev) => {
          const existing = prev.find((item) => item.id === product.id);
          if (existing) {
            return prev.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            );
          }
          return [
            ...prev,
            {
              id: product.id,
              name: product.name,
              price: product.price,
              seller: product.categoryName,
              image: product.imageUrl,
              quantity,
            },
          ];
        });
      },
      updateItem: (id, quantity) => {
        setItems((prev) =>
          prev
            .map((item) =>
              item.id === id ? { ...item, quantity } : item,
            )
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
      },
      clear: () => setItems([]),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider.");
  }
  return context;
}
