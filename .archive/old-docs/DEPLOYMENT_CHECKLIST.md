# DEPLOYMENT_CHECKLIST.md

## Phase 1: Database & Environment Setup

### ✅ Local Setup (Complete)

- [x] Created dedicated `app` schema in Supabase
- [x] Updated `.env.local` with `DATABASE_URL` pointing to app schema
- [x] Ran `npx prisma db push` to create subscription tables
- [x] Ran `npx prisma db seed` to seed plans
- [x] Added token consumption guards to AI/DOL routes:
  - `/api/generate-mockup` (100 AI tokens)
  - `/api/generate-pdf` (75 AI tokens)
  - `/api/dol-pull` (1 DOL check token)

### 🔄 Production Database Setup

- [ ] **Create app schema in production database:**
  ```sql
  CREATE SCHEMA IF NOT EXISTS app;
  ```
- [ ] **Run migrations in production** (choose one method):
  - **Option A:** Temporary migration route `/api/admin/migrate` that calls `prisma.db.push()`
  - **Option B:** Vercel CLI preview shell: `npx prisma db push`
  - **Option C:** CI/Post-deploy step (recommended long-term)
- [ ] **Seed plans in production:**
  ```bash
  npx prisma db seed
  ```

### 🔧 Environment Variables Setup

#### ✅ Local (Complete)

All local env vars are configured in `.env.local`

#### 🔄 Production (Vercel Settings → Environment Variables)

Set the following in **Production** environment:

**Database:**

- [ ] `DATABASE_URL=postgres://[user]:[pass]@[host]:5432/[db]?sslmode=require&schema=app`

**Stripe:**

- [ ] `STRIPE_SECRET_KEY=sk_live_...` (or sk*test* for staging)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...` (or pk*test*)
- [ ] `NEXT_PUBLIC_STARTER_PRICE_ID=price_...`
- [ ] `NEXT_PUBLIC_BUSINESS_PRICE_ID=price_...`
- [ ] `NEXT_PUBLIC_ENTERPRISE_PRICE_ID=price_...`

**App:**

- [ ] `NEXT_PUBLIC_APP_URL=https://your-domain.com`

**Clerk (if using):**

- [ ] `CLERK_SECRET_KEY=...`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...`

**Leave blank for now (will be set after webhook creation):**

- [ ] `STRIPE_WEBHOOK_SECRET=` (set after step 5)

### 🔗 Stripe Webhook Setup

- [ ] **Create webhook endpoint:** `https://your-domain.com/api/stripe/webhook`
- [ ] **Select events:**
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] **Copy signing secret** → Add to Vercel as `STRIPE_WEBHOOK_SECRET`
- [ ] **Redeploy** to pick up webhook secret

### 🧪 End-to-End Testing

- [ ] **Fresh org test:**
  1. Sign in with new organization
  2. Navigate to `/billing`
  3. Select a plan and complete checkout
  4. Verify org gets:
     - `subscription.status = active/trialing`
     - `planId` set correctly
     - `tokenWallet` with plan quotas
- [ ] **Token consumption test:**
  - Hit gated pages (should load)
  - Run AI actions (`/api/generate-mockup`, `/api/generate-pdf`)
  - Verify tokens decrement in database
- [ ] **Webhook idempotency:**
  - Re-send last event from Stripe dashboard
  - Verify no duplicate processing (check `WebhookEvent` table)

## Phase 2: Code Quality & CI/CD

### 🧹 Remove Build Bypasses

- [ ] **Remove from `next.config.js`:**
  ```javascript
  // DELETE these lines:
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  ```
- [ ] **Clean build test:**
  ```bash
  rm -rf .next
  npx prisma generate
  npx tsc --noEmit
  npm run lint
  npm run build
  ```
- [ ] **Fix any TypeScript/ESLint errors that surface**

### 🤖 GitHub Actions CI

- [ ] **Create `.github/workflows/ci.yml`** (see template below)
- [ ] **Add repository secrets:**
  - `CI_DATABASE_URL` (test database URL)
  - `CI_STRIPE_SECRET_KEY` (test keys)
  - `CI_STRIPE_WEBHOOK_SECRET` (test secret)
- [ ] **Verify CI passes on push/PR**

### 📊 Observability

- [ ] **Health check working:** `GET /api/health` returns `{ ok: true, db: true }`
- [ ] **Add webhook transition logging** (optional):
  ```javascript
  console.log("Stripe webhook:", { event: type, orgId, planName });
  ```
- [ ] **Monitor error rates** in production logs

## Phase 3: Go-Live Checklist

### 🚀 Final Verification

- [ ] ✅ **Database:** Connects in prod, migrations applied, plans seeded
- [ ] ✅ **Environment:** All required env vars in production
- [ ] ✅ **Stripe:** Webhook created, secret configured, redeploy complete
- [ ] ✅ **Billing Flow:** Checkout works, plan applied, tokens topped up
- [ ] ✅ **Access Control:** Gated routes block unpaid orgs
- [ ] ✅ **Token System:** AI/DOL actions consume tokens correctly
- [ ] ✅ **Code Quality:** Bypass flags removed, clean tsc/eslint
- [ ] ✅ **Monitoring:** Health check returns OK, error logging active

### 🆘 Rollback Plan

If issues occur:

1. **Re-enable build bypasses** (quick fix for deployment)
2. **Revert webhook changes** in Stripe dashboard
3. **Check Vercel function logs** for specific errors
4. **Database:** Keep subscription tables (they're isolated in app schema)

---

## CI/CD Template

Create `.github/workflows/ci.yml`:

\`\`\`yaml
name: CI

on:
push:
branches: [ main ]
pull_request:
branches: [ main ]

permissions:
contents: read

jobs:
build-typecheck-lint:
name: Typecheck, Lint, and Build
runs-on: ubuntu-latest

    env:
      NODE_ENV: production
      NEXT_TELEMETRY_DISABLED: 1
      NEXT_PUBLIC_APP_URL: http://localhost:3000
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: pk_test_dummy
      NEXT_PUBLIC_STARTER_PRICE_ID: price_dummy_starter
      NEXT_PUBLIC_BUSINESS_PRICE_ID: price_dummy_business
      NEXT_PUBLIC_ENTERPRISE_PRICE_ID: price_dummy_enterprise
      DATABASE_URL: \${{ secrets.CI_DATABASE_URL || 'postgresql://user:pass@localhost:5432/db?sslmode=disable' }}
      STRIPE_SECRET_KEY: \${{ secrets.CI_STRIPE_SECRET_KEY || 'sk_test_dummy' }}
      STRIPE_WEBHOOK_SECRET: \${{ secrets.CI_STRIPE_WEBHOOK_SECRET || 'whsec_dummy' }}

    steps:
      - name: 🧾 Checkout
        uses: actions/checkout@v4

      - name: 🟢 Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: 📦 Install deps
        run: npm ci

      - name: 🔧 Generate Prisma client
        run: npx prisma generate

      - name: 🔠 Type check
        run: npx tsc -p tsconfig.json --noEmit

      - name: 🔍 Lint
        run: npm run lint --if-present

      - name: 🏗️ Build
        run: npm run build

      - name: 📦 Upload build artifact
        if: success()
        uses: actions/upload-artifact@v4
        with:
          name: next-build
          path: .next

\`\`\`

---

## Summary

This checklist ensures your subscription system is production-ready with:

- ✅ **Database isolation** (app schema prevents conflicts)
- ✅ **Token enforcement** (all AI/DOL routes protected)
- ✅ **Stripe integration** (checkout + webhooks)
- ✅ **Environment parity** (local/prod configs match)
- ✅ **Code quality** (TypeScript/ESLint validation)
- ✅ **Monitoring** (health checks + error logging)

Follow the phases in order for a smooth deployment! 🚀
