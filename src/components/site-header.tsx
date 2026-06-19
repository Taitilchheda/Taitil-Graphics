import Link from "next/link";
import CartCount from "@/components/cart/cart-count";
import { navigation } from "@/lib/navigation";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--background)]">
      <div className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 md:px-6 lg:px-10">
          <Link className="flex items-center gap-2" href="/">
            <span className="font-logo text-2xl text-[var(--accent)]">
              Taitil
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-strong)]">
              Graphics
            </span>
          </Link>
          <label className="hidden flex-1 items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm md:flex">
            <span className="text-[var(--ink-muted)]">Search</span>
            <input
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Search for products, designs, or services..."
            />
          </label>
          <div className="ml-auto flex items-center gap-5 text-xs text-[var(--ink-soft)]">
            <Link className="flex flex-col items-center gap-1" href="/favourites">
              <span className="rounded-full border border-[var(--border)] p-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 20.5l-7.2-7.2a4.5 4.5 0 016.4-6.4l.8.8.8-.8a4.5 4.5 0 116.4 6.4L12 20.5z" />
                </svg>
              </span>
              Favourites
            </Link>
            <Link className="flex flex-col items-center gap-1" href="/cart">
              <span className="rounded-full border border-[var(--border)] p-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M3 4h2l2.2 10.5a2 2 0 002 1.5h7.7a2 2 0 001.9-1.4l1.6-5.6H7.2" />
                  <circle cx="10" cy="20" r="1.5" />
                  <circle cx="18" cy="20" r="1.5" />
                </svg>
              </span>
              <span className="flex items-center gap-1">
                Cart <CartCount />
              </span>
            </Link>
            <Link className="flex flex-col items-center gap-1" href="/auth/login">
              <span className="rounded-full border border-[var(--border)] p-2">
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                  <path d="M4 20a8 8 0 0116 0" />
                </svg>
              </span>
              Sign In
            </Link>
          </div>
        </div>
        <div className="px-4 pb-4 md:hidden">
          <label className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm">
            <span className="text-[var(--ink-muted)]">Search</span>
            <input
              className="w-full bg-transparent text-sm focus:outline-none"
              placeholder="Search for products, designs, or services..."
            />
          </label>
        </div>
      </div>
      <div className="border-b border-[var(--border)] bg-[var(--peach)]">
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 py-3 text-sm font-medium text-[var(--ink-soft)] md:px-6 lg:px-10">
          {navigation.map((item) => (
            <div key={item.label} className="group relative">
              <Link
                className="flex items-center gap-1"
                href={item.href}
              >
                {item.label}
                {item.items ? <span className="text-xs">v</span> : null}
              </Link>
              {item.items ? (
                <div className="absolute left-0 top-full hidden min-w-[220px] rounded-2xl border border-[var(--border)] bg-white p-3 shadow-lg group-hover:block">
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--ink-muted)]">
                    {item.label}
                  </p>
                  <div className="space-y-1">
                    {item.items.map((sub) => (
                      <Link
                        key={sub.href}
                        className="block rounded-xl px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
                        href={sub.href}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
}
