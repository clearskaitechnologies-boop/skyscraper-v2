-- Add missing columns to leads table for multi-pipeline support
-- Run with: psql "$DATABASE_URL" -f db/migrations/20260117_add_missing_columns.sql

-- Add multi-pipeline fields to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "jobType" TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "workType" TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "urgency" TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "budget" INTEGER;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "warmthScore" INTEGER;

-- Add coverPhotoUrl to org_branding (if not exists)
ALTER TABLE org_branding ADD COLUMN IF NOT EXISTS "coverPhotoUrl" TEXT;

-- Add coverPhoto to tradesCompanyMember (if not exists)
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;

-- Verify columns exist
DO $$
BEGIN
  RAISE NOTICE 'Migration 20260117_add_missing_columns completed successfully';
END $$;
