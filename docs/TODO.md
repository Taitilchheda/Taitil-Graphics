# Taitil Graphics - Master Todo List

This list consolidates requirements from the PRD, Product Design Document, and Tech Stack Document.

## Marketplace Platform (PRD)

### User authentication (Customer, Seller, Admin)
- [ ] Define roles, permissions, and access rules.
- [ ] Design signup/login flows and account recovery.
- [ ] Implement Auth.js integration and session handling.
- [ ] Add role-based UI gating in frontend.
- [ ] Add admin role management tools.

### Seller onboarding
- [ ] Define seller profile data requirements.
- [ ] Implement KYC capture and verification flow.
- [ ] Build seller dashboard entry point.
- [ ] Add onboarding checklist and status tracking.

### Product catalog & search
- [ ] Define product schema (variants, pricing, inventory).
- [ ] Build product CRUD for sellers.
- [ ] Implement catalog browsing with filters.
- [ ] Add search indexing and query UI.
- [ ] Add product detail page with media gallery.

### Cart & checkout
- [ ] Build cart state, add/remove, and quantity updates.
- [ ] Implement checkout page and address capture.
- [ ] Add order summary, taxes, and shipping logic.
- [ ] Add confirmation and order receipt flow.

### Payments & refunds
- Online payments are out of scope — orders are handled manually over WhatsApp / phone. Keep this section if/when a payment gateway is reintroduced.
- [ ] Integrate payment gateway (Razorpay/Stripe) — only if/when you want to automate payment.
- [ ] Implement payment status handling and webhooks.
- [ ] Add refund initiation and status tracking.
- [ ] Log and surface payment failures.

### Order & inventory management
- [ ] Build order lifecycle states.
- [ ] Implement seller order management UI.
- [ ] Create inventory update rules on checkout.
- [ ] Add low-stock and out-of-stock handling.

### Reviews & ratings
- [ ] Define review schema and moderation rules.
- [ ] Build review submission UI.
- [ ] Display ratings summary on product pages.
- [ ] Add admin moderation tools.

### Admin dashboard
- [ ] Define admin KPIs and core views.
- [ ] Build user, seller, and product moderation.
- [ ] Add order oversight and support workflows.
- [ ] Add analytics and export options.

## Portfolio Platform (PDD)

### Core pages (Home, Work, Services, About, Contact)
- [ ] Define information architecture and page content.
- [ ] Build navigation with sticky header.
- [ ] Implement responsive layouts for each page.

### Hero gallery with CTA
- [ ] Design full-width hero gallery layout.
- [ ] Implement hover colorization effects.
- [ ] Add primary CTA and tracking.

### Services section (card-based)
- [ ] Define service cards and content model.
- [ ] Implement responsive card grid.
- [ ] Add service detail links or modal behavior.

### Portfolio / case studies
- [ ] Define case study template and fields.
- [ ] Implement gallery-first layout.
- [ ] Add flexible layout blocks for case studies.
- [ ] Implement lazy loading for media.

### Process timeline
- [ ] Define process steps and copy.
- [ ] Implement visual timeline component.
- [ ] Add subtle motion for step reveals.

### Contact form (conversion-optimized)
- [ ] Define form fields and validation rules.
- [ ] Implement form with React Hook Form + Zod.
- [ ] Store inquiries and send notifications.
- [ ] Add success state and follow-up CTA.

### Visual system
- [ ] Set typography pairing (sans + serif).
- [ ] Define neutral palette with accent colors.
- [ ] Build reusable components and spacing scale.

### UX, performance, and SEO
- [ ] Implement optimized images and lazy loading.
- [ ] Ensure accessibility and keyboard navigation.
- [ ] Add SEO metadata and structured data.
- [ ] Set analytics and performance monitoring.

## Tech Stack Implementation

### Project setup
- [ ] Initialize Next.js (App Router) + TypeScript.
- [ ] Configure Tailwind CSS and shadcn/ui.
- [ ] Add Framer Motion for animations.

### CMS (Sanity)
- [ ] Define schema for portfolio and case studies.
- [ ] Set up preview and image CDN.
- [ ] Wire CMS content into frontend.

### Backend & data
- [ ] Define API routes for contact and forms.
- [ ] Add PostgreSQL and ORM (Prisma/SQLAlchemy).
- [ ] Add Redis for caching and rate limiting.

### Authentication & security
- [ ] Implement Auth.js with email/social login.
- [ ] Add role-based access control.
- [ ] Enforce HTTPS and secure secrets handling.

### File storage & media
- [ ] Configure S3/R2 bucket and access policies.
- [ ] Wire media uploads and image optimization.

### Email & integrations
- [ ] Integrate Resend or SendGrid.
- [ ] Send confirmation and notification emails.
- [ ] Add optional Slack webhook alerts.

### Analytics & observability
- [ ] Integrate Sentry for error tracking.
- [ ] Add PostHog/Plausible for analytics.
- [ ] Enable Vercel Analytics.

### CI/CD & hosting
- [ ] Set up GitHub Actions for build/test.
- [ ] Configure preview deployments.
- [ ] Automate database migrations.

## Non-Functional Requirements (PRD)
- [ ] Target <2s load time on key pages.
- [ ] Ensure 99.9% uptime with monitoring.
- [ ] Document scaling strategy and limits.

## Future Roadmap
- [ ] AI product recommendations.
- [ ] Influencer storefronts.
- [ ] Regional language support.
- [ ] Client portal and admin dashboard expansion.
- [ ] Marketplace-ready architecture (queues, search).
