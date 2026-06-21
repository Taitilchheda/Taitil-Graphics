# Graph Report - .  (2026-06-21)

## Corpus Check
- 189 files · ~371,595 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 328 nodes · 400 edges · 42 communities detected
- Extraction: 88% EXTRACTED · 11% INFERRED · 2% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `GET()` - 13 edges
2. `POST()` - 12 edges
3. `PATCH()` - 8 edges
4. `Local Development Setup` - 6 edges
5. `Catalog browsing & product discovery` - 6 edges
6. `Admin dashboard & operations` - 6 edges
7. `seedCatalogIfEmpty()` - 5 edges
8. `resolveConversation()` - 5 edges
9. `Vercel Deployment` - 5 edges
10. `Taitil Graphics Logo (Green + Orange)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Reference image 1.jpg (content unreadable)` --conceptually_related_to--> `Catalog browsing & product discovery`  [AMBIGUOUS]
  reference/1.jpg → docs/IMPLEMENTATION-REPORT.md
- `Reference screenshot 2026-01-25 214802 (content unreadable)` --conceptually_related_to--> `Admin dashboard & operations`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214802.png → docs/IMPLEMENTATION-REPORT.md
- `Reference screenshot 2026-01-25 214848 (content unreadable)` --conceptually_related_to--> `Admin dashboard & operations`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214848.png → docs/IMPLEMENTATION-REPORT.md
- `Proposed Tech Stack (Next.js, Tailwind, Framer Motion)` --semantically_similar_to--> `Local Development Setup`  [INFERRED] [semantically similar]
  graphify-out/converted/Taitil_Graphics_Product_Design_Document_793af616.md → docs/SETUP.md
- `Brand Identity (Neutral + Green/Blue Accents)` --conceptually_related_to--> `Taitil Graphics Logo (Green + Orange)`  [INFERRED]
  graphify-out/converted/Taitil_Graphics_Product_Design_Document_793af616.md → public/logo.svg

## Hyperedges (group relationships)
- **Placeholder Card Images (Shared Template)** — img_category_celebrations, img_category_packaging, img_hero_small, img_product_cake, img_product_letterhead, img_product_visit [EXTRACTED 0.95]
- **Taitil Brand Visual System** — PDD_brand_identity, PDD_typography, PDD_visual_style, public_logo, img_sweets_box [INFERRED 0.85]
- **Production Deployment Stack** — DEPLOYMENT_vercel, DEPLOYMENT_database_schema, DEPLOYMENT_sendgrid, DEPLOYMENT_stripe, DEPLOYMENT_rate_limit, DEPLOYMENT_joi_validation, DEPLOYMENT_ga4 [EXTRACTED 0.95]
- **Authentication system (register + login + JWT + admin provisioning)** — implementation_report_authentication, solution_summary_test_accounts, tech_stack_auth [INFERRED 0.85]
- **SVG placeholder image set (categories + hero + products)** — category_business_svg, category_gift_svg, hero_main_svg, product_cake_1_svg, product_celebration_svg, product_marketing_svg, product_visit_2_svg [INFERRED 0.90]
- **WhatsApp/phone-based lead checkout pipeline** — implementation_report_checkout, implementation_report_security_rationale, implementation_report_config_deps [INFERRED 0.85]

## Communities

### Community 0 - "Pages & UI Handlers"
Cohesion: 0.03
Nodes (2): handleConversationSelect(), loadMessages()

### Community 1 - "Providers & Layout Components"
Cohesion: 0.07
Nodes (7): handleQuickMessage(), handleSend(), respond(), ensureCsrfToken(), getCsrfToken(), formatInr(), handleBuyNow()

### Community 2 - "API Route Helpers"
Cohesion: 0.14
Nodes (21): attachGuestCookieIfNeeded(), buildDailySeries(), computeDiscountPercent(), DELETE(), ensureCategory(), ensureSubcategory(), escapeHtml(), generateSupportReply() (+13 more)

### Community 3 - "Cross-Cutting Concepts (docs)"
Cohesion: 0.09
Nodes (25): Category placeholder image (teal/green palette), Category placeholder image (sage/pale green palette), Hero main placeholder image (warm beige palette), Analytics capture & admin view, Authentication & Accounts implementation, Catalog browsing & product discovery, Cart & Lead-based checkout flow, Configuration dependencies (DATABASE_URL, JWT, WhatsApp) (+17 more)

### Community 4 - "Security & Identity"
Cohesion: 0.13
Nodes (19): Joi Input Validation, Rate Limiting Middleware, Brand Identity (Neutral + Green/Blue Accents), Proposed Tech Stack (Next.js, Tailwind, Framer Motion), Typography - Outfit + Cormorant Garamond, Minimalism & Content-First Design Philosophy, Admin Dashboard at /admin/chat, AI-Powered Chat (+11 more)

### Community 5 - "Buttons & Cart UI"
Cohesion: 0.13
Nodes (0): 

### Community 6 - "CSRF & Security Headers"
Cohesion: 0.22
Nodes (2): isExempt(), proxy()

### Community 7 - "Product Catalog Logic"
Cohesion: 0.25
Nodes (2): getAllProducts(), getProductById()

### Community 8 - "Audit Logging & Auth"
Cohesion: 0.28
Nodes (3): getAuthUser(), requireAdmin(), requireAuth()

### Community 9 - "Recommendations Engine"
Cohesion: 0.33
Nodes (4): buildProfile(), getPersonalizedHotSellers(), getPersonalizedRecommendations(), uniqueById()

### Community 10 - "Lead Capture"
Cohesion: 0.22
Nodes (9): API Caching Strategy, PostgreSQL Database Schema, Google Analytics 4 Integration, Image Optimization Config, SendGrid Email Service, Stripe Payment Integration, Vercel Deployment, PM2 Process Management (+1 more)

### Community 11 - "Misc Small Modules"
Cohesion: 0.43
Nodes (4): loadUserState(), safeParse(), save(), writeUserState()

### Community 12 - "Misc Small Modules"
Cohesion: 0.33
Nodes (2): clearFilter(), toggleFilter()

### Community 13 - "Misc Small Modules"
Cohesion: 0.38
Nodes (7): Admin dashboard & operations, Removed features (retailer dashboard, projects, geolocation), Reference screenshot 2026-01-25 214802 (content unreadable), Reference screenshot 2026-01-25 214825 (content unreadable), Reference screenshot 2026-01-25 214848 (content unreadable), AI-powered chat API (/api/chat), Backend: Next.js Route Handlers (MVP); NestJS/FastAPI later

### Community 14 - "Misc Small Modules"
Cohesion: 0.53
Nodes (4): addToast(), error(), info(), success()

### Community 15 - "Misc Small Modules"
Cohesion: 0.4
Nodes (0): 

### Community 16 - "Misc Small Modules"
Cohesion: 0.7
Nodes (4): buildDirectWhatsAppLink(), buildWhatsAppLink(), digitsOnly(), getWhatsappNumber()

### Community 17 - "Misc Small Modules"
Cohesion: 0.5
Nodes (2): rateLimit(), sweep()

### Community 18 - "Misc Small Modules"
Cohesion: 0.5
Nodes (3): auto_label(), End-to-end pipeline runner after both chunks exist. Steps: merge (3C) → build+cl, Pick the 2-3 most-connected labels in a community as its name.

### Community 19 - "Misc Small Modules"
Cohesion: 1.0
Nodes (2): main(), resolveHsnCode()

### Community 20 - "Misc Small Modules"
Cohesion: 0.67
Nodes (0): 

### Community 21 - "Misc Small Modules"
Cohesion: 0.67
Nodes (0): 

### Community 22 - "Misc Small Modules"
Cohesion: 0.67
Nodes (3): Cake Product Placeholder Card (Blue), Letterhead Product Placeholder Card (Sage), Visit Card Placeholder (Light Blue)

### Community 23 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Misc Small Modules"
Cohesion: 1.0
Nodes (2): Generic File Icon SVG, Window/Monitor Icon SVG

### Community 29 - "Misc Small Modules"
Cohesion: 1.0
Nodes (2): CI/CD: GitHub + GitHub Actions (builds, tests, previews, migrations), Hosting: Vercel + Supabase/Postgres; alt AWS ECS+RDS+CloudFront

### Community 30 - "Misc Small Modules"
Cohesion: 1.0
Nodes (2): Product placeholder image (blue palette), Product placeholder image (lavender palette)

### Community 31 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Misc Small Modules"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Misc Small Modules"
Cohesion: 1.0
Nodes (1): User Journeys (Browser, Lead, Recruiter)

### Community 40 - "Misc Small Modules"
Cohesion: 1.0
Nodes (1): Success Metrics (>2.5min session, <40% bounce)

### Community 41 - "Misc Small Modules"
Cohesion: 1.0
Nodes (1): Next.js default globe icon (asset)

## Ambiguous Edges - Review These
- `Catalog browsing & product discovery` → `Reference image 1.jpg (content unreadable)`  [AMBIGUOUS]
  reference/1.jpg · relation: conceptually_related_to
- `Admin dashboard & operations` → `Reference screenshot 2026-01-25 214802 (content unreadable)`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214802.png · relation: conceptually_related_to
- `Admin dashboard & operations` → `Reference screenshot 2026-01-25 214825 (content unreadable)`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214825.png · relation: conceptually_related_to
- `Admin dashboard & operations` → `Reference screenshot 2026-01-25 214848 (content unreadable)`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214848.png · relation: conceptually_related_to
- `Reference screenshot 2026-01-25 214802 (content unreadable)` → `Reference screenshot 2026-01-25 214825 (content unreadable)`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214802.png · relation: semantically_similar_to
- `Reference screenshot 2026-01-25 214825 (content unreadable)` → `Reference screenshot 2026-01-25 214848 (content unreadable)`  [AMBIGUOUS]
  reference/Screenshot 2026-01-25 214825.png · relation: semantically_similar_to

## Knowledge Gaps
- **38 isolated node(s):** `End-to-end pipeline runner after both chunks exist. Steps: merge (3C) → build+cl`, `Pick the 2-3 most-connected labels in a community as its name.`, `SendGrid Email Service`, `Stripe Payment Integration`, `Joi Input Validation` (+33 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Misc Small Modules`** (2 nodes): `create-admin.js`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `db-error-banner.tsx`, `DbErrorBanner()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `site-footer.tsx`, `SiteFooter()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `whatsapp-float.tsx`, `WhatsAppFloat()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `CategorySidebar.tsx`, `toggleCategory()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `Generic File Icon SVG`, `Window/Monitor Icon SVG`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `CI/CD: GitHub + GitHub Actions (builds, tests, previews, migrations)`, `Hosting: Vercel + Supabase/Postgres; alt AWS ECS+RDS+CloudFront`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (2 nodes): `Product placeholder image (blue palette)`, `Product placeholder image (lavender palette)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `postcss.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `category-card.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `ErrorMessage.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `LoadingSpinner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `legacy-shims.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `User Journeys (Browser, Lead, Recruiter)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `Success Metrics (>2.5min session, <40% bounce)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Misc Small Modules`** (1 nodes): `Next.js default globe icon (asset)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Catalog browsing & product discovery` and `Reference image 1.jpg (content unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Admin dashboard & operations` and `Reference screenshot 2026-01-25 214802 (content unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Admin dashboard & operations` and `Reference screenshot 2026-01-25 214825 (content unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Admin dashboard & operations` and `Reference screenshot 2026-01-25 214848 (content unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Reference screenshot 2026-01-25 214802 (content unreadable)` and `Reference screenshot 2026-01-25 214825 (content unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **What is the exact relationship between `Reference screenshot 2026-01-25 214825 (content unreadable)` and `Reference screenshot 2026-01-25 214848 (content unreadable)`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Are the 2 inferred relationships involving `Local Development Setup` (e.g. with `Rate Limiting Middleware` and `Proposed Tech Stack (Next.js, Tailwind, Framer Motion)`) actually correct?**
  _`Local Development Setup` has 2 INFERRED edges - model-reasoned connections that need verification._