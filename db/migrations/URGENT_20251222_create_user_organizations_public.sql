-- ============================================================================
-- URGENT MIGRATION: Create user_organizations in public schema
-- Date: 2025-12-22
-- Purpose: Fix production - table was created in app schema but Prisma expects public
-- Root Cause: Claims disappeared because no user_organizations memberships exist
-- ============================================================================

-- Create the user_organizations table in PUBLIC schema (Prisma default)
CREATE TABLE IF NOT EXISTS public.user_organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  organization_id UUID, -- Match Prisma schema @db.Uuid
  role TEXT NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one user can only have one role per org
  CONSTRAINT unique_user_org UNIQUE (user_id, organization_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON public.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON public.user_organizations(organization_id);

-- Add foreign key to organizations table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    ALTER TABLE public.user_organizations
    DROP CONSTRAINT IF EXISTS fk_user_organizations_org;
    
    ALTER TABLE public.user_organizations
    ADD CONSTRAINT fk_user_organizations_org
    FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_organizations table created successfully in public schema';
  RAISE NOTICE '✅ This will allow getActiveOrgSafe() to create memberships';
  RAISE NOTICE '✅ Claims will now be linked to users via their org memberships';
END $$;
