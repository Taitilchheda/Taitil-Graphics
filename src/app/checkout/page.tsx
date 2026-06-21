"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageCircle, Phone, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { ensureCsrfToken } from "@/lib/csrf-client";

// Checkout is a "request a call back" form. Once the user submits, the
// server stores the enquiry as a Lead and we redirect them to a
// confirmation page with a WhatsApp deep link so they can ping us
// directly. No payment, no automated shipping — pricing and delivery
// are confirmed over the phone/WhatsApp.
export default function CheckoutPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { cartItems, cartTotal, clearCart, hasPricedItems, hasUnpricedItems } = useCart();
  const [address, setAddress] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal: "",
    phone: "",
  });
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [success, setSuccess] = useState<{ leadId: string; whatsappUrl: string; message: string } | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      const next = encodeURIComponent('/checkout')
      router.replace(`/auth/login?next=${next}`)
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user?.token) return;
      const res = await fetch("/api/account/addresses", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const payload = await res.json().catch(() => ({}));
      setSavedAddresses(payload.addresses || []);
    };
    loadAddresses();
  }, [user?.token]);

  const totalCents = cartTotal;

  const handleChange = (field: keyof typeof address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!user?.token) {
      setError("Please log in to continue.");
      return;
    }
    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (hasUnpricedItems || !hasPricedItems) {
      setError("Some items are missing prices. Please update pricing before checkout.");
      return;
    }
    if (!address.fullName || !address.line1 || !address.city || !address.state || !address.postal || !address.phone) {
      setError("Please complete all required address fields.");
      return;
    }

    setSubmitting(true);
    try {
      // Make sure the CSRF cookie exists before the state-changing POST.
      // The proxy short-circuits CSRF for Bearer-authenticated requests
      // (see src/proxy.ts) — we still send the token explicitly so
      // other state-changing endpoints hit on this page keep working
      // if the proxy exemption ever changes.
      const csrfToken = await ensureCsrfToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      };
      if (csrfToken) headers["x-csrf-token"] = csrfToken;

      const res = await fetch("/api/checkout", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify({
          address,
          notes: notes || undefined,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to submit enquiry.");
      }

      const payload = await res.json();
      clearCart();
      setSuccess({
        leadId: payload.leadId,
        whatsappUrl: payload.whatsappUrl,
        message: payload.message,
      });
    } catch (err: any) {
      setError(err.message || "Enquiry failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-100">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">Sign in required</h1>
          <p className="text-gray-600">Please log in to continue to checkout.</p>
          <Link href="/auth/login?next=%2Fcheckout" className="btn-primary inline-flex items-center gap-2 justify-center">
            Sign in
          </Link>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-100">
        <Header />
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
          <div className="rounded-3xl border border-emerald-200 bg-white p-10 shadow-sm space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h1 className="font-display text-3xl font-semibold text-gray-900">Request received</h1>
            <p className="text-gray-600">{success.message}</p>
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-left text-sm text-gray-700 space-y-2">
              <div><span className="font-semibold">Reference:</span> {success.leadId}</div>
              <div className="text-xs text-gray-500">Keep this reference handy when we call you back.</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={success.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" /> Send on WhatsApp
              </a>
              <a
                href="tel:+917666247666"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
              >
                <Phone className="h-4 w-4" /> Call us to confirm
              </a>
            </div>
            <Link
              href="/products"
              className="inline-block text-sm font-semibold text-primary-700 hover:text-primary-800"
            >
              Continue browsing
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-100">
      <Header />
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 sm:px-6 lg:px-8 py-10">
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
            Checkout
          </p>
          <h1 className="font-display text-4xl font-semibold">
            Tell us where to deliver.
          </h1>
          <p className="text-sm text-[var(--ink-soft)]">
            We confirm pricing and delivery by phone or WhatsApp. No online payment yet.
          </p>
        </section>

        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <form
            className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                Full name
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  value={address.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  placeholder="Aarav Mehta"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                Email
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  value={user?.email ?? ""}
                  disabled
                />
              </label>
            </div>
            {savedAddresses.length > 0 ? (
              <label className="space-y-2 text-sm font-semibold">
                Saved addresses
                <select
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  onChange={(e) => {
                    const selected = savedAddresses.find((addr) => addr.id === e.target.value);
                    if (selected) {
                      setAddress({
                        fullName: selected.fullName || address.fullName,
                        line1: selected.line1 || '',
                        line2: selected.line2 || '',
                        city: selected.city || '',
                        state: selected.state || '',
                        postal: selected.postal || '',
                        phone: selected.phone || address.phone,
                      });
                    }
                  }}
                >
                  <option value="">Select an address</option>
                  {savedAddresses.map((addr) => (
                    <option key={addr.id} value={addr.id}>
                      {addr.line1}, {addr.city}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="space-y-2 text-sm font-semibold">
              Address line 1
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                value={address.line1}
                onChange={(e) => handleChange("line1", e.target.value)}
                placeholder="Flat, street, area"
              />
            </label>
            <label className="space-y-2 text-sm font-semibold">
              Address line 2 (optional)
              <input
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                value={address.line2}
                onChange={(e) => handleChange("line2", e.target.value)}
                placeholder="Landmark, apartment"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold">
                City
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  value={address.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  placeholder="Mumbai"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                State
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  value={address.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="Maharashtra"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                Postal code
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  value={address.postal}
                  onChange={(e) => handleChange("postal", e.target.value)}
                  placeholder="400001"
                />
              </label>
              <label className="space-y-2 text-sm font-semibold">
                Phone
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm"
                  value={address.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </label>
            </div>
            <label className="space-y-2 text-sm font-semibold">
              Notes for our team (optional)
              <textarea
                className="w-full rounded-2xl border border-[var(--border)] px-4 py-3 text-sm min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Custom sizes, branding requirements, preferred delivery window..."
              />
            </label>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Request a call back"}
            </button>
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600">
                {error}
              </div>
            ) : null}
          </form>

          <div className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
                Order summary
              </p>
              <h2 className="font-display text-2xl font-semibold">
                Pay when you confirm
              </h2>
              <p className="text-sm text-[var(--ink-soft)]">
                We&apos;ll call you to lock the price, share delivery options, and arrange payment manually.
              </p>
            </div>
            <div className="rounded-3xl bg-[var(--muted)]/60 p-6 text-sm text-[var(--ink-soft)] space-y-3">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>INR {(cartTotal / 100).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center justify-between font-semibold text-[var(--foreground)]">
                <span>Total (tax calculated at confirmation)</span>
                <span>INR {(totalCents / 100).toLocaleString("en-IN")}</span>
              </div>
              <div className="text-xs text-[var(--ink-soft)]">
                Final pricing is shared over the call once we confirm availability.
              </div>
            </div>
            <div className="space-y-2 text-xs text-[var(--ink-soft)]">
              <div className="font-semibold text-[var(--foreground)]">What happens next?</div>
              <ol className="list-decimal pl-5 space-y-1">
                <li>You submit this form. We save it as a request.</li>
                <li>We call you back within 1 business hour.</li>
                <li>On call, we confirm price, delivery &amp; payment mode.</li>
              </ol>
            </div>
            <Link
              className="text-sm font-semibold text-[var(--accent-strong)]"
              href="/cart"
            >
              Back to cart
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}