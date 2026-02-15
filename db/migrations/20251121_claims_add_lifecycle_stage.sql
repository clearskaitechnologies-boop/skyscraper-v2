-- Add missing lifecycle_stage column for claims with safe idempotent operations.
-- Column is nullable (maps to optional enum in Prisma) and no default is set.
-- Index improves orgId + lifecycle_stage filtering.

ALTER TABLE claims
  ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT;

CREATE INDEX IF NOT EXISTS idx_claims_org_stage ON claims("orgId", lifecycle_stage);

DO $$ BEGIN RAISE NOTICE '✅ lifecycle_stage reconciliation complete'; END $$;
