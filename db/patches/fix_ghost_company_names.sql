-- ============================================================
-- Patch: Fix ghost company names created by auto-creation bug
-- Date: 2025-01-XX
-- Issue: Auto-creation fallback used user?.name (personal name)
--        instead of actual company name, creating companies like
--        "Damien's Company" instead of using the real business name.
-- ============================================================

-- 1. Audit: Find companies that look like personal names
--    (Run this first to see what needs fixing)
SELECT tc.id, tc.name, tc."createdAt",
       tcm."firstName", tcm."lastName", tcm."userId"
FROM "TradesCompany" tc
LEFT JOIN "TradesCompanyMember" tcm ON tcm."companyId" = tc.id
WHERE tc.name ILIKE '%company%'
   OR tc.name ILIKE '%''s %'
   OR tc.name = 'My Company'
ORDER BY tc."createdAt" DESC;

-- 2. Fix specific known bad name (update company ID below)
-- UPDATE "TradesCompany"
-- SET name = 'ClearSkai Technologies, LLC'
-- WHERE id = '<COMPANY_ID_HERE>'
--   AND name != 'ClearSkai Technologies, LLC';

-- 3. Generic: Reset all "My Company" placeholders so owners can rename
-- UPDATE "TradesCompany"
-- SET name = 'My Company'
-- WHERE name ILIKE '%''s company%'
--   AND name NOT ILIKE '%LLC%'
--   AND name NOT ILIKE '%Inc%'
--   AND name NOT ILIKE '%Corp%';
