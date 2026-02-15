-- ============================================================
-- CONSOLIDATED PENDING MIGRATIONS
-- Run this SQL to bring the database schema up to date
-- Date: 2025-02-11
-- ============================================================

SET search_path TO app, public;

-- ============================================================
-- 1. ADD SLUG AND USERID TO CONTACTS (20251204181502_add_client_slug)
-- ============================================================
-- Add slug column
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "slug" TEXT;

-- Add userId column for Clerk integration
ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- Create unique index on slug (if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'app' AND indexname = 'contacts_slug_key'
  ) THEN
    CREATE UNIQUE INDEX "contacts_slug_key" ON "contacts"("slug");
  END IF;
END $$;

-- Create unique index on userId (if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'app' AND indexname = 'contacts_userId_key'
  ) THEN
    CREATE UNIQUE INDEX "contacts_userId_key" ON "contacts"("userId");
  END IF;
END $$;

-- Generate slugs for existing contacts (c-{hash})
UPDATE "contacts" SET "slug" = 'c-' || substring(md5("id"), 1, 24) 
WHERE "slug" IS NULL;

-- Make slug column required after populating existing rows
ALTER TABLE "contacts" ALTER COLUMN "slug" SET NOT NULL;

-- ============================================================
-- 2. PHASE E COLLABORATION TABLES (20251205_phase_e_collaboration)
-- ============================================================

-- 2a. claim_documents table
CREATE TABLE IF NOT EXISTS "claim_documents" (
  "id"                   TEXT PRIMARY KEY,
  "claim_id"             TEXT NOT NULL,
  "name"                 TEXT NOT NULL,
  "url"                  TEXT NOT NULL,
  "mime_type"            TEXT,
  "size_bytes"           INTEGER,
  "uploaded_by_id"       TEXT,
  "is_shared_with_client" BOOLEAN NOT NULL DEFAULT FALSE,
  "shared_at"            TIMESTAMPTZ,
  "shared_by_user_id"    TEXT,
  "is_archived"          BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at"           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- FK from claim_documents → claims
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'claim_documents_claim_id_fkey'
  ) THEN
    ALTER TABLE "claim_documents"
    ADD CONSTRAINT "claim_documents_claim_id_fkey"
      FOREIGN KEY ("claim_id") REFERENCES "claims"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Index for client-visible docs
CREATE INDEX IF NOT EXISTS "claim_documents_shared_idx"
ON "claim_documents" ("claim_id", "is_shared_with_client")
WHERE "is_archived" = FALSE;

-- 2b. signature_requests table
CREATE TABLE IF NOT EXISTS "signature_requests" (
  "id"              TEXT PRIMARY KEY,
  "claimId"         TEXT NOT NULL,
  "documentId"      TEXT NOT NULL,
  "requesterId"     TEXT,
  "signerName"      TEXT NOT NULL,
  "signerEmail"     TEXT NOT NULL,
  "status"          TEXT NOT NULL DEFAULT 'pending',
  "provider"        TEXT,
  "providerId"      TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "signedAt"        TIMESTAMPTZ
);

-- FKs for signature_requests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'signature_requests_claimId_fkey'
  ) THEN
    ALTER TABLE "signature_requests"
    ADD CONSTRAINT "signature_requests_claimId_fkey"
      FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'signature_requests_documentId_fkey'
  ) THEN
    ALTER TABLE "signature_requests"
    ADD CONSTRAINT "signature_requests_documentId_fkey"
      FOREIGN KEY ("documentId") REFERENCES "claim_documents"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "signature_requests_claimId_idx"
ON "signature_requests" ("claimId");

CREATE INDEX IF NOT EXISTS "signature_requests_documentId_idx"
ON "signature_requests" ("documentId");

-- 2c. claim_events audit log table
CREATE TABLE IF NOT EXISTS "claim_events" (
  "id"         TEXT PRIMARY KEY,
  "claimId"    TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "actorId"    TEXT,
  "metadata"   JSONB,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'claim_events_claimId_fkey'
  ) THEN
    ALTER TABLE "claim_events"
    ADD CONSTRAINT "claim_events_claimId_fkey"
      FOREIGN KEY ("claimId") REFERENCES "claims"("id") ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "claim_events_claimId_createdAt_idx"
ON "claim_events" ("claimId", "createdAt" DESC);

-- ============================================================
-- 3. ADD IS_ARCHIVED TO ORG (20251206_add_is_archived_to_org)
-- ============================================================
ALTER TABLE "Org"
ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS "Org_is_archived_idx" ON "Org"("is_archived");

-- ============================================================
-- 4. TELEMETRY TABLES (20251228120000_add_telemetry_tables)
-- ============================================================

CREATE TABLE IF NOT EXISTS "telemetry_events" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NULL,
  user_id text NULL,
  kind text NOT NULL,
  ref_type text NULL,
  ref_id text NULL,
  title text NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_org_created
  ON "telemetry_events" (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_kind_created
  ON "telemetry_events" (kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_org_kind_created
  ON "telemetry_events" (org_id, kind, created_at DESC);


CREATE TABLE IF NOT EXISTS "job_runs" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NULL,
  queue text NULL,
  job_name text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  success boolean NOT NULL DEFAULT true,
  attempts int NOT NULL DEFAULT 1,
  duration_ms int NULL,
  error_message text NULL,
  started_at timestamptz NULL,
  finished_at timestamptz NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_runs_org_created
  ON "job_runs" (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_runs_queue_created
  ON "job_runs" (queue, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_runs_job_created
  ON "job_runs" (job_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_runs_success_created
  ON "job_runs" (success, created_at DESC);


CREATE TABLE IF NOT EXISTS "cache_stats" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NULL,
  cache_name text NOT NULL,
  op text NOT NULL,
  hit boolean NULL,
  key text NULL,
  ttl_seconds int NULL,
  duration_ms int NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cache_stats_org_name_created
  ON "cache_stats" (org_id, cache_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cache_stats_name_created
  ON "cache_stats" (cache_name, created_at DESC);

-- ============================================================
-- 5. CREATE ClientPropertyPhoto TABLE (MISSING FROM MIGRATIONS)
-- ============================================================
CREATE TABLE IF NOT EXISTS "ClientPropertyPhoto" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId"  TEXT NOT NULL,
  "folder"    TEXT NOT NULL DEFAULT 'property',
  "url"       TEXT NOT NULL,
  "caption"   TEXT,
  "mimeType"  TEXT,
  "sizeBytes" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add FK to Client table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ClientPropertyPhoto_clientId_fkey'
  ) THEN
    ALTER TABLE "ClientPropertyPhoto"
    ADD CONSTRAINT "ClientPropertyPhoto_clientId_fkey"
      FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientPropertyPhoto_clientId_idx"
ON "ClientPropertyPhoto" ("clientId");

CREATE INDEX IF NOT EXISTS "ClientPropertyPhoto_clientId_folder_idx"
ON "ClientPropertyPhoto" ("clientId", "folder");

-- ============================================================
-- 6. RECORD THESE MIGRATIONS IN _prisma_migrations
-- ============================================================
INSERT INTO app._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
VALUES
  (gen_random_uuid()::text, '', now(), '20251204181502_add_client_slug', NULL, NULL, now(), 1),
  (gen_random_uuid()::text, '', now(), '20251205_phase_e_collaboration', NULL, NULL, now(), 1),
  (gen_random_uuid()::text, '', now(), '20251206_add_is_archived_to_org', NULL, NULL, now(), 1),
  (gen_random_uuid()::text, '', now(), '20251228120000_add_telemetry_tables', NULL, NULL, now(), 1),
  (gen_random_uuid()::text, '', now(), '20260211_add_client_property_photo', NULL, NULL, now(), 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES (Run these after to confirm)
-- ============================================================
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'contacts' AND column_name IN ('slug', 'userId');
-- SELECT column_name FROM information_schema.columns WHERE table_schema = 'app' AND table_name = 'Org' AND column_name = 'is_archived';
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'app' AND table_name IN ('claim_documents', 'signature_requests', 'claim_events', 'telemetry_events', 'job_runs', 'cache_stats', 'ClientPropertyPhoto');
