-- ================================================================================
-- MASTER MIGRATION: January 15, 2026
-- Archive System + Trades Onboarding Schema Fix
-- ================================================================================
-- This migration includes:
-- 1. Archive system (archivedAt columns on leads, claims, projects)
-- 2. Cold storage flag on Org table
-- 3. Trades onboarding schema drift fix (tradesCompanyMember missing columns)
-- ================================================================================

-- =============================================================================
-- PART 1: ARCHIVE SYSTEM
-- =============================================================================

-- Add archivedAt to leads table
ALTER TABLE "leads" 
ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;

-- Add archivedAt to claims table  
ALTER TABLE "claims" 
ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;

-- Add archivedAt to projects table
ALTER TABLE "projects" 
ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;

-- Add coldStorageEnabled flag to Org table
ALTER TABLE "Org" 
ADD COLUMN IF NOT EXISTS "coldStorageEnabled" BOOLEAN DEFAULT FALSE;

-- Create indexes for efficient archive queries
CREATE INDEX IF NOT EXISTS "idx_leads_archived" ON "leads" ("archivedAt") WHERE "archivedAt" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_claims_archived" ON "claims" ("archivedAt") WHERE "archivedAt" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "idx_projects_archived" ON "projects" ("archivedAt") WHERE "archivedAt" IS NOT NULL;

-- =============================================================================
-- PART 2: TRADES ONBOARDING SCHEMA FIX
-- tradesCompanyMember table was missing 21 columns that Prisma expected
-- =============================================================================

-- Profile fields
ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "firstName" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "lastName" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "email" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "phone" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "title" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "tradeType" TEXT;

-- Array fields for specialties and preferences
ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "specialties" TEXT[] DEFAULT '{}';

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "lookingFor" TEXT[] DEFAULT '{}';

-- Numeric fields
ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER;

-- Text/content fields
ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "bio" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "avatar" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "workHistory" TEXT;

-- Status and workflow fields
ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'active';

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "onboardingStep" TEXT DEFAULT 'profile';

-- Company linking fields
ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "pendingCompanyToken" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "invitedBy" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "orgId" TEXT;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "canEditCompany" BOOLEAN DEFAULT FALSE;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "canInviteMembers" BOOLEAN DEFAULT FALSE;

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "canManageJobs" BOOLEAN DEFAULT FALSE;

-- =============================================================================
-- VERIFICATION QUERIES (run manually to verify)
-- =============================================================================
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'tradesCompanyMember' ORDER BY column_name;
-- 
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name IN ('leads', 'claims', 'projects') 
-- AND column_name = 'archivedAt';
-- 
-- SELECT column_name FROM information_schema.columns 
-- WHERE table_name = 'Org' AND column_name = 'coldStorageEnabled';

-- =============================================================================
-- COMPLETE
-- =============================================================================
