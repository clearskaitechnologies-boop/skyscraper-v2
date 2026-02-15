-- ============================================================================
-- Migration: Create user_organizations junction table
-- Date: 2025-11-14
-- Purpose: Link users to organizations with roles (multi-tenant support)
-- ============================================================================

-- Create the user_organizations table in the app schema
CREATE TABLE IF NOT EXISTS app.user_organizations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  org_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VIEWER', -- 'ADMIN' | 'MANAGER' | 'FIELD' | 'VIEWER'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Unique constraint: one user can only have one role per org
  CONSTRAINT unique_user_org UNIQUE (user_id, org_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON app.user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org_id ON app.user_organizations(org_id);

-- Add foreign key to orgs table (if it exists)
-- Note: We're using TEXT for org_id to match Clerk's org IDs
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'app' AND table_name = 'orgs') THEN
    ALTER TABLE app.user_organizations
    ADD CONSTRAINT fk_user_organizations_org
    FOREIGN KEY (org_id) REFERENCES app."Org"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_organizations TO service_role;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ user_organizations table created successfully';
END $$;
