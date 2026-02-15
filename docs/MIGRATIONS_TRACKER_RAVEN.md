# Migrations Tracker - Raven Session

**Created:** January 2026  
**Branch:** `raven/dead-page-cleanup`  
**Session:** Top 5 Features Implementation

---

## Summary

This document tracks schema changes needed or discovered during the Raven session. Most features were implemented using existing tables to avoid schema drift, but some improvements would benefit from migrations.

---

## ✅ No Migrations Needed

The following features work with existing schema:

### Feature 1: Report Queue System

- Uses existing `ai_reports` table with `status` field
- Queue states: `queued`, `processing`, `completed`, `failed`
- No schema changes needed

### Feature 2: Portal Timeline API

- Uses existing `ClaimTimelineEvent` model
- Uses existing `PortalLink` for token auth
- No schema changes needed

### Feature 3: Trades ↔ Claims Link

- Uses existing `claim_events` table for contractor assignments
- Events: `contractor_assigned`, `contractor_accepted`, `contractor_completed`
- No schema changes needed

### Feature 5: Storage Guardrails

- Uses existing `branding_uploads` and `claim_documents` for usage tracking
- Uses existing `claim_events` for audit logging
- No schema changes needed

---

## ⚠️ Schema Drift Detected

### 1. `ClientProConnection` Missing `claimId`

**Location:** `prisma/schema.prisma` vs `trades-service/prisma/schema.prisma`

**Issue:**

- Main schema's `ClientProConnection` has NO `claimId` field
- Trades-service schema has `coreClaimId` field
- The `/api/trades/attach-to-claim/route.ts` tries to update `claimId` which doesn't exist

**Impact:** Attach-to-claim endpoint will fail

**Fix:**

```prisma
model ClientProConnection {
  // ... existing fields
  claimId      String?     // Add this
  claims       claims?     @relation(fields: [claimId], references: [id])
}
```

### 2. `email_logs` Table Missing

**Location:** `src/app/api/reports/email/route.ts` line ~240

**Issue:**

- Code references `prisma.email_logs.create()`
- No `email_logs` model exists in schema

**Impact:** Report email sending may fail

**Workaround:** Feature 4 uses `email_queue.react_json` for tracking instead

**Suggested Migration:**

```prisma
model email_log {
  id             String    @id @default(cuid())
  reportId       String?
  claimId        String?
  orgId          String
  recipientEmail String
  recipientName  String?
  subject        String
  resendId       String?
  status         String    @default("queued")
  openedAt       DateTime?
  clickedAt      DateTime?
  errorMessage   String?
  metadata       Json?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @default(now())

  @@index([orgId, createdAt])
  @@index([reportId])
  @@index([status])
}
```

---

## 🔮 Future Improvements

### 1. Dedicated Contractor Assignment Table

Currently using `claim_events` for contractor assignments. A dedicated table would be cleaner:

```prisma
model ClaimContractor {
  id           String   @id @default(cuid())
  claimId      String
  companyId    String   @db.Uuid
  role         String   // "primary_contractor", "subcontractor", "consultant"
  status       String   @default("assigned")
  assignedAt   DateTime @default(now())
  acceptedAt   DateTime?
  completedAt  DateTime?
  notes        String?

  claim   claims        @relation(fields: [claimId], references: [id])
  company tradesCompany @relation(fields: [companyId], references: [id])

  @@unique([claimId, companyId])
  @@index([claimId])
  @@index([companyId])
}
```

### 2. Storage Usage Tracking Table

For more efficient quota tracking:

```prisma
model storage_usage {
  id        String   @id @default(cuid())
  orgId     String   @unique
  usedBytes BigInt   @default(0)
  fileCount Int      @default(0)
  lastSync  DateTime @default(now())

  @@index([orgId])
}
```

### 3. Report Queue Dedicated Table

If `ai_reports` becomes overloaded:

```prisma
model report_queue {
  id           String   @id @default(cuid())
  reportId     String
  claimId      String
  orgId        String
  priority     Int      @default(5)
  status       String   @default("queued")
  attempts     Int      @default(0)
  lastError    String?
  scheduledFor DateTime?
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime @default(now())

  @@index([status, priority, createdAt])
  @@index([orgId])
}
```

---

## Migration Scripts Location

Existing migrations: `/db/migrations/`

To create a new migration:

```bash
# Generate migration
psql "$DATABASE_URL" -f ./db/migrations/YYYYMMDD_description.sql

# Or use Prisma
npx prisma migrate dev --name description
```

---

## Files Created/Modified This Session

### New Files:

1. `src/lib/reports/queue.ts` - Report queue management
2. `src/app/api/reports/queue/route.ts` - Queue API
3. `scripts/process-report-queue.js` - Queue worker
4. `src/app/api/portal/claims/[claimId]/timeline/route.ts` - Portal timeline
5. `src/app/api/portal/claims/[claimId]/accept/route.ts` - Portal acceptance
6. `src/app/api/claims/[claimId]/contractors/route.ts` - Contractor assignment
7. `src/app/api/trades/jobs/route.ts` - Contractor jobs list
8. `src/app/api/trades/jobs/[claimId]/route.ts` - Job detail/actions
9. `src/app/api/reports/delivery/route.ts` - Report delivery
10. `src/app/api/reports/delivery/track/route.ts` - Email tracking pixel
11. `src/lib/storage/guardrails.ts` - Storage validation
12. `src/app/api/storage/quota/route.ts` - Quota API
13. `src/app/(app)/trades/_components/TradesSearchBar.tsx` - Search component

### Modified Files:

1. `src/app/(app)/settings/branding/BrandingForm.tsx` - Removed cover photo
2. `src/app/api/trades/search/route.ts` - Complete rewrite
3. `src/app/(app)/trades/page.tsx` - Added search bar
4. `src/app/(app)/trades/profile/_components/TradesSocialProfile.tsx` - Fixed cover photo
5. `src/app/api/upload/supabase/route.ts` - Added guardrails

---

## Verification Commands

```bash
# Check Prisma schema sync
npx prisma validate

# Generate Prisma client
npx prisma generate

# Check for drift
npx prisma migrate status

# Test specific feature
curl -X GET http://localhost:3000/api/storage/quota \
  -H "Cookie: <session>"
```

---

## Notes

- All new features use existing tables to avoid migration risk
- Schema drift in `ClientProConnection` should be addressed before using attach-to-claim
- `email_logs` issue is worked around with `email_queue.react_json`
- Consider consolidating trades-service schema into main schema
