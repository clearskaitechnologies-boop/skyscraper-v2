-- Migration: Fix Org aiModeDefault and add missing Org columns
-- Date: 2025-11-20
-- NOTE: Existing migration 20241117_phase34_ai_performance_logs.sql added aiModeDefault as nullable TEXT DEFAULT 'auto'.
-- This script enforces NOT NULL and new default 'standard' per request and backfills NULLs.
-- It also conditionally adds other Org columns observed in Prisma schema but absent from prior migrations.
-- Safe to run multiple times (idempotent guards via IF NOT EXISTS and DO block logic).

BEGIN;

-- 1. Ensure aiModeDefault column exists and matches desired constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Org' AND column_name = 'aiModeDefault'
  ) THEN
    ALTER TABLE "Org" ADD COLUMN "aiModeDefault" TEXT NOT NULL DEFAULT 'standard';
  ELSE
    -- Column exists; enforce default and NOT NULL
    ALTER TABLE "Org" ALTER COLUMN "aiModeDefault" SET DEFAULT 'standard';
    UPDATE "Org" SET "aiModeDefault" = 'standard' WHERE "aiModeDefault" IS NULL;
    ALTER TABLE "Org" ALTER COLUMN "aiModeDefault" SET NOT NULL;
  END IF;
END$$;

-- 2. Add branding & PDF header/footer fields (nullable text)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "brandLogoUrl" TEXT;  -- Prisma: brandLogoUrl String?
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "pdfFooterText" TEXT; -- Prisma: pdfFooterText String?
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "pdfHeaderText" TEXT; -- Prisma: pdfHeaderText String?

-- 3. Referral code (unique, nullable). Unique index allows multiple NULLs naturally.
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "referralCode" TEXT; -- Prisma: referralCode String? @unique
CREATE UNIQUE INDEX IF NOT EXISTS "Org_referralCode_key" ON "Org"("referralCode") WHERE "referralCode" IS NOT NULL;

-- 4. Video access fields (may already exist from 20251117_add_org_video_fields)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "videoEnabled" BOOLEAN DEFAULT false; -- Prisma: videoEnabled Boolean @default(false)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "videoPlanTier" TEXT;                -- Prisma: videoPlanTier String?

-- 5. AI caching / dedupe settings (exist if 20241117_phase34_ai_performance_logs applied; ensure defaults)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiCacheEnabled" BOOLEAN DEFAULT true;  -- Prisma: aiCacheEnabled Boolean @default(true)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiCacheTTL" INTEGER DEFAULT 604800;     -- Prisma: aiCacheTTL Int? @default(604800)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "aiDedupeEnabled" BOOLEAN DEFAULT true;  -- Prisma: aiDedupeEnabled Boolean @default(true)

-- 6. Trial reminder flags (ensure present; prior migration 20241102_trial_reminder_flags.sql)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "sentTrialT24" BOOLEAN DEFAULT false; -- Prisma: sentTrialT24 Boolean @default(false)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "sentTrialT1"  BOOLEAN DEFAULT false; -- Prisma: sentTrialT1  Boolean @default(false)

-- 7. Quota tracking columns (ensure present; prior migration 20251031_phase3_teams_api_keys_white_label.sql)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "seats_limit" INTEGER DEFAULT 1; -- Not mapped in current Prisma Org (verify before use)
ALTER TABLE "Org" ADD COLUMN IF NOT EXISTS "seats_used"  INTEGER DEFAULT 1; -- Not mapped in current Prisma Org (verify before use)

-- 8. Index hygiene (create if missing based on Prisma @@index declarations)
CREATE INDEX IF NOT EXISTS "Org_stripeCustomerId_idx" ON "Org"("stripeCustomerId");
CREATE INDEX IF NOT EXISTS "Org_subscriptionStatus_idx" ON "Org"("subscriptionStatus");
CREATE INDEX IF NOT EXISTS "Org_trialEndsAt_idx" ON "Org"("trialEndsAt");

COMMIT;

-- Verification queries (optional – do not include in production execution if using psql -f)
-- SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='Org' ORDER BY column_name;
-- SELECT "aiModeDefault", COUNT(*) FROM "Org" GROUP BY 1;
