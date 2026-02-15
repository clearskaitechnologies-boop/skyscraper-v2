-- ============================================================================
-- COMPREHENSIVE DATABASE AUDIT & MISSING TABLES CREATION
-- Date: 2025-11-14
-- Purpose: Ensure all tables exist for production deployment
-- ============================================================================

-- Check if activities table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'app' AND table_name = 'activities'
  ) THEN
    
    CREATE TABLE app.activities (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      org_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      contact_id TEXT,
      lead_id TEXT,
      project_id TEXT,
      claim_id TEXT,
      inspection_id TEXT,
      job_id TEXT,
      due_date TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Create indexes for performance
    CREATE INDEX idx_activities_org_type_created ON app.activities(org_id, type, created_at DESC);
    CREATE INDEX idx_activities_org_user_created ON app.activities(org_id, user_id, created_at DESC);
    CREATE INDEX idx_activities_lead ON app.activities(lead_id) WHERE lead_id IS NOT NULL;
    CREATE INDEX idx_activities_claim ON app.activities(claim_id) WHERE claim_id IS NOT NULL;
    CREATE INDEX idx_activities_job ON app.activities(job_id) WHERE job_id IS NOT NULL;

    -- Grants
    GRANT SELECT, INSERT, UPDATE, DELETE ON app.activities TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON app.activities TO service_role;

    RAISE NOTICE '✅ activities table created';
  ELSE
    RAISE NOTICE '✅ activities table already exists';
  END IF;
END $$;

-- Ensure user_organizations exists (we created this earlier, but check again)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'app' AND table_name = 'user_organizations'
  ) THEN
    
    CREATE TABLE app.user_organizations (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      user_id TEXT NOT NULL,
      org_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'VIEWER',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT unique_user_org UNIQUE (user_id, org_id)
    );

    CREATE INDEX idx_user_organizations_user_id ON app.user_organizations(user_id);
    CREATE INDEX idx_user_organizations_org_id ON app.user_organizations(org_id);

    GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_organizations TO authenticated;
    GRANT SELECT, INSERT, UPDATE, DELETE ON app.user_organizations TO service_role;

    RAISE NOTICE '✅ user_organizations table created';
  ELSE
    RAISE NOTICE '✅ user_organizations table already exists';
  END IF;
END $$;

-- Ensure orgId exists on leads table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'leads' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE app.leads ADD COLUMN org_id TEXT;
    CREATE INDEX idx_leads_org_id ON app.leads(org_id);
    RAISE NOTICE '✅ Added org_id to leads table';
  ELSE
    RAISE NOTICE '✅ leads.org_id already exists';
  END IF;
END $$;

-- Ensure orgId exists on claims table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'app' AND table_name = 'claims' AND column_name = 'org_id'
  ) THEN
    ALTER TABLE app.claims ADD COLUMN org_id TEXT;
    CREATE INDEX idx_claims_org_id ON app.claims(org_id);
    RAISE NOTICE '✅ Added org_id to claims table';
  ELSE
    RAISE NOTICE '✅ claims.org_id already exists';
  END IF;
END $$;

-- Final summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE FOUNDATION COMPLETE';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables verified/created:';
  RAISE NOTICE '  ✅ app.activities';
  RAISE NOTICE '  ✅ app.user_organizations';
  RAISE NOTICE '  ✅ app.leads (with org_id)';
  RAISE NOTICE '  ✅ app.claims (with org_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Regenerate Prisma: npx prisma generate';
  RAISE NOTICE '  2. Restart dev server: npm run dev';
  RAISE NOTICE '  3. Test /leads, /claims, /dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
END $$;
