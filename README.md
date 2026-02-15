# SkaiScraper

**AI Command Center for Storm Restoration & Trades Operations**

[Live Product →](https://skaiscrape.com) · [Features & Demo →](https://skaiscrape.com/features) · [SkaiStack Platform →](https://skaiscrape.com/skaistack)

---

## What is SkaiScraper?

SkaiScraper is a full-stack SaaS platform that automates the entire workflow for roofing contractors, restoration companies, and trades professionals — from storm damage detection to claim settlement to job completion.

**Core capabilities:**

- **AI Damage Builder** — Upload photos, get AI-generated damage narratives with measurements and material estimates
- **Weather Intelligence** — NOAA-backed storm verification with property-level hail and wind data
- **Claims Workspace** — Full claim lifecycle management with timeline, documents, and digital signatures
- **Smart Supplements** — AI-assisted supplement generation for carrier negotiations
- **Trades Network** — Vendor marketplace with AI-powered contractor matching
- **Client Portal** — Branded portal for homeowners to track projects and communicate
- **Batch Proposals** — Template-based document generation with brand customization and PDF export

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 14 (App Router) + TypeScript        |
| UI         | Tailwind CSS + shadcn/ui + Framer Motion    |
| Auth       | Clerk (identity-based routing)              |
| Database   | PostgreSQL (Supabase) + Prisma (243 models) |
| AI         | OpenAI GPT-4o + Vision                      |
| Payments   | Stripe (subscriptions + token metering)     |
| Email      | Resend + React Email                        |
| Monitoring | Sentry (server + edge + client)             |
| Hosting    | Vercel (edge deployment)                    |

## Quick Start

```bash
pnpm install
cp .env.example .env.local   # Fill in your keys
npx prisma generate
pnpm dev
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for full setup instructions.

## Documentation

| Document                           | Description                                      |
| ---------------------------------- | ------------------------------------------------ |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, module overview, data flow        |
| [DEPLOYMENT.md](DEPLOYMENT.md)     | Environment setup, deployment, migrations        |
| [SECURITY.md](SECURITY.md)         | Auth model, secrets handling, compliance roadmap |
| [CHANGELOG.md](CHANGELOG.md)       | Release history                                  |

> Historical build logs and AI session artifacts are archived in `docs/archive/`.

## Platform: SkaiStack™

SkaiScraper is the first product in the **SkaiStack Intelligence Platform**:

| Product                                               | Status         |
| ----------------------------------------------------- | -------------- |
| **SkaiScraper**                                       | ✅ Live        |
| **EyAi Inspect** (drone + satellite damage detection) | 🔜 Coming Soon |
| **BirdsEyAi** (aerial property intelligence)          | 🔜 Coming Soon |

## License

Proprietary — © 2024-2026 ClearSkai Technologies LLC. All rights reserved.
