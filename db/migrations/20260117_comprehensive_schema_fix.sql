-- ================================================================================
-- COMPREHENSIVE SCHEMA FIX - January 17, 2026
-- Ensures all critical tables and columns exist for core functionality
-- ================================================================================

-- ============================================================================
-- 1. LEADS TABLE - Pipeline/Job Category Support
-- ============================================================================

-- Ensure jobCategory exists with proper default
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "jobCategory" VARCHAR(50) DEFAULT 'lead';
CREATE INDEX IF NOT EXISTS "leads_jobCategory_idx" ON "leads"("jobCategory");

-- Ensure jobType, workType, urgency, budget, warmthScore exist
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "jobType" VARCHAR(100);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "workType" VARCHAR(100);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "urgency" VARCHAR(50) DEFAULT 'standard';
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "budget" DECIMAL(12,2);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "warmthScore" INTEGER;

-- ============================================================================
-- 2. ORG BRANDING - Cover Photo Support
-- ============================================================================

ALTER TABLE "org_branding" ADD COLUMN IF NOT EXISTS "coverPhotoUrl" TEXT;

-- ============================================================================
-- 3. TRADES COMPANY - Ensure all columns exist
-- ============================================================================

-- Create table if not exists
CREATE TABLE IF NOT EXISTS "tradesCompany" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    logo TEXT,
    "coverPhoto" TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    "zipCode" TEXT,
    "licenseNumber" TEXT,
    "insuranceNumber" TEXT,
    "yearsInBusiness" INTEGER,
    rating DECIMAL(2,1) DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    specialties TEXT[] DEFAULT '{}',
    "serviceAreas" TEXT[] DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    portfolio JSONB DEFAULT '[]',
    "ownerUserId" TEXT,
    "clerkOrgId" TEXT
);

-- Add missing columns to tradesCompany if they don't exist
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS "serviceAreas" TEXT[] DEFAULT '{}';
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS portfolio JSONB DEFAULT '[]';
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS "ownerUserId" TEXT;
ALTER TABLE "tradesCompany" ADD COLUMN IF NOT EXISTS "clerkOrgId" TEXT;

-- Create index for slug
CREATE UNIQUE INDEX IF NOT EXISTS "tradesCompany_slug_key" ON "tradesCompany"(slug) WHERE slug IS NOT NULL;

-- ============================================================================
-- 4. TRADES COMPANY MEMBER - Ensure all columns exist
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tradesCompanyMember" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "userId" TEXT NOT NULL UNIQUE,
    "companyId" TEXT REFERENCES "tradesCompany"(id) ON DELETE SET NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    email TEXT,
    phone TEXT,
    title TEXT,
    "jobTitle" TEXT,
    "tradeType" TEXT,
    specialties TEXT[] DEFAULT '{}',
    "lookingFor" TEXT[] DEFAULT '{}',
    "yearsExperience" INTEGER,
    bio TEXT,
    avatar TEXT,
    "coverPhoto" TEXT,
    "workHistory" TEXT,
    status TEXT DEFAULT 'active',
    "onboardingStep" TEXT DEFAULT 'profile',
    "pendingCompanyToken" TEXT,
    "invitedBy" TEXT,
    "orgId" TEXT,
    role TEXT DEFAULT 'member',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    city TEXT,
    state TEXT
);

-- Add missing columns to tradesCompanyMember
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "workHistory" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "lookingFor" TEXT[] DEFAULT '{}';
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';

-- Create index for userId
CREATE UNIQUE INDEX IF NOT EXISTS "tradesCompanyMember_userId_key" ON "tradesCompanyMember"("userId");

-- ============================================================================
-- 5. TRADES POST - Social Feed Support
-- ============================================================================

CREATE TABLE IF NOT EXISTS "tradesPost" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "companyId" TEXT REFERENCES "tradesCompany"(id) ON DELETE CASCADE,
    "authorId" TEXT,
    content TEXT,
    "mediaUrls" TEXT[] DEFAULT '{}',
    "mediaType" TEXT DEFAULT 'text',
    "likesCount" INTEGER DEFAULT 0,
    "commentsCount" INTEGER DEFAULT 0,
    "sharesCount" INTEGER DEFAULT 0,
    "isPublic" BOOLEAN DEFAULT TRUE,
    tags TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. TEMPLATE + ORG TEMPLATE - Report Templates
-- ============================================================================

-- Base Template table
CREATE TABLE IF NOT EXISTS "Template" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    "thumbnailUrl" TEXT,
    version TEXT DEFAULT '1.0',
    tags TEXT[] DEFAULT '{}',
    "isPublished" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT TRUE,
    "isMarketplace" BOOLEAN DEFAULT FALSE,
    sections JSONB DEFAULT '[]',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- OrgTemplate (company's templates)
CREATE TABLE IF NOT EXISTS "OrgTemplate" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "orgId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL REFERENCES "Template"(id) ON DELETE CASCADE,
    "customName" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("orgId", "templateId")
);

-- Seed the mandatory "Initial Claim Inspection" template
INSERT INTO "Template" (
    id, slug, name, description, category, version, "isPublished", "isActive", "isMarketplace", tags
)
VALUES (
    'template-initial-claim-inspection',
    'initial-claim-inspection',
    'Initial Claim Inspection',
    'First response inspection report documenting initial damage findings and emergency mitigation.',
    'Inspections',
    '1.0',
    TRUE,
    TRUE,
    TRUE,
    ARRAY['initial', 'claim', 'inspection', 'mandatory']
)
ON CONFLICT (slug) DO UPDATE SET
    "isPublished" = TRUE,
    "isActive" = TRUE,
    "updatedAt" = NOW();

-- ============================================================================
-- 7. CLIENTS TABLE - Basic Client Support
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Client" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "orgId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "companyName" TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    "zipCode" TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Client_orgId_idx" ON "Client"("orgId");

-- ============================================================================
-- 8. ENSURE DEMO DATA SEED
-- ============================================================================

-- Update existing leads without jobCategory to appropriate categories
UPDATE "leads" 
SET "jobCategory" = 'claim' 
WHERE "claimId" IS NOT NULL AND ("jobCategory" IS NULL OR "jobCategory" = 'lead');

-- Done!
DO $$
BEGIN
    RAISE NOTICE 'Schema fix migration completed successfully!';
END $$;
