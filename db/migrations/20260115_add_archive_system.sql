-- Add archivedAt columns for archive system
-- Items are never deleted, only archived

-- Add to leads table
ALTER TABLE app.leads ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_leads_archived ON app.leads("archivedAt") WHERE "archivedAt" IS NOT NULL;

-- Add to claims table
ALTER TABLE app.claims ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_claims_archived ON app.claims("archivedAt") WHERE "archivedAt" IS NOT NULL;

-- Add to projects table
ALTER TABLE app.projects ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_projects_archived ON app.projects("archivedAt") WHERE "archivedAt" IS NOT NULL;

-- Add cold storage billing flag to Org
-- Users pay $7.99/mo for access to items archived > 30 days
ALTER TABLE app."Org" ADD COLUMN IF NOT EXISTS "coldStorageEnabled" BOOLEAN DEFAULT false;
ALTER TABLE app."Org" ADD COLUMN IF NOT EXISTS "coldStorageEnabledAt" TIMESTAMPTZ;
