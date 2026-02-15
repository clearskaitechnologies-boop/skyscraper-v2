# MASTER COMPREHENSIVE TODO LIST

**Generated:** January 16, 2026  
**Purpose:** Full system audit and hardening roadmap  
**Status:** 🔴 CRITICAL ITEMS REQUIRE IMMEDIATE ACTION

---

## 📊 AUDIT SUMMARY

| Category              | Status      | Count                 | Severity |
| --------------------- | ----------- | --------------------- | -------- |
| Prisma/DB Drift       | ✅ PASS     | 0 issues              | -        |
| Migration Sync        | ✅ PASS     | 12 migrations applied | -        |
| API Routes Total      | 📊 Audit    | 802 routes            | -        |
| Routes WITHOUT auth() | 🔴 CRITICAL | 314 routes            | HIGH     |
| Submit Buttons        | 📊 Audit    | 92 instances          | MEDIUM   |
| Disabled Buttons      | 📊 Audit    | 238 instances         | MEDIUM   |
| Empty Catch Blocks    | 🟡 WARNING  | 135 instances         | MEDIUM   |
| Bridge Entity Gaps    | 🟡 WARNING  | Missing fields        | MEDIUM   |

---

## 🔴 CRITICAL (P0) - MUST FIX IMMEDIATELY

### 1. API Route Security Audit

**Finding:** 314 of 802 API routes have no explicit `auth()` call.

**Risk:** Unauthenticated access to sensitive data/actions.

**Action Items:**

- [ ] Audit all 314 routes - categorize as:
  - Public (intentional) - document why
  - Protected (needs auth()) - add auth
  - Webhook (needs signature) - verify
- [ ] Priority routes to check:
  - [ ] `/api/ai/*` - 25+ routes
  - [ ] `/api/claims/*` - sensitive data
  - [ ] `/api/trades/*` - user data
  - [ ] `/api/portal/*` - client data

**Sample routes needing review:**

```
src/app/api/ai/analyze-damage/route.ts
src/app/api/ai/chat/route.ts
src/app/api/ai/claim-writer/route.ts
src/app/api/claims/[claimId]/route.ts
src/app/api/trades/work-requests/route.ts
```

---

### 2. Bridge Entity Schema Gaps

**Finding:** `ClientWorkRequest` is missing critical bridge fields.

**Current Schema:**

```prisma
model ClientWorkRequest {
  id          String  @id
  clientId    String
  targetProId String? @db.Uuid
  // MISSING: orgId, workspaceId, createdByUserId, source
}
```

**Required Fields for Proper Bridge:**

- [ ] `orgId` - Link to client organization
- [ ] `workspaceId` - Created on accept (nullable)
- [ ] `createdByUserId` - Audit trail
- [ ] `source` - enum: `job_posting`, `direct_invite`, `marketplace`
- [ ] `acceptedAt` - Timestamp when accepted

**Migration Required:**

```sql
ALTER TABLE "ClientWorkRequest"
ADD COLUMN "orgId" TEXT,
ADD COLUMN "workspaceId" TEXT,
ADD COLUMN "createdByUserId" TEXT,
ADD COLUMN "source" TEXT DEFAULT 'direct_invite',
ADD COLUMN "acceptedAt" TIMESTAMPTZ;
```

---

### 3. Incomplete Profile Gate

**Finding:** Users can land in dead-end states after skipping onboarding.

**Action Items:**

- [ ] Add `isProfileComplete` computed field
- [ ] Add middleware guard:

```typescript
// src/middleware.ts
if (isTradesRoute && !profileComplete) {
  redirect("/trades/profile/edit?reason=incomplete");
}
```

- [ ] Update all trades routes to check profile completion

---

## 🟡 HIGH PRIORITY (P1) - FIX THIS WEEK

### 4. Empty Catch Blocks (135 instances)

**Finding:** Errors are being swallowed without user feedback.

**High-Risk Examples:**

```typescript
// src/app/(app)/debug-auth/page.tsx:19
} catch (e) {}  // ❌ Completely silent

// src/app/(app)/supplements/new/page.tsx:77
const data = await res.json().catch(() => ({}));  // ❌ Hides parse errors
```

**Action Items:**

- [ ] Audit all 135 catch blocks
- [ ] Add minimum logging: `console.error("[Module]", e)`
- [ ] Add user feedback for user-facing flows
- [ ] Pattern to enforce:

```typescript
} catch (error) {
  console.error("[ModuleName]", error);
  toast.error("Something went wrong");
}
```

---

### 5. Button/Submit Audit

**Finding:** 92 submit buttons, 238 disabled buttons.

**Risk:** Silent failures when validation blocks submit.

**Action Items:**

- [ ] Audit submit buttons in critical flows:
  - [ ] `/trades/onboarding` ✅ Already fixed
  - [ ] `/trades/profile/edit` ✅ Already fixed
  - [ ] `/claims/new`
  - [ ] `/leads/new`
  - [ ] `/reports/new/*`
- [ ] Ensure all have:
  - Toast on success
  - Toast on error
  - Loading state during submission
  - `noValidate` on forms with JS validation

---

### 6. Route Existence Verification

**Finding:** Many routes referenced in UI.

**Top Routes to Verify:**
| Route | References | Exists? |
|-------|------------|---------|
| `/dashboard` | 52 | ✅ |
| `/sign-in` | 24 | ✅ |
| `/pricing` | 24 | ⚠️ Verify |
| `/onboarding/start` | 23 | ⚠️ Verify |
| `/sign-up` | 19 | ✅ |
| `/trades/profile` | 13 | ✅ |
| `/portal` | 11 | ✅ |
| `/settings/branding` | 10 | ⚠️ Verify |

**Action Items:**

- [ ] Run route verification script
- [ ] Fix or remove dead links
- [ ] Add 404 monitoring

---

## 🟢 MEDIUM PRIORITY (P2) - FIX THIS SPRINT

### 7. Messaging Bridge Enforcement

**Finding:** Messages should be scoped to ClientWorkRequest.

**Invariant to Enforce:**

```sql
-- Messages MUST have bridge reference
ALTER TABLE "Message"
ADD CONSTRAINT "message_must_have_bridge"
CHECK ("clientWorkRequestId" IS NOT NULL OR "threadId" IS NOT NULL);
```

**Action Items:**

- [ ] Verify all message creation flows include bridge reference
- [ ] Add DB constraint
- [ ] Query for orphan messages

---

### 8. Form Tracker Adoption

**Finding:** Only onboarding has instrumentation.

**Action Items:**

- [ ] Add formTracker to:
  - [ ] `/trades/profile/edit`
  - [ ] `/trades/company/edit`
  - [ ] `/claims/new`
  - [ ] `/leads/new`
  - [ ] `/portal/[slug]/claims/new`
- [ ] Add Sentry breadcrumb integration

---

### 9. Flow End-to-End Tests

**Finding:** Only onboarding has Playwright tests.

**Action Items:**

- [ ] Add tests for:
  - [ ] Pro → Client invite flow
  - [ ] Client → Pro invite flow
  - [ ] Job acceptance flow
  - [ ] Claim creation flow
  - [ ] Template marketplace flow

---

## 📋 VERIFICATION QUERIES (RUN REGULARLY)

### Database Integrity Checks

```sql
-- 1. Orphaned ClientWorkRequests (no client)
SELECT id FROM "ClientWorkRequest"
WHERE "clientId" NOT IN (SELECT id FROM "Client");

-- 2. Orphaned messages (if thread-based)
SELECT id FROM "Message"
WHERE "threadId" NOT IN (SELECT id FROM "Thread");

-- 3. Duplicate connections
SELECT "clientId", "contractorId", COUNT(*)
FROM "ClientProConnection"
GROUP BY "clientId", "contractorId"
HAVING COUNT(*) > 1;

-- 4. Accepted requests without workspace (after migration)
SELECT id FROM "ClientWorkRequest"
WHERE status = 'accepted'
AND "workspaceId" IS NULL;
```

---

## 🔧 AUTOMATED CHECKS TO ADD

### 1. ESLint Rules

```javascript
// .eslintrc.js additions
rules: {
  // No empty catch blocks
  "no-empty": ["error", { "allowEmptyCatch": false }],

  // Custom: No button without onClick or type
  "custom/button-must-act": "error",
}
```

### 2. Pre-Commit Hooks

```bash
# .husky/pre-commit
npx prisma validate
npx tsc --noEmit
npm run lint
```

### 3. CI Pipeline Checks

```yaml
# .github/workflows/audit.yml
- name: Prisma Drift Check
  run: npx prisma migrate status

- name: Route Verification
  run: node scripts/verify-routes.js

- name: Auth Audit
  run: node scripts/audit-auth.js
```

---

## 📆 IMPLEMENTATION TIMELINE

### Week 1 (Immediate)

- [ ] P0 #1: API Route Security Audit (critical routes first)
- [ ] P0 #2: Bridge Schema Migration
- [ ] P0 #3: Profile Completion Gate

### Week 2

- [ ] P1 #4: Fix critical empty catch blocks
- [ ] P1 #5: Audit critical form submissions
- [ ] P1 #6: Verify and fix broken routes

### Week 3

- [ ] P2 #7: Messaging bridge constraints
- [ ] P2 #8: Form tracker adoption
- [ ] P2 #9: E2E test coverage expansion

### Ongoing

- [ ] Weekly integrity query runs
- [ ] Pre-deploy checklist completion
- [ ] New feature bridge compliance

---

## 📝 FILES CREATED/MODIFIED THIS SESSION

| File                                                                                                 | Purpose                      |
| ---------------------------------------------------------------------------------------------------- | ---------------------------- |
| [docs/POST_MORTEM_ONBOARDING_JAN_2026.md](docs/POST_MORTEM_ONBOARDING_JAN_2026.md)                   | Post-mortem analysis         |
| [docs/PRODUCTION_CONFIDENCE_CHECKLIST.md](docs/PRODUCTION_CONFIDENCE_CHECKLIST.md)                   | Pre-deploy checklist         |
| [src/lib/formTracker.ts](src/lib/formTracker.ts)                                                     | Form instrumentation utility |
| [e2e/trades-onboarding.spec.ts](e2e/trades-onboarding.spec.ts)                                       | Playwright regression tests  |
| [src/app/(app)/trades/onboarding/page.tsx](<src/app/(app)/trades/onboarding/page.tsx>)               | Instrumented onboarding      |
| [src/app/(app)/trades/profile/edit/page.tsx](<src/app/(app)/trades/profile/edit/page.tsx>)           | Direct profile edit          |
| [src/app/(app)/trades/company/edit/page.tsx](<src/app/(app)/trades/company/edit/page.tsx>)           | Company edit page            |
| [src/app/(app)/trades/company/employees/page.tsx](<src/app/(app)/trades/company/employees/page.tsx>) | Admin delegation             |
| [src/app/(app)/trades/employees/[id]/page.tsx](<src/app/(app)/trades/employees/[id]/page.tsx>)       | Employee profile             |
| [src/app/api/trades/company/route.ts](src/app/api/trades/company/route.ts)                           | Company API                  |
| [src/app/api/trades/company/employees/route.ts](src/app/api/trades/company/employees/route.ts)       | Employees API                |

---

## 🎯 SUCCESS CRITERIA

System is production-hardened when:

1. ✅ All API routes are categorized (public/protected/webhook)
2. ✅ Bridge entity has all required fields
3. ✅ No silent failures in user flows
4. ✅ All forms show success/error feedback
5. ✅ E2E tests cover critical paths
6. ✅ DB integrity queries return 0 rows
7. ✅ Pre-deploy checklist is green

---

_This document should be reviewed weekly and updated as items are completed._
