# MASTER SIMPLIFICATION PLAN

> **Mandate:** $80 per seat per month. Period.
> No tokens. No credits. No tiers. No feature paywalls. No upsells.
> Every paying user gets **everything**.

---

## 1. What We Keep

| Layer               | File / Pattern                        | Why                                      |
| ------------------- | ------------------------------------- | ---------------------------------------- |
| Seat pricing        | `src/lib/billing/seat-pricing.ts`     | Single source of truth ($80/seat)        |
| Seat enforcement    | `src/lib/billing/seat-enforcement.ts` | Prevents over-invite beyond paid seats   |
| Stripe portal       | `src/lib/billing/portal.ts`           | Customer self-serve invoices & payment   |
| Stripe infra        | `src/lib/billing/stripe.ts`           | Shared Stripe client setup               |
| Trials              | `src/lib/billing/trials.ts`           | 72-hour trial onboarding                 |
| Subscription model  | `prisma/schema.prisma → Subscription` | Tracks stripeSubId, seatCount, status    |
| Create subscription | `api/billing/create-subscription`     | $80 × seats checkout                     |
| Update seats        | `api/billing/update-seats`            | Add/remove seats mid-cycle               |
| Seats API           | `api/billing/seats`                   | Seat count query                         |
| Portal API          | `api/billing/portal`                  | Stripe billing portal redirect           |
| Invoices API        | `api/billing/invoices`                | Invoice history                          |
| Info API            | `api/billing/info`                    | Billing summary                          |
| Status API          | `api/billing/status`                  | Subscription status                      |
| Webhook             | `api/webhooks/stripe` (edited)        | Subscription lifecycle + emails          |
| Billing page        | `(app)/settings/billing/page.tsx`     | Already pure seat-based UI               |
| Full access routes  | `api/billing/full-access/*`           | Trades Network membership                |
| Referrals (edited)  | `src/lib/referrals/*`                 | Keep month extension, remove token award |

## 2. What We Delete — Token / Credit / Tier Files

### API Routes (DELETE ENTIRE DIRECTORIES)

- `src/app/api/tokens/` — 7 routes (buy, consume, purchase, status, adjust, balance, route)
- `src/app/api/admin/tokens/` — 4 routes (route, simulate-reset, reset, refill)
- `src/app/api/org/tokens/` — 1 route
- `src/app/api/checkout/` — 2 routes (legacy token checkout + token-pack)
- `src/app/api/billing/token-pack/` — token pack checkout
- `src/app/api/billing/tokens/` — token checkout
- `src/app/api/billing/plans/` — tier/plan route
- `src/app/api/billing/auto-refill/` — auto-refill balance
- `src/app/api/billing/report-credits/` — report credit checkout + balance
- `src/app/api/billing/purchases/` — token purchase history
- `src/app/admin/tokens/` — admin token page + error boundary

### Library Files (DELETE)

- `src/lib/tokens/` — entire directory (index.ts, charge.ts, planQuotas.ts, **tests**)
- `src/lib/billing/autoRefill.ts` — auto-refill via Stripe
- `src/lib/billing/checkLimits.ts` — plan limit checks
- `src/lib/billing/constants.ts` — token cost constants
- `src/lib/billing/enforcement.ts` — tier enforcement
- `src/lib/billing/entitlements.ts` — feature entitlements by plan
- `src/lib/billing/plans.ts` — plan definitions & quotas
- `src/lib/billing/priceMap.ts` — Stripe priceId → tier mapping
- `src/lib/billing/usage.ts` — usage/overage calculations
- `src/lib/billing/wallet.ts` — token wallet balance
- `src/lib/credits/wallet.ts` — report credits wallet
- `src/config/reportCreditPlans.ts` — report credit plan definitions
- `src/stores/tokenStore.ts` — Zustand token store

### Components (DELETE)

- `src/components/tokens/TokenCounter.tsx`
- `src/components/tokens/TokenUpsellModal.tsx`
- `src/components/tokens/NoTokensModal.tsx`
- `src/components/tokens/TokenBar.tsx`
- `src/components/tokens/TokenBanner.tsx`
- `src/components/dashboard/TokenUsageChart.tsx`

## 3. What We Edit — Surgical Cleanup

### Stripe Webhook (`api/webhooks/stripe/route.ts`)

- Remove imports: `ensureTokenRow`, `refill`, `resetMonthly`, `PRICE_TO_PLAN`
- Remove `awardFirstOrTokens` import
- Remove token seeding in `checkout.session.completed`
- Remove `usage_tokens` reset blocks
- Remove token-pack purchase handler
- Remove token top-up handler
- Keep: emails, seat-billing, subscription status, full-access, referral month extension

### ~15 API Routes — Remove Token Charge Calls

All these files import from `@/lib/tokens` — remove the import and any charge/deduct/require blocks:

- `api/uploads/route.ts` — remove `requireTokens`, `spendTokens`
- `api/reports/generate/route.ts` — remove `charge`, `InsufficientTokensError`
- `api/claims/[claimId]/predict/route.ts` — remove `charge` (20 tokens)
- `api/generate-mockup/route.ts` — remove `runMockupAndCharge`
- `api/generate-pdf/route.ts` — remove `runWeatherClaimAndCharge`
- `api/ai/damage-builder/route.ts` — remove `deduct`, `getTokenStatus`
- `api/ai/damage/upload/route.ts` — remove token import
- `api/ai/damage/analyze/route.ts` — remove token import
- `api/ai/proposals/run/route.ts` — remove token import
- `api/ai/weather/run/route.ts` — remove token import
- `api/ai/chat/route.ts` — remove token import
- `api/dol-pull/route.ts` — remove token import
- `api/dol-check/route.ts` — remove token import
- `api/health/summary/route.ts` — remove token status

### Referral Utils (`src/lib/referrals/utils.ts`)

- Remove token branch from `awardFirstOrTokens` — always return month extension
- Remove `usage_tokens` increment logic

### Prisma Schema — Remove Token Models

- `TokenWallet` model
- `token_packs` model
- `token_usage` model
- `tokens_ledger` model
- `org_usage` model (if exists)
- `usage_tokens` model (if exists)
- Remove token relations from `Org` model

## 4. Post-Purge Verification

1. `npx prisma generate` — must succeed
2. `pnpm build` — must succeed (no broken imports)
3. Git commit all changes
4. Deploy to Vercel production

---

**Result:** A clean, enterprise-grade SaaS where every user pays $80/seat/month and gets unlimited access to every feature. No complexity. No upsells. No confusion.
