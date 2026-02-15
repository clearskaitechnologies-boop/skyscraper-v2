-- ============================================================================
-- DEMO DATA CLEANUP: Keep exactly 1 claim, 1 lead, 1 retail job
-- Target org: cmhe0kl1j0000acz0am77w682
-- ============================================================================
-- This script preserves the FIRST (oldest) record of each type and removes
-- all others that match demo patterns.
--
-- Run with: psql "$DATABASE_URL" -f ./db/migrations/20250702_cleanup_excess_demo.sql
-- ============================================================================

BEGIN;

-- Step 1: Identify demo leads to keep (1 of each type)
-- Keep the oldest claim-type lead
WITH claim_leads AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM leads
  WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
    AND "jobCategory" = 'claim'
),
-- Keep the oldest retail-type lead (out_of_pocket, financed, or repair)
retail_leads AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM leads
  WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
    AND "jobCategory" IN ('out_of_pocket', 'financed', 'repair')
),
-- Keep the oldest standard lead (NULL or other jobCategory)
standard_leads AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM leads
  WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
    AND ("jobCategory" IS NULL OR "jobCategory" NOT IN ('claim', 'out_of_pocket', 'financed', 'repair'))
),
-- IDs to keep
keep_ids AS (
  SELECT id FROM claim_leads WHERE rn = 1
  UNION ALL
  SELECT id FROM retail_leads WHERE rn = 1
  UNION ALL
  SELECT id FROM standard_leads WHERE rn = 1
)
-- Delete excess leads (keep 1 of each type)
DELETE FROM leads
WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
  AND id NOT IN (SELECT id FROM keep_ids)
  AND title ILIKE '%demo%' OR title ILIKE '%test%' OR title ILIKE '%smith%' OR title ILIKE '%damien%';

-- Step 2: Clean up excess claims (keep 1)
WITH ranked_claims AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) as rn
  FROM claims
  WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
)
DELETE FROM claims
WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
  AND id IN (SELECT id FROM ranked_claims WHERE rn > 1);

-- Step 3: Report what remains
SELECT 'Remaining leads:' as info, COUNT(*) as count FROM leads WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682';
SELECT 'Remaining claims:' as info, COUNT(*) as count FROM claims WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682';
SELECT 'Lead categories:' as info, "jobCategory", COUNT(*) as count
  FROM leads WHERE "orgId" = 'cmhe0kl1j0000acz0am77w682'
  GROUP BY "jobCategory";

COMMIT;
