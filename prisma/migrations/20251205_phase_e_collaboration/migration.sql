-- PHASE E – COLLAB FEATURES MIGRATION (SAFE VERSION)
-- This migration:
-- 1) Creates claim_documents table if it doesn't exist
-- 2) Adds sharing-related columns
-- 3) Creates signature_requests table
-- 4) Creates claim_events audit log table
-- 5) Adds foreign keys to claims / claim_documents ONLY (no users FKs)

------------------------------------------------------------
-- 1) Base claim_documents table (if it doesn't exist yet)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "claim_documents" (
  "id"            TEXT PRIMARY KEY,
  "claim_id"      TEXT NOT NULL,
  "name"          TEXT NOT NULL,
  "url"           TEXT NOT NULL,
  "mime_type"     TEXT,
  "size_bytes"    INTEGER,
  "uploaded_by_id" TEXT,
  "created_at"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure FK from claim_documents → claims
-- (Assumes you already have a "claims" table with "id" TEXT PK)
-- NOTE: Table uses snake_case "claim_id" column name
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

------------------------------------------------------------
-- 2) Add Phase E sharing columns to claim_documents
------------------------------------------------------------
ALTER TABLE "claim_documents"
ADD COLUMN IF NOT EXISTS "is_shared_with_client" BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "shared_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "shared_by_user_id" TEXT,
ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for client-visible docs
CREATE INDEX IF NOT EXISTS "claim_documents_shared_idx"
ON "claim_documents" ("claim_id", "is_shared_with_client")
WHERE "is_archived" = FALSE;

------------------------------------------------------------
-- 3) signature_requests table (uses camelCase to match existing schema)
------------------------------------------------------------
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

-- FKs for signature_requests → claims, claim_documents
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

------------------------------------------------------------
-- 4) claim_events audit log (uses camelCase to match existing schema)
------------------------------------------------------------
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
