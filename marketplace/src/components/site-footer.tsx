import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="bg-[var(--footer)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:px-6 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:px-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-logo text-2xl text-white">Taitil</span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Graphics
            </span>
          </div>
          <p className="text-sm text-white/70">
            Your trusted partner for professional printing, celebration decor,
            and cake toppers crafted with premium finishes.
          </p>
          <div className="space-y-2 text-xs text-white/70">
            <p>Follow Us</p>
            <div className="flex gap-3">
              <Link href="#">Facebook</Link>
              <Link href="#">Instagram</Link>
            </div>
          </div>
        </div>
        <div className="space-y-3 text-sm text-white/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Quick Links
          </p>
          <Link href="/">Home</Link>
          <Link href="/categories/business-essentials">Business Essentials</Link>
          <Link href="/categories/celebrations">Celebrations</Link>
          <Link href="/categories/marketing-material">Marketing Material</Link>
          <Link href="/categories/packaging">Packaging</Link>
          <Link href="/categories/all">Browse all products</Link>
        </div>
        <div className="space-y-3 text-sm text-white/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Our Services
          </p>
          <Link href="/categories/business-essentials/visiting-cards">
            Business Cards
          </Link>
          <Link href="/categories/marketing-material/flyers">
            Flyers & Brochures
          </Link>
          <Link href="/categories/marketing-material/posters">Posters</Link>
          <Link href="/categories/gift-articles/apparel">Custom Apparel</Link>
          <Link href="/categories/cake-decorations">Cake decor & toppers</Link>
        </div>
        <div className="space-y-3 text-sm text-white/70">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Contact Us
          </p>
          <p>+91 7666 24 7666</p>
          <p>taitilgraphics@gmail.com</p>
          <p>
            B 403, Saraswati apartment, C S complex road no 4,
            Behind Shakti Nagar, Dahisar East, Mumbai 400068
          </p>
          <p>Mon - Sun: 10:00 AM - 7:00 PM</p>
          <button
            type="button"
            className="mt-2 w-full rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Chat on WhatsApp
          </button>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[var(--footer-dark)]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-white/70 md:flex-row md:px-6 lg:px-10">
          <span>(c) 2026 Taitil Graphics. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="#">Privacy Policy</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Refund Policy</Link>
            <Link href="#">Contact</Link>
          </div>
        </div>
      </div>
      <div className="bg-[#232f3e] px-4 py-3 text-center text-xs text-white/70">
        Secure Payments - Fast Delivery - Quality Guaranteed - 24/7 Support
      </div>
    </footer>
  );
}
