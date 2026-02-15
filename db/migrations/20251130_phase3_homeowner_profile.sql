-- Phase 3: Add HomeownerProfile and update ClientPortalAccess
-- Manual migration to avoid shadow database issues

-- Create homeowner_profiles table
CREATE TABLE IF NOT EXISTS "homeowner_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "orgId" TEXT,
    "fullName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for homeowner_profiles
CREATE INDEX IF NOT EXISTS "homeowner_profiles_userId_idx" ON "homeowner_profiles"("userId");
CREATE INDEX IF NOT EXISTS "homeowner_profiles_orgId_idx" ON "homeowner_profiles"("orgId");

-- Add new columns to client_portal_access (if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='client_portal_access' AND column_name='userId') THEN
        ALTER TABLE "client_portal_access" ADD COLUMN "userId" TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='client_portal_access' AND column_name='orgId') THEN
        ALTER TABLE "client_portal_access" ADD COLUMN "orgId" TEXT;
    END IF;
END $$;

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS "client_portal_access_userId_idx" ON "client_portal_access"("userId");
CREATE INDEX IF NOT EXISTS "client_portal_access_orgId_idx" ON "client_portal_access"("orgId");

-- Comment for documentation
COMMENT ON TABLE "homeowner_profiles" IS 'Phase 3: Self-service portal user profiles';
