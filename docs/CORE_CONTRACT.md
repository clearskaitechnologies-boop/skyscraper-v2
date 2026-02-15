# 🔐 CORE CONTRACT — ARCHITECTURAL INVARIANTS

**Version:** 1.0  
**Date:** January 16, 2026  
**Status:** 🔒 **LOCKED — NO FEATURE MAY VIOLATE THESE RULES**

---

## 🎯 PURPOSE

This document defines **non-negotiable architectural invariants** that protect the system from drift, rot, and regressions.

Every feature, every API route, every database migration, and every new file **MUST** comply with these rules.

**No exceptions.**

---

## 📜 THE 5 INVARIANTS

### 1️⃣ IDENTITY & AUTH

**Rule:** Clerk is the only authentication provider

**Requirements:**

- Every user action MUST be attributable to a `userId` from Clerk
- Every mutation MUST verify authentication via `auth()` from `@clerk/nextjs/server`
- No anonymous mutations beyond public marketing pages
- No custom auth, no JWT parsing, no session hacks

**Valid patterns:**

```typescript
// ✅ CORRECT
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  // ... rest of logic
}
```

**Invalid patterns:**

```typescript
// ❌ FORBIDDEN
const token = req.headers.get("authorization");
const decoded = jwt.verify(token); // NO CUSTOM AUTH

// ❌ FORBIDDEN
const user = await prisma.users.findFirst({ where: { email } }); // NO PASSWORD CHECKS
```

**Enforcement:**

- All `/api` routes must call `auth()` before any database write
- CI gate: `scripts/audit-api-auth.js` must show **0 unprotected write routes**

---

### 2️⃣ OWNERSHIP & SCOPE

**Rule:** Every record belongs to exactly ONE organization or workspace

**Requirements:**

- Every Prisma model MUST have either:
  - `orgId` (organization-scoped data)
  - `workspaceId` (workspace-scoped data)
  - `userId` (user-scoped data)
- **No global or floating data** unless explicitly system-level (migrations, settings)
- Cross-org access is **FORBIDDEN** unless explicitly bridged

**Valid patterns:**

```typescript
// ✅ CORRECT — org-scoped
const claims = await prisma.retailClaims.findMany({
  where: { orgId: user.orgId },
});

// ✅ CORRECT — workspace-scoped
const jobs = await prisma.job.findMany({
  where: { workspaceId: workspace.id },
});
```

**Invalid patterns:**

```typescript
// ❌ FORBIDDEN — global query
const allClaims = await prisma.retailClaims.findMany(); // NO ORG FILTER

// ❌ FORBIDDEN — cross-org access
const otherOrgClaim = await prisma.retailClaims.findFirst({
  where: { id: claimId }, // Missing orgId check!
});
```

**Enforcement:**

- All Prisma queries must filter by `orgId`, `workspaceId`, or `userId`
- New models without ownership fields are rejected in PR review

---

### 3️⃣ CLIENT ↔ PRO BRIDGE (CRITICAL)

**Rule:** All cross-org collaboration MUST use the defined bridge entity

**Bridge Entity:** `ClientWorkRequest` (formerly `ClientProConnection`)

**Required Fields:**

```prisma
model ClientWorkRequest {
  id              String   @id @default(cuid())

  // REQUIRED: Ownership
  clientOrgId     String
  proOrgId        String
  workspaceId     String   @unique

  // REQUIRED: Source tracking
  source          String   // "client_invite" | "pro_invite" | "job_post"

  // REQUIRED: State management
  status          String   // "requested" | "accepted" | "active" | "closed"

  // REQUIRED: Attribution
  createdByUserId String
  createdByRole   String   // "client" | "pro"

  // Relationships
  clientOrg       Organization @relation("ClientWorkRequests", fields: [clientOrgId])
  proOrg          Organization @relation("ProWorkRequests", fields: [proOrgId])
  workspace       Workspace @relation(fields: [workspaceId])
}
```

**Rules:**

1. All jobs MUST attach to a `Workspace` created from a `ClientWorkRequest`
2. All messages MUST reference a `workspaceId` from a valid bridge
3. All files, photos, and documents MUST belong to a workspace
4. Direct client→pro database writes are **FORBIDDEN** without a bridge

**Valid Flow:**

```
1. Pro posts job → ClientWorkRequest created (source: "job_post", status: "requested")
2. Client accepts → status = "accepted", Workspace created
3. All collaboration happens in Workspace (scoped by workspaceId)
```

**Invalid Flow:**

```
❌ Client creates job directly in Pro's org → FORBIDDEN
❌ Pro accesses Client's claims directly → FORBIDDEN
❌ Workspace exists without ClientWorkRequest → FORBIDDEN
```

**Enforcement:**

- E2E tests must verify full invite→workspace→job flow
- New workspace creation MUST validate `ClientWorkRequest` exists

---

### 4️⃣ FAILURE TRANSPARENCY

**Rule:** No silent failures. Every error must be observable.

**Requirements:**

- **No empty `catch` blocks**
- Every async operation MUST either:
  - Log the error (`console.error`, logger service)
  - Notify the UI (return error response, show toast)
  - Preserve retry ability (queue, job table)
- User-facing errors must be actionable ("Network error, try again" not "Error 500")

**Valid patterns:**

```typescript
// ✅ CORRECT
try {
  await sendEmail(user.email);
} catch (error) {
  console.error("[Email Error]", error);
  await prisma.failedEmails.create({
    data: { userId: user.id, error: String(error) },
  });
  return { error: "Email failed to send. We'll retry shortly." };
}
```

**Invalid patterns:**

```typescript
// ❌ FORBIDDEN
try {
  await sendEmail(user.email);
} catch (error) {
  // Silent failure — no log, no UI feedback, no retry
}

// ❌ FORBIDDEN
.catch(() => {}) // Empty handler
```

**Enforcement:**

- Lint rule: `no-empty` for catch blocks
- CI gate: `grep -r "catch.*{.*}" | grep -v console.error` must return 0

---

### 5️⃣ DATA REALITY RULE

**Rule:** Code without users, data, or execution paths cannot exist

**Requirements:**
If a feature:

- Has no user-facing UI
- Has no database records
- Has no execution path (no imports, no routes)
- Has no scheduled jobs

Then it **MUST be removed** or **moved to RFC quarantine**.

**Valid:**

- Feature has UI → has API route → has Prisma queries → has data
- Feature is in `docs/rfcs/` with "Status: Proposed"

**Invalid:**

- Feature has code but no UI
- Feature has UI but no backend
- Feature "will be used later"
- Feature exists "just in case"

**Enforcement:**

- Quarterly dead code audits (`scripts/find-dead-delegates.js`)
- Any directory with 0 imports for >90 days is removed

---

## 🛑 ANTI-PATTERNS (PERMANENTLY BANNED)

These patterns have caused system rot and are **never allowed**:

### ❌ "Future Use" Code

```typescript
// FORBIDDEN
const featureFlags = {
  ML_ENABLED: false, // "We might use this later"
  BLOCKCHAIN_ENABLED: false, // "Just scaffolding for now"
};
```

**Why:** Rots the codebase. If not needed now, belongs in RFC.

### ❌ Unscoped Data

```typescript
// FORBIDDEN
model GlobalSetting {
  key   String @id
  value String
}
```

**Why:** Creates shared mutable state. Use org-scoped settings.

### ❌ Custom Auth

```typescript
// FORBIDDEN
const validPassword = await bcrypt.compare(password, user.hashedPassword);
```

**Why:** Clerk handles auth. Custom auth creates security holes.

### ❌ Cross-Org Queries

```typescript
// FORBIDDEN
const allOrgs = await prisma.organization.findMany();
```

**Why:** Violates data isolation. Query only user's org.

### ❌ Silent Failures

```typescript
// FORBIDDEN
.catch(() => {}) // or empty catch {}
```

**Why:** Debugging nightmare. Always log or notify.

---

## ✅ ENFORCEMENT MECHANISMS

### 🔒 Pre-Merge Checks

All PRs must pass:

1. **TypeScript compilation** — `npx tsc --noEmit`
2. **API auth audit** — `node scripts/audit-api-auth.js` (0 unprotected writes)
3. **Dead delegate check** — `node scripts/find-dead-delegates.js` (count not increasing)
4. **Playwright E2E tests** — All critical flows must pass

### 🔍 Quarterly Audits

Every 90 days:

1. Run full system audit (`docs/RAVEN_MASTER_FIX_PLAN.md`)
2. Delete any directory with 0 imports
3. Archive unused Prisma models
4. Update this document with new learnings

### 📋 RFC Requirement

Any new feature must have an approved RFC before implementation.

RFC template: `docs/rfcs/RFC_TEMPLATE.md`

Decision framework: `docs/DECISION_FRAMEWORK.md`

---

## 🧠 PHILOSOPHY

> "Capability ≠ Readiness"

Just because we **can** build a feature doesn't mean we **should** right now.

This contract ensures:

- **No fantasy architecture** (blockchain, quantum, mesh)
- **No aspirational code** (ML pipelines with no data)
- **No silent rot** (dead code accumulates)
- **No scope creep** (everything has ownership)

---

## 🔑 FINAL AUTHORITY

This contract is **non-negotiable**.

If a feature cannot comply, it is not ready to ship.

If compliance feels impossible, the feature design is wrong.

**Questions? Propose an RFC. Never break the contract.**

---

**Signed:** System Architecture Team  
**Effective:** January 16, 2026  
**Next Review:** April 16, 2026
