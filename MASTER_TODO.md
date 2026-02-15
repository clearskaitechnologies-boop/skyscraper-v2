# MASTER TODO — SkaiScraper Production Readiness

> Generated: 2026-02-14
> Billing Model: **$80 per seat per month. Period.**
> Stripe Product: `prod_Tylw6eipXQDDDS` / Price: `price_1T0oOREmf7hVRjVVCdV7CRzU`

---

## ✅ COMPLETED — Token/Credit Purge

- [x] All three token systems removed (TokenWallet, usage_tokens, tokens_ledger)
- [x] Prisma schema: token models deleted
- [x] All API routes: token guards stripped (~25 routes)
- [x] All components: token UI removed (~15 components)
- [x] Webhook: duplicate cases merged, zero token branches
- [x] Marketing Pricing: rewritten to single $80/seat card
- [x] `requireActiveSubscription.ts` guard created
- [x] `env.d.ts`: legacy tier price IDs removed
- [x] Referrals: simplified to 30-day extension only
- [x] "Flat pricing" language → "Transparent pricing" (taxes will apply)
- [x] "Dominus AI" → "SkaiScraper AI" in marketing landing page
- [x] Old billing page deleted, crm-tokens deleted, TokensBadge deleted
- [x] Build passes clean (673 static pages, exit 0)

---

## 🔥 PRIORITY 1 — Dashboard & Leaderboard Enhancements

### 1A. Add "Retail" Tab to Company Leaderboard

- **File:** `src/components/dashboard/CompanyLeaderboard.tsx`
- **Current tabs:** Revenue | Claims | Doors
- **Action:** Add "Retail" tab next to Claims
- **Data source:** Need `retailSales` field on leaderboard entries
- **API:** `src/app/api/dashboard/leaderboard/route.ts` — add retail aggregation
- **DB:** Likely from `Job` or `Claim` where job type = "retail" or similar field
- **Status:** ❌ Not started

### 1B. Doors Tracking — Already Wired ✅

- Leaderboard already has `doorsKnocked` field and Doors tab
- Doors are tracked when lead source type = "door knocking"
- **No additional page needed** — it's embedded in the leaderboard
- **Verify:** Ensure door knocking lead source actually increments the counter

### 1C. Dashboard Top Cards — Dynamic Widgets

- **File:** `src/app/(app)/dashboard/page-stark.tsx`
- **Current state:** Basic stat cards
- **Action:** Upgrade to animated/dynamic widgets with trends, sparklines, color coding
- **Reference:** User wants "beautiful" not "basic"
- **Status:** ❌ Not started

---

## 🔥 PRIORITY 2 — Broken Pages

### 2A. Mortgage Checks Page

- **File:** `src/app/(app)/mortgage-checks/page.tsx`
- **User report:** "app error"
- **Investigation needed:** Page exists, server component with Prisma queries
- **Likely cause:** Missing DB table, bad relation, or auth issue
- **Status:** ❌ Not investigated

### 2B. Permits Page

- **File:** `src/app/(app)/permits/page.tsx`
- **User report:** "app error"
- **Investigation needed:** Page exists, server component with Prisma queries
- **Likely cause:** Same as mortgage-checks — likely missing DB table or relation
- **Status:** ❌ Not investigated

### 2C. Claim Financial Page — Route Param Bug 🐛

- **File:** `src/app/(app)/claims/[claimId]/financial/page.tsx`
- **Bug:** Route param is `claimId` but code reads `id` → always empty string
- **Fix:** Change `params.id` → `params.claimId`
- **Status:** ❌ Not fixed

---

## 🔥 PRIORITY 3 — Unified Headers / UI Consistency

All of these pages have custom inline headers instead of the standard `PageHero` component:

| Page               | File                                               | Current Header          |
| ------------------ | -------------------------------------------------- | ----------------------- |
| SMS Center         | `src/app/(app)/sms/page.tsx`                       | Inline gradient + emoji |
| Permits            | `src/app/(app)/permits/page.tsx`                   | Inline gradient + emoji |
| Mortgage Checks    | `src/app/(app)/mortgage-checks/page.tsx`           | Inline gradient + emoji |
| Financial Overview | `src/app/(app)/financial/reports/page.tsx`         | Mismatched old style    |
| Commission Plans   | `src/app/(app)/settings/commission-plans/page.tsx` | Inline gradient + emoji |
| Invoices           | `src/app/(app)/invoices/page.tsx`                  | Inline gradient + emoji |
| Commissions        | `src/app/(app)/commissions/page.tsx`               | Inline gradient + emoji |

### Action Items:

- [ ] Identify or create the standard `PageHero` component
- [ ] Replace all inline headers with `PageHero`
- [ ] Remove black outlines on card borders (likely `border` class → `border-slate-200` or remove)
- [ ] Upgrade basic stat cards to glass/surface pattern used elsewhere
- **Status:** ❌ Not started

---

## 🔥 PRIORITY 4 — Real Data (Zero Demo Data)

### 4A. Financial Overview — 100% Hardcoded 🔴

- **File:** `src/app/(app)/financial/reports/page.tsx`
- **Problem:** Every value is fake ($328,450, $198,230, etc.), no API calls, no Prisma queries
- **Action:** Wire to real financial data from claims/invoices/commissions
- **Needs:** API endpoint or server-side Prisma queries for P&L, revenue, expenses
- **Status:** ❌ Not started

### 4B. All Other CRM Pages

- SMS Center: ✅ Real data (Twilio API)
- Permits: ✅ Real data (Prisma)
- Mortgage Checks: ✅ Real data (Prisma)
- Commission Plans: ✅ Real data (API)
- Invoices: ✅ Real data (Prisma)
- Commissions: ✅ Real data (Prisma)

---

## 📋 PRIORITY 5 — Subscription Enforcement

### 5A. Wire `requireActiveSubscription` Guard

- **File:** `src/lib/billing/requireActiveSubscription.ts` (created ✅)
- **Action:** Add to key API routes that should require an active subscription
- **Routes to guard (pick critical ones):**
  - `/api/ai/*` — AI features
  - `/api/claims/*` — core claim operations
  - `/api/estimate/*` — estimates
  - `/api/export/*` — exports
  - `/api/generate-*` — generators
- **Note:** All features are UNLIMITED with active seat — guard only checks subscription exists
- **Status:** ❌ Not wired

### 5B. Set Stripe Price ID in Vercel

- **Env var:** `STRIPE_PRICE_ID`
- **Value:** `price_1T0oOREmf7hVRjVVCdV7CRzU`
- **Action:** Set in Vercel dashboard → Settings → Environment Variables
- **Status:** ❌ Not set (needs manual action in Vercel dashboard)

---

## 📋 PRIORITY 6 — Marketing & Public-Facing Cleanup

### 6A. Dominus References

- **Marketing:** ✅ Fixed (MarketingLanding.tsx → "SkaiScraper AI")
- **Internal (351 refs):** Keep as-is — Dominus is the internal AI engine name
- **Action if user wants full rename:** Would require renaming types, components, API modules — massive refactor
- **Status:** ✅ Marketing clean

### 6B. Token/Credit References in Marketing

- **Status:** ✅ All clean — only benign "credit card" / "Stripe credits" references remain

---

## 📋 PRIORITY 7 — Code Quality & DevOps

### 7A. Prisma Schema Cleanup

- `Plan` model still has `monthlyTokens`, `aiIncluded` fields
- These are DB columns that need a migration to remove
- Low priority — they don't affect functionality
- **Status:** ❌ Not started

### 7B. Stale Imports / Dead Code Scan

- Run periodic `pnpm build` to catch import errors
- Consider adding `eslint-plugin-unused-imports`
- **Status:** ✅ Current build is clean

### 7C. Template Marketplace Layout Warning

- `reports/templates/marketplace/page.tsx` is under `(app)` layout
- Sidebar shows when it shouldn't for public marketplace
- **Fix:** Move to `src/app/(public)/reports/templates/marketplace/page.tsx`
- **Status:** ❌ Not fixed

---

## 📋 PRIORITY 8 — Future Enhancements (User Requests)

### 8A. Doors Standalone Page (Optional)

- Currently tracked in leaderboard only
- Could build dedicated `/doors` page for field reps to log door knocks
- Includes map view, daily targets, route planning
- **Status:** ❌ Not built (leaderboard tracking works)

### 8B. Beautiful Widget Cards

- Replace basic `<Card>` stat components with:
  - Sparkline trends (7-day / 30-day)
  - Color-coded status indicators
  - Animated count-up numbers
  - Glass morphism / gradient backgrounds
- **Status:** ❌ Not started

### 8C. Volume Discounts

- Pricing pages mention "Volume discounts for 50+ seats"
- Need to implement Stripe quantity-based pricing tiers or manual discount codes
- **Status:** ❌ Not implemented

---

## 🚀 DEPLOYMENT CHECKLIST

Before each deploy:

1. [ ] `npx prisma generate` — regenerate client
2. [ ] `pnpm build` — verify 0 errors
3. [ ] `grep -rn "token" src/app/api/webhooks/stripe` — should return 0
4. [ ] Check `env.d.ts` — only `STRIPE_PRICE_ID`, no tier vars
5. [ ] Set `STRIPE_PRICE_ID=price_1T0oOREmf7hVRjVVCdV7CRzU` in Vercel env
6. [ ] `git add . && git commit && vercel --prod`

---

## Summary Counts

| Category            | Total  | Done   | Remaining |
| ------------------- | ------ | ------ | --------- |
| Token Purge         | 14     | 14     | 0         |
| Dashboard           | 3      | 1      | 2         |
| Broken Pages        | 3      | 0      | 3         |
| Unified Headers     | 7      | 0      | 7         |
| Real Data           | 1      | 0      | 1         |
| Subscription Guard  | 2      | 0      | 2         |
| Marketing Cleanup   | 2      | 2      | 0         |
| Code Quality        | 3      | 1      | 2         |
| Future Enhancements | 3      | 0      | 3         |
| **TOTAL**           | **38** | **18** | **20**    |
