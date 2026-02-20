# 🔬 MASTER INTEGRITY AUDIT & VERIFICATION PLAN

**Last Updated:** 2025-02-20  
**Status:** PRODUCTION-READY

This document provides the complete 5-layer verification system to **prove** platform integrity. No vibes. Hard proof.

---

## 📋 TABLE OF CONTENTS

1. [Layer 1: Database Integrity Audit](#layer-1-database-integrity-audit)
2. [Layer 2: Cross-Tenant Security Verification](#layer-2-cross-tenant-security-verification)
3. [Layer 3: Automated Programmatic Audit](#layer-3-automated-programmatic-audit)
4. [Layer 4: UI Behavioral Walkthrough](#layer-4-ui-behavioral-walkthrough)
5. [Layer 5: Permanent Constraint Hardening](#layer-5-permanent-constraint-hardening)
6. [Execution Checklist](#execution-checklist)

---

## 🧱 Layer 1: Database Integrity Audit

**Purpose:** Verify relational data is correct at the database level.  
**Tool:** [scripts/audit/db-integrity-audit.sql](scripts/audit/db-integrity-audit.sql)

### Quick Run

```bash
# Run full audit
psql $DATABASE_URL -f scripts/audit/db-integrity-audit.sql

# Or in Supabase SQL Editor - copy/paste the file contents
```

### Checks Performed

| #   | Check                                  | Level       | Expected |
| --- | -------------------------------------- | ----------- | -------- |
| 1.1 | Orphan companies (no members)          | ⚠️ Warning  | 0 rows   |
| 1.2 | Members with invalid companyId         | 🚨 Critical | 0 rows   |
| 1.3 | Duplicate memberships                  | 🚨 Critical | 0 rows   |
| 2.1 | Hidden profiles (incomplete)           | 📊 Info     | Review   |
| 3.1 | Connections with null participants     | 🚨 Critical | 0 rows   |
| 3.2 | Self-connections                       | 🚨 Critical | 0 rows   |
| 3.3 | Duplicate accepted connections         | 🚨 Critical | 0 rows   |
| 4.1 | ClientProConnection invalid client     | 🚨 Critical | 0 rows   |
| 4.2 | ClientProConnection invalid contractor | 🚨 Critical | 0 rows   |
| 5.1 | client_access invalid claimId          | 🚨 Critical | 0 rows   |
| 5.3 | Claims without orgId                   | 🚨 Critical | 0 rows   |
| 6.1 | Threads with empty participants        | ⚠️ Warning  | 0 rows   |
| 6.2 | Threads without orgId                  | 🚨 Critical | 0 rows   |
| 6.3 | Messages without valid thread          | 🚨 Critical | 0 rows   |
| 7.3 | Cross-org thread-claim violations      | 🚨 Critical | 0 rows   |

### Fix Violations

If you find violations, fix them before proceeding:

```sql
-- Example: Fix orphan members (remove invalid company reference)
UPDATE "tradesCompanyMember"
SET "companyId" = NULL
WHERE "companyId" NOT IN (SELECT id FROM "tradesCompany");

-- Example: Delete duplicate connections (keep oldest)
DELETE FROM "tradesConnection"
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY LEAST("requesterId","addresseeId"),
                   GREATEST("requesterId","addresseeId")
      ORDER BY "createdAt"
    ) as rn
    FROM "tradesConnection"
    WHERE status = 'accepted'
  ) t WHERE rn > 1
);

-- Example: Delete self-connections
DELETE FROM "tradesConnection"
WHERE "requesterId" = "addresseeId";
```

---

## 🔒 Layer 2: Cross-Tenant Security Verification

**Purpose:** Verify org isolation prevents unauthorized access.  
**Method:** Manual API testing with curl/Postman

### Test Matrix

#### As User from Org A, attempt to access Org B resources:

| Test                           | Endpoint                                | Expected    |
| ------------------------------ | --------------------------------------- | ----------- |
| Read foreign claim             | `GET /api/claims/{ORG_B_CLAIM}`         | 403 or 404  |
| Update foreign claim           | `PATCH /api/claims/{ORG_B_CLAIM}`       | 403 or 404  |
| Delete foreign claim           | `DELETE /api/claims/{ORG_B_CLAIM}`      | 403 or 404  |
| Read foreign threads           | `GET /api/messages/threads` (wrong org) | Empty array |
| Send to foreign thread         | `POST /api/messages/{ORG_B_THREAD}`     | 403 or 404  |
| Edit foreign company           | `PATCH /api/trades/company/{ORG_B}`     | 403 or 404  |
| Attach client to foreign claim | `POST /api/claims/{ORG_B}/client`       | 403 or 404  |

#### Validation Tests:

| Test                 | Action                     | Expected       |
| -------------------- | -------------------------- | -------------- |
| Self-connection      | Connect user to themselves | 400 (rejected) |
| Duplicate connection | Same connection twice      | 409 (conflict) |
| View public profile  | Any contractor profile     | 200 (allowed)  |

### Curl Test Examples

```bash
# Set your test tokens
ORG_A_TOKEN="your_org_a_jwt"
ORG_B_CLAIM="claim_id_from_org_b"

# Test 1: Attempt cross-org claim access
curl -s -X GET "https://skaiscrape.com/api/claims/${ORG_B_CLAIM}" \
  -H "Authorization: Bearer ${ORG_A_TOKEN}" \
  -w "\nStatus: %{http_code}\n"
# Expected: 403 or 404

# Test 2: Attempt cross-org claim update
curl -s -X PATCH "https://skaiscrape.com/api/claims/${ORG_B_CLAIM}" \
  -H "Authorization: Bearer ${ORG_A_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked"}' \
  -w "\nStatus: %{http_code}\n"
# Expected: 403 or 404
```

---

## 🧪 Layer 3: Automated Programmatic Audit

**Purpose:** Repeatable automated verification.  
**Tool:** [scripts/audit/audit-connections.ts](scripts/audit/audit-connections.ts)

### Run the Audit

```bash
# Execute the TypeScript audit script
npx ts-node scripts/audit/audit-connections.ts

# Or compile and run
npx tsc scripts/audit/audit-connections.ts
node scripts/audit/audit-connections.js
```

### Exit Codes

| Code | Meaning                          |
| ---- | -------------------------------- |
| 0    | ✅ All checks passed             |
| 1    | 🚨 Critical violations found     |
| 2    | ⚠️ Warnings found (non-critical) |

### Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/integrity-check.yml
name: Integrity Audit
on:
  push:
    branches: [main]
  schedule:
    - cron: "0 6 * * *" # Daily at 6 AM

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx ts-node scripts/audit/audit-connections.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## 🎯 Layer 4: UI Behavioral Walkthrough

**Purpose:** Manual verification of end-to-end flows.

### Pre-Test Setup

1. Create 2 test accounts:
   - **Pro Account A** (contractor with complete profile)
   - **Client Account B** (homeowner)

2. Ensure Pro A profile is visible:
   ```sql
   UPDATE "tradesCompanyMember"
   SET "onboardingStep" = 'complete', status = 'active', "isActive" = true
   WHERE "userId" = 'YOUR_PRO_USER_ID';
   ```

### Client Flow Tests

| #   | Step         | Action                      | Verify                         |
| --- | ------------ | --------------------------- | ------------------------------ |
| C1  | Search Pro   | Go to `/portal/find-a-pro`  | Pro A appears in results       |
| C2  | View Profile | Click Pro A card            | Profile page loads (no 404)    |
| C3  | Connect      | Click "Connect" button      | Status changes to "Pending"    |
| C4  | Check DB     | Query client_pro_connection | Row exists with correct IDs    |
| C5  | Message      | Send message to Pro A       | Message appears in thread      |
| C6  | Receive      | Pro A replies               | Reply visible in client portal |

### Pro Flow Tests

| #   | Step           | Action                     | Verify                         |
| --- | -------------- | -------------------------- | ------------------------------ |
| P1  | View Requests  | Go to `/network/clients`   | Client B connection visible    |
| P2  | Accept         | Accept connection request  | Status changes to "Connected"  |
| P3  | Check DB       | Query ClientProConnection  | `status = 'accepted'`          |
| P4  | Create Claim   | Create new claim           | Claim appears in dashboard     |
| P5  | Attach Client  | Go to Claim → Client tab   | Add Client B to claim          |
| P6  | Check DB       | Query client_access        | Row exists for claim + email   |
| P7  | Message Client | Send message on claim      | Message creates portal thread  |
| P8  | Share Doc      | Upload doc, toggle "Share" | Document sharing flag = true   |
| P9  | Client Sees    | Client views portal        | Document visible in their view |
| P10 | Remove Access  | Remove client from claim   | client_access row deleted      |

### Verification Queries

Run after each test:

```sql
-- Check connection created (after C3)
SELECT * FROM "ClientProConnection"
WHERE "clientId" = 'CLIENT_B_ID'
  AND "contractorId" = 'PRO_A_COMPANY_ID';

-- Check client access created (after P5)
SELECT * FROM "client_access"
WHERE "claimId" = 'TEST_CLAIM_ID';

-- Check message thread created (after P7)
SELECT * FROM "MessageThread"
WHERE "claimId" = 'TEST_CLAIM_ID'
  AND "isPortalThread" = true;
```

---

## 🛡️ Layer 5: Permanent Constraint Hardening

**Purpose:** Prevent future data corruption with database constraints.  
**Tool:** [db/migrations/hardening-constraints.sql](db/migrations/hardening-constraints.sql)

### Prerequisites

⚠️ **Run Layer 1 audit FIRST.** Fix all violations before adding constraints, or the migration will fail.

### Apply Constraints

```bash
# Apply hardening constraints
psql $DATABASE_URL -f db/migrations/hardening-constraints.sql
```

### Constraints Added

| Constraint                        | Table            | Effect                                 |
| --------------------------------- | ---------------- | -------------------------------------- |
| `no_self_connection`              | tradesConnection | Prevents user connecting to self       |
| `unique_accepted_connection_pair` | tradesConnection | Prevents duplicate connections         |
| NOT NULL                          | Various          | Ensures required fields always present |
| `trg_validate_thread_claim_org`   | MessageThread    | Prevents cross-org thread-claim        |

### Verify Constraints

```sql
-- Check constraints exist
SELECT conname, contype, conrelid::regclass
FROM pg_constraint
WHERE conname LIKE '%connection%' OR conname LIKE '%thread%';

-- Check triggers exist
SELECT tgname, tgrelid::regclass
FROM pg_trigger
WHERE tgname LIKE '%validate%';
```

---

## ✅ Execution Checklist

### Phase 1: Audit (Do First)

- [ ] Run `db-integrity-audit.sql` in Supabase
- [ ] Document any violations found
- [ ] Fix all 🚨 Critical violations
- [ ] Re-run audit until 0 critical violations

### Phase 2: Programmatic Verification

- [ ] Run `audit-connections.ts`
- [ ] Verify exit code 0 or 2 (no critical)
- [ ] Review any warnings

### Phase 3: Cross-Tenant Testing

- [ ] Test claim isolation (Org A → Org B)
- [ ] Test message isolation
- [ ] Test connection validation
- [ ] Document any failures

### Phase 4: UI Walkthrough

- [ ] Complete Client Flow Tests (C1-C6)
- [ ] Complete Pro Flow Tests (P1-P10)
- [ ] Verify DB state after each step

### Phase 5: Hardening

- [ ] Re-run audit (must pass)
- [ ] Apply `hardening-constraints.sql`
- [ ] Verify constraints exist
- [ ] Run audit one final time

### Phase 6: Production Verification

- [ ] Run audit on production database
- [ ] Apply constraints to production
- [ ] Add audit to CI/CD pipeline
- [ ] Schedule daily audit cron job

---

## 📁 File Reference

| File                                      | Purpose                           |
| ----------------------------------------- | --------------------------------- |
| `scripts/audit/db-integrity-audit.sql`    | SQL queries to check DB integrity |
| `scripts/audit/audit-connections.ts`      | Automated audit script            |
| `db/migrations/hardening-constraints.sql` | Constraint migration              |
| `__tests__/cross-tenant-security.test.ts` | Security test specs               |
| `PLATFORM_FIXES_TODO.md`                  | Known issues tracker              |

---

## 🔄 Ongoing Maintenance

### Daily

- Automated audit runs via CI/CD
- Alert on any failures

### Weekly

- Review audit logs
- Check for new edge cases

### Pre-Deploy

- Run full audit
- Verify 0 violations before production deploy

---

## 💡 Quick Commands Reference

```bash
# Full database audit
psql $DATABASE_URL -f scripts/audit/db-integrity-audit.sql

# Programmatic audit
npx ts-node scripts/audit/audit-connections.ts

# Apply hardening (AFTER audit passes)
psql $DATABASE_URL -f db/migrations/hardening-constraints.sql

# Run security tests
pnpm test __tests__/cross-tenant-security.test.ts
```

---

**Remember:** If any check returns violations, FIX THEM before proceeding to the next layer. Each layer builds on the previous one being clean.
