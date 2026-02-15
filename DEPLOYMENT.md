# Deployment Guide

## Environments

| Environment    | URL                    | Branch      | Auto-Deploy     |
| -------------- | ---------------------- | ----------- | --------------- |
| **Production** | https://skaiscrape.com | `main`      | ✅ Yes (Vercel) |
| **Preview**    | `*.vercel.app`         | PR branches | ✅ Yes          |
| **Local Dev**  | http://localhost:3000  | any         | Manual          |

## Prerequisites

- Node.js ≥22, <23
- pnpm ≥10.0.0
- PostgreSQL (via Supabase or local)
- Clerk account (authentication)
- Stripe account (payments)
- OpenAI API key (AI features)

## Local Development Setup

```bash
# 1. Clone and install
git clone https://github.com/ClearSkaiTechnologiesLLC/Skaiscrape.git
cd Skaiscrape
pnpm install

# 2. Set up environment
cp .env.example .env.local
# Fill in all required values (see .env.example for descriptions)

# 3. Generate Prisma client
npx prisma generate

# 4. Apply database migrations
# See db/migrations/ for the migration files
# Apply in date order using psql or your preferred tool

# 5. Start dev server
pnpm dev
```

## Environment Variables

All required environment variables are documented in `.env.example` (359 variables).

### Critical Variables

| Variable                            | Service                    | Required       |
| ----------------------------------- | -------------------------- | -------------- |
| `DATABASE_URL`                      | Supabase PostgreSQL        | ✅             |
| `DIRECT_URL`                        | Supabase Direct Connection | ✅             |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk                      | ✅             |
| `CLERK_SECRET_KEY`                  | Clerk                      | ✅             |
| `NEXT_PUBLIC_SUPABASE_URL`          | Supabase                   | ✅             |
| `SUPABASE_SERVICE_ROLE_KEY`         | Supabase                   | ✅             |
| `OPENAI_API_KEY`                    | OpenAI                     | ✅             |
| `STRIPE_SECRET_KEY`                 | Stripe                     | ✅             |
| `STRIPE_WEBHOOK_SECRET`             | Stripe                     | ✅             |
| `RESEND_API_KEY`                    | Resend                     | For email      |
| `SENTRY_DSN`                        | Sentry                     | For monitoring |

### Security-Sensitive Flags

| Variable                | Production Value | Purpose                |
| ----------------------- | ---------------- | ---------------------- |
| `NEXT_PUBLIC_BETA_MODE` | `false`          | Auth bypass (dev only) |
| `NODE_ENV`              | `production`     | Disables debug tooling |

## Production Deployment

### Vercel (Primary)

Deployments are automatic on push to `main`:

1. Push to `main` branch
2. Vercel builds automatically (`next build`)
3. Prisma client is generated during `postinstall`
4. Deployment goes live at skaiscrape.com

### Manual Deploy

```bash
# Build locally to verify
pnpm build

# Deploy to Vercel production
vercel --prod
```

### Build Configuration

- **Build Command:** `NODE_OPTIONS=--max_old_space_size=8192 BUILD_PHASE=1 next build`
- **Output Directory:** `.next`
- **Node Version:** 22.x
- **Package Manager:** pnpm 10.x

## Database Migrations

Migrations are raw SQL files in `db/migrations/`, ordered by date prefix (`YYYYMMDD_description.sql`).

### Applying Migrations

```bash
# Apply a specific migration
psql "$DATABASE_URL" -f ./db/migrations/20260208_example.sql

# Or use the VS Code task:
# "02: Apply Local DB Migrations"
```

### Migration Conventions

- Prefix with date: `YYYYMMDD_description.sql`
- Use `CREATE TABLE IF NOT EXISTS` for safety
- Seed data goes in separate files prefixed with `seed_`
- Archive old/one-off migrations in `db/migrations/archive/`

## Feature Flags

| Flag                    | Type    | Purpose                                |
| ----------------------- | ------- | -------------------------------------- |
| `NEXT_PUBLIC_BETA_MODE` | Env var | Auth bypass (dev only, locked in prod) |
| `BUILD_PHASE`           | Env var | Skips runtime checks during build      |
| `STOP_AFTER_ONE`        | Env var | Worker processes one item then exits   |

## Health Checks

```bash
# Production health
curl https://skaiscrape.com/api/health/live

# Ready check (includes DB)
curl https://skaiscrape.com/api/health/ready
```

## Monitoring

- **Errors:** Sentry (server + edge + client source maps)
- **Uptime:** Health endpoints at `/api/health/live` and `/api/health/ready`
- **Logs:** Vercel runtime logs

## Rollback Strategy

1. **Vercel Instant Rollback:** Use Vercel dashboard → Deployments → promote previous deployment
2. **Git Revert:** `git revert HEAD && git push` triggers new deployment
3. **Database:** Migrations are additive — rollback requires manual SQL

## VS Code Tasks

The project includes pre-configured VS Code tasks (`.vscode/tasks.json`):

| Task                            | Purpose                   |
| ------------------------------- | ------------------------- |
| `01: Install & Generate Prisma` | Fresh setup               |
| `02: Apply Local DB Migrations` | Apply all migrations      |
| `03: Dev Server`                | Start development server  |
| `04: Worker — STOP_AFTER_ONE`   | Run upload processor once |
| `Deploy SkaiScraper`            | Build + deploy to Vercel  |

## Troubleshooting

### Build fails with memory error

Increase Node memory: `NODE_OPTIONS=--max_old_space_size=8192`

### Prisma client out of date

Run: `npx prisma generate`

### Auth not working locally

1. Verify Clerk keys in `.env.local`
2. Ensure `NEXT_PUBLIC_BETA_MODE=false` (or `true` for dev bypass)
3. Check middleware logs in terminal

### Database connection issues

1. Verify `DATABASE_URL` and `DIRECT_URL` in `.env.local`
2. Check Supabase project is active
3. Try: `npx prisma db pull` to verify connection
