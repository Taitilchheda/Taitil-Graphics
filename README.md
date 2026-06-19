# Taitil Graphics — Marketplace

A Next.js 16 + Prisma + Razorpay marketplace for studio-grade printing and
celebration decor.

This repository is a single Next.js application. The earlier
`marketplace/` subfolder and the vendored `taitilgraphics/otp-service/` fork
have been collapsed into the project root.

## Getting started

```bash
npm install
cp .env.example .env.local       # then fill in DATABASE_URL, Razorpay keys, etc.
npx prisma migrate deploy        # apply Prisma migrations
npm run dev                      # http://localhost:3000
```

## Scripts

| Script             | What it does                                       |
|--------------------|----------------------------------------------------|
| `npm run dev`      | Next.js dev server (Turbopack).                    |
| `npm run build`    | `prisma generate` + `next build`.                  |
| `npm run start`    | Production server (`next start`).                  |
| `npm run lint`     | ESLint (Next + TypeScript configs).                |
| `npm run type-check` | `tsc --noEmit` against `tsconfig.json`.          |
| `npm run migrate`  | Runs the one-shot Prisma migration script.         |

## Layout

```
.
├── prisma/                 Prisma schema + migrations
├── public/                 Static assets (images, logo)
├── scripts/                One-shot migration / seed scripts
├── src/
│   ├── app/                Next.js App Router pages + API routes
│   ├── components/         Shared UI (cart, layout, providers, sections…)
│   ├── data/               Static catalog seed (used as Prisma seed source)
│   ├── lib/                Auth, Prisma, Razorpay, shipping, email, etc.
│   └── types/              Local type shims
├── templates/              HTML templates for invoices and shipping labels
├── docs/                   Project planning + historical reports (see below)
└── reference/              Reference screenshots (not part of the app)
```

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
- **Database**: Prisma + PostgreSQL. Set `DATABASE_URL` (and `DIRECT_URL` if
  using a connection-pooling provider like Neon).