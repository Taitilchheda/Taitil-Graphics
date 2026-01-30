import Link from "next/link";
import DbErrorBanner from "@/components/db-error-banner";
import ProductCard from "@/components/product-card";
import {
  getCategories,
  getProducts,
  getProductsByCategory,
  getProductsBySubcategory,
} from "@/db/queries";
import { titleFromSlug } from "@/lib/utils";

export default async function CategoryListingPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const slugParts = slug ?? ["all"];
  const categorySlug = slugParts[0];
  const subcategorySlug = slugParts[1];

  let dbError: string | null = null;
  let categoryList = [];
  let filteredProducts = [];

  try {
    [categoryList, filteredProducts] = await Promise.all([
      getCategories(),
      categorySlug === "all"
        ? getProducts()
        : subcategorySlug
          ? getProductsBySubcategory(categorySlug, subcategorySlug)
          : getProductsByCategory(categorySlug),
    ]);
  } catch (error) {
    dbError =
      error instanceof Error
        ? error.message
        : "Database connection failed.";
  }

  const category =
    categorySlug === "all"
      ? null
      : categoryList.find((item) => item.slug === categorySlug);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
          {category ? category.name : "All Products"}
        </p>
        <h1 className="text-3xl font-semibold">
          {subcategorySlug
            ? titleFromSlug(subcategorySlug)
            : category?.name || "All Products"}
        </h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Discover our complete range of products and services for print,
          packaging, celebrations, and cake decor.
        </p>
        {dbError ? (
          <DbErrorBanner message={`Database error: ${dbError}`} />
        ) : null}
      </section>

      <section className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 md:grid-cols-[1.2fr_1.2fr_0.6fr] md:items-center">
        <label className="space-y-2 text-xs font-semibold text-[var(--ink-soft)]">
          Search
          <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-4 py-2">
            <svg
              aria-hidden="true"
              className="h-4 w-4 text-[var(--ink-muted)]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <input
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Search products"
            />
          </div>
        </label>
        <div className="flex flex-wrap gap-2">
          <Link
            className={`rounded-full border px-4 py-2 text-xs font-semibold ${
              categorySlug === "all"
                ? "border-[var(--accent)] text-[var(--accent-strong)]"
                : "border-[var(--border)] text-[var(--ink-soft)]"
            }`}
            href="/categories/all"
          >
            All
          </Link>
          {categoryList.map((item) => (
            <Link
              key={item.id}
              className={`rounded-full border px-4 py-2 text-xs font-semibold ${
                item.slug === categorySlug
                  ? "border-[var(--accent)] text-[var(--accent-strong)]"
                  : "border-[var(--border)] text-[var(--ink-soft)]"
              }`}
              href={`/categories/${item.slug}`}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <label className="space-y-2 text-xs font-semibold text-[var(--ink-soft)]">
          Sort by
          <select className="w-full rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm">
            <option>Most Popular</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
        </label>
      </section>

      <p className="text-sm text-[var(--ink-soft)]">
        Showing {filteredProducts.length} products
      </p>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </div>
  );
}
