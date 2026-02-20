-- ============================================================================
-- 🔬 DATABASE INTEGRITY AUDIT
-- ============================================================================
-- Run these queries in Supabase SQL Editor or psql
-- Every query should return 0 rows for a healthy database
-- If any return rows, those are integrity violations to fix
--
-- Usage: psql $DATABASE_URL -f scripts/audit/db-integrity-audit.sql
-- ============================================================================

\echo '============================================================================'
\echo '🔬 DATABASE INTEGRITY AUDIT — Starting...'
\echo '============================================================================'
\echo ''

-- ============================================================================
-- SECTION 1: COMPANY INTEGRITY
-- ============================================================================

\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 SECTION 1: COMPANY INTEGRITY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 1.1 Orphan companies (no members) — WARNING level, not critical
\echo ''
\echo '⚠️  1.1 Orphan companies (no members):'
SELECT c.id, c.name, c.slug, c."createdAt"
FROM "tradesCompany" c
LEFT JOIN "tradesCompanyMember" m ON m."companyId" = c.id
WHERE m.id IS NULL
ORDER BY c."createdAt" DESC;

-- 1.2 Members referencing non-existent companies — CRITICAL
\echo ''
\echo '🚨 1.2 Members with invalid companyId (orphaned members):'
SELECT m.id, m."userId", m."companyId", m."firstName", m."lastName", m."companyName"
FROM "tradesCompanyMember" m
LEFT JOIN "tradesCompany" c ON c.id = m."companyId"
WHERE m."companyId" IS NOT NULL AND c.id IS NULL;

-- 1.3 Duplicate memberships (same user in same company twice) — CRITICAL
\echo ''
\echo '🚨 1.3 Duplicate memberships (same user in same company):'
SELECT "userId", "companyId", COUNT(*) as duplicate_count
FROM "tradesCompanyMember"
WHERE "companyId" IS NOT NULL
GROUP BY "userId", "companyId"
HAVING COUNT(*) > 1;

-- 1.4 Users with multiple company memberships (may be intentional)
\echo ''
\echo '⚠️  1.4 Users in multiple companies (review if intentional):'
SELECT "userId", COUNT(DISTINCT "companyId") as company_count
FROM "tradesCompanyMember"
WHERE "companyId" IS NOT NULL
GROUP BY "userId"
HAVING COUNT(DISTINCT "companyId") > 1;

-- 1.5 Companies with duplicate slugs (constraint violation)
\echo ''
\echo '🚨 1.5 Companies with duplicate slugs:'
SELECT slug, COUNT(*) as count
FROM "tradesCompany"
GROUP BY slug
HAVING COUNT(*) > 1;


-- ============================================================================
-- SECTION 2: PROFILE VISIBILITY AUDIT (Find-a-Pro)
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '👁️  SECTION 2: PROFILE VISIBILITY AUDIT'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 2.1 Profiles that WON'T appear in Find-a-Pro (incomplete/inactive)
\echo ''
\echo '⚠️  2.1 Profiles HIDDEN from Find-a-Pro (incomplete/inactive):'
SELECT id, "userId", "firstName", "lastName", "companyName", 
       status, "onboardingStep", "isActive",
       CASE 
         WHEN "onboardingStep" != 'complete' THEN 'onboardingStep != complete'
         WHEN status != 'active' THEN 'status != active'
         WHEN "isActive" != true THEN 'isActive = false'
         ELSE 'unknown'
       END as reason_hidden
FROM "tradesCompanyMember"
WHERE "onboardingStep" != 'complete'
   OR status != 'active'
   OR "isActive" != true;

-- 2.2 Profiles that WILL appear (for verification)
\echo ''
\echo '✅ 2.2 Profiles VISIBLE in Find-a-Pro (complete/active):'
SELECT COUNT(*) as visible_profiles
FROM "tradesCompanyMember"
WHERE "onboardingStep" = 'complete'
  AND status = 'active'
  AND "isActive" = true;


-- ============================================================================
-- SECTION 3: TRADES CONNECTION INTEGRITY
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔗 SECTION 3: TRADES CONNECTION INTEGRITY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 3.1 Connections with null requester or addressee — CRITICAL
\echo ''
\echo '🚨 3.1 Connections with NULL participants:'
SELECT *
FROM "tradesConnection"
WHERE "requesterId" IS NULL
   OR "addresseeId" IS NULL;

-- 3.2 Self-connections (should never exist) — CRITICAL
\echo ''
\echo '🚨 3.2 Self-connections (invalid):'
SELECT *
FROM "tradesConnection"
WHERE "requesterId" = "addresseeId";

-- 3.3 Duplicate accepted connections — CRITICAL
\echo ''
\echo '🚨 3.3 Duplicate accepted connections:'
SELECT LEAST("requesterId","addresseeId") as user_a,
       GREATEST("requesterId","addresseeId") as user_b,
       COUNT(*) as connection_count
FROM "tradesConnection"
WHERE status = 'accepted'
GROUP BY LEAST("requesterId","addresseeId"), GREATEST("requesterId","addresseeId")
HAVING COUNT(*) > 1;

-- 3.4 Connection status distribution
\echo ''
\echo '📈 3.4 Connection status distribution (info only):'
SELECT status, COUNT(*) as count
FROM "tradesConnection"
GROUP BY status
ORDER BY count DESC;


-- ============================================================================
-- SECTION 4: CLIENT-PRO CONNECTION INTEGRITY
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🤝 SECTION 4: CLIENT-PRO CONNECTION INTEGRITY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 4.1 ClientProConnection with invalid client — CRITICAL
\echo ''
\echo '🚨 4.1 ClientProConnection with invalid client:'
SELECT cpc.id, cpc."clientId", cpc."contractorId"
FROM "ClientProConnection" cpc
LEFT JOIN "Client" c ON c.id = cpc."clientId"
WHERE c.id IS NULL;

-- 4.2 ClientProConnection with invalid contractor — CRITICAL
\echo ''
\echo '🚨 4.2 ClientProConnection with invalid contractor:'
SELECT cpc.id, cpc."clientId", cpc."contractorId"
FROM "ClientProConnection" cpc
LEFT JOIN "tradesCompany" tc ON tc.id = cpc."contractorId"
WHERE tc.id IS NULL;

-- 4.3 Duplicate client-pro connections
\echo ''
\echo '🚨 4.3 Duplicate client-pro connections:'
SELECT "clientId", "contractorId", COUNT(*)
FROM "ClientProConnection"
GROUP BY "clientId", "contractorId"
HAVING COUNT(*) > 1;


-- ============================================================================
-- SECTION 5: CLAIM ACCESS INTEGRITY
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📋 SECTION 5: CLAIM ACCESS INTEGRITY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 5.1 client_access referencing non-existent claims — CRITICAL
\echo ''
\echo '🚨 5.1 client_access with invalid claimId:'
SELECT ca.*
FROM "client_access" ca
LEFT JOIN "claims" c ON c.id = ca."claimId"
WHERE c.id IS NULL;

-- 5.2 Duplicate claim access entries
\echo ''
\echo '🚨 5.2 Duplicate claim access entries:'
SELECT "claimId", email, COUNT(*)
FROM "client_access"
GROUP BY "claimId", email
HAVING COUNT(*) > 1;

-- 5.3 Claims without orgId (orphaned claims)
\echo ''
\echo '🚨 5.3 Claims without orgId:'
SELECT id, "claimNumber", "orgId"
FROM "claims"
WHERE "orgId" IS NULL OR "orgId" = '';


-- ============================================================================
-- SECTION 6: MESSAGING INTEGRITY
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '💬 SECTION 6: MESSAGING INTEGRITY'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 6.1 Threads with no participants (empty arrays) — WARNING
\echo ''
\echo '⚠️  6.1 Threads with empty participants array:'
SELECT id, "orgId", subject, participants, "createdAt"
FROM "MessageThread"
WHERE array_length(participants, 1) IS NULL 
   OR array_length(participants, 1) < 1;

-- 6.2 Threads without orgId — CRITICAL
\echo ''
\echo '🚨 6.2 Threads without orgId:'
SELECT id, subject, "orgId", "createdAt"
FROM "MessageThread"
WHERE "orgId" IS NULL OR "orgId" = '';

-- 6.3 Messages without valid thread — CRITICAL
\echo ''
\echo '🚨 6.3 Messages without valid thread:'
SELECT m.id, m."threadId", m."senderUserId", m."createdAt"
FROM "Message" m
LEFT JOIN "MessageThread" t ON t.id = m."threadId"
WHERE t.id IS NULL;

-- 6.4 Messages without sender — CRITICAL
\echo ''
\echo '🚨 6.4 Messages without sender:'
SELECT id, "threadId", "senderUserId"
FROM "Message"
WHERE "senderUserId" IS NULL OR "senderUserId" = '';

-- 6.5 Portal threads with no claimId — WARNING (may be okay for direct messages)
\echo ''
\echo '⚠️  6.5 Portal threads without claimId (review):'
SELECT id, subject, "orgId", "isPortalThread", "claimId"
FROM "MessageThread"
WHERE "isPortalThread" = true AND "claimId" IS NULL;


-- ============================================================================
-- SECTION 7: CROSS-TENANT ISOLATION CHECK
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '🔒 SECTION 7: CROSS-TENANT ISOLATION'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 7.1 Claims per org distribution
\echo ''
\echo '📈 7.1 Claims per organization:'
SELECT "orgId", COUNT(*) as claim_count
FROM "claims"
GROUP BY "orgId"
ORDER BY claim_count DESC
LIMIT 20;

-- 7.2 Message threads per org distribution
\echo ''
\echo '📈 7.2 Message threads per organization:'
SELECT "orgId", COUNT(*) as thread_count
FROM "MessageThread"
GROUP BY "orgId"
ORDER BY thread_count DESC
LIMIT 20;

-- 7.3 Check for threads referencing claims from different org — CRITICAL
\echo ''
\echo '🚨 7.3 Threads with claimId from different org (cross-tenant violation):'
SELECT mt.id as thread_id, mt."orgId" as thread_org, 
       c.id as claim_id, c."orgId" as claim_org
FROM "MessageThread" mt
JOIN "claims" c ON mt."claimId" = c.id
WHERE mt."orgId" != c."orgId";


-- ============================================================================
-- SECTION 8: DATA QUALITY CHECKS
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📊 SECTION 8: DATA QUALITY CHECKS'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

-- 8.1 tradesCompanyMember without userId — CRITICAL
\echo ''
\echo '🚨 8.1 Members without userId:'
SELECT id, "companyId", "firstName", "lastName"
FROM "tradesCompanyMember"
WHERE "userId" IS NULL OR "userId" = '';

-- 8.2 Companies without name or slug
\echo ''
\echo '⚠️  8.2 Companies without name or slug:'
SELECT id, name, slug
FROM "tradesCompany"
WHERE name IS NULL OR name = '' OR slug IS NULL OR slug = '';

-- 8.3 Claims without required fields
\echo ''
\echo '⚠️  8.3 Claims without required fields:'
SELECT id, "claimNumber", "orgId", "propertyId", "damageType"
FROM "claims"
WHERE "claimNumber" IS NULL 
   OR "orgId" IS NULL 
   OR "propertyId" IS NULL 
   OR "damageType" IS NULL;


-- ============================================================================
-- SUMMARY
-- ============================================================================

\echo ''
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
\echo '📋 SUMMARY — Record Counts'
\echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'

\echo ''
SELECT 
  'tradesCompany' as table_name, COUNT(*) as row_count FROM "tradesCompany"
UNION ALL SELECT 
  'tradesCompanyMember', COUNT(*) FROM "tradesCompanyMember"
UNION ALL SELECT 
  'tradesConnection', COUNT(*) FROM "tradesConnection"
UNION ALL SELECT 
  'ClientProConnection', COUNT(*) FROM "ClientProConnection"
UNION ALL SELECT 
  'ClientSavedPro', COUNT(*) FROM "ClientSavedPro"
UNION ALL SELECT 
  'Client', COUNT(*) FROM "Client"
UNION ALL SELECT 
  'claims', COUNT(*) FROM "claims"
UNION ALL SELECT 
  'client_access', COUNT(*) FROM "client_access"
UNION ALL SELECT 
  'MessageThread', COUNT(*) FROM "MessageThread"
UNION ALL SELECT 
  'Message', COUNT(*) FROM "Message"
ORDER BY table_name;

\echo ''
\echo '============================================================================'
\echo '✅ DATABASE INTEGRITY AUDIT — Complete'
\echo '============================================================================'
\echo ''
\echo 'Review any rows returned above. Each query should return 0 rows.'
\echo 'Queries marked 🚨 are CRITICAL violations that must be fixed.'
\echo 'Queries marked ⚠️ are WARNINGS that should be reviewed.'
\echo '============================================================================'
