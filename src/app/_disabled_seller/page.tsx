import Link from "next/link";

export default function SellerPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-12">
      <section className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
          Seller hub
        </p>
        <h1 className="font-display text-4xl font-semibold">
          Launch and manage your storefront.
        </h1>
        <p className="max-w-2xl text-sm text-[var(--ink-soft)]">
          Track sales, manage inventory, and keep your store optimized with
          performance insights built for independent creators.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white"
            href="/auth/register"
          >
            Apply as seller
          </Link>
          <Link
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold"
            href="/products"
          >
            View marketplace
          </Link>
        </div>
      </section>

      <section id="onboarding" className="grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Verify your studio",
            detail: "Complete KYC, upload business documents, and set payouts.",
          },
          {
            title: "List your catalog",
            detail: "Add products, pricing, stock, and delivery timelines.",
          },
          {
            title: "Launch & optimize",
            detail: "Get featured placements and ad credits at launch.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm"
          >
            <p className="font-semibold">{item.title}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              {item.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 rounded-[32px] border border-[var(--border)] bg-white p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
            Seller dashboard
          </p>
          <h2 className="font-display text-3xl font-semibold">
            Everything you need to run a storefront.
          </h2>
          <p className="text-sm text-[var(--ink-soft)]">
            Track revenue, fulfillment, and customer satisfaction. Use real-time
            insights to refine your catalog and grow recurring buyers.
          </p>
        </div>
        <div className="grid gap-4 text-sm">
          {[
            "Order management and fulfillment",
            "Inventory sync and low-stock alerts",
            "Customer reviews and messaging",
            "Promoted listings and discounts",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl bg-[var(--muted)]/60 p-4"
            >
              {item}
            </div>
          ))}
        </div>
      </section>

      <section id="insights" className="grid gap-6 md:grid-cols-3">
        {[
          { label: "Avg. order value", value: "INR 4,890" },
          { label: "Store conversion", value: "6.4%" },
          { label: "Repeat buyers", value: "38%" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="rounded-3xl border border-[var(--border)] bg-white p-6 text-center shadow-sm"
          >
            <p className="text-2xl font-semibold">{metric.value}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              {metric.label}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
