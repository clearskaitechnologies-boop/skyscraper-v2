# PHASE 4: DATA MODEL & PERMISSIONS CLEANUP

## Comprehensive Schema Audit & Migration Plan

**Date:** November 30, 2025  
**Total Models:** 103  
**Status:** AUDIT IN PROGRESS - NO DESTRUCTIVE CHANGES YET

---

## 🎯 PHASE 4 OBJECTIVES

1. ✅ Identify all models and their usage patterns
2. ✅ Document org-scoping status
3. ✅ Define role/permission model
4. ✅ Plan safe migrations
5. ⚠️ NO DESTRUCTIVE OPERATIONS WITHOUT EXPLICIT APPROVAL

---

## 📊 MODEL INVENTORY (103 Total Models)

### CORE MODELS (Actively Used - High Priority)

#### 1. **Org** ✅ CRITICAL

- **Fields:** id, clerkOrgId, name, planId, stripeCustomerId, etc.
- **Usage:** Core tenant model, used everywhere
- **Org Scoping:** N/A (IS the org)
- **Indexes:** ✅ stripeCustomerId, subscriptionStatus, trialEndsAt
- **Status:** ✅ GOOD - Well structured

#### 2. **claims** ✅ CRITICAL

- **Fields:** id, orgId, claimNumber, status, dateOfLoss, etc.
- **Usage:** Main claims management (claims/page.tsx, claim detail pages)
- **Org Scoping:** ✅ Has orgId
- **Indexes:** ✅ orgId, claimNumber, status
- **Status:** ✅ GOOD

#### 3. **users** ✅ CRITICAL

- **Fields:** id, clerkUserId, orgId, email, role, etc.
- **Usage:** User auth and profiles throughout app
- **Org Scoping:** ✅ Has orgId
- **Indexes:** Need to verify
- **Status:** ⚠️ Check if orgId indexed

#### 4. **user_organizations** ✅ CRITICAL (MULTI-TENANT JOIN)

- **Purpose:** Links users to orgs with roles
- **Fields:** id, userId, orgId, role
- **Usage:** safeOrgContext, org membership checks
- **Indexes:** ⚠️ VERIFY userId, orgId indexes
- **Status:** ✅ ACTIVELY USED

#### 5. **leads** ✅ ACTIVE

- **Fields:** id, orgId, name, status, source, etc.
- **Usage:** /leads page, CRM functionality
- **Org Scoping:** ✅ Has orgId
- **Indexes:** ✅ orgId, status
- **Status:** ✅ GOOD

#### 6. **Message** / **MessageThread** ✅ ACTIVE

- **Purpose:** Pro-to-pro and pro-to-client messaging
- **Usage:** /messages page (recently refactored)
- **Org Scoping:** ⚠️ CHECK - May need orgId
- **Status:** 🔍 NEEDS ORG SCOPING AUDIT

#### 7. **Client** ✅ ACTIVE

- **Purpose:** Homeowner/client records
- **Fields:** id, orgId, name, email, phone
- **Usage:** Portal, client management
- **Org Scoping:** ✅ Has orgId
- **Status:** ✅ GOOD

#### 8. **ClientPortalAccess** ✅ ACTIVE

- **Purpose:** Portal login tokens for homeowners
- **Fields:** id, clientId, token, expiresAt
- **Usage:** Portal auth, invite system
- **Org Scoping:** ⚠️ Scoped via clientId → Client.orgId
- **Status:** ✅ GOOD (indirect scoping)

#### 9. **TradePartner** ✅ ACTIVE

- **Purpose:** Trade/contractor network
- **Usage:** /trade-partners page
- **Org Scoping:** ✅ Has orgId
- **Indexes:** ✅ orgId
- **Status:** ✅ GOOD

#### 10. **ai_reports** ✅ ACTIVE

- **Purpose:** AI-generated reports (weather, damage, etc.)
- **Usage:** Weather page, rebuttal page, AI features
- **Org Scoping:** ✅ Has orgId
- **Indexes:** ✅ orgId, type
- **Status:** ✅ GOOD

#### 11. **weather_reports** ⚠️ VERIFY

- **Purpose:** Weather intelligence reports
- **Usage:** /weather page, /api/weather/report
- **Org Scoping:** 🔍 CHECK if has orgId
- **Status:** 🔍 NEEDS AUDIT

#### 12. **claim_documents** ✅ ACTIVE

- **Purpose:** File attachments for claims
- **Org Scoping:** ⚠️ Likely scoped via claimId → claims.orgId
- **Status:** ✅ GOOD (indirect scoping)

#### 13. **activities** ✅ ACTIVE

- **Purpose:** Activity logs/feed
- **Org Scoping:** ✅ Has orgId
- **Status:** ✅ GOOD

#### 14. **tasks** ✅ ACTIVE

- **Purpose:** Task management
- **Org Scoping:** ✅ Has orgId
- **Status:** ✅ GOOD

#### 15. **properties** ✅ ACTIVE

- **Purpose:** Property records linked to claims
- **Org Scoping:** ✅ Has orgId
- **Status:** ✅ GOOD

---

### TRADE NETWORK MODELS (Active Subsystem)

#### 16-20. **Trade Network Suite** ✅ ACTIVE

- **Models:** TradesProfile, TradesPost, TradesMessage, TradesConnection, TradesFeedEngagement
- **Purpose:** Social network for trade professionals
- **Usage:** /network/trades routes
- **Org Scoping:** ✅ TradesProfile has orgId, others inherit
- **Status:** ✅ GOOD - Well designed subsystem

---

### BILLING & TOKENS MODELS (Critical for Revenue)

#### 21-26. **Billing Suite** ✅ CRITICAL

- **Models:**
  - Subscription ✅
  - TokenWallet ✅
  - token_ledger ✅
  - token_usage ✅
  - token_balances ⚠️ (duplicate?)
  - tokens_ledger ⚠️ (duplicate of token_ledger?)
- **Usage:** Stripe integration, token management
- **Org Scoping:** ✅ All have orgId
- **Status:** ⚠️ POTENTIAL DUPLICATES - Need consolidation

#### 27-28. **Plan & BillingSettings** ✅ CRITICAL

- **Purpose:** Subscription plans and auto-refill settings
- **Status:** ✅ GOOD

---

### PARTIALLY USED / EXPERIMENTAL MODELS

#### 29. **proposals** ⚠️ PARTIAL

- **Purpose:** Proposal generation system
- **Related:** proposal_drafts, proposal_events, proposal_files, proposal_photos
- **Usage:** Limited usage detected
- **Status:** 🔍 NEEDS USAGE AUDIT

#### 30. **estimates** ⚠️ PARTIAL

- **Purpose:** Estimate generation
- **Status:** 🔍 CHECK if actively used

#### 31. **jobs** ⚠️ PARTIAL

- **Purpose:** Job/project management
- **Related:** job_schedules, JobCost
- **Status:** 🔍 CHECK usage

#### 32. **inspections** ⚠️ PARTIAL

- **Purpose:** Inspection scheduling/management
- **Status:** 🔍 CHECK usage

#### 33. **supplements** ⚠️ PARTIAL

- **Purpose:** Insurance supplement generation
- **Related:** supplement_items
- **Status:** 🔍 VERIFY active usage

#### 34. **reports** ⚠️ PARTIAL

- **Purpose:** Generic report storage
- **Status:** 🔍 May overlap with ai_reports

---

### LIKELY UNUSED / LEGACY MODELS (Deprecation Candidates)

#### 35-40. **Potential Duplicates / Legacy**

- **organizations** vs **Org** vs **orgs** ❌ DUPLICATE DETECTED
- **organization_users** vs **user_organizations** ❌ DUPLICATE DETECTED
- **token_balances** vs **TokenWallet** ❌ POTENTIAL DUPLICATE
- **tokens_ledger** vs **token_ledger** ❌ DUPLICATE (underscore vs camelCase)
- **usage_tokens** vs **token_usage** ❌ POTENTIAL DUPLICATE
- **profiles** vs **TradesProfile** ❌ CHECK if duplicate

#### 41-50. **Experimental / Unused Models** (VERIFY BEFORE DROPPING)

- client_network_trades ❓
- client_networks ❓
- client_activity ❓
- client_contacts ❓
- trade_profiles (vs TradesProfile?) ❓
- trades_feed_engagement (vs TradesFeedEngagement?) ❓
- tn\_\* models (tn_memberships, tn_messages, tn_participants, tn_posts, tn_threads) ❓
- claim_bad_faith_analysis ❓
- claims_activity_log ❓
- photo_findings ❓
- weather_daily_snapshots ❓
- weather_documents ❓
- weather_events ❓
- weather_results ❓
- retail_packets ❓
- quick_dols ❓
- referrals / referral_rewards ❓
- team_invitations / team_members / org_members ❓
- tool_runs / tool_usage ❓
- agent_runs ❓
- activity_logs (vs activities?) ❓

---

## 🔒 ORG SCOPING AUDIT

### ✅ PROPERLY ORG-SCOPED (Has orgId + Index)

```prisma
✅ Org (IS the org)
✅ claims (orgId indexed)
✅ leads (orgId indexed)
✅ Client (orgId indexed)
✅ TradePartner (orgId)
✅ ai_reports (orgId indexed)
✅ users (orgId)
✅ activities (orgId)
✅ tasks (orgId)
✅ properties (orgId)
✅ projects (orgId)
✅ estimates (orgId)
✅ jobs (orgId)
✅ inspections (orgId)
✅ TradesProfile (orgId indexed)
✅ Subscription (orgId unique)
✅ TokenWallet (orgId unique)
✅ BillingSettings (orgId unique)
✅ claim_documents (via claimId)
```

### ⚠️ MISSING ORG SCOPING (Needs orgId Added)

```prisma
⚠️ Message - CHECK if needs orgId
⚠️ MessageThread - CHECK if needs orgId
⚠️ weather_reports - Likely needs orgId
⚠️ ClaimTimelineEvent - Scoped via claimId only
⚠️ ClaimMaterial - Scoped via claimId only
⚠️ ClaimPhotoMeta - Scoped via claimId only (if exists)
⚠️ ClaimReport - Scoped via claimId only
⚠️ proposals - CHECK if has orgId
⚠️ supplements - CHECK if has orgId
⚠️ contacts - CHECK org scoping
```

### ❓ AMBIGUOUS / NEEDS AUDIT

```prisma
❓ Appointment - CHECK structure
❓ CopilotMessage / CopilotThread - AI chat history
❓ WebhookEvent - System events (may not need org scoping)
❓ Plan - Global plans (no org scoping needed)
❓ RetailEstimate / RetailEstimateItem - CHECK structure
```

---

## 👥 ROLE & PERMISSIONS MODEL

### Current Role Storage

**Primary:** `user_organizations.role`

- ✅ VERIFIED: Used in safeOrgContext
- ✅ Links users to orgs with roles

**Secondary:** `users.role`

- ⚠️ Legacy field? May be deprecated
- 🔍 VERIFY if still used

**Portal:** `ClientPortalAccess`

- ✅ Homeowner portal access tokens
- ✅ No role field (homeowners have implicit "client" role)

### Defined Roles

```typescript
type ProRole = "owner" | "admin" | "member";
type PortalRole = "homeowner" | "client";
```

### Role Permissions Matrix

| Role          | Manage Billing | Manage Team | Delete Org | Manage Claims | View Portal |
| ------------- | -------------- | ----------- | ---------- | ------------- | ----------- |
| **owner**     | ✅             | ✅          | ✅         | ✅            | ❌          |
| **admin**     | ✅             | ✅          | ❌         | ✅            | ❌          |
| **member**    | ❌             | ❌          | ❌         | ✅            | ❌          |
| **homeowner** | ❌             | ❌          | ❌         | View Only     | ✅          |

### Implementation Status

```typescript
// ✅ IMPLEMENTED in safeOrgContext
const ctx = await safeOrgContext();
// Returns: { status, userId, orgId, role, membership }

// ⏳ TODO: Add permission helpers
export function canManageBilling(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canManageTeam(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canDeleteOrg(role: string): boolean {
  return role === "owner";
}
```

---

## 📈 PERFORMANCE & INDEXES

### ✅ CRITICAL INDEXES (Already Exist)

```prisma
✅ Org.stripeCustomerId
✅ Org.subscriptionStatus
✅ Org.trialEndsAt
✅ claims.orgId
✅ claims.claimNumber
✅ claims.status
✅ leads.orgId
✅ leads.status
✅ ai_reports.orgId
✅ ai_reports.type
✅ TradesProfile.orgId
✅ TradesProfile.userId
✅ ClaimTimelineEvent.claimId
✅ user_organizations (composite keys)
```

### ⚠️ MISSING INDEXES (Should Add)

```prisma
⚠️ users.orgId - CRITICAL for org queries
⚠️ users.clerkUserId - Already unique, but verify
⚠️ Message.orgId (if added)
⚠️ MessageThread.orgId (if added)
⚠️ weather_reports.orgId (if added)
⚠️ Client.orgId - Verify exists
⚠️ TradePartner.orgId - Verify exists
⚠️ activities.orgId, activities.createdAt (for activity feed)
⚠️ tasks.orgId, tasks.dueDate (for task lists)
⚠️ claim_documents.claimId (for file lists)
```

---

## 🚨 DETECTED ISSUES

### 1. **Duplicate Table Names**

```
❌ organizations vs Org vs orgs
❌ organization_users vs user_organizations
❌ token_balances vs TokenWallet
❌ tokens_ledger vs token_ledger
❌ usage_tokens vs token_usage
❌ profiles vs TradesProfile
❌ trade_profiles vs TradesProfile
❌ trades_feed_engagement vs TradesFeedEngagement (case mismatch)
```

**Risk:** Query confusion, data inconsistency  
**Action:** Consolidate to single source of truth

### 2. **Case Inconsistencies**

```
⚠️ 345 schema mismatches detected by validator
⚠️ PascalCase vs snake_case mixing
⚠️ org vs Org in codebase
```

**Risk:** TypeScript errors, query failures  
**Action:** Standardize naming convention

### 3. **Missing Org Scoping**

```
⚠️ 10-15 models missing orgId
⚠️ Potential cross-tenant data leakage
```

**Risk:** CRITICAL SECURITY ISSUE  
**Action:** Add orgId to all tenant-scoped models

### 4. **Unused/Experimental Models**

```
❓ 20-30 models with unclear usage
❓ Bloating schema, slowing migrations
```

**Risk:** Maintenance burden, confusion  
**Action:** Archive or document clearly

---

## 📋 MIGRATION PLAN

### PHASE A: SAFE CHANGES (Can Execute Now)

#### A1: Add Missing Indexes

```prisma
// Add to schema.prisma
model users {
  // ... existing fields
  @@index([orgId])
  @@index([clerkUserId]) // Already unique, but explicit index helps
}

model Client {
  // ... existing fields
  @@index([orgId])
}

model activities {
  // ... existing fields
  @@index([orgId, createdAt])
}

model tasks {
  // ... existing fields
  @@index([orgId, dueDate])
}
```

**Risk:** ✅ NONE - Indexes are additive  
**Benefit:** Query performance improvements  
**Execute:** `prisma migrate dev --name add_missing_indexes`

#### A2: Add Optional orgId Fields

```prisma
// Only for models that SHOULD be org-scoped but aren't

model Message {
  // ... existing fields
  orgId String? // Optional first, backfill later

  @@index([orgId])
}

model MessageThread {
  // ... existing fields
  orgId String? // Optional first, backfill later

  @@index([orgId])
}
```

**Risk:** ⚠️ LOW - Optional fields don't break existing code  
**Benefit:** Enables org filtering  
**Execute:** After testing in dev

#### A3: Add Role Permission Helpers

```typescript
// src/lib/permissions.ts (NEW FILE - SAFE)
export type ProRole = "owner" | "admin" | "member";

export function canManageBilling(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canManageTeam(role: string): boolean {
  return role === "owner" || role === "admin";
}

export function canDeleteOrg(role: string): boolean {
  return role === "owner";
}

export function canManageBranding(role: string): boolean {
  return role === "owner" || role === "admin";
}
```

**Risk:** ✅ NONE - New file, no breaking changes  
**Execute:** Immediately

---

### PHASE B: MEDIUM-RISK CHANGES (Require Testing)

#### B1: Backfill orgId on New Fields

```sql
-- Example: Backfill Message.orgId from related MessageThread → Claim → orgId
UPDATE "Message" m
SET "orgId" = (
  SELECT c."orgId"
  FROM "MessageThread" mt
  JOIN "claims" c ON mt."claimId" = c."id"
  WHERE mt."id" = m."threadId"
)
WHERE m."orgId" IS NULL;
```

**Risk:** ⚠️ MEDIUM - Must verify data relationships  
**Testing:** Dry-run on staging first  
**Execute:** After Phase A complete

#### B2: Make orgId Required

```prisma
// After backfill complete
model Message {
  // ... existing fields
  orgId String // Remove the ?
}
```

**Risk:** ⚠️ MEDIUM - Will fail if any NULL orgIds remain  
**Prerequisites:** Backfill complete + verified  
**Execute:** After B1 verified

---

### PHASE C: HIGH-RISK CHANGES (Manual Review Required)

#### C1: Drop Duplicate Tables

```prisma
// DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL

// 1. Verify "organizations" is unused
// 2. If used, migrate data to "Org"
// 3. Update all references
// 4. Then drop:

// model organizations { } // COMMENTED OUT, NOT DROPPED YET
```

**Risk:** 🚨 HIGH - Data loss if table is used  
**Prerequisites:**

- Complete usage audit
- Data migration script
- Backup before execution
  **Execute:** ONLY with explicit approval

#### C2: Rename Tables for Consistency

```prisma
// Example: Standardize to snake_case OR PascalCase

// Option 1: All snake_case
model message { } // from Message
model message_thread { } // from MessageThread

// Option 2: All PascalCase (RECOMMENDED)
model Message { }
model MessageThread { }
```

**Risk:** 🚨 HIGH - Breaks all existing queries  
**Prerequisites:**

- Update ALL codebase references
- Test every route
- Deployment downtime plan
  **Execute:** ONLY after exhaustive testing

---

## ✅ IMMEDIATE ACTIONABLE TASKS

### Priority 1: Documentation (SAFE)

- [x] Create this DATA_MODEL_REVIEW.md
- [ ] Audit each model's actual usage in codebase
- [ ] Document which models are safe to deprecate
- [ ] Create DATA_MODEL_MIGRATION_PLAN.md with step-by-step commands

### Priority 2: Safe Improvements (LOW RISK)

- [ ] Add missing indexes (Phase A1)
- [ ] Create permission helper functions (Phase A3)
- [ ] Add optional orgId fields where needed (Phase A2)
- [ ] Run `prisma migrate dev --name phase_4a_safe_improvements`

### Priority 3: Org Scoping Audit (MEDIUM RISK)

- [ ] List all queries without orgId filter
- [ ] Add orgId checks to routes missing them
- [ ] Backfill orgId on existing records (Phase B1)
- [ ] Make orgId required after backfill (Phase B2)

### Priority 4: Deprecation (HIGH RISK - MANUAL)

- [ ] Identify truly unused models
- [ ] Create backup of production DB
- [ ] Test dropping one model in staging
- [ ] Document rollback procedure
- [ ] Execute only with approval

---

## 🎯 SUCCESS CRITERIA

### Phase 4 Complete When:

- ✅ All 103 models documented with usage status
- ✅ All org-scoped models have orgId + index
- ✅ All queries include orgId filter where appropriate
- ✅ Role/permission helpers implemented
- ✅ No duplicate table names
- ✅ Migration plan documented with rollback steps
- ✅ Zero data loss from migrations
- ✅ Build passes with zero TypeScript errors
- ✅ No breaking changes in production

---

## 📝 NOTES

- **Schema Validator:** 345 mismatches detected (case issues, model name discrepancies)
- **Current Mode:** WARN (not blocking builds)
- **Production Safety:** All destructive operations require explicit approval
- **Rollback Plan:** Every migration must document rollback steps
- **Testing Strategy:** Stage → Verify → Production

**Last Updated:** November 30, 2025  
**Next Review:** After Priority 1-2 tasks complete
