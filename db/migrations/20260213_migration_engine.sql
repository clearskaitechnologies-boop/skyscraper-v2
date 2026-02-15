-- ============================================================
-- Migration Engine Schema: migration_logs + external tracking
-- Run: psql "$DATABASE_URL" -f ./db/migrations/20260213_migration_engine.sql
-- ============================================================

BEGIN;

-- 1. Migration audit log table
CREATE TABLE IF NOT EXISTS app.migration_logs (
  id            TEXT PRIMARY KEY,
  "orgId"       TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'acculynx',  -- 'acculynx', 'jobber', 'csv', etc.
  status        TEXT NOT NULL DEFAULT 'pending',   -- 'pending', 'running', 'completed', 'failed'
  stats         JSONB DEFAULT '{}',
  errors        JSONB DEFAULT '[]',
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_migration_logs_org ON app.migration_logs ("orgId");
CREATE INDEX IF NOT EXISTS idx_migration_logs_status ON app.migration_logs (status);

-- 2. Add externalId + externalSource columns to core tables (for dedup tracking)
-- These columns track the original ID from the source CRM so we never double-import.

ALTER TABLE app.contacts
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

CREATE INDEX IF NOT EXISTS idx_contacts_external
  ON app.contacts ("orgId", "externalId", "externalSource")
  WHERE "externalId" IS NOT NULL;

ALTER TABLE app.properties
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

CREATE INDEX IF NOT EXISTS idx_properties_external
  ON app.properties ("orgId", "externalId", "externalSource")
  WHERE "externalId" IS NOT NULL;

ALTER TABLE app.leads
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_external
  ON app.leads ("orgId", "externalId", "externalSource")
  WHERE "externalId" IS NOT NULL;

ALTER TABLE app.jobs
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

CREATE INDEX IF NOT EXISTS idx_jobs_external
  ON app.jobs ("orgId", "externalId", "externalSource")
  WHERE "externalId" IS NOT NULL;

ALTER TABLE app.claims
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

CREATE INDEX IF NOT EXISTS idx_claims_external
  ON app.claims ("orgId", "externalId", "externalSource")
  WHERE "externalId" IS NOT NULL;

COMMIT;

\echo ''
\echo '✅ Migration engine schema ready'
\echo '   - app.migration_logs table created'
\echo '   - externalId + externalSource columns added to contacts, properties, leads, jobs, claims'
\echo ''
