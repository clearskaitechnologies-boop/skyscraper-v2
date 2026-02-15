-- ============================================================================
-- Fix: Add Pricing Tier columns to "Org" table (not "organizations")
-- ============================================================================
--
-- The 20251202_pricing_tiers_system.sql migration added tier/usage columns
-- to the "organizations" table, but Prisma uses the "Org" table.
--
-- This migration adds the missing columns to the correct "Org" table.
-- Safe to run multiple times (idempotent with IF NOT EXISTS).
--
-- ============================================================================

BEGIN;

-- Add tier column to "Org" table  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'Org' 
      AND column_name = 'tier'
  ) THEN
    ALTER TABLE public."Org" 
    ADD COLUMN tier TEXT DEFAULT 'STARTER' 
    CHECK (tier IN ('STARTER', 'PROFESSIONAL', 'ENTERPRISE'));
  END IF;
END$$;

-- Add usage tracking columns to "Org" table
ALTER TABLE public."Org" 
ADD COLUMN IF NOT EXISTS "claimsUsedThisMonth" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "aiCreditsUsedThisMonth" INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "storageBytesUsed" BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS "usagePeriodStart" TIMESTAMP DEFAULT NOW();

-- Create index for tier filtering
CREATE INDEX IF NOT EXISTS "Org_tier_idx" ON public."Org"(tier);

-- Backfill NULL values
UPDATE public."Org" 
SET 
  "claimsUsedThisMonth" = COALESCE("claimsUsedThisMonth", 0),
  "aiCreditsUsedThisMonth" = COALESCE("aiCreditsUsedThisMonth", 0),
  "storageBytesUsed" = COALESCE("storageBytesUsed", 0),
  "usagePeriodStart" = COALESCE("usagePeriodStart", NOW())
WHERE 
  "claimsUsedThisMonth" IS NULL 
  OR "aiCreditsUsedThisMonth" IS NULL 
  OR "storageBytesUsed" IS NULL 
  OR "usagePeriodStart" IS NULL;

COMMIT;

-- Verification query (optional):
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' AND table_name = 'Org' 
-- AND column_name IN ('tier', 'claimsUsedThisMonth', 'aiCreditsUsedThisMonth', 'storageBytesUsed', 'usagePeriodStart')
-- ORDER BY column_name;
