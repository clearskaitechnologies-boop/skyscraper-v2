# Release Notes — v2.8.0 (2026-02-20)

## Summary

Major stability release: 6 critical bug fixes, 2 feature deletions, 4 new features.
**48 files changed** | **1,410 additions** | **3,260 deletions** | **0 TypeScript errors**

---

## Bug Fixes

### 🔴 P0 — Client Portal Down for 1 Week

- **Root cause:** `/portal(.*)` was in the Clerk `isPublicRoute` matcher, preventing `auth().protect()` from injecting session context. `currentUser()` returned `null` → infinite redirect loop.
- **Fix:** Removed `/portal` from public routes. Added portal-specific redirect to `/client/sign-in` for unauthenticated users.

### 🔴 P0 — Pipeline `lifecycle_stage: "ACTIVE"` Crash

- **Root cause:** `stageToLifecycle` mapping in `/api/pipeline/move` used invalid enum values (`INTAKE`, `ACTIVE`, `CLOSED`). Zod schema in `domainSchemas.ts` also had wrong values.
- **Fix:** Aligned both to Prisma enum: `FILED | ADJUSTER_REVIEW | APPROVED | DENIED | APPEAL | BUILD | COMPLETED | DEPRECIATION`.

### 🟡 P1 — Leaderboard Showing Demo Data

- **Root cause:** Claims query in leaderboard API didn't filter out `isDemo: true` records.
- **Fix:** Added `isDemo: false` filter.

### 🟡 P1 — Trades Profile Widget Showing "Set Up"

- **Root cause:** Self-healing in profile API only fixed `null` userId, not stale/wrong userId.
- **Fix:** Broadened condition from `!byOrg.userId` to `byOrg.userId !== userId`.

### 🟡 P1 — Company Page "No Company" Error

- **Root cause:** Auto-create logic created ghost companies instead of linking to existing org-bound company.
- **Fix:** Added STEP 1 lookup for existing `tradesCompany` by `orgId` before creating new.

### 🟡 P1 — Weather Analytics HTTP 402

- **Root cause:** `requireActiveSubscription()` had no beta mode bypass.
- **Fix:** Added `isBetaMode()` check that returns synthetic active subscription during beta.

---

## Feature Deletions

### Community Feature — REMOVED

All portal community feed, maps/communities, community reports engine, and config deleted.

### Batch Reports — REMOVED

All batch-proposals pages, API routes, components, sidebar entries, and nav config deleted.

**Total: 19+ files deleted, 0 remaining references.**

---

## New Features

### Claims Workspace Side Panel

- New `ClaimsSidebar` component with Claim Value, Key Dates, Adjuster Contact, Quick Actions, Property cards
- Claims overview uses 2/3 + 1/3 responsive grid layout

### Job Value in Claims Header

- Emerald pill showing `estimatedValue` in the claim layout header
- Visible on both demo and real claims (hidden when value is $0)

### Manager / Downline Hierarchy

- Self-referential relation on `tradesCompanyMember` (managerId → id)
- SQL migration: `db/migrations/20260220_add_manager_hierarchy.sql`
- API: `/api/trades/company/seats/assign-manager` (POST + GET)
- Safety rails: self-assign prevention, cycle detection (A→B→C→A), cross-company isolation
- UI: promote-to-manager, assign direct reports, org chart toggle

### Sentry Test Endpoint

- Dev-only `/api/dev/sentry-test` for verifying error capture
- Modes: `?mode=handled` (default), `?mode=unhandled`, `?mode=message`
- Blocked in production

---

## Verification

| Check                        | Result                        |
| ---------------------------- | ----------------------------- |
| TypeScript (`tsc --noEmit`)  | ✅ 0 errors                   |
| Next.js build (`next build`) | ✅ Clean                      |
| Migration applied            | ✅ ALTER TABLE + INDEX + FK   |
| Git pushed                   | ✅ `origin/main` at `8283f9d` |

---

## Known Limitations

| Item                | Status                       | Notes                      |
| ------------------- | ---------------------------- | -------------------------- |
| Retail jobs         | 501 stub                     | On roadmap, not in MVP     |
| Claims import       | 501 stub                     | Manual entry for now       |
| Proposals/new       | May show validation banners  | Working, cosmetic issue    |
| Final payout packet | Returns zeros for new claims | Needs line items populated |
| Mailers/send        | 501 stub                     | Email integration pending  |

---

## Rollback Plan

1. **Manager hierarchy UI:** Remove UI elements from `CompanySeatsClient.tsx`; data columns are additive (no schema rollback needed)
2. **Billing bypass:** Set `NEXT_PUBLIC_BETA_MODE=false` to re-enable billing enforcement
3. **Portal auth:** If issues arise, re-add `/portal(.*)` to public matcher (temporary fix only)
4. **Deleted features:** Files archived in git history at commit `b6f94e1~1`
