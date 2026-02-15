# 🦅 MASTER RAVEN OPERATIONAL OVERVIEW

**Generated:** January 16, 2026  
**Repository:** preloss-vision-main (Skaiscraper)  
**Branch:** raven/dead-page-cleanup  
**Status:** Production Application with Gaps

---

## 📊 EXECUTIVE SUMMARY

| Category               | Status         | Health |
| ---------------------- | -------------- | ------ |
| **Core Claims System** | ✅ Functional  | 🟢 85% |
| **Client Portal**      | ⚠️ Partial     | 🟡 60% |
| **Trades Network**     | ⚠️ Partial     | 🟡 55% |
| **AI Features**        | ✅ Mostly Real | 🟢 75% |
| **Billing/Tokens**     | ✅ Functional  | 🟢 80% |
| **File Uploads**       | ✅ Functional  | 🟢 85% |
| **Background Jobs**    | ⚠️ Partial     | 🟡 70% |
| **Security**           | ✅ Good        | 🟢 80% |

**Overall Operational Readiness:** 🟢 **76%**

> Security upgraded from 65% to 80% after verifying many "unprotected" routes actually use alternative auth patterns.

---

## 1️⃣ SYSTEM VERIFICATION

### ✅ Fully Functional Features

| Feature                 | Status | Evidence                                 |
| ----------------------- | ------ | ---------------------------------------- |
| Clerk Authentication    | ✅     | 475+ routes use `auth()`                 |
| Claims CRUD             | ✅     | Full workflow, timeline, documents       |
| File Uploads (Supabase) | ✅     | Guardrails, quotas, fallback to Firebase |
| PDF Report Generation   | ✅     | Puppeteer + react-pdf, queue system      |
| Stripe Billing          | ✅     | Webhooks with signature verification     |
| Token/Wallet System     | ✅     | Ledger, consumption tracking             |
| Email Queue (Resend)    | ✅     | Retry logic, 5 max attempts              |
| Weather Integration     | ✅     | NOAA + OpenAI analysis                   |
| Cron Jobs               | ✅     | 8+ active crons via Vercel               |

### ⚠️ Partially Functional Features

| Feature               | Status | Issues                                |
| --------------------- | ------ | ------------------------------------- |
| Client Portal         | ⚠️     | Missing FK relations, orphaned models |
| Trades Network        | ⚠️     | Schema drift, legacy tables           |
| AI Rebuttal Engine    | ⚠️     | No billing check, medium risk         |
| Contractor Assignment | ⚠️     | Uses claim_events workaround          |
| Push Notifications    | ⚠️     | TODO in code, not implemented         |
| Virus Scanning        | ⚠️     | Basic signature only, no ClamAV       |

### ❌ Non-Functional / Aspirational

| Feature                  | Status | Notes                               |
| ------------------------ | ------ | ----------------------------------- |
| Mockup Generation        | ❌     | Disabled (needs Replicate key)      |
| Video Processing         | ❌     | Worker exists but not integrated    |
| Real-time Chat           | ❌     | Messages table exists, no WebSocket |
| ClientNotification Model | ❌     | Referenced in code, not in schema   |
| BullMQ Scheduler         | ❌     | Disabled by default                 |

---

## 2️⃣ ROUTE & ENDPOINT AUDIT

### Authentication Coverage

| Auth Method                     | Routes  | Percentage |
| ------------------------------- | ------- | ---------- |
| ✅ `auth()` from Clerk          | 475     | 60%        |
| ✅ `requireUser()`              | 40+     | 5%         |
| ✅ `withOrgScope()`             | 50+     | 6%         |
| ✅ CRON_SECRET                  | 6+      | 1%         |
| ⚠️ `getActiveOrgContext()` only | 104     | 13%        |
| 🔓 Public (intentional)         | 65      | 8%         |
| ⚠️ **Needs Review**             | **~50** | **~6%**    |

> **Note:** Initial audit flagged 148 routes as "unprotected" but many use alternative auth patterns (`getActiveOrgContext`, `getCurrentUserPermissions`, compose wrappers) that include auth internally.

### 🚨 Security Issues (Re-verified)

| Route                    | Risk      | Issue                          | Actual Status                                   |
| ------------------------ | --------- | ------------------------------ | ----------------------------------------------- |
| `/api/debug/claims`      | 🟡 MEDIUM | Debug route                    | ✅ Scoped to user's org via getActiveOrgContext |
| `/api/debug/demo-claims` | 🟡 MEDIUM | Demo data                      | ⚠️ Verify scope                                 |
| `/api/ai/diagnose-setup` | � MEDIUM  | Config check                   | ⚠️ Verify auth wrapper                          |
| `/api/vendors/search`    | ✅ OK     | -                              | ✅ Has safeAuth + withOrgScope + withRateLimit  |
| `/api/ai/generate`       | 🟡 MEDIUM | No rate limit or billing check | ⚠️ Add billing check                            |
| `/api/debug/*`           | 🟢 LOW    | Debug routes                   | ⚠️ Review each individually                     |

### Webhook Security ✅

| Webhook                | Signature Verification  |
| ---------------------- | ----------------------- |
| `/api/webhooks/stripe` | ✅ Stripe signature     |
| `/api/webhooks/clerk`  | ✅ SVIX signature       |
| `/api/webhooks/lob`    | ✅ LOB signature        |
| `/api/webhooks/trades` | ⚠️ No idempotency check |

---

## 3️⃣ PRO ↔ CLIENT BRIDGE ANALYSIS

### Entity Relationship Map

```
┌─────────────────┐      ┌──────────────────┐
│     Client      │◄────►│   tradesCompany  │
│   (cuid ID)     │      │    (UUID ID)     │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         ▼                        ▼
┌─────────────────┐      ┌──────────────────┐
│ClientProConnection│    │tradesCompanyMember│
│  clientId=cuid   │     │   (UUID ID)       │
│contractorId=UUID │     └──────────────────┘
└────────┬────────┘
         │ ⚠️ ID TYPE MISMATCH
         ▼
┌─────────────────┐
│     claims      │◄─── No direct FK to tradesCompany
│   (String ID)   │     Uses claim_events workaround
└─────────────────┘
```

### 🔴 Critical Entity Issues

| Issue                                       | Models Affected                                        | Impact                     |
| ------------------------------------------- | ------------------------------------------------------ | -------------------------- |
| **ID Type Mismatch**                        | ClientProConnection, ClientSavedPro, ClientWorkRequest | cuid ↔ UUID joins may fail |
| **Missing FK: leads.clientId**              | leads, Client                                          | No relation enforced       |
| **Missing FK: ClientPortalAccess.clientId** | ClientPortalAccess, Client                             | Orphaned records possible  |
| **Missing FK: ClaimClientLink.claimId**     | ClaimClientLink, claims                                | Email access not linked    |
| **Missing FK: ClaimTimelineEvent.claimId**  | ClaimTimelineEvent, claims                             | Cascade delete broken      |
| **Duplicate Tables**                        | client_networks vs Client                              | Data fragmentation         |
| **Duplicate Tables**                        | client_saved_trades vs ClientSavedPro                  | Same purpose               |

### Missing Models (Referenced in Code)

| Model                 | Where Referenced             | Status                        |
| --------------------- | ---------------------------- | ----------------------------- |
| `ClientNotification`  | 5+ notification files        | ❌ Not in schema              |
| `client_activity_log` | network/clients              | ❌ Not in schema              |
| `ClaimContractor`     | Best practice for assignment | ❌ Using claim_events instead |

---

## 4️⃣ SCHEMA & DATA DRIFT AUDIT

### Legacy Tables to Consolidate

| Legacy                | Modern           | Recommendation              |
| --------------------- | ---------------- | --------------------------- |
| `client_networks`     | `Client`         | Migrate data, remove legacy |
| `client_contacts`     | Part of Client   | Flatten into Client         |
| `client_saved_trades` | `ClientSavedPro` | Remove duplicate            |

### Missing Fields/Relations

```prisma
// NEEDED: Add to ClientProConnection
claimId String?
claim   claims? @relation(fields: [claimId], references: [id])

// NEEDED: Add to leads
client Client? @relation(fields: [clientId], references: [id])

// NEEDED: Add to ClientPortalAccess
client Client @relation(fields: [clientId], references: [id])
claim  claims @relation(fields: [claimId], references: [id])
```

### tradesCompany.orgId Issue

```
tradesCompany.orgId = UUID (@db.Uuid)
Org.id              = cuid (String)
```

This ID type mismatch means `tradesCompany` cannot have a proper FK to `Org`.

---

## 5️⃣ AI FEATURES STATUS

### AI Endpoint Security Matrix

| Endpoint                 | Auth | Rate Limit | Billing | Real/Demo   | Risk |
| ------------------------ | ---- | ---------- | ------- | ----------- | ---- |
| `/api/ai/chat`           | ✅   | ✅ 10/min  | ⚠️      | ✅ REAL     | 🟢   |
| `/api/ai/rebuttal`       | ✅   | ✅ 10/min  | ❌      | ✅ REAL     | 🟡   |
| `/api/ai/generate`       | ✅   | ❌         | ❌      | ✅ REAL     | 🔴   |
| `/api/ai/diagnose-setup` | ❌   | ❌         | ❌      | ✅ REAL     | 🔴   |
| `/api/ai/analyze-damage` | ✅   | ✅ 10/min  | ✅      | ✅ REAL     | 🟢   |
| `/api/ai/weather`        | ✅   | ✅ 10/min  | ✅      | ✅ REAL     | 🟢   |
| `/api/ai/mockup`         | ✅   | ✅ 10/min  | ❌      | ❌ DISABLED | 🟢   |
| `/api/reports/build`     | ✅   | ❌         | ✅      | ✅ REAL     | 🟢   |
| `/api/vendors/search`    | ❌   | ❌         | ❌      | ✅ REAL     | 🔴   |

### AI Key Usage

| Key                   | Files Using | Status            |
| --------------------- | ----------- | ----------------- |
| `OPENAI_API_KEY`      | 25+         | ✅ Required       |
| `XAI_API_KEY`         | 1           | ⚠️ Optional       |
| `REPLICATE_API_TOKEN` | 1           | ❌ Not configured |
| `ANTHROPIC_API_KEY`   | 0           | ❌ Unused         |

### Token/Billing Controls

- ✅ `tokenCheckMiddleware` exists
- ⚠️ Bypassed when `SKIP_TOKEN_CHECK=true` (default in dev)
- ⚠️ `trackAiUsage()` logs but doesn't block
- ❌ Plan gating is client-side only, not server-enforced

---

## 6️⃣ OPERATIONAL READINESS

### Background Jobs Health

| Job                    | Trigger           | Error Handling | Idempotent | Status |
| ---------------------- | ----------------- | -------------- | ---------- | ------ |
| email-retry cron       | Every 15 min      | ✅             | ✅         | 🟢     |
| trials/sweep cron      | Hourly            | ✅             | ✅         | 🟢     |
| stripe-reconcile       | Daily 2 AM        | ✅             | ⚠️         | 🟢     |
| process-batch-jobs     | Every 5 min       | ✅             | ⚠️         | 🟢     |
| process-report-queue   | Manual/Continuous | ✅             | ✅         | 🟢     |
| process-uploads-worker | Manual            | ✅             | ❌         | 🔴     |
| weather-analyze worker | Queue             | ✅             | ❌         | 🔴     |
| trades webhook         | External          | ⚠️             | ❌         | 🔴     |

### Upload Validation

| Check                        | Status |
| ---------------------------- | ------ |
| MIME type validation         | ✅     |
| File size limits             | ✅     |
| Dangerous extension blocking | ✅     |
| Basic signature detection    | ⚠️     |
| Virus scanning (ClamAV)      | ❌     |
| Storage quotas               | ✅     |

### Observable Risks

| Risk                         | Impact    | Likelihood             |
| ---------------------------- | --------- | ---------------------- |
| Debug endpoints expose data  | 🔴 HIGH   | 🟡 MEDIUM              |
| AI endpoints without billing | 🟡 MEDIUM | 🟢 LOW (auth required) |
| Trades webhook duplicates    | 🟡 MEDIUM | 🟡 MEDIUM              |
| Orphaned storage files       | 🟢 LOW    | 🔴 HIGH                |
| Schema drift causing errors  | 🟡 MEDIUM | 🟡 MEDIUM              |

---

## 7️⃣ DUPLICATION & TECHNICAL DEBT

### Duplicate Patterns

| Pattern         | Locations                                                         | Recommendation                       |
| --------------- | ----------------------------------------------------------------- | ------------------------------------ |
| PDF Generation  | `/lib/pdf/`, `/lib/report-engine/`                                | Consolidate to report-engine         |
| AI Clients      | `/lib/openai/`, `/lib/ai/`, `/lib/xai/`                           | Use unified AICore                   |
| Upload Handlers | `/api/upload/supabase`, `/api/upload/avatar`, `/api/upload/cover` | Already consolidated with guardrails |
| Auth Helpers    | `requireUser`, `withOrgScope`, `getActiveOrgContext`              | Document when to use each            |

### Unused/Deprecated Code

| Item                | Location    | Safe to Delete                |
| ------------------- | ----------- | ----------------------------- |
| `_app_deprecated/`  | src/        | ✅ Yes                        |
| `ARCHIVE_*` folders | Various     | ✅ Yes                        |
| `src/server/db.ts`  | src/server/ | ⚠️ Check imports first        |
| BullMQ scheduler    | scripts/    | ⚠️ Disabled but may be needed |

### TODO/FIXME Count

| Type       | Approximate Count   |
| ---------- | ------------------- |
| TODO       | 50+ in source files |
| FIXME      | 5-10                |
| DEPRECATED | 10+ references      |

---

## 8️⃣ TOP PRIORITIES - EXECUTION PLAN

### Week 1: Security Lockdown 🔴

| Task                                   | Files                             | Priority    |
| -------------------------------------- | --------------------------------- | ----------- |
| Add auth to `/api/debug/*` routes      | `/api/debug/`                     | 🔴 CRITICAL |
| Add auth to `/api/ai/diagnose-setup`   | `/api/ai/diagnose-setup/route.ts` | 🔴 CRITICAL |
| Add auth to `/api/vendors/search`      | `/api/vendors/search/route.ts`    | 🔴 HIGH     |
| Add idempotency to trades webhook      | `/api/webhooks/trades/route.ts`   | 🔴 HIGH     |
| Add rate limiting to billing endpoints | `/api/billing/*`                  | 🟡 MEDIUM   |

**CI Check:** Add `audit-api-auth.js` to pre-commit hook

### Week 2: AI & Billing Hardening 🟡

| Task                                    | Files                       | Priority  |
| --------------------------------------- | --------------------------- | --------- |
| Add billing check to `/api/ai/generate` | `/api/ai/generate/route.ts` | 🔴 HIGH   |
| Add billing check to `/api/ai/rebuttal` | `/api/ai/rebuttal/route.ts` | 🟡 MEDIUM |
| Server-side plan gating                 | `/lib/auth/planGate.ts`     | 🟡 MEDIUM |
| Rate limit all AI endpoints             | `/api/ai/*`                 | 🟡 MEDIUM |
| Track AI usage consistently             | All AI routes               | 🟡 MEDIUM |

**CI Check:** Add billing check validation to API tests

### Week 3: Schema & Data Cleanup 🟢

| Task                                 | Files                  | Priority  |
| ------------------------------------ | ---------------------- | --------- |
| Add missing FK relations             | `prisma/schema.prisma` | 🟡 MEDIUM |
| Fix ClientProConnection.claimId      | Schema + API           | 🟡 MEDIUM |
| Consolidate client_networks → Client | Migration script       | 🟢 LOW    |
| Add ClientNotification model         | Schema                 | 🟢 LOW    |
| Remove deprecated code               | Various                | 🟢 LOW    |

**Migration Files Needed:**

1. `20260116_add_client_relations.sql`
2. `20260116_add_clientproconnection_claimid.sql`
3. `20260116_consolidate_client_tables.sql`

---

## 9️⃣ DELIVERABLES SUMMARY

### Feature Status Matrix

| Feature               | Status | Priority | Action              |
| --------------------- | ------ | -------- | ------------------- |
| Claims CRUD           | ✅     | -        | Maintain            |
| File Uploads          | ✅     | -        | Maintain            |
| Stripe Billing        | ✅     | -        | Maintain            |
| Client Portal         | ⚠️     | HIGH     | Fix FK relations    |
| Trades Network        | ⚠️     | HIGH     | Fix schema drift    |
| AI Features           | ⚠️     | MEDIUM   | Add billing checks  |
| Debug Routes          | ❌     | CRITICAL | Add auth or delete  |
| Contractor Assignment | ⚠️     | MEDIUM   | Create proper model |
| Push Notifications    | ❌     | LOW      | Implement or remove |

### Route Status (Top Issues)

| Route                    | Status | Fix                      |
| ------------------------ | ------ | ------------------------ |
| `/api/debug/claims`      | ❌     | Add auth or delete       |
| `/api/debug/demo-claims` | ❌     | Add auth or delete       |
| `/api/ai/diagnose-setup` | ❌     | Add auth                 |
| `/api/vendors/search`    | ❌     | Add auth                 |
| `/api/webhooks/trades`   | ⚠️     | Add idempotency          |
| `/api/ai/generate`       | ⚠️     | Add rate limit + billing |

### Entity Health

| Entity              | Health | Issue                                   |
| ------------------- | ------ | --------------------------------------- |
| Client              | ⚠️ 70% | Missing FK from leads, duplicate tables |
| tradesCompany       | ⚠️ 65% | orgId type mismatch, no FK to Org       |
| claims              | ✅ 90% | Good, needs FK from ClaimTimelineEvent  |
| ClientProConnection | ⚠️ 60% | Missing claimId, ID type mismatch       |

---

## 📋 IMMEDIATE ACTION ITEMS

### Today (Critical)

1. [ ] Add `if (!userId || !orgId) return 401` to `/api/debug/*` routes
2. [ ] Add auth to `/api/ai/diagnose-setup`
3. [ ] Add auth to `/api/vendors/search`

### This Week (High)

4. [ ] Add idempotency to `/api/webhooks/trades`
5. [ ] Add billing check to `/api/ai/generate`
6. [ ] Add rate limiting to remaining AI endpoints
7. [ ] Review and fix 148 potentially unprotected routes

### Next Week (Medium)

8. [ ] Add missing FK relations to schema
9. [ ] Add ClientProConnection.claimId field
10. [ ] Create ClientNotification model
11. [ ] Consolidate legacy client tables

### Later (Low)

12. [ ] Remove deprecated code
13. [ ] Implement virus scanning
14. [ ] Add orphaned file cleanup cron
15. [ ] Enable BullMQ scheduler for production

---

## 🎯 SUCCESS CRITERIA

To reach **90% Operational Readiness**:

- [ ] All API routes authenticated or intentionally public
- [ ] All AI endpoints have billing checks
- [ ] Schema has no orphaned FKs
- [ ] No duplicate client tables
- [ ] All webhooks have idempotency
- [ ] All background jobs log to job_runs
- [ ] No debug endpoints in production

---

_This document generated by Raven Analysis Session - January 16, 2026_
