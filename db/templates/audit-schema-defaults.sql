-- =====================================================
-- DATABASE SCHEMA DEFAULTS AUDIT
-- =====================================================
-- Reviews all tables to ensure proper default values
-- for clean user onboarding (zeros, false, now(), etc.)
-- =====================================================

-- 1. Check Users Table Defaults
-- =====================================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable,
  CASE 
    WHEN column_default IS NULL AND is_nullable = 'YES' THEN '⚠️ MISSING DEFAULT'
    WHEN column_default LIKE '%0%' OR column_default LIKE '%false%' THEN '✅ GOOD'
    ELSE '🔍 REVIEW'
  END as status
FROM information_schema.columns
WHERE table_name = 'users'
  AND column_name IN ('leads_count', 'jobs_count', 'revenue_total', 'assistant_enabled', 'onboarding_complete')
ORDER BY ordinal_position;

-- 2. Check Organizations Table Defaults
-- =====================================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable,
  CASE 
    WHEN column_default IS NULL AND is_nullable = 'YES' THEN '⚠️ MISSING DEFAULT'
    WHEN column_default LIKE '%0%' OR column_default LIKE '%false%' THEN '✅ GOOD'
    ELSE '🔍 REVIEW'
  END as status
FROM information_schema.columns
WHERE table_name = 'organizations'
  AND column_name IN ('branding_complete', 'team_size', 'total_leads', 'total_jobs', 'total_revenue')
ORDER BY ordinal_position;

-- 3. Check Leads Table Defaults
-- =====================================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'leads'
  AND column_name IN ('status', 'source', 'created_at', 'updated_at')
ORDER BY ordinal_position;

-- 4. Check Tokens Ledger Defaults
-- =====================================================
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tokens_ledger'
  AND column_name IN ('amount', 'type', 'created_at')
ORDER BY ordinal_position;

-- 5. Recommended Schema Updates (Copy to migration)
-- =====================================================

-- Add defaults to users table
-- ALTER TABLE users 
--   ALTER COLUMN leads_count SET DEFAULT 0,
--   ALTER COLUMN jobs_count SET DEFAULT 0,
--   ALTER COLUMN revenue_total SET DEFAULT 0,
--   ALTER COLUMN assistant_enabled SET DEFAULT true,
--   ALTER COLUMN onboarding_complete SET DEFAULT false;

-- Add defaults to organizations table
-- ALTER TABLE organizations 
--   ALTER COLUMN branding_complete SET DEFAULT false,
--   ALTER COLUMN team_size SET DEFAULT 1,
--   ALTER COLUMN total_leads SET DEFAULT 0,
--   ALTER COLUMN total_jobs SET DEFAULT 0,
--   ALTER COLUMN total_revenue SET DEFAULT 0;

-- Add defaults to leads table
-- ALTER TABLE leads 
--   ALTER COLUMN status SET DEFAULT 'new',
--   ALTER COLUMN source SET DEFAULT 'manual',
--   ALTER COLUMN created_at SET DEFAULT NOW(),
--   ALTER COLUMN updated_at SET DEFAULT NOW();

-- 6. Check for Null Values in Production Data
-- =====================================================

-- Users with null counters
SELECT 
  id,
  email,
  leads_count,
  jobs_count,
  revenue_total
FROM users
WHERE leads_count IS NULL 
   OR jobs_count IS NULL 
   OR revenue_total IS NULL;

-- Orgs with null counters
SELECT 
  id,
  name,
  total_leads,
  total_jobs,
  total_revenue
FROM organizations
WHERE total_leads IS NULL 
   OR total_jobs IS NULL 
   OR total_revenue IS NULL;

-- 7. Fix Existing Null Values
-- =====================================================

-- Update null counters in users
UPDATE users 
SET 
  leads_count = COALESCE(leads_count, 0),
  jobs_count = COALESCE(jobs_count, 0),
  revenue_total = COALESCE(revenue_total, 0),
  assistant_enabled = COALESCE(assistant_enabled, true),
  onboarding_complete = COALESCE(onboarding_complete, false)
WHERE leads_count IS NULL 
   OR jobs_count IS NULL 
   OR revenue_total IS NULL
   OR assistant_enabled IS NULL
   OR onboarding_complete IS NULL;

-- Update null counters in organizations
UPDATE organizations 
SET 
  branding_complete = COALESCE(branding_complete, false),
  team_size = COALESCE(team_size, 1),
  total_leads = COALESCE(total_leads, 0),
  total_jobs = COALESCE(total_jobs, 0),
  total_revenue = COALESCE(total_revenue, 0)
WHERE branding_complete IS NULL 
   OR team_size IS NULL
   OR total_leads IS NULL 
   OR total_jobs IS NULL 
   OR total_revenue IS NULL;

-- 8. Verification Report
-- =====================================================
SELECT 
  'Users with null counters' as metric,
  COUNT(*) as count
FROM users
WHERE leads_count IS NULL OR jobs_count IS NULL OR revenue_total IS NULL
UNION ALL
SELECT 
  'Orgs with null counters',
  COUNT(*)
FROM organizations
WHERE total_leads IS NULL OR total_jobs IS NULL OR total_revenue IS NULL
UNION ALL
SELECT 
  'Total users',
  COUNT(*)
FROM users
UNION ALL
SELECT 
  'Total orgs',
  COUNT(*)
FROM organizations;

-- =====================================================
-- END OF AUDIT
-- =====================================================
