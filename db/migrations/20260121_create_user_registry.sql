-- ============================================================================
-- USER REGISTRY TABLE - Master Identity Lookup
-- Created: January 21, 2026
-- Purpose: Single source of truth for user type determination at scale
-- ============================================================================

-- Create the user_registry table
CREATE TABLE IF NOT EXISTS app.user_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- The master key - links to Clerk
  "clerkUserId" TEXT UNIQUE NOT NULL,
  
  -- User type: determines which portal they access
  "userType" TEXT NOT NULL CHECK ("userType" IN ('client', 'pro')),
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Soft pointers (not foreign keys to avoid circular deps)
  "proProfileId" UUID,       -- Points to tradesCompanyMember.id if pro
  "clientProfileId" UUID,    -- Points to clients.id if client
  
  -- Organization binding (for pro users)
  "orgId" TEXT,              -- Links to organizations for pro users
  
  -- Cached metadata for fast routing
  "displayName" TEXT,
  "email" TEXT,
  "avatarUrl" TEXT,
  
  -- Status flags
  "isActive" BOOLEAN DEFAULT true,
  "lastSeenAt" TIMESTAMP WITH TIME ZONE,
  
  -- Ensure uniqueness on clerkUserId
  CONSTRAINT user_registry_clerk_unique UNIQUE ("clerkUserId")
);

-- ============================================================================
-- CRITICAL CONSTRAINT: Enforce One User Type Rule
-- This prevents any future dev mistakes, bad migrations, or admin errors
-- ============================================================================

ALTER TABLE app.user_registry
DROP CONSTRAINT IF EXISTS one_profile_only;

ALTER TABLE app.user_registry
ADD CONSTRAINT one_profile_only CHECK (
  ("userType" = 'pro' AND "proProfileId" IS NOT NULL AND "clientProfileId" IS NULL)
  OR
  ("userType" = 'client' AND "clientProfileId" IS NOT NULL AND "proProfileId" IS NULL)
  OR
  -- Allow initial registration before profile is created
  ("proProfileId" IS NULL AND "clientProfileId" IS NULL)
);

-- ============================================================================
-- INDEXES for O(1) lookups at scale
-- ============================================================================

-- Primary lookup index (most common query)
CREATE INDEX IF NOT EXISTS idx_user_registry_clerk_id 
ON app.user_registry ("clerkUserId");

-- User type filtering
CREATE INDEX IF NOT EXISTS idx_user_registry_user_type 
ON app.user_registry ("userType");

-- Org-based queries (for admin views)
CREATE INDEX IF NOT EXISTS idx_user_registry_org_id 
ON app.user_registry ("orgId") 
WHERE "orgId" IS NOT NULL;

-- Active users only
CREATE INDEX IF NOT EXISTS idx_user_registry_active 
ON app.user_registry ("isActive") 
WHERE "isActive" = true;

-- Combined index for routing (clerkUserId + userType)
CREATE INDEX IF NOT EXISTS idx_user_registry_routing 
ON app.user_registry ("clerkUserId", "userType", "isActive");

-- ============================================================================
-- TRIGGER: Auto-update updatedAt timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION app.update_user_registry_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_registry_updated_at ON app.user_registry;
CREATE TRIGGER user_registry_updated_at
  BEFORE UPDATE ON app.user_registry
  FOR EACH ROW
  EXECUTE FUNCTION app.update_user_registry_timestamp();

-- ============================================================================
-- BACKFILL EXISTING USERS
-- This migrates existing pro users from tradesCompanyMember
-- ============================================================================

-- Backfill PRO users from tradesCompanyMember
INSERT INTO app.user_registry ("clerkUserId", "userType", "proProfileId", "orgId", "displayName", "email", "createdAt")
SELECT DISTINCT
  tcm."userId" AS "clerkUserId",
  'pro' AS "userType",
  tcm.id AS "proProfileId",
  tcm."orgId",
  COALESCE(tcm."name", tcm."firstName" || ' ' || tcm."lastName") AS "displayName",
  tcm.email,
  tcm."createdAt"
FROM app."tradesCompanyMember" tcm
WHERE tcm."userId" IS NOT NULL
  AND tcm."userId" != ''
  AND tcm.status = 'active'
ON CONFLICT ("clerkUserId") DO UPDATE SET
  "proProfileId" = EXCLUDED."proProfileId",
  "orgId" = EXCLUDED."orgId",
  "displayName" = COALESCE(EXCLUDED."displayName", app.user_registry."displayName"),
  "updatedAt" = NOW();

-- Backfill CLIENT users from clients table (if they have clerkUserId)
-- Note: Many clients may not have Clerk accounts yet (they're contacts)
INSERT INTO app.user_registry ("clerkUserId", "userType", "clientProfileId", "displayName", "email", "createdAt")
SELECT DISTINCT
  c."clerkUserId",
  'client' AS "userType",
  c.id AS "clientProfileId",
  COALESCE(c."firstName" || ' ' || c."lastName", c.email) AS "displayName",
  c.email,
  c."createdAt"
FROM app.clients c
WHERE c."clerkUserId" IS NOT NULL
  AND c."clerkUserId" != ''
  AND NOT EXISTS (
    SELECT 1 FROM app.user_registry ur WHERE ur."clerkUserId" = c."clerkUserId"
  )
ON CONFLICT ("clerkUserId") DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify migration)
-- ============================================================================

-- Check total users migrated
-- SELECT "userType", COUNT(*) FROM app.user_registry GROUP BY "userType";

-- Check for any constraint violations
-- SELECT * FROM app.user_registry WHERE 
--   ("userType" = 'pro' AND "proProfileId" IS NULL AND "clientProfileId" IS NOT NULL)
--   OR ("userType" = 'client' AND "clientProfileId" IS NULL AND "proProfileId" IS NOT NULL);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE ON app.user_registry TO authenticated;
GRANT SELECT ON app.user_registry TO anon;

COMMENT ON TABLE app.user_registry IS 'Master user identity lookup table for Client vs Pro routing at scale';
COMMENT ON COLUMN app.user_registry."clerkUserId" IS 'Immutable Clerk user ID - the master key for identity';
COMMENT ON COLUMN app.user_registry."userType" IS 'client = free homeowner portal, pro = billable contractor portal';
