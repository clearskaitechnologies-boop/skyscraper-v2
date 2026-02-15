# 🔧 PRIORITIZED FIX CHECKLIST

**PreLoss Vision / SkaiScraper**  
**Generated:** November 17, 2025  
**Total Issues:** 15 items across 4 priority levels

---

## 🔴 CRITICAL PRIORITY (Fix Before Production)

### TODO-001: Fix Weather Table Name Mismatch

**Priority:** 🔴 CRITICAL  
**Impact:** Weather features will fail at runtime  
**Estimated Time:** 30 minutes

**Problem:**
Code references `weather_reports` table which doesn't exist. Database has `weather_results` instead.

**Files to Fix:**

```bash
# Search for all occurrences
grep -r "weather_reports" src/ --include="*.ts" --include="*.tsx"
```

**Expected Matches:**

- `prisma.weather_reports.findMany()`
- `prisma.weather_reports.create()`
- `prisma.weather_reports.update()`
- Import statements
- Type definitions

**Fix Pattern:**

```typescript
// BEFORE ❌
const report = await prisma.weather_reports.findUnique({
  where: { id: reportId },
});

// AFTER ✅
const report = await prisma.weather_results.findUnique({
  where: { id: reportId },
});
```

**Test Command:**

```bash
# After fixes, verify no references remain
grep -r "weather_reports" src/ --include="*.ts" --include="*.tsx"
# Should return: (no results)
```

---

### TODO-002: Standardize Model Names to Plural

**Priority:** 🔴 CRITICAL  
**Impact:** TypeScript errors, runtime crashes  
**Estimated Time:** 1 hour

**Problem:**
Code inconsistently uses singular (`prisma.lead`) vs plural (`prisma.leads`). Schema uses plural everywhere.

**Models to Fix:**

1. `lead` → `leads`
2. `claim` → `claims`
3. `property` → `properties`
4. `contact` → `contacts`

**Search & Replace:**

```bash
# Find singular references
grep -r "prisma\.lead\." src/ --include="*.ts" --include="*.tsx"
grep -r "prisma\.claim\." src/ --include="*.ts" --include="*.tsx"
grep -r "prisma\.property\." src/ --include="*.ts" --include="*.tsx"
```

**Example Fixes:**

**File:** `src/app/(app)/leads/[id]/page.tsx`

```typescript
// BEFORE ❌
async function getLead(id: string, orgId: string) {
  return prisma.lead.findFirst({
    where: { id, orgId: org.id },
  });
}

// AFTER ✅
async function getLead(id: string, orgId: string) {
  return prisma.leads.findFirst({
    where: { id, orgId: org.id },
  });
}
```

**File:** `src/app/(app)/claims/[claimId]/page.tsx`

```typescript
// BEFORE ❌
const claim = await prisma.claim.findUnique({
  where: { id: params.claimId },
});

// AFTER ✅
const claim = await prisma.claims.findUnique({
  where: { id: params.claimId },
});
```

---

### TODO-003: Fix Property Profile Model References

**Priority:** 🔴 CRITICAL  
**Impact:** Property queries will fail  
**Estimated Time:** 30 minutes

**Problem:**
Code may reference `propertyProfile` (camelCase) but schema has `property_profiles` (snake_case).

**Search:**

```bash
grep -r "propertyProfile" src/ --include="*.ts" --include="*.tsx"
grep -r "PropertyProfile" src/ --include="*.ts" --include="*.tsx"
```

**Fix Pattern:**

```typescript
// BEFORE ❌
const profile = await prisma.propertyProfile.findUnique({
  where: { id: profileId },
});

// AFTER ✅
const profile = await prisma.property_profiles.findUnique({
  where: { id: profileId },
});
```

---

### TODO-004: Run TypeScript Build Validation

**Priority:** 🔴 CRITICAL  
**Impact:** Catch all type errors before deployment  
**Estimated Time:** 15 minutes

**Commands:**

```bash
cd /Users/admin/Downloads/preloss-vision-main

# 1. Regenerate Prisma client with latest schema
npx prisma generate

# 2. Run full build
pnpm run build 2>&1 | tee build-output.log

# 3. Check for errors
grep -i "error" build-output.log

# 4. Fix any errors and repeat
```

**Expected Output:**

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
```

**If Errors Found:**

- Note file paths and line numbers
- Fix type mismatches
- Re-run build
- Repeat until clean

---

## 🟡 HIGH PRIORITY (Fix This Week)

### TODO-005: Update Health Check SQL Script

**Priority:** 🟡 HIGH  
**Impact:** Health monitoring will fail  
**Estimated Time:** 5 minutes

**File:** `db/scripts/health_check.sql`

**Problem:** References `weather_reports` table

**Fix:**

```sql
-- BEFORE ❌
SELECT 'weather_reports', COUNT(*) FROM "weather_reports"

-- AFTER ✅
SELECT 'weather_results', COUNT(*) FROM "weather_results"
```

**Full Fixed Section:**

```sql
UNION ALL
SELECT 'weather_results', COUNT(*) FROM "weather_results"
UNION ALL
SELECT 'weather_events', COUNT(*) FROM "weather_events"
UNION ALL
SELECT 'weather_daily_snapshots', COUNT(*) FROM "weather_daily_snapshots"
UNION ALL
SELECT 'weather_documents', COUNT(*) FROM "weather_documents"
```

---

### TODO-006: Create Test Organization

**Priority:** 🟡 HIGH  
**Impact:** Can't test org-specific features  
**Estimated Time:** 10 minutes

**Steps:**

1. Start dev server: `pnpm dev`
2. Visit: `http://localhost:3000`
3. Click "Sign Up"
4. Create account with Clerk
5. Create organization when prompted
6. Note the org ID from database

**Enable Video Features:**

```sql
-- Run after org created
UPDATE "Org"
SET "videoEnabled" = true,
    "videoPlanTier" = 'beta'
WHERE "clerkOrgId" = 'org_YOUR_ORG_ID_HERE';

-- Verify
SELECT id, name, "videoEnabled", "videoPlanTier"
FROM "Org"
ORDER BY "createdAt" DESC
LIMIT 1;
```

---

### TODO-007: Verify All Weather API Routes

**Priority:** 🟡 HIGH  
**Impact:** Weather verification may fail  
**Estimated Time:** 1 hour

**Routes to Check:**

1. `/api/weather/analyze`
2. `/api/weather/build-intel`
3. `/api/weather/build-smart`
4. `/api/weather/report`
5. `/api/weather/verify`
6. `/api/weather/reports/[id]`
7. `/api/weather/export-pdf`

**For Each Route:**

```typescript
// Check for weather_reports references
// Example fix in /api/weather/report/route.ts:

// BEFORE ❌
const report = await prisma.weather_reports.create({
  data: {
    orgId: org.id,
    propertyId: input.propertyId,
    reportData: weatherData,
  },
});

// AFTER ✅
const report = await prisma.weather_results.create({
  data: {
    orgId: org.id,
    propertyId: input.propertyId,
    reportData: weatherData,
  },
});
```

---

### TODO-008: Audit Claim Model References

**Priority:** 🟡 HIGH  
**Impact:** Claims features may break  
**Estimated Time:** 45 minutes

**Search:**

```bash
grep -rn "prisma\.claim\b" src/app/api/claims/ --include="*.ts"
```

**Common Files:**

- `/api/claims/[claimId]/route.ts`
- `/api/claims/route.ts`
- `/api/claims/save/route.ts`
- `/api/claims/start/route.ts`

**Fix Pattern:**

```typescript
// BEFORE ❌
const claim = await prisma.claim.update({
  where: { id: claimId },
  data: updates,
});

// AFTER ✅
const claim = await prisma.claims.update({
  where: { id: claimId },
  data: updates,
});
```

---

## 🟢 MEDIUM PRIORITY (Polish & Optimization)

### TODO-009: Add Database Indexes for Performance

**Priority:** 🟢 MEDIUM  
**Impact:** Improves query performance  
**Estimated Time:** 30 minutes

**Create Migration:**

```sql
-- File: db/migrations/20251117_add_performance_indexes.sql

-- Leads queries by org + status
CREATE INDEX IF NOT EXISTS idx_leads_org_status
ON "leads"("orgId", "status");

-- Leads queries by org + created date
CREATE INDEX IF NOT EXISTS idx_leads_org_created
ON "leads"("orgId", "createdAt" DESC);

-- Claims queries by org + lifecycle stage
CREATE INDEX IF NOT EXISTS idx_claims_org_stage
ON "claims"("orgId", "lifecycleStage");

-- Claims queries by org + created date
CREATE INDEX IF NOT EXISTS idx_claims_org_created
ON "claims"("orgId", "createdAt" DESC);

-- Weather results by property + date
CREATE INDEX IF NOT EXISTS idx_weather_property_date
ON "weather_results"("propertyId", "createdAt" DESC);

-- Reports by org + created date
CREATE INDEX IF NOT EXISTS idx_reports_org_created
ON "reports"("orgId", "createdAt" DESC);

-- TokenWallet lookups by org
CREATE INDEX IF NOT EXISTS idx_token_wallet_org
ON "TokenWallet"("orgId");

-- Activities by claim + created date
CREATE INDEX IF NOT EXISTS idx_claim_activities_claim_created
ON "claim_activities"("claimId", "createdAt" DESC);
```

**Apply:**

```bash
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -f db/migrations/20251117_add_performance_indexes.sql
```

---

### TODO-010: Add Error Boundaries to Key Routes

**Priority:** 🟢 MEDIUM  
**Impact:** Better error UX  
**Estimated Time:** 1 hour

**Files to Add Error Boundaries:**

1. `/leads/[id]/page.tsx`
2. `/claims/[claimId]/page.tsx`
3. `/reports/[reportId]/page.tsx`
4. `/weather/page.tsx`

**Pattern:**

```tsx
// Create: src/app/(app)/leads/[id]/error.tsx
"use client";

export default function LeadError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto py-12 text-center">
      <h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
      <p className="mb-6 text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="rounded bg-primary px-4 py-2 text-white">
        Try again
      </button>
    </div>
  );
}
```

---

### TODO-011: Standardize API Response Format

**Priority:** 🟢 MEDIUM  
**Impact:** Consistent API behavior  
**Estimated Time:** 2 hours

**Current State:** Mixed response formats

**Target Format:**

```typescript
// Success responses
{
  success: true,
  data: { /* result */ },
  meta?: { /* pagination, etc */ }
}

// Error responses
{
  success: false,
  error: {
    code: "INSUFFICIENT_TOKENS",
    message: "You don't have enough AI tokens",
    details?: { /* additional context */ }
  }
}
```

**Example API Update:**

```typescript
// File: /api/ai/dominus/analyze-lead/route.ts

// BEFORE ❌
if (!hasTokens) {
  return NextResponse.json({ error: "Insufficient tokens" }, { status: 402 });
}

// AFTER ✅
if (!hasTokens) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "INSUFFICIENT_TOKENS",
        message: "You don't have enough AI tokens to run this analysis",
        details: { required: 50, available: wallet.balance },
      },
    },
    { status: 402 }
  );
}
```

---

### TODO-012: Add API Rate Limiting

**Priority:** 🟢 MEDIUM  
**Impact:** Prevent abuse  
**Estimated Time:** 2 hours

**Implementation:**

1. Install: `npm install @upstash/ratelimit`
2. Configure Redis (Upstash or similar)
3. Add middleware

**Example:**

```typescript
// File: src/lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const aiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
});

export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
});
```

**Usage in API Routes:**

```typescript
import { aiRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const { userId } = auth();

  const { success } = await aiRateLimit.limit(userId!);
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before trying again." },
      { status: 429 }
    );
  }

  // ... rest of handler
}
```

---

## 🔵 LOW PRIORITY (Nice to Have)

### TODO-013: Remove Backup Schema Files

**Priority:** 🔵 LOW  
**Impact:** Cleanup only, no functional change  
**Estimated Time:** 5 minutes

**Files to Remove:**

```bash
rm prisma/schema.prisma.bak
rm prisma/schema.prisma.full-backup
rm prisma/schema.prisma.old
# (any other .bak or .old files)
```

---

### TODO-014: Add API Documentation

**Priority:** 🔵 LOW  
**Impact:** Developer experience  
**Estimated Time:** 4 hours

**Create:** `docs/API.md`

**Structure:**

```markdown
# API Documentation

## Authentication

All API routes require Clerk authentication...

## Endpoints

### Leads

- `POST /api/leads` - Create lead
- `GET /api/leads/[id]` - Get lead
- `PUT /api/leads/[id]` - Update lead

### Claims

...

### AI / Dominus

...

### Weather

...

### Reports

...
```

---

### TODO-015: Add Logging & Monitoring

**Priority:** 🔵 LOW  
**Impact:** Better observability  
**Estimated Time:** 3 hours

**Setup:**

1. Configure Sentry (already partially configured)
2. Add structured logging with `pino`
3. Add performance monitoring

**Example:**

```typescript
// File: src/lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true },
        }
      : undefined,
});

// Usage in API routes:
logger.info({ userId, leadId }, "Lead analysis started");
logger.error({ error, userId }, "AI analysis failed");
```

---

## 📊 PRIORITY SUMMARY

| Priority    | Count        | Total Time    |
| ----------- | ------------ | ------------- |
| 🔴 Critical | 4 items      | ~2.5 hours    |
| 🟡 High     | 4 items      | ~3 hours      |
| 🟢 Medium   | 4 items      | ~5.5 hours    |
| 🔵 Low      | 3 items      | ~12 hours     |
| **TOTAL**   | **15 items** | **~23 hours** |

---

## ✅ COMPLETION CHECKLIST

### Before Production Deploy:

- [ ] TODO-001: Fix weather table references
- [ ] TODO-002: Standardize model names
- [ ] TODO-003: Fix property profile references
- [ ] TODO-004: Run build validation (0 errors)
- [ ] TODO-005: Update health check SQL
- [ ] TODO-006: Create test org
- [ ] TODO-007: Verify weather API routes
- [ ] TODO-008: Audit claim model references

### After Launch (Week 1):

- [ ] TODO-009: Add database indexes
- [ ] TODO-010: Add error boundaries
- [ ] TODO-011: Standardize API responses
- [ ] TODO-012: Add rate limiting

### Future Improvements:

- [ ] TODO-013: Remove backup files
- [ ] TODO-014: Add API documentation
- [ ] TODO-015: Add logging & monitoring

---

## 🚀 QUICK START (Critical Fixes Only)

```bash
# 1. Fix weather table references (30 min)
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i '' 's/weather_reports/weather_results/g'

# 2. Fix model references (1 hour)
# Manual: Search and replace prisma.lead → prisma.leads (etc)

# 3. Regenerate Prisma client
npx prisma generate

# 4. Build validation
pnpm run build

# 5. Fix any remaining errors
# Iterate until clean build

# 6. Update health check SQL
# Edit db/scripts/health_check.sql

# 7. Create test org
pnpm dev
# Sign up via browser

# 8. Ready to deploy! 🎉
```

---

**Generated:** November 17, 2025  
**Next Review:** After critical fixes completed
