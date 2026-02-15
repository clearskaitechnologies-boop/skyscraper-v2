# 🎯 MASTER DOMAIN OPERATIONAL AUDIT

**Generated:** January 16, 2026  
**Goal:** Bring all 6 core domains to 100% operational readiness  
**Current Overall Readiness:** 52%  
**Target:** 100%

---

## 📊 EXECUTIVE SUMMARY — DOMAIN READINESS

| Domain              | Current | Target | Critical Gaps | Blocking Issues                                    |
| ------------------- | ------- | ------ | ------------- | -------------------------------------------------- |
| **Core Claims**     | 🟡 72%  | 100%   | 4             | Missing models, unprotected job route              |
| **AI Features**     | 🔴 25%  | 100%   | 8             | 87% endpoints lack rate limits, billing disabled   |
| **File Uploads**    | 🟡 65%  | 100%   | 5             | 4 routes missing validation, no virus scan         |
| **Background Jobs** | 🟡 60%  | 100%   | 6             | SQL injection, missing CRON_SECRET, no idempotency |
| **Client Portal**   | 🔴 35%  | 100%   | 7             | 3 missing models, broken FK relations              |
| **Trades Network**  | 🔴 40%  | 100%   | 8             | Phantom models, ID type mismatches                 |

**Overall Readiness:** 🔴 **52%** → Target: 🟢 **100%**

---

## 🔴 CRITICAL BLOCKERS (P0) — Must Fix Immediately

### 1. SECURITY CRITICAL

| Issue                       | Domain          | File                                | Risk      | Fix                       |
| --------------------------- | --------------- | ----------------------------------- | --------- | ------------------------- |
| **SQL Injection**           | Background Jobs | `scripts/process-uploads-worker.js` | 🔴 HIGH   | Use parameterized queries |
| **Unprotected AI endpoint** | AI Features     | `/api/ai/vision/selftest/route.ts`  | 🔴 HIGH   | Add `auth()` check        |
| **Unprotected AI endpoint** | AI Features     | `/api/ai/product-context/route.ts`  | 🔴 HIGH   | Add `auth()` check        |
| **Missing CRON_SECRET**     | Background Jobs | `/api/weather/cron-daily/route.ts`  | 🔴 HIGH   | Add Bearer token check    |
| **Missing CRON_SECRET**     | Background Jobs | `/api/cron/user-columns/route.ts`   | 🟠 MEDIUM | Add Bearer token check    |
| **Unprotected job route**   | Core Claims     | `/api/jobs/[jobId]/route.ts`        | 🔴 HIGH   | Add `auth()` check        |

### 2. SCHEMA CRITICAL — Missing Models

| Model                 | Domain         | Used By                    | Fix                    |
| --------------------- | -------------- | -------------------------- | ---------------------- |
| `ClaimAccess`         | Client Portal  | 7+ API routes, invite flow | Add to `schema.prisma` |
| `PortalLink`          | Client Portal  | Timeline/accept routes     | Add to `schema.prisma` |
| `ClientNotification`  | Client Portal  | Notifications API, UI      | Add to `schema.prisma` |
| `TradePartner`        | Trades Network | Claim assignments, API     | Add to `schema.prisma` |
| `ClaimTradePartner`   | Trades Network | Claim-contractor linking   | Add to `schema.prisma` |
| `ClaimSupplement`     | Core Claims    | Supplement route           | Add to `schema.prisma` |
| `ClaimSupplementItem` | Core Claims    | Supplement route           | Add to `schema.prisma` |
| `ClaimInvoice`        | Core Claims    | Billing features           | Add to `schema.prisma` |

### 3. ID TYPE MISMATCHES

| Field                              | Current         | Should Be             | Impact                  |
| ---------------------------------- | --------------- | --------------------- | ----------------------- |
| `tradesCompany.orgId`              | UUID (@db.Uuid) | String (cuid)         | Cannot join to `Org.id` |
| `ClientProConnection.contractorId` | UUID            | Matches tradesCompany | OK ✅                   |
| `ClientProConnection.claimId`      | Missing         | String (cuid)         | Missing field entirely  |

---

## 📋 DOMAIN-BY-DOMAIN AUDIT

---

### 🏢 DOMAIN 1: CORE CLAIMS

**Readiness: 72%** | **Critical Gaps: 4** | **Routes: 20+**

#### Status Matrix

| Component          | Readiness | Status | Blocking Issues                  |
| ------------------ | --------- | ------ | -------------------------------- |
| Claims CRUD API    | 90%       | ✅     | Minor org scope gaps             |
| Claims Documents   | 85%       | ✅     | Needs orgId index                |
| Claims Timeline    | 50%       | ⚠️     | Schema mismatch                  |
| Claims Supplements | 30%       | 🔴     | Missing Prisma models            |
| Jobs API           | 40%       | 🔴     | **Auth missing on detail route** |
| Reports API        | 80%       | ✅     | Minor org scope gaps             |
| Report Generation  | 85%       | ✅     | Working pipeline                 |
| UI Pages           | 90%       | ✅     | All wired correctly              |

#### Route Audit

| Route                             | Auth | Org Scope | Status          | Fix                    |
| --------------------------------- | ---- | --------- | --------------- | ---------------------- |
| `POST /api/claims`                | ✅   | ✅        | Good            | —                      |
| `GET /api/claims`                 | ✅   | ✅        | Good            | —                      |
| `GET /api/claims/[id]`            | ✅   | ✅        | Good            | —                      |
| `PATCH /api/claims/[id]`          | ✅   | ✅        | Good            | —                      |
| `DELETE /api/claims/[id]`         | ✅   | ✅        | Good            | —                      |
| `GET /api/claims/list`            | ⚠️   | ❌        | Needs Fix       | Add org filter         |
| `POST /api/claims/update`         | ✅   | ⚠️        | Needs Fix       | Validate org ownership |
| `GET /api/claims/[id]/timeline`   | ✅   | ✅        | Schema Issue    | Add FK                 |
| `GET /api/claims/[id]/events`     | ✅   | ⚠️        | Needs Fix       | Add org check          |
| `GET /api/claims/[id]/supplement` | ✅   | ✅        | Schema Issue    | Add model              |
| **`GET /api/jobs/[jobId]`**       | ❌   | ❌        | 🔴 **CRITICAL** | Add auth               |

#### Missing Models

```prisma
model ClaimSupplement {
  id          String   @id @default(cuid())
  claimId     String
  amount      Float
  status      String   @default("pending")
  createdAt   DateTime @default(now())

  claim       claims   @relation(fields: [claimId], references: [id])
  items       ClaimSupplementItem[]
  @@index([claimId])
}

model ClaimSupplementItem {
  id            String @id @default(cuid())
  supplementId  String
  description   String
  quantity      Int    @default(1)
  unitPrice     Float

  supplement    ClaimSupplement @relation(fields: [supplementId], references: [id])
}

model ClaimInvoice {
  id        String   @id @default(cuid())
  claimId   String
  amount    Float
  status    String   @default("draft")
  createdAt DateTime @default(now())

  claim     claims   @relation(fields: [claimId], references: [id])
  @@index([claimId])
}
```

---

### 🤖 DOMAIN 2: AI FEATURES

**Readiness: 25%** | **Critical Gaps: 8** | **Endpoints: 45+**

#### Status Matrix

| Metric              | Count | Percentage |
| ------------------- | ----- | ---------- |
| Total AI Endpoints  | 45    | 100%       |
| With Auth           | 43    | 96%        |
| With Rate Limiting  | 6     | **13%** 🔴 |
| With Billing Check  | 8     | **18%** 🔴 |
| With Usage Tracking | 2     | **4%** 🔴  |
| Fully Protected     | 2     | **4%** 🔴  |

#### Critical Endpoints Needing Fixes

| Endpoint                  | Auth    | Rate Limit | Billing | Tracking | Priority |
| ------------------------- | ------- | ---------- | ------- | -------- | -------- |
| `/api/ai/vision/selftest` | ❌ NONE | ❌         | ❌      | ❌       | 🔴 P0    |
| `/api/ai/product-context` | ❌ NONE | ❌         | ❌      | ❌       | 🔴 P0    |
| `/api/ai/generate`        | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/ai/analyze-damage`  | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/ai/photo-analysis`  | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/reports/build`      | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/reports/generate`   | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/ai/appeal/generate` | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/ai/carrier-summary` | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |
| `/api/ai/narrative`       | ✅      | ❌         | ❌      | ❌       | 🟠 P1    |

#### CRITICAL: Billing is Disabled!

```typescript
// src/lib/usage/index.ts - ALL FUNCTIONS ARE NO-OPS!
export async function deductTokens(...): Promise<void> {
  return; // Feature disabled. Intentionally no-op.
}
```

#### Fix: Create AI Middleware

```typescript
// src/lib/ai/middleware.ts
export async function withAIProtection(handler, options) {
  return async (request) => {
    // 1. Auth check
    const { userId, orgId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2. Rate limit check
    const { success } = await aiRateLimit.limit(orgId || userId);
    if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

    // 3. Plan/billing check
    if (options.requiresPro && !(await hasFeature(orgId, "ai_features"))) {
      return NextResponse.json({ error: "Pro plan required" }, { status: 402 });
    }

    // 4. Execute handler
    const result = await handler(request);

    // 5. Track usage on success
    if (result.ok) {
      await trackAiUsage({
        orgId,
        userId,
        feature: options.feature,
        tokens: options.estimatedTokens,
      });
    }

    return result;
  };
}
```

---

### 📁 DOMAIN 3: FILE UPLOADS

**Readiness: 65%** | **Critical Gaps: 5** | **Upload Routes: 15+**

#### Status Matrix

| Upload Type        | Auth | MIME Check | Size Limit | Quota | Logging | Status       |
| ------------------ | ---- | ---------- | ---------- | ----- | ------- | ------------ |
| Supabase Universal | ✅   | ✅         | ✅         | ✅    | ✅      | ✅ GOOD      |
| Avatar             | ✅   | ✅         | ✅         | ❌    | ❌      | ⚠️ PARTIAL   |
| Cover              | ✅   | ✅         | ✅         | ❌    | ❌      | ⚠️ PARTIAL   |
| Portfolio          | ✅   | ✅         | ✅         | ❌    | ❌      | ⚠️ PARTIAL   |
| Branding           | ✅   | ✅         | ✅         | ❌    | ❌      | ⚠️ PARTIAL   |
| Claim Files        | ✅   | ✅         | ✅         | ❌    | ❌      | ⚠️ PARTIAL   |
| Claim Photos       | ✅   | ⚠️         | ❌         | ❌    | ❌      | 🔴 NEEDS FIX |
| Evidence           | ✅   | ✅         | ✅         | ❌    | ❌      | ⚠️ PARTIAL   |
| AI Detect          | ✅   | ❌         | ❌         | ❌    | ❌      | 🔴 NEEDS FIX |
| Mockup Generate    | ✅   | ❌         | ❌         | ❌    | ❌      | 🔴 NEEDS FIX |
| OCR Image          | ✅   | ❌         | ❌         | ❌    | ❌      | 🔴 NEEDS FIX |
| OCR PDF            | ✅   | ❌         | ❌         | ❌    | ❌      | 🔴 NEEDS FIX |

#### Missing Validation Routes

| Route                     | Fix Required               |
| ------------------------- | -------------------------- |
| `/api/claims/ai/detect`   | Add MIME + size validation |
| `/api/mockup/generate`    | Add MIME + size validation |
| `/api/ocr/image`          | Add MIME + size validation |
| `/api/ocr/pdf`            | Add MIME + size validation |
| `/api/claims/[id]/photos` | Add size limit             |

#### Critical Gaps

| Gap                          | Severity  | Fix                                |
| ---------------------------- | --------- | ---------------------------------- |
| No virus scanning            | 🔴 HIGH   | Implement ClamAV or cloud scanning |
| 13/15 routes missing quota   | 🟠 MEDIUM | Wire up `checkStorageCapacity()`   |
| 13/15 routes missing logging | 🟠 MEDIUM | Add `logStorageEvent()` calls      |
| No orphaned file cleanup     | 🟠 MEDIUM | Create cleanup cron                |
| Partial path traversal check | 🟠 MEDIUM | Add explicit `..` rejection        |

---

### ⚙️ DOMAIN 4: BACKGROUND JOBS

**Readiness: 60%** | **Critical Gaps: 6** | **Workers: 4** | **Crons: 8**

#### Worker Status

| Worker                 | Error Handling | Retry | Idempotent | job_runs | Shutdown | Status      |
| ---------------------- | -------------- | ----- | ---------- | -------- | -------- | ----------- |
| process-uploads-worker | ⚠️ Basic       | ❌    | ❌         | ❌       | ❌       | 🔴 CRITICAL |
| process-report-queue   | ✅             | ✅    | ⚠️         | ✅       | ✅       | ✅ GOOD     |
| agentWorker            | ✅             | ✅    | ❌         | ❌       | ✅       | ⚠️ PARTIAL  |
| pg-boss worker         | ✅             | ✅    | ⚠️         | ⚠️       | ❌       | ⚠️ PARTIAL  |

#### Cron Status

| Cron                    | Schedule | CRON_SECRET    | Error Handling | Status              |
| ----------------------- | -------- | -------------- | -------------- | ------------------- |
| wallet/reset-monthly    | Monthly  | ✅             | ⚠️ Basic       | ⚠️                  |
| **weather/cron-daily**  | Daily    | ❌ **MISSING** | ❌             | 🔴 CRITICAL         |
| cron/trials/sweep       | Hourly   | ✅             | ✅             | ⚠️                  |
| cron/email-retry        | 15min    | ✅             | ✅             | ⚠️                  |
| cron/stripe-reconcile   | Daily    | ✅             | ✅             | ⚠️                  |
| **cron/user-columns**   | 30min    | ❌ **MISSING** | ✅             | ⚠️                  |
| **cron/ai-insights**    | Weekly   | ❓             | N/A            | 🔴 **MISSING FILE** |
| cron/process-batch-jobs | 5min     | ✅             | ✅             | ⚠️                  |

#### Critical Fix: SQL Injection

```javascript
// BEFORE (VULNERABLE) - process-uploads-worker.js
await prisma.$executeRawUnsafe(`UPDATE branding_uploads SET status='done' WHERE id='${rec.id}'`);

// AFTER (SAFE)
await prisma.$executeRaw`UPDATE branding_uploads SET status='done' WHERE id = ${rec.id}::uuid`;
```

---

### 👥 DOMAIN 5: CLIENT PORTAL

**Readiness: 35%** | **Critical Gaps: 7** | **Missing Models: 3**

#### Model Status

| Model                  | In Schema  | FK Relations                  | Status      |
| ---------------------- | ---------- | ----------------------------- | ----------- |
| Client                 | ✅         | ✅ orgId→Org                  | ✅ GOOD     |
| ClientProConnection    | ✅         | ✅ clientId, contractorId     | ✅ GOOD     |
| ClientSavedPro         | ✅         | ✅ clientId, companyId        | ✅ GOOD     |
| ClientWorkRequest      | ✅         | ✅ clientId, targetProId      | ✅ GOOD     |
| ClaimClientLink        | ✅         | ❌ **No FK to claims**        | 🟠 BROKEN   |
| ClientPortalAccess     | ✅         | ❌ **No FK to Client/claims** | 🟠 BROKEN   |
| ClientConnection       | ✅         | ❌ **No FK to Org/Client**    | 🟠 ORPHANED |
| **ClaimAccess**        | ❌ MISSING | —                             | 🔴 PHANTOM  |
| **PortalLink**         | ❌ MISSING | —                             | 🔴 PHANTOM  |
| **ClientNotification** | ❌ MISSING | —                             | 🔴 PHANTOM  |

#### Broken API Routes

| Route                              | Issue                             | Fix       |
| ---------------------------------- | --------------------------------- | --------- |
| `/api/portal/claims`               | Uses ClaimAccess (missing)        | Add model |
| `/api/portal/claims/[id]/access`   | Uses ClaimAccess→ClaimClientLink  | Add model |
| `/api/portal/claims/[id]/timeline` | Uses PortalLink (missing)         | Add model |
| `/api/portal/claims/[id]/accept`   | Uses PortalLink (missing)         | Add model |
| `/api/portal/invite`               | Uses ClaimAccess (missing)        | Add model |
| `/api/portal/generate-access`      | Wrong function signature          | Fix call  |
| `/api/client-notifications`        | Uses ClientNotification (missing) | Add model |

#### Required Schema Additions

```prisma
model ClaimAccess {
  id           String    @id @default(cuid())
  claimId      String
  orgId        String
  invitedEmail String
  role         String    @default("VIEWER")
  status       String    @default("INVITED")
  tokenHash    String?   @unique
  expiresAt    DateTime?
  createdAt    DateTime  @default(now())

  claim        claims    @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@index([claimId])
  @@index([invitedEmail])
}

model PortalLink {
  id          String    @id @default(cuid())
  claimId     String
  token       String    @unique
  active      Boolean   @default(true)
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  claim       claims    @relation(fields: [claimId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([claimId])
}

model ClientNotification {
  id        String   @id @default(cuid())
  clientId  String
  type      String
  title     String
  message   String?
  read      Boolean  @default(false)
  createdAt DateTime @default(now())

  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  @@index([clientId])
  @@index([read])
}
```

---

### 🔧 DOMAIN 6: TRADES NETWORK

**Readiness: 40%** | **Critical Gaps: 8** | **Phantom Models: 5**

#### Model Status

| Model                 | In Schema  | ID Type | orgId Type  | Status      |
| --------------------- | ---------- | ------- | ----------- | ----------- |
| tradesCompany         | ✅         | UUID    | **UUID** 🔴 | ID Mismatch |
| tradesCompanyMember   | ✅         | UUID    | String      | ✅ OK       |
| tradesPost            | ✅         | UUID    | —           | ✅ OK       |
| tradesReview          | ✅         | UUID    | —           | ✅ OK       |
| tradesPortfolioItem   | ✅         | UUID    | —           | ✅ OK       |
| tradesJobPosting      | ✅         | UUID    | —           | ✅ OK       |
| Vendor                | ✅         | UUID    | —           | ✅ OK       |
| **TradePartner**      | ❌ MISSING | —       | —           | 🔴 PHANTOM  |
| **ClaimTradePartner** | ❌ MISSING | —       | —           | 🔴 PHANTOM  |
| **tradesConnection**  | ❌ MISSING | —       | —           | 🔴 PHANTOM  |

#### Critical ID Type Mismatch

```
tradesCompany.orgId = UUID (@db.Uuid)
Org.id = String (cuid)

RESULT: Cannot join tradesCompany to Org table!
```

#### Broken Routes

| Route                          | Issue                           | Fix              |
| ------------------------------ | ------------------------------- | ---------------- |
| `/api/trades`                  | Uses TradePartner (missing)     | Add model        |
| `/api/trades/[id]`             | Uses TradePartner (missing)     | Add model        |
| `/api/trades/connections`      | Uses tradesConnection (missing) | Add model        |
| `/api/claims/[id]/contractors` | Uses claim_events workaround    | Add proper model |
| `/api/trades/jobs`             | Uses claim_events workaround    | Add proper model |

#### Required Schema Additions

```prisma
model TradePartner {
  id            String   @id @default(cuid())
  orgId         String
  businessName  String
  licenseNumber String?
  phone         String?
  email         String?
  specialties   String[] @default([])
  createdAt     DateTime @default(now())

  claimAssignments ClaimTradePartner[]

  @@index([orgId])
  @@map("trade_partners")
}

model ClaimTradePartner {
  id             String   @id @default(cuid())
  claimId        String
  tradePartnerId String
  role           String?  @default("Contractor")
  status         String   @default("assigned")
  addedAt        DateTime @default(now())

  claim        claims       @relation(fields: [claimId], references: [id], onDelete: Cascade)
  tradePartner TradePartner @relation(fields: [tradePartnerId], references: [id], onDelete: Cascade)

  @@unique([claimId, tradePartnerId])
  @@index([claimId])
  @@map("claim_trade_partners")
}

// FIX: Change tradesCompany.orgId from UUID to String
model tradesCompany {
  // ... existing fields ...
  orgId   String    // CHANGE FROM: String @db.Uuid
}
```

---

## ✅ MASTER TODO LIST — PRIORITIZED

### 🔴 WEEK 1: CRITICAL SECURITY & SCHEMA (Days 1-7)

#### Day 1-2: Security Fixes

| #   | Task                                        | Domain | File                                      | Effort |
| --- | ------------------------------------------- | ------ | ----------------------------------------- | ------ |
| 1   | Fix SQL injection in process-uploads-worker | Jobs   | `scripts/process-uploads-worker.js`       | 15min  |
| 2   | Add auth to `/api/ai/vision/selftest`       | AI     | `src/app/api/ai/vision/selftest/route.ts` | 10min  |
| 3   | Add auth to `/api/ai/product-context`       | AI     | `src/app/api/ai/product-context/route.ts` | 10min  |
| 4   | Add CRON_SECRET to weather cron             | Jobs   | `src/app/api/weather/cron-daily/route.ts` | 10min  |
| 5   | Add CRON_SECRET to user-columns cron        | Jobs   | `src/app/api/cron/user-columns/route.ts`  | 10min  |
| 6   | Add auth to `/api/jobs/[jobId]`             | Claims | `src/app/api/jobs/[jobId]/route.ts`       | 10min  |

#### Day 3-4: Schema Migration — Missing Models

| #   | Task                                       | Domain | File                   | Effort |
| --- | ------------------------------------------ | ------ | ---------------------- | ------ |
| 7   | Add ClaimAccess model                      | Portal | `prisma/schema.prisma` | 30min  |
| 8   | Add PortalLink model                       | Portal | `prisma/schema.prisma` | 20min  |
| 9   | Add ClientNotification model               | Portal | `prisma/schema.prisma` | 20min  |
| 10  | Add TradePartner model                     | Trades | `prisma/schema.prisma` | 20min  |
| 11  | Add ClaimTradePartner model                | Trades | `prisma/schema.prisma` | 20min  |
| 12  | Add ClaimSupplement model                  | Claims | `prisma/schema.prisma` | 20min  |
| 13  | Fix tradesCompany.orgId type (UUID→String) | Trades | `prisma/schema.prisma` | 15min  |
| 14  | Add FK relations to ClientPortalAccess     | Portal | `prisma/schema.prisma` | 15min  |
| 15  | Add FK relations to ClaimClientLink        | Portal | `prisma/schema.prisma` | 15min  |
| 16  | Run `prisma migrate dev`                   | All    | —                      | 10min  |

#### Day 5-7: Update Broken Routes

| #   | Task                                              | Domain | File                                                | Effort |
| --- | ------------------------------------------------- | ------ | --------------------------------------------------- | ------ |
| 17  | Update portal/claims to use new ClaimAccess       | Portal | `src/app/api/portal/claims/route.ts`                | 45min  |
| 18  | Update portal invite flow                         | Portal | `src/app/api/portal/invite/route.ts`                | 45min  |
| 19  | Update trades API to use TradePartner             | Trades | `src/app/api/trades/route.ts`                       | 45min  |
| 20  | Update claim contractors to use ClaimTradePartner | Trades | `src/app/api/claims/[claimId]/contractors/route.ts` | 45min  |
| 21  | Create or remove `/api/cron/ai-insights`          | Jobs   | New file or remove from vercel.json                 | 30min  |

---

### 🟠 WEEK 2: AI PROTECTION & RELIABILITY (Days 8-14)

#### AI Middleware & Rate Limiting

| #   | Task                                             | Domain | File                       | Effort |
| --- | ------------------------------------------------ | ------ | -------------------------- | ------ |
| 22  | Create AI middleware                             | AI     | `src/lib/ai/middleware.ts` | 2hr    |
| 23  | Add rate limits to 10 high-priority AI endpoints | AI     | Various `/api/ai/*` routes | 3hr    |
| 24  | Enable billing/usage tracking                    | AI     | `src/lib/usage/index.ts`   | 2hr    |
| 25  | Add `trackAiUsage()` to all OpenAI endpoints     | AI     | 15+ files                  | 2hr    |
| 26  | Add plan gating beyond just chat                 | AI     | Multiple routes            | 2hr    |

#### Background Jobs Reliability

| #   | Task                                            | Domain | File                                | Effort |
| --- | ----------------------------------------------- | ------ | ----------------------------------- | ------ |
| 27  | Add retry logic to process-uploads-worker       | Jobs   | `scripts/process-uploads-worker.js` | 1hr    |
| 28  | Add idempotency keys to workers                 | Jobs   | Multiple workers                    | 2hr    |
| 29  | Add graceful shutdown to process-uploads-worker | Jobs   | `scripts/process-uploads-worker.js` | 30min  |
| 30  | Add job_runs logging to all crons               | Jobs   | 8 cron routes                       | 2hr    |
| 31  | Add DLQ to pg-boss                              | Jobs   | `src/lib/jobs/pg-boss.ts`           | 1hr    |

---

### 🟡 WEEK 3: FILE VALIDATION & PORTAL COMPLETION (Days 15-21)

#### File Upload Validation

| #   | Task                                   | Domain  | File                   | Effort |
| --- | -------------------------------------- | ------- | ---------------------- | ------ |
| 32  | Add MIME validation to 4 routes        | Uploads | Various `/api/` routes | 1hr    |
| 33  | Add size limits to 5 routes            | Uploads | Various `/api/` routes | 1hr    |
| 34  | Add quota checks to 13 routes          | Uploads | Various `/api/` routes | 3hr    |
| 35  | Add audit logging to 13 routes         | Uploads | Various `/api/` routes | 2hr    |
| 36  | Create orphaned file cleanup cron      | Uploads | New file               | 2hr    |
| 37  | Add path traversal check to storage.ts | Uploads | `src/lib/storage.ts`   | 30min  |

#### Client Portal Completion

| #   | Task                                     | Domain | File                                               | Effort |
| --- | ---------------------------------------- | ------ | -------------------------------------------------- | ------ |
| 38  | Wire up ClientNotification API           | Portal | `src/app/api/client-notifications/route.ts`        | 1hr    |
| 39  | Fix NotificationBell component           | Portal | `src/components/portal/NotificationBell.tsx`       | 1hr    |
| 40  | Update portal timeline to use PortalLink | Portal | `src/app/api/portal/claims/[id]/timeline/route.ts` | 1hr    |
| 41  | Update portal accept to use PortalLink   | Portal | `src/app/api/portal/claims/[id]/accept/route.ts`   | 1hr    |
| 42  | Fix generate-access function signature   | Portal | `src/app/api/portal/generate-access/route.ts`      | 30min  |

---

### 🟢 WEEK 4+: OPTIMIZATION & TECH DEBT (Days 22+)

| #   | Task                                        | Domain  | Effort |
| --- | ------------------------------------------- | ------- | ------ |
| 43  | Migrate legacy client_networks to Client    | Portal  | 4hr    |
| 44  | Consolidate trades-service schema with main | Trades  | 4hr    |
| 45  | Add virus scanning integration              | Uploads | 8hr    |
| 46  | Add pg_advisory_lock to crons               | Jobs    | 2hr    |
| 47  | Remove mock code from AI predictor          | AI      | 1hr    |
| 48  | Add retry logic to OpenAI client            | AI      | 2hr    |
| 49  | Create E2E tests for critical flows         | All     | 8hr    |
| 50  | Add org scoping to remaining claims routes  | Claims  | 2hr    |

---

## 🎯 SUCCESS CRITERIA — 100% OPERATIONAL

| Domain              | Criteria                                                  | Verification          |
| ------------------- | --------------------------------------------------------- | --------------------- |
| **Core Claims**     | All routes authenticated, all models in schema, FKs valid | `npx prisma validate` |
| **AI Features**     | 100% endpoints have auth + rate limit + billing           | Audit script          |
| **File Uploads**    | All uploads validated, quota enforced, logged             | Audit script          |
| **Background Jobs** | All workers idempotent, all crons secured                 | Manual check          |
| **Client Portal**   | All models in schema, all routes functional               | E2E tests             |
| **Trades Network**  | ID types consistent, all models in schema                 | `npx prisma validate` |

---

## 📁 FILES TO MODIFY — QUICK REFERENCE

### Schema Changes (prisma/schema.prisma)

- Add: ClaimAccess, PortalLink, ClientNotification
- Add: TradePartner, ClaimTradePartner
- Add: ClaimSupplement, ClaimSupplementItem, ClaimInvoice
- Fix: tradesCompany.orgId (UUID → String)
- Fix: ClientPortalAccess FK relations
- Fix: ClaimClientLink FK relations

### Security Fixes

- `scripts/process-uploads-worker.js` — SQL injection
- `src/app/api/ai/vision/selftest/route.ts` — Add auth
- `src/app/api/ai/product-context/route.ts` — Add auth
- `src/app/api/weather/cron-daily/route.ts` — Add CRON_SECRET
- `src/app/api/cron/user-columns/route.ts` — Add CRON_SECRET
- `src/app/api/jobs/[jobId]/route.ts` — Add auth

### New Files to Create

- `src/lib/ai/middleware.ts` — AI protection middleware
- `src/app/api/cron/cleanup-orphaned-files/route.ts` — File cleanup cron

---

**Generated by Raven** | **January 16, 2026** | **Target: 100% Operational Readiness**
