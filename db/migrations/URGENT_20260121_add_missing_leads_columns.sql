-- URGENT: Add missing columns to leads table for production
-- Run this migration IMMEDIATELY on production database:
-- psql "$DATABASE_URL" -f db/migrations/URGENT_20260121_add_missing_leads_columns.sql

-- Add multi-pipeline fields to leads (these columns exist in Prisma schema but may be missing from DB)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "jobType" VARCHAR(50);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "workType" VARCHAR(100);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "urgency" VARCHAR(20);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "budget" INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "warmthScore" INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ(6);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "jobCategory" VARCHAR(50) DEFAULT 'lead';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "clientId" VARCHAR(255);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "leads_jobCategory_idx" ON "leads"("jobCategory");
CREATE INDEX IF NOT EXISTS "leads_clientId_idx" ON "leads"("clientId");
CREATE INDEX IF NOT EXISTS "leads_archivedAt_idx" ON "leads"("archivedAt");

-- Update existing leads that have claimId to be 'claim' category (if not already set)
UPDATE "leads" SET "jobCategory" = 'claim' WHERE "claimId" IS NOT NULL AND ("jobCategory" = 'lead' OR "jobCategory" IS NULL);

-- Verification
DO $$
BEGIN
  RAISE NOTICE '✅ Migration URGENT_20260121_add_missing_leads_columns completed successfully';
END $$;
