-- =====================================================
-- PRODUCTION DATA RESET SCRIPT
-- =====================================================
-- ⚠️ WARNING: This script deletes data!
-- Use ONLY before production launch to ensure clean slate.
-- Last updated: 2024-11-03
-- =====================================================

-- 1. Reset All User Counters to Zero
-- =====================================================
UPDATE users 
SET 
  leads_count = 0,
  jobs_count = 0,
  revenue_total = 0,
  assistant_enabled = true,
  onboarding_complete = false;

-- Verify user counters reset
SELECT COUNT(*) as users_reset, 
       SUM(leads_count) as total_leads,
       SUM(jobs_count) as total_jobs,
       SUM(revenue_total) as total_revenue
FROM users;

-- 2. Reset Organization Metrics
-- =====================================================
UPDATE organizations 
SET 
  branding_complete = false,
  team_size = 1,
  total_leads = 0,
  total_jobs = 0,
  total_revenue = 0;

-- Verify org reset
SELECT COUNT(*) as orgs_reset FROM organizations;

-- 3. Delete Test/Demo Data
-- =====================================================

-- Delete test leads
DELETE FROM leads 
WHERE source = 'test' 
   OR email LIKE '%@test.com'
   OR email LIKE '%@example.com'
   OR notes LIKE '%test%';

-- Delete test jobs
DELETE FROM jobs 
WHERE status = 'test'
   OR description LIKE '%test%';

-- Delete test contractors
DELETE FROM contractors 
WHERE contact_email LIKE '%@test.com'
   OR description LIKE '%test%';

-- Delete test vendors
DELETE FROM vendors 
WHERE contact_email LIKE '%@test.com'
   OR description LIKE '%test%';

-- Delete test invoices
DELETE FROM invoices 
WHERE status = 'test'
   OR notes LIKE '%test%';

-- Delete test claims
DELETE FROM claims 
WHERE status = 'test'
   OR notes LIKE '%test%';

-- 4. Reset Token Balances (Optional)
-- =====================================================
-- Option A: Delete all test token transactions
DELETE FROM tokens_ledger 
WHERE description LIKE '%test%'
   OR description LIKE '%demo%';

-- Option B: Reset all token balances to zero (DANGEROUS!)
-- Uncomment only if you want to zero out ALL tokens
-- DELETE FROM tokens_ledger;

-- 5. Clean Up Orphaned Records
-- =====================================================

-- Delete leads without valid org
DELETE FROM leads 
WHERE org_id NOT IN (SELECT id FROM organizations);

-- Delete jobs without valid org
DELETE FROM jobs 
WHERE org_id NOT IN (SELECT id FROM organizations);

-- Delete tokens without valid org
DELETE FROM tokens_ledger 
WHERE org_id NOT IN (SELECT id FROM organizations);

-- 6. Reset Upload/Storage Data
-- =====================================================

-- Delete test uploads
DELETE FROM branding_uploads 
WHERE status = 'test'
   OR upload_data->>'test' = 'true';

-- Delete orphaned uploads
DELETE FROM branding_uploads 
WHERE org_id NOT IN (SELECT id FROM organizations);

-- 7. Vacuum and Optimize (PostgreSQL)
-- =====================================================
VACUUM FULL users;
VACUUM FULL organizations;
VACUUM FULL leads;
VACUUM FULL jobs;
VACUUM FULL tokens_ledger;

-- 8. Verification Queries
-- =====================================================

-- Check user counters are zeroed
SELECT 
  COUNT(*) as total_users,
  SUM(leads_count) as sum_leads,
  SUM(jobs_count) as sum_jobs,
  SUM(revenue_total) as sum_revenue
FROM users;

-- Check org counters are zeroed
SELECT 
  COUNT(*) as total_orgs,
  SUM(total_leads) as sum_leads,
  SUM(total_jobs) as sum_jobs,
  SUM(total_revenue) as sum_revenue
FROM organizations;

-- Check for remaining test data
SELECT 
  (SELECT COUNT(*) FROM leads WHERE source = 'test') as test_leads,
  (SELECT COUNT(*) FROM jobs WHERE status = 'test') as test_jobs,
  (SELECT COUNT(*) FROM tokens_ledger WHERE description LIKE '%test%') as test_tokens;

-- Check token balances
SELECT 
  org_id,
  SUM(amount) as total_tokens
FROM tokens_ledger
GROUP BY org_id
ORDER BY total_tokens DESC
LIMIT 10;

-- 9. Final Status Report
-- =====================================================
SELECT 
  'Users' as table_name, COUNT(*) as record_count FROM users
UNION ALL
SELECT 'Organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'Leads', COUNT(*) FROM leads
UNION ALL
SELECT 'Jobs', COUNT(*) FROM jobs
UNION ALL
SELECT 'Contractors', COUNT(*) FROM contractors
UNION ALL
SELECT 'Vendors', COUNT(*) FROM vendors
UNION ALL
SELECT 'Tokens Ledger', COUNT(*) FROM tokens_ledger
UNION ALL
SELECT 'Claims', COUNT(*) FROM claims
UNION ALL
SELECT 'Invoices', COUNT(*) FROM invoices
ORDER BY table_name;

-- =====================================================
-- END OF RESET SCRIPT
-- =====================================================
-- Next Steps:
-- 1. Review verification queries above
-- 2. Ensure all counters are at 0
-- 3. Run bootstrap-new-org.ts for any existing users
-- 4. Test signup flow with new user
-- 5. Deploy to production
-- =====================================================
