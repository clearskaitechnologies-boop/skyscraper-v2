-- Migration: Add all missing Org columns
-- Created: 2026-01-20
-- Purpose: Sync database with Prisma schema for Org table

-- Add all potentially missing columns for Org table
-- Each column uses IF NOT EXISTS to be idempotent

ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "sentTrialT24" BOOLEAN DEFAULT false;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "sentTrialT1" BOOLEAN DEFAULT false;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "brandLogoUrl" TEXT;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "pdfFooterText" TEXT;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "pdfHeaderText" TEXT;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "videoEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "videoPlanTier" TEXT;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiCacheEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiCacheTTL" INTEGER DEFAULT 604800;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiDedupeEnabled" BOOLEAN DEFAULT true;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiModeDefault" TEXT DEFAULT 'auto';
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "coldStorageEnabled" BOOLEAN DEFAULT false;
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "coldStorageEnabledAt" TIMESTAMPTZ(6);

-- Create unique index on referralCode if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'Org_referralCode_key') THEN
        CREATE UNIQUE INDEX "Org_referralCode_key" ON "Org" ("referralCode");
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Org' 
ORDER BY ordinal_position;
