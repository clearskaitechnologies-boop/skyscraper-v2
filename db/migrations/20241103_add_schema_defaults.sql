-- =====================================================
-- ADD SCHEMA DEFAULTS MIGRATION
-- =====================================================
-- Migration to add proper default values to all tables
-- Ensures clean slate for all new users/orgs
-- Run this before production launch
-- =====================================================

-- 1. Users Table Defaults
-- =====================================================
ALTER TABLE users 
  ALTER COLUMN leads_count SET DEFAULT 0,
  ALTER COLUMN jobs_count SET DEFAULT 0,
  ALTER COLUMN revenue_total SET DEFAULT 0,
  ALTER COLUMN assistant_enabled SET DEFAULT true,
  ALTER COLUMN onboarding_complete SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add NOT NULL constraints after setting defaults
ALTER TABLE users 
  ALTER COLUMN leads_count SET NOT NULL,
  ALTER COLUMN jobs_count SET NOT NULL,
  ALTER COLUMN revenue_total SET NOT NULL,
  ALTER COLUMN assistant_enabled SET NOT NULL,
  ALTER COLUMN onboarding_complete SET NOT NULL;

-- 2. Organizations Table Defaults
-- =====================================================
ALTER TABLE organizations 
  ALTER COLUMN branding_complete SET DEFAULT false,
  ALTER COLUMN team_size SET DEFAULT 1,
  ALTER COLUMN total_leads SET DEFAULT 0,
  ALTER COLUMN total_jobs SET DEFAULT 0,
  ALTER COLUMN total_revenue SET DEFAULT 0,
  ALTER COLUMN subscription_tier SET DEFAULT 'starter',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add NOT NULL constraints
ALTER TABLE organizations 
  ALTER COLUMN branding_complete SET NOT NULL,
  ALTER COLUMN team_size SET NOT NULL,
  ALTER COLUMN total_leads SET NOT NULL,
  ALTER COLUMN total_jobs SET NOT NULL,
  ALTER COLUMN total_revenue SET NOT NULL;

-- 3. Leads Table Defaults
-- =====================================================
ALTER TABLE leads 
  ALTER COLUMN status SET DEFAULT 'new',
  ALTER COLUMN source SET DEFAULT 'manual',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- 4. Jobs Table Defaults
-- =====================================================
ALTER TABLE jobs 
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN priority SET DEFAULT 'normal',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- 5. Claims Table Defaults
-- =====================================================
ALTER TABLE claims 
  ALTER COLUMN status SET DEFAULT 'open',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- 6. Tokens Ledger Defaults
-- =====================================================
ALTER TABLE tokens_ledger 
  ALTER COLUMN created_at SET DEFAULT NOW();

-- Add check constraint for amount
ALTER TABLE tokens_ledger 
  ADD CONSTRAINT tokens_ledger_amount_check 
  CHECK (amount != 0);

-- 7. Vendors Table Defaults
-- =====================================================
ALTER TABLE vendors 
  ALTER COLUMN service_types SET DEFAULT '{}',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- 8. Contractors Table Defaults
-- =====================================================
ALTER TABLE contractors 
  ALTER COLUMN premium SET DEFAULT false,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Add NOT NULL constraint
ALTER TABLE contractors 
  ALTER COLUMN premium SET NOT NULL;

-- 9. Notifications Table Defaults (if exists)
-- =====================================================
-- ALTER TABLE notifications 
--   ALTER COLUMN read SET DEFAULT false,
--   ALTER COLUMN type SET DEFAULT 'info',
--   ALTER COLUMN created_at SET DEFAULT NOW();

-- 10. Feature Flags Table Defaults (if exists)
-- =====================================================
-- ALTER TABLE feature_flags 
--   ALTER COLUMN enabled SET DEFAULT true,
--   ALTER COLUMN created_at SET DEFAULT NOW();

-- 11. Update Existing Null Values
-- =====================================================

-- Fix users
UPDATE users 
SET 
  leads_count = COALESCE(leads_count, 0),
  jobs_count = COALESCE(jobs_count, 0),
  revenue_total = COALESCE(revenue_total, 0),
  assistant_enabled = COALESCE(assistant_enabled, true),
  onboarding_complete = COALESCE(onboarding_complete, false);

-- Fix organizations
UPDATE organizations 
SET 
  branding_complete = COALESCE(branding_complete, false),
  team_size = COALESCE(team_size, 1),
  total_leads = COALESCE(total_leads, 0),
  total_jobs = COALESCE(total_jobs, 0),
  total_revenue = COALESCE(total_revenue, 0),
  subscription_tier = COALESCE(subscription_tier, 'starter');

-- Fix contractors
UPDATE contractors 
SET premium = COALESCE(premium, false);

-- 12. Create Indexes for Performance
-- =====================================================

-- Index for user counters (dashboard queries)
CREATE INDEX IF NOT EXISTS idx_users_counters 
  ON users(leads_count, jobs_count, revenue_total);

-- Index for org counters
CREATE INDEX IF NOT EXISTS idx_orgs_counters 
  ON organizations(total_leads, total_jobs, total_revenue);

-- Index for lead status (pipeline queries)
CREATE INDEX IF NOT EXISTS idx_leads_status 
  ON leads(status, created_at DESC);

-- Index for token balances (wallet queries)
CREATE INDEX IF NOT EXISTS idx_tokens_org_user 
  ON tokens_ledger(org_id, user_id, created_at DESC);

-- 13. Verification
-- =====================================================
SELECT 
  'Migration complete!' as status,
  NOW() as timestamp;

-- Check defaults were applied
SELECT 
  table_name,
  column_name,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'organizations', 'leads', 'contractors')
  AND column_name IN ('leads_count', 'jobs_count', 'branding_complete', 'premium', 'status')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- END OF MIGRATION
-- =====================================================
