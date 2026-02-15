-- ============================================================================
-- TRADES NETWORK - PHASE 1: Onboarding + Company Creation
-- ============================================================================
-- Created: 2024-12-19
-- Purpose: Real trades network with employee onboarding and company setup
-- Safety: Additive only, no breaking changes to existing tables
-- ============================================================================

-- ============================================================================
-- TRADES COMPANIES
-- ============================================================================
-- Represents contractor/trades companies (electricians, plumbers, roofers, etc.)
-- Created by admin after 3+ employees have linked their accounts

CREATE TABLE IF NOT EXISTS "TradesCompany" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "coverImage" TEXT,
  
  -- Business Details
  "businessType" TEXT, -- LLC, Corporation, Sole Proprietor, etc.
  "licenseNumber" TEXT,
  "licenseState" TEXT,
  "insuranceProvider" TEXT,
  "insurancePolicyNumber" TEXT,
  "bondProvider" TEXT,
  
  -- Contact
  "email" TEXT,
  "phone" TEXT,
  "website" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT DEFAULT 'AZ',
  "zip" TEXT,
  
  -- Service Details
  "specialties" TEXT[], -- ['Roofing', 'Solar', 'HVAC']
  "serviceAreas" TEXT[], -- ['Phoenix', 'Scottsdale', 'Tempe']
  "yearsInBusiness" INTEGER,
  
  -- Status
  "status" TEXT DEFAULT 'pending', -- pending, active, suspended
  "verifiedAt" TIMESTAMP,
  "verifiedBy" TEXT,
  
  -- Admin
  "adminUserId" TEXT NOT NULL, -- Clerk user ID of company admin
  "organizationId" TEXT, -- Optional: link to existing Clerk org
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "TradesCompany_slug_idx" ON "TradesCompany"("slug");
CREATE INDEX IF NOT EXISTS "TradesCompany_adminUserId_idx" ON "TradesCompany"("adminUserId");
CREATE INDEX IF NOT EXISTS "TradesCompany_status_idx" ON "TradesCompany"("status");
CREATE INDEX IF NOT EXISTS "TradesCompany_state_idx" ON "TradesCompany"("state");

-- ============================================================================
-- TRADES EMPLOYEES
-- ============================================================================
-- Individual trades professionals linked to companies
-- Onboarding: Users create employee profile, link to pending company
-- After 3+ linked, one becomes admin and creates company page

CREATE TABLE IF NOT EXISTS "TradesEmployee" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT UNIQUE NOT NULL, -- Clerk user ID
  "companyId" TEXT REFERENCES "TradesCompany"("id") ON DELETE SET NULL,
  
  -- Personal Info
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "avatar" TEXT,
  
  -- Professional Info
  "title" TEXT, -- Foreman, Lead Technician, etc.
  "specialties" TEXT[], -- ['Roofing', 'Solar']
  "certifications" TEXT[], -- ['Licensed Electrician', 'OSHA Certified']
  "yearsExperience" INTEGER,
  
  -- Onboarding Status
  "onboardingStep" TEXT DEFAULT 'profile', -- profile, link_company, pending_admin, complete
  "pendingCompanyName" TEXT, -- During onboarding before company created
  "pendingCompanyToken" TEXT, -- Shared token for linking employees
  "isAdmin" BOOLEAN DEFAULT false,
  "canEditCompany" BOOLEAN DEFAULT false,
  
  -- Status
  "status" TEXT DEFAULT 'active', -- active, inactive, suspended
  "verifiedAt" TIMESTAMP,
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "TradesEmployee_userId_idx" ON "TradesEmployee"("userId");
CREATE INDEX IF NOT EXISTS "TradesEmployee_companyId_idx" ON "TradesEmployee"("companyId");
CREATE INDEX IF NOT EXISTS "TradesEmployee_pendingCompanyToken_idx" ON "TradesEmployee"("pendingCompanyToken");
CREATE INDEX IF NOT EXISTS "TradesEmployee_email_idx" ON "TradesEmployee"("email");

-- ============================================================================
-- TRADES PROJECTS (Claims Integration)
-- ============================================================================
-- Links trades companies to insurance claims
-- Allows pros to be invited/assigned to claims

CREATE TABLE IF NOT EXISTS "TradesProject" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "claimId" TEXT NOT NULL, -- Foreign key to existing claims table
  "companyId" TEXT NOT NULL REFERENCES "TradesCompany"("id") ON DELETE CASCADE,
  
  -- Project Details
  "role" TEXT NOT NULL, -- 'contractor', 'sub-contractor', 'inspector'
  "scope" TEXT, -- Description of work
  "status" TEXT DEFAULT 'invited', -- invited, accepted, in_progress, completed, declined
  
  -- Assignment
  "invitedBy" TEXT, -- User ID who sent invite
  "invitedAt" TIMESTAMP DEFAULT NOW(),
  "acceptedAt" TIMESTAMP,
  "completedAt" TIMESTAMP,
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "TradesProject_claimId_idx" ON "TradesProject"("claimId");
CREATE INDEX IF NOT EXISTS "TradesProject_companyId_idx" ON "TradesProject"("companyId");
CREATE INDEX IF NOT EXISTS "TradesProject_status_idx" ON "TradesProject"("status");

-- ============================================================================
-- ONBOARDING INVITES
-- ============================================================================
-- Tracks invite links for employees to join pending companies

CREATE TABLE IF NOT EXISTS "TradesOnboardingInvite" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "token" TEXT UNIQUE NOT NULL,
  "companyName" TEXT NOT NULL,
  "createdBy" TEXT NOT NULL, -- Employee ID who created invite
  "email" TEXT, -- Optional: specific email invite
  "expiresAt" TIMESTAMP,
  "usedBy" TEXT[], -- Array of employee IDs who used this invite
  "maxUses" INTEGER DEFAULT 10,
  "status" TEXT DEFAULT 'active', -- active, expired, revoked
  "createdAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "TradesOnboardingInvite_token_idx" ON "TradesOnboardingInvite"("token");
CREATE INDEX IF NOT EXISTS "TradesOnboardingInvite_createdBy_idx" ON "TradesOnboardingInvite"("createdBy");

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if a pending company has enough employees to create company page
CREATE OR REPLACE FUNCTION check_pending_company_ready(pending_token TEXT)
RETURNS TABLE(
  ready BOOLEAN,
  employee_count BIGINT,
  pending_company_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) >= 3 as ready,
    COUNT(*) as employee_count,
    MAX("pendingCompanyName") as pending_company_name
  FROM "TradesEmployee"
  WHERE "pendingCompanyToken" = pending_token
    AND "companyId" IS NULL
    AND "status" = 'active';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (Optional - comment out for production)
-- ============================================================================

-- Example: Onboarding flow simulation
-- User 1 creates profile, generates invite token
-- Users 2 & 3 join using token
-- User 1 becomes admin, creates company page
-- All 3 employees now linked to company

COMMENT ON TABLE "TradesCompany" IS 'Trades contractor companies - created after 3+ employees onboard';
COMMENT ON TABLE "TradesEmployee" IS 'Individual trades professionals - onboarding starts here';
COMMENT ON TABLE "TradesProject" IS 'Links trades companies to insurance claims';
COMMENT ON TABLE "TradesOnboardingInvite" IS 'Invite tokens for employees to join pending companies';

-- ============================================================================
-- PHASE 1 COMPLETE
-- ============================================================================
-- Tables created:
-- ✅ TradesCompany (company pages)
-- ✅ TradesEmployee (individual pros with onboarding flow)
-- ✅ TradesProject (claim assignments)
-- ✅ TradesOnboardingInvite (invite system)
--
-- Next: Build onboarding UI + company creation flow
-- ============================================================================
