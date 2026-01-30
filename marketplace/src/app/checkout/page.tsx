"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";


declare global {
  interface Window {
    Razorpay?: any;
  }
}

const loadRazorpayScript = () => {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
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

  const taxCents = 0;
  const totalCents = cartTotal + taxCents;

  const handleChange = (field: keyof typeof address, value: string) => {
    setAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          address,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Failed to start checkout.");
      }

      const payload = await res.json();
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk) {
        throw new Error("Failed to load Razorpay. Please try again.");
      }

      const options = {
        key: payload.keyId,
        amount: payload.amount,
        currency: payload.currency,
        name: "Taitil Graphics",
        description: "Order payment",
        order_id: payload.razorpayOrderId,
        prefill: {
          name: address.fullName,
          email: user.email,
          contact: address.phone,
        },
        theme: { color: "#0ea5e9" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              orderId: payload.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyRes.ok) {
            clearCart();
            router.push(`/order/confirmation?orderId=${payload.orderId}`);
            return;
          }
          const verifyPayload = await verifyRes.json().catch(() => ({}));
          setError(verifyPayload.error || "Payment verification failed.");
        },
      };

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err: any) {
      setError(err.message || "Checkout failed");
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
          <Link href="/auth/login" className="btn-primary inline-flex items-center gap-2 justify-center">
            Sign in
          </Link>
        </main>
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
          Secure your order.
        </h1>
        <p className="text-sm text-[var(--ink-soft)]">
          Complete your payment and receive instant access to your assets.
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white p-8 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            handleCheckout();
          }}
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
          <div className="flex items-center gap-3">
            <input type="checkbox" className="h-4 w-4" />
            <span className="text-xs text-[var(--ink-soft)]">
              I agree to the marketplace terms and digital delivery policy.
            </span>
          </div>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Processing..." : "Pay with Razorpay"}
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
              Pay with Razorpay
            </h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Secure INR payment with instant confirmation.
            </p>
          </div>
          <div className="rounded-3xl bg-[var(--muted)]/60 p-6 text-sm text-[var(--ink-soft)] space-y-3">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>INR {(cartTotal / 100).toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-[var(--foreground)]">
              <span>Total (GST included)</span>
              <span>INR {(totalCents / 100).toLocaleString("en-IN")}</span>
            </div>
            <div className="text-xs text-[var(--ink-soft)]">Prices are inclusive of GST.</div>
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
