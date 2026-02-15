# 🏗️ SkaiScraper — Master TODO

> Last updated: 2025-07-03
> Target: 10,000 active users · $80/seat · Enterprise-grade reliability

---

## ✅ Phase 1 — Foundation (COMPLETE)

### Billing & Payments

- [x] $80/seat/month Stripe billing system
- [x] `POST /api/billing/create-subscription` — Stripe Customer + Subscription
- [x] `POST /api/billing/update-seats` — seat quantity with proration
- [x] `GET /api/billing/seats` — seat usage info
- [x] Seat enforcement (`checkSeatAvailability`, `enforceSeatLimit`)
- [x] Webhook handlers: `customer.subscription.updated/deleted`, `invoice.payment_succeeded`
- [x] Settings → Billing page rewrite (seat selector, stepper, price breakdown)
- [x] Marketing → Pricing page rewrite (flat $80/seat, calculator, FAQ)
- [x] `STRIPE_SETUP_GUIDE.md` — complete setup documentation
- [x] Performance indexes migration (`20250702_performance_indexes_and_seat_billing.sql`)

### Identity & Auth

- [x] Deterministic `org_${userId}` identity resolution (root cause fix)
- [x] Clerk auth guards on all protected routes
- [x] `safeOrgContext()` helper for API routes

---

## ✅ Phase 2 — Feature Expansion (COMPLETE)

### Smart Documents (`/smart-docs`)

- [x] `SignatureEnvelope` Prisma model (19 e-sign files)
- [x] Smart Documents hub page — KPIs, document list, create, send, templates
- [x] `GET /api/smart-docs/envelopes` — list all envelopes
- [x] Template gallery (Authorization to Represent, Scope of Work, Material Selection, etc.)
- [x] Nav entry added to `CORE_NAV` + context nav

### Measurements (`/measurements`)

- [x] `measurement_orders` Prisma model (provider, order_type, status tracking)
- [x] SQL migration (`20250703_measurements_and_smart_docs.sql`)
- [x] `GET/POST /api/measurements` — list & create orders
- [x] `GET/PATCH/DELETE /api/measurements/[id]` — detail, update, cancel
- [x] `POST /api/measurements/webhook` — provider callback endpoint
- [x] Measurements page — order form, status tracking, provider cards
- [x] Nav entry added to `CORE_NAV` + context nav

### QuickBooks Integration (`/settings/integrations`)

- [x] `quickbooks_connections` Prisma model (OAuth tokens, sync tracking)
- [x] QuickBooks service layer (OAuth, Customer/Invoice/Payment CRUD, Job-to-Invoice sync)
- [x] OAuth callback route (`/api/integrations/quickbooks/callback`)
- [x] `GET/POST /api/integrations/quickbooks/status` — connection status & disconnect
- [x] Settings → Integrations page (connect/disconnect, status, sync info)
- [x] Integration cards for GAF QuickMeasure, EagleView, Xactimate

### Scale Hardening (10K Users)

- [x] Prisma transaction timeouts (maxWait: 10s, timeout: 30s)
- [x] Scale configuration constants (`src/lib/scale/config.ts`)
- [x] Deep health check endpoint (`/api/health/deep` — DB, cache, memory)
- [x] Runtime health monitoring module (`src/lib/scale/health.ts`)
- [x] Nav context entries for `/settings`, `/smart-docs`, `/measurements`

---

## 🔄 Phase 3 — Next Sprint

### Smart Documents — Enhanced

- [ ] **Template PDF generation** — render template to PDF server-side
- [ ] **Document upload** — upload existing PDFs to sign
- [ ] **Multi-signer flow** — sequential signing with role-based fields
- [ ] **Resend email delivery** — wire `send` endpoint to Resend (`esign-invite.ts`)
- [ ] **Audit trail** — tamper-evident signature log for legal compliance
- [ ] **Bulk send** — send same document to multiple properties
- [ ] **Template builder** — drag-and-drop field placement UI

### Measurements — Enhanced

- [ ] **GAF QuickMeasure API integration** — direct order placement (requires partner app)
- [ ] **EagleView API integration** — direct order placement
- [ ] **Manual report upload** — Supabase Storage upload for PDF/image reports
- [ ] **Auto-attach to claims** — link measurement data to claim estimates
- [ ] **Measurement viewer** — interactive display of roof facets, waste factor, totals
- [ ] **Xactimate ESX parser** — import line items from ESX files

### QuickBooks — Enhanced

- [ ] **Auto-sync on job close** — trigger QB invoice creation when job status = complete
- [ ] **Payment reconciliation** — match QB payments to SkaiScraper records
- [ ] **Multi-entity support** — connect multiple QB companies per org
- [ ] **Sync dashboard** — real-time sync status, error resolution UI
- [ ] **Batch sync** — sync all unsynced jobs in one click

### Scale — 10K Production

- [ ] **L1 in-memory cache** — add `lru-cache` as L1 in front of Redis L2
- [ ] **Consolidate rate limiters** — unify 6 rate-limit codepaths to single Upstash SDK path
- [ ] **BullMQ queue consolidation** — merge two separate queue connection patterns
- [ ] **PgBouncer URL enforcement** — add `?pgbouncer=true&connection_limit=10&pool_timeout=20` to prod DATABASE_URL
- [ ] **Database connection monitoring** — alert when connections exceed 80% capacity
- [ ] **Error boundaries** — React error boundaries on every page section
- [ ] **Structured logging** — replace `console.log` with Pino/Winston structured logger
- [ ] **Request tracing** — add correlation IDs to all API requests
- [ ] **Graceful degradation** — serve cached data when DB is slow (>500ms)
- [ ] **CDN static assets** — move public assets to Vercel Edge Cache
- [ ] **Database read replicas** — route read-heavy queries to Supabase replica

---

## 📋 Phase 4 — Enterprise Features

### Client Portal

- [ ] Homeowner-facing portal (`/portal/[claimId]`)
- [ ] Real-time project status tracking
- [ ] Document signing from portal
- [ ] Photo upload for damage documentation
- [ ] Payment status & invoice history

### Advanced AI

- [ ] AI claims analysis — automatic damage detection from photos
- [ ] AI supplement builder — generate supplement arguments from adjuster notes
- [ ] AI rebuttal engine — context-aware carrier response drafting
- [ ] AI cost estimator — predictive pricing based on market data

### Team & Permissions

- [ ] Role-based access control (RBAC) — admin, manager, sales, production
- [ ] Team performance dashboards
- [ ] Commission tracking & payroll integration
- [ ] Territory management with geofencing

### Mobile

- [ ] Progressive Web App (PWA) — offline-capable on mobile
- [ ] Push notifications for job updates
- [ ] In-field photo capture with GPS tagging
- [ ] Offline signature collection

---

## 🔒 Critical Infrastructure

| Concern            | Status | Notes                                                |
| ------------------ | ------ | ---------------------------------------------------- |
| Database backups   | ✅     | Supabase daily automated backups                     |
| SSL/TLS            | ✅     | Enforced by Vercel + Supabase                        |
| Auth (Clerk)       | ✅     | Production-hardened, MFA available                   |
| Rate limiting      | ⚠️     | 6 implementations — needs consolidation              |
| Connection pooling | ⚠️     | PgBouncer available, needs URL enforcement           |
| Queue system       | ⚠️     | BullMQ installed, two connection patterns            |
| Monitoring         | ✅     | Deep health check + Sentry integration               |
| Error handling     | ✅     | All API routes have try/catch + structured responses |
| Input validation   | ⚠️     | Ad-hoc — should add Zod schemas to all API routes    |

---

## 🔑 Environment Variables Required

### Stripe (Billing)

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...          # $80/seat monthly price
```

### QuickBooks

```
QUICKBOOKS_CLIENT_ID=...
QUICKBOOKS_CLIENT_SECRET=...
QUICKBOOKS_REDIRECT_URI=https://skaiscrape.com/api/integrations/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=production   # or "sandbox"
```

### Database (Scale)

```
DATABASE_URL=postgresql://...?pgbouncer=true&connection_limit=10&pool_timeout=20
DIRECT_DATABASE_URL=postgresql://...   # Direct connection for migrations
```

### Redis

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
REDIS_URL=redis://...               # ioredis TCP (BullMQ)
```

---

## 📊 Scale Targets

| Metric                  | Current | Target | Strategy                              |
| ----------------------- | ------- | ------ | ------------------------------------- |
| Active users            | ~50     | 10,000 | PgBouncer + connection limits         |
| Concurrent API requests | ~10     | 500    | Rate limiting + caching               |
| Database connections    | ~20     | 1,000  | connection_limit=10 × 100 functions   |
| Response time (p95)     | ~800ms  | <300ms | L1 cache + optimized queries          |
| Uptime                  | 99.5%   | 99.9%  | Health checks + graceful degradation  |
| Data loss tolerance     | None    | None   | Supabase backups + transaction safety |

---

_"WE CANNOT AFFORD TO LOSE DATA OR JOBS. THIS SYSTEM NEEDS TO BE READY."_
