-- Add single-column unique constraint on orgId for org_branding
-- This fixes: "no unique or exclusion constraint matching the ON CONFLICT specification"
-- The upsert_org_branding() function uses ON CONFLICT ("orgId") but only a composite
-- unique on (orgId, ownerId) existed. Business rule: one branding per org.
-- Run: psql "$DATABASE_URL" -f db/migrations/20260209_add_orgId_unique_constraint.sql

-- Drop existing composite unique (it's redundant with single-column unique)
ALTER TABLE org_branding DROP CONSTRAINT IF EXISTS org_branding_orgId_ownerId_key;

-- Add single-column unique on orgId
ALTER TABLE org_branding ADD CONSTRAINT org_branding_orgId_key UNIQUE ("orgId");

-- Verify
SELECT conname, contype FROM pg_constraint WHERE conrelid = 'org_branding'::regclass;
