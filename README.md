# Taitil Graphics — Marketplace

A Next.js 16 + Prisma marketplace for studio-grade printing and
celebration decor. Catalog, cart, reviews, leads, and admin. Ordering
is handled out-of-band via WhatsApp / phone call until the business
scales enough to justify online payments and shipping automation.

This repository is a single Next.js application. The earlier
`marketplace/` subfolder and the vendored `taitilgraphics/otp-service/` fork
have been collapsed into the project root.

## Stack

- **Next.js 16** (App Router, Turbopack) on Vercel.
- **Prisma 5** + **MongoDB Atlas** (M0 free tier). Switch back to
  PostgreSQL when the business scales.
- **JWT** auth (HS256, 7-day expiry, session invalidation via
  `User.sessionInvalidatedAt`).
- **OTP** delivery via the hosted `otp-service-beta.vercel.app`. Phone
  OTP only — no email OTP.
- **WhatsApp / phone** for ordering. No Razorpay, no Delhivery, no
  transactional email.

## Getting started

```bash
npm install
cp .env.example .env.local       # fill in JWT_SECRET, DATABASE_URL, OTP_SERVICE_URL, WHATSAPP_NUMBER
npx prisma db push               # provision MongoDB collections
npm run dev                      # http://localhost:3000
```

## Scripts

| Script                | What it does                                       |
|-----------------------|----------------------------------------------------|
| `npm run dev`         | Next.js dev server (Turbopack).                    |
| `npm run build`       | `prisma generate` + `next build`.                  |
| `npm run start`       | Production server (`next start`).                  |
| `npm run lint`        | ESLint (Next + TypeScript configs).                |
| `npm run type-check`  | `tsc --noEmit` against `tsconfig.json`.            |
| `npm run db:push`     | Push the Prisma schema to MongoDB (no migrations). |
| `npm run db:generate` | Regenerate the Prisma client only.                 |

## Layout

```
.
├── prisma/                 Prisma schema (MongoDB)
├── public/                 Static assets (images, logo)
├── scripts/                One-shot maintenance scripts (backfill-hsn)
├── src/
│   ├── app/                Next.js App Router pages + API routes
│   ├── components/         Shared UI (cart, layout, providers, sections…)
│   ├── data/               Static catalog seed (used as Prisma seed source)
│   ├── lib/                Auth, Prisma, CSRF, rate limit, validators, etc.
│   └── types/              Local type shims
├── templates/              HTML templates for invoices
├── docs/                   Project planning + historical reports
└── reference/              Reference screenshots (not part of the app)
```

## Security

The app ships with a baseline of enterprise hardening. Highlights:

- **CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy** are added by `src/middleware.ts` on every
  response.
- **CSRF** is enforced via the double-submit-cookie pattern
  (`src/lib/csrf.ts`); the Edge middleware rejects state-changing
  requests without a matching `x-csrf-token` header + cookie.
- **Per-endpoint rate limits** are configured in
  `src/lib/rate-limit.ts`. Defaults: 5 logins / 15 min / IP, 3 OTP
  sends / 5 min / phone, 10 checkouts / min / IP.
- **Zod validation** is mandatory on every state-changing API route.
  Schemas live in `src/lib/validators.ts` and are the public contract
  of each endpoint.
- **Constant-time login**: the server always runs bcrypt even when the
  user doesn't exist, so attackers can't enumerate emails by timing.
- **Session invalidation**: bumping `User.sessionInvalidatedAt` on
  logout / password change / admin force-revoke rejects all tokens
  issued at or before that timestamp.
- **Secret scanning**: `.gitleaks.toml` rules catch the patterns we
  actually use (JWT, MongoDB URI, Delhivery, Firebase keys, GSTIN).
- **Type safety**: `tsc --noEmit` runs in CI; `tsconfig` strict mode
  is on.

### Known limitations

- The rate limiter is per-process. On serverless each cold start resets
  the counters, so an attacker who can trigger cold starts gets a
  fresh budget. Replace with Upstash Redis (free tier) once traffic
  picks up. Env vars are already wired: `UPSTASH_REDIS_REST_URL` and
  `UPSTASH_REDIS_REST_TOKEN`.
- The OTP service is hosted externally. If it goes down, login and
  signup stop working. Self-hosting it is documented in
  `docs/SETUP.md`.

## Vercel deployment

1. Push the repo to GitHub.
2. In Vercel: **Import Project** → point at this repo.
3. **Project Settings → General → Root Directory**: leave empty (the
   project root is the Next.js root). Earlier versions pointed at
   `marketplace/`, which no longer exists.
4. **Environment Variables**: copy from `.env.example`. Required:
   `JWT_SECRET`, `DATABASE_URL`, `OTP_SERVICE_URL`, `WHATSAPP_NUMBER`.
5. **Build command**: `prisma generate && next build` (default is fine).
6. **Post-deploy**: run `npx prisma db push` against your production
   DATABASE_URL (Atlas) to provision the collections. Either via Vercel
   CLI `vercel env pull` + local run, or by connecting to Atlas and
   letting it infer the schema from the generated client.

## Documentation

Historical and planning material lives in [`docs/`](docs/):

- [`docs/README.md`](docs/README.md) — original Next.js bootstrap notes.
- [`docs/TODO.md`](docs/TODO.md) — consolidated backlog from the PRD / PDD / tech-stack docs.
- [`docs/IMPLEMENTATION-REPORT.md`](docs/IMPLEMENTATION-REPORT.md) — code-level audit of what works and what's stubbed.
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deployment guide (Vercel / Railway / VPS).
- [`docs/SETUP.md`](docs/SETUP.md) — local setup walk-through.
- [`docs/SOLUTION-SUMMARY.md`](docs/SOLUTION-SUMMARY.md) — earlier "everything works" status report.
- `docs/Taitil_Graphics_*.docx` — original product / design / tech-stack documents.

## Notes

- **Auth** is JWT-based (see `src/lib/auth-token.ts` and `src/lib/server-auth.ts`).
- **OTP delivery** uses `OTP_SERVICE_URL` (defaults to the hosted
  `otp-service-beta.vercel.app` deploy). The previous local `taitilgraphics/otp-service/`
  fork has been removed; if you self-host OTP, deploy the upstream
  `sauravhathi/otp-service` separately and point `OTP_SERVICE_URL` at it.
- **Firebase** keys, if present locally, are excluded from git by
  `*.json` + whitelist rules in `.gitignore`.
- **Database**: Prisma + MongoDB Atlas. Set `DATABASE_URL` to your
  Atlas connection string. When migrating to Postgres later, replace
  `provider = "mongodb"` with `provider = "postgresql"`, re-introduce
  `directUrl`, and add SQL migrations back into `prisma/migrations/`.
