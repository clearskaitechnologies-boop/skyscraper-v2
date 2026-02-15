-- =============================================================================
-- Migration: Performance Indexes + Seat Billing Schema
-- Date: 2025-07-02
-- Purpose: Add composite indexes for 200-user enterprise scale + seat billing
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. CLAIMS — hot-path indexes
-- ---------------------------------------------------------------------------
-- Monthly claims count (billing/status)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_org_created
  ON claims ("orgId", "createdAt");

-- Damage type filtering
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_claims_org_damage_type
  ON claims ("orgId", "damageType");

-- ---------------------------------------------------------------------------
-- 2. LEADS — hot-path indexes
-- ---------------------------------------------------------------------------
-- Job category filtering (retail vs insurance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_job_category
  ON leads ("orgId", "jobCategory");

-- Time-series queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_created
  ON leads ("orgId", "createdAt");

-- ---------------------------------------------------------------------------
-- 3. SUBSCRIPTION — add seatCount + stripeSubscriptionItemId columns
-- ---------------------------------------------------------------------------
ALTER TABLE "Subscription"
  ADD COLUMN IF NOT EXISTS "stripeSubscriptionItemId" TEXT,
  ADD COLUMN IF NOT EXISTS "seatCount" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "pricePerSeat" INTEGER NOT NULL DEFAULT 8000;

-- ---------------------------------------------------------------------------
-- 4. TEAM PERFORMANCE — org + period queries
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_team_perf_org_period
  ON team_performance ("orgId", "period");

-- ---------------------------------------------------------------------------
-- 5. ACTIVITIES — org + timestamp for feed queries
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_activities_org_created
  ON activities ("orgId", "createdAt" DESC);

-- ---------------------------------------------------------------------------
-- 6. APPOINTMENTS — upcoming-per-org
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_appointments_org_start
  ON appointments ("orgId", "startTime");

-- ---------------------------------------------------------------------------
-- 7. DOCUMENTS — org lookup
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_org
  ON documents ("orgId");

-- ---------------------------------------------------------------------------
-- 8. JOBS — org + status for pipeline queries
-- ---------------------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_org_status
  ON jobs ("orgId", status);

COMMIT;

-- Verify
SELECT indexname, tablename
FROM pg_indexes
WHERE indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
