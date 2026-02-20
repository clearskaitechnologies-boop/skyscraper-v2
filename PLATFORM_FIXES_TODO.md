# 🛠️ PLATFORM FIXES TODO — Pre-Testing Checklist

**Last Updated:** 2025-02-20

This document catalogs all blocking issues preventing proper platform testing. Fix these BEFORE beginning user acceptance testing.

---

## 🚨 CRITICAL ISSUES (Blocking Testing)

### 1. `/contractors/[id]` Route Does Not Exist (404 Error)

**Status:** 🔴 BROKEN  
**Symptom:** Accessing `/contractors/36a6ac3d-6199-4210-8ee1-fd7eeb80b8b8` redirects to sign-in or 404s  
**Root Cause:** The route `/contractors/[id]` **does not exist** in the codebase

**Files with broken links pointing to `/contractors/${id}`:**
| File | Line | Code |
|------|------|------|
| [src/app/(app)/network/trades/page.tsx](<src/app/(app)/network/trades/page.tsx#L338>) | 338 | `/contractors/${contractor.id}` |
| [src/app/(app)/network/trades/page.tsx](<src/app/(app)/network/trades/page.tsx#L424>) | 424 | `/contractors/${pro.id}` |
| [src/app/(app)/network/trades/TradesNetworkClient.tsx](<src/app/(app)/network/trades/TradesNetworkClient.tsx#L111>) | 111 | `/contractors/${id}` |

**Correct routes that DO exist:**

- `/portal/contractors/[id]` — Client portal view of contractor
- `/network/contractors/[contractorId]` — Pro network view
- `/portal/find-a-pro/[id]` — Client finding a pro

**FIX OPTIONS:**

- **Option A (Recommended):** Create redirect route at `src/app/contractors/[id]/page.tsx` that redirects to `/portal/contractors/[id]` or `/network/contractors/[id]` based on user type
- **Option B:** Fix all broken links to point to correct routes

---

### 2. Trade Professional NOT Showing in "Find a Pro" List

**Status:** 🔴 BROKEN  
**Symptom:** Your Pro Trades Pro account isn't appearing in the Find a Pro search  
**Root Cause:** API filters require `onboardingStep = "complete"` AND `status = "active"` AND `isActive = true`

**Filter Location:** [src/app/api/portal/find-pro/route.ts](src/app/api/portal/find-pro/route.ts#L359-L363)

```typescript
const baseFilter = {
  isActive: true,
  status: "active",
  onboardingStep: "complete", // ONLY COMPLETE PROFILES SHOW
};
```

**FIX:** Check your `tradesCompanyMember` record in the database:

```sql
SELECT id, "userId", "firstName", "lastName", "companyName",
       status, "onboardingStep", "isActive"
FROM "tradesCompanyMember"
WHERE "userId" = 'YOUR_CLERK_USER_ID';
```

If `onboardingStep` ≠ 'complete' or `status` ≠ 'active', update:

```sql
UPDATE "tradesCompanyMember"
SET "onboardingStep" = 'complete',
    status = 'active',
    "isActive" = true
WHERE "userId" = 'YOUR_CLERK_USER_ID';
```

---

### 3. Phantom/Duplicate Company Issue

**Status:** 🟡 NEEDS INVESTIGATION  
**Symptom:** Company account attached to yours appears duplicated or non-existent

**⚠️ IMPORTANT DISCOVERY:** The UUID `36a6ac3d-6199-4210-8ee1-fd7eeb80b8b8` is from **demo seed data** in `db/seed-trades-demo.sql`. This company may not exist in your actual database!

**Potential Causes:**

1. `tradesCompanyMember.companyId` points to a deleted `tradesCompany`
2. Multiple `tradesCompanyMember` rows for same user
3. Company was soft-deleted (`isActive = false`) but member still references it
4. **The company ID is from demo data that was never seeded to production**

**Diagnosis Query:**

```sql
-- Check for orphaned member records
SELECT m.id, m."userId", m."companyId", m."companyName",
       c.id as "actual_company_id", c.name as "actual_company_name", c."isActive"
FROM "tradesCompanyMember" m
LEFT JOIN "tradesCompany" c ON m."companyId" = c.id
WHERE m."userId" = 'YOUR_CLERK_USER_ID';

-- Check for duplicates
SELECT "userId", COUNT(*)
FROM "tradesCompanyMember"
GROUP BY "userId"
HAVING COUNT(*) > 1;
```

---

## 🔧 WORKFLOW ISSUES

### 4. Client-to-Pro Connection Flow

**Status:** 🟡 NEEDS VERIFICATION  
**Required Flow:**

1. Client finds Pro in `/portal/find-a-pro`
2. Client clicks "Connect"
3. Pro receives connection request
4. Pro accepts → Client can now see Pro's details

**API Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `POST /api/portal/connect-pro` | Client requests connection |
| `GET /api/portal/connections` | Get connection statuses |
| `POST /api/client/connect` | Alternative connection endpoint |

**Key File:** [src/app/api/portal/connect-pro/route.ts](src/app/api/portal/connect-pro/route.ts)

---

### 5. Attach Client to Claim

**Status:** 🟡 NEEDS VERIFICATION  
**Required Flow:**

1. Pro creates/opens a claim
2. Pro goes to Claim → Client tab
3. Pro searches for or invites client by email
4. Client receives portal access to claim

**Key Components:**

- [src/app/(app)/claims/[claimId]/\_components/ClientConnectSection.tsx](<src/app/(app)/claims/[claimId]/_components/ClientConnectSection.tsx>) — UI for attaching client
- [src/components/trades/AttachToClaimDialog.tsx](src/components/trades/AttachToClaimDialog.tsx) — Dialog for attaching to claim
- `client_access` table — Stores claim-client access relationships

**FIX CHECK:** Ensure the `ClientConnectSection` component is rendered in the claim detail page.

---

### 6. Pro → Client Messaging

**Status:** 🟡 PARTIALLY WORKING  
**Required Flow:**

1. Pro opens Messages
2. Pro can message connected clients
3. Messages appear in Client Portal `/portal/messages`

**API Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `GET /api/messages/threads?role=client` | Client gets their threads |
| `POST /api/portal/messages/actions` | Send/create messages |
| `GET /api/portal/messages/thread/[threadId]` | Get thread messages |
| `POST /api/claims/[claimId]/messages` | Pro sends message on claim |

**Key Files:**

- [src/app/portal/messages/page.tsx](src/app/portal/messages/page.tsx) — Client messages UI
- [src/lib/messages/getOrCreatePortalThread.ts](src/lib/messages/getOrCreatePortalThread.ts) — Thread creation logic
- [src/app/api/portal/messages/route.ts](src/app/api/portal/messages/route.ts) — Portal messaging API

**Issue:** Portal threads require `isPortalThread: true` flag and must be tied to a claim.

---

### 7. Document Sharing to Client Portal

**Status:** 🟡 NEEDS VERIFICATION  
**Required Flow:**

1. Pro uploads document to claim
2. Pro toggles "Share with Client" switch
3. Document appears in Client Portal

**Key Components:**

- [src/components/claims/ClientDocumentSharing.tsx](src/components/claims/ClientDocumentSharing.tsx) — Document sharing UI
- [src/components/jobs/ClientShareWidget.tsx](src/components/jobs/ClientShareWidget.tsx) — Share widget

**API Endpoints:**
| Endpoint | Purpose |
|----------|---------|
| `GET /api/claims/documents/sharing` | Get document sharing status |
| `POST /api/claims/[claimId]/documents/[docId]/share` | Toggle sharing |

---

## 📋 COMPLETE TESTING CHECKLIST

### Pre-Flight Database Checks

```sql
-- 1. Verify your pro profile is complete
SELECT id, "userId", status, "onboardingStep", "isActive", "companyId"
FROM "tradesCompanyMember"
WHERE "userId" = 'YOUR_CLERK_USER_ID';

-- 2. Verify company exists and is active
SELECT id, name, slug, "isActive", "isVerified"
FROM "tradesCompany"
WHERE id = 'YOUR_COMPANY_ID';

-- 3. Check for client connections
SELECT * FROM "ClientProConnection"
WHERE "proCompanyId" = 'YOUR_COMPANY_ID';

-- 4. Check for client access to claims
SELECT ca.*, c."claimNumber"
FROM client_access ca
JOIN claims c ON ca."claimId" = c.id
WHERE c."orgId" = 'YOUR_ORG_ID';
```

### Workflow Test Sequence

1. ✅ **Login as Pro** → Verify dashboard loads
2. ✅ **Check Profile** → Go to `/trades/profile` → Verify info is complete
3. 🔴 **Find a Pro** → Login as Client → Search for your Pro → **BLOCKED IF NOT SHOWING**
4. 🔴 **View Pro Profile** → Click pro card → **BLOCKED BY 404**
5. ⬜ **Connect** → Click Connect button → Verify status changes
6. ⬜ **Attach to Claim** → Pro opens claim → Attaches client
7. ⬜ **Message Client** → Pro sends message → Client sees in portal
8. ⬜ **Share Document** → Pro shares file → Client sees in portal
9. ⬜ **Build Report** → Use report builder → Generate PDF
10. ⬜ **Depreciation** → Add line items → Calculate RCV/ACV

---

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1 — Fix Blocking Issues

1. [ ] **Create `/contractors/[id]` route** — Either redirect or new page
2. [ ] **Update broken links** in trades network pages
3. [ ] **Verify/fix your tradesCompanyMember record** — `onboardingStep = 'complete'`

### Priority 2 — Verify Core Flows

4. [ ] Test client-pro connection with a fresh client account
5. [ ] Test messaging from pro to client
6. [ ] Test document sharing toggle

### Priority 3 — End-to-End Testing

7. [ ] Complete claim lifecycle test
8. [ ] Report generation test
9. [ ] Depreciation calculation test

---

## 📁 KEY FILES REFERENCE

| Feature                | File                                                                  |
| ---------------------- | --------------------------------------------------------------------- |
| Find a Pro API         | `src/app/api/portal/find-pro/route.ts`                                |
| Pro Profile (Portal)   | `src/app/portal/contractors/[id]/page.tsx`                            |
| Pro Profile (Network)  | `src/app/(app)/network/contractors/[contractorId]/page.tsx`           |
| Client Connect Section | `src/app/(app)/claims/[claimId]/_components/ClientConnectSection.tsx` |
| Portal Messages        | `src/app/portal/messages/page.tsx`                                    |
| Document Sharing       | `src/components/claims/ClientDocumentSharing.tsx`                     |
| Trades Onboarding      | `src/app/api/trades/onboarding/route.ts`                              |
| Client Access Model    | `prisma/schema.prisma` → `client_access`                              |

---

**Next Steps:** Start with the database checks above to identify the exact state of your pro profile and company, then work through the Priority 1 fixes.
