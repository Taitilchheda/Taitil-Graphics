import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import type { CatalogProduct } from "@/lib/catalog-types";
import AddToCartButton from "@/components/cart/add-to-cart-button";
import FavouriteButton from "@/components/favourite-button";
import { formatCurrency, whatsappQuoteLink } from "@/lib/utils";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const imageSrc =
    product.imageUrl && product.imageUrl.trim()
      ? product.imageUrl
      : "/images/product-visit-1.svg";

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-sm">
      <div className="relative">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="block w-full"
          aria-label="Zoom image"
        >
          <Image
            src={imageSrc}
            alt={product.name}
            width={600}
            height={400}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="h-44 w-full object-contain bg-white"
          />
        </button>
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
            {product.badge}
          </span>
        ) : null}
        <FavouriteButton productId={product.id} />
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b px-4 py-2 text-sm">
              <span className="font-medium">{product.name}</span>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Close
              </button>
            </div>
            <div className="h-[80vh] overflow-auto p-4">
              <img
                src={imageSrc}
                alt={product.name}
                className="mx-auto max-h-none w-auto max-w-none"
              />
            </div>
            <div className="border-t px-4 py-2 text-xs text-gray-500">Scroll to pan. Use Ctrl + mouse wheel to zoom.</div>
          </div>
        </div>
      )}
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase text-[var(--accent)]">
          {product.categoryName}
        </p>
        <Link className="font-semibold" href={`/products/${product.slug}`}>
          {product.name}
        </Link>
        <p className="text-xs text-[var(--ink-soft)]">{product.description}</p>
        <div className="flex items-center gap-2 text-xs text-[var(--ink-muted)]">
          <span className="flex items-center gap-1">
            <svg
              aria-hidden="true"
              className="h-3.5 w-3.5 text-[#f2b100]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 3l2.6 5.4 6 .9-4.3 4.2 1 6-5.3-2.8-5.3 2.8 1-6L3.4 9.3l6-.9L12 3z" />
            </svg>
            {product.rating}
          </span>
          <span>({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between pt-2 text-sm font-semibold text-[var(--accent-strong)]">
          <Link
            className="text-[var(--accent-strong)]"
            href={whatsappQuoteLink(product.name)}
            target="_blank"
          >
            Contact for Quote
          </Link>
          <Link
            className="text-[var(--accent-strong)]"
            href={`/products/${product.slug}`}
          >
            View details &gt;
          </Link>
        </div>
        <div className="flex items-center justify-between text-xs text-[var(--ink-muted)]">
          <span>From {formatCurrency(product.price)}</span>
          <AddToCartButton
            product={product}
            className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-semibold text-white"
          />
        </div>
      </div>
    </article>
  );
}
