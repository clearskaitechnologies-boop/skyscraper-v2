-- Migration: Add professional profile fields and post visibility
-- Date: 2026-02-10

-- Add visibility to trades posts
ALTER TABLE "TradesPost" ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'public';

-- Add new professional fields to trades_company_member
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "licenseNumber" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "licenseState" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "businessEntityType" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "isBonded" BOOLEAN DEFAULT FALSE;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "isInsured" BOOLEAN DEFAULT FALSE;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "insurancePolicyNumber" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "additionalNotes" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "coverageTypes" TEXT[] DEFAULT '{}';

-- Index for visibility filtering on posts
CREATE INDEX IF NOT EXISTS "idx_trades_post_visibility" ON "TradesPost"("visibility", "active");
