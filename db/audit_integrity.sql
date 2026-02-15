-- ============================================================
-- DATA INTEGRITY AUDIT
-- Run: psql "$DATABASE_URL" -f ./db/audit_integrity.sql
--
-- Checks for:
--   1. Orphan data (records under orgs with no user membership)
--   2. Duplicate org spam (users with multiple orgs)
--   3. Ghost orgs (orgs with no members)
--   4. Cross-org data summary
--   5. Null orgId violations
-- ============================================================

\echo ''
\echo '============================================'
\echo '  DATA INTEGRITY AUDIT'
\echo '============================================'
\echo ''

-- ── 1. ORG OWNERSHIP SUMMARY ────────────────────────────────────────────
\echo '── 1. ORG OWNERSHIP: Who owns what ──'

SELECT
  o.id AS org_id,
  LEFT(o.name, 30) AS org_name,
  LEFT(o."clerkOrgId", 40) AS clerk_org_id,
  COUNT(DISTINCT uo."userId") AS members,
  o."createdAt"::date AS created
FROM app."Org" o
LEFT JOIN app.user_organizations uo ON uo."organizationId" = o.id
GROUP BY o.id, o.name, o."clerkOrgId", o."createdAt"
ORDER BY o."createdAt";

-- ── 2. USERS WITH MULTIPLE ORGS (org spam indicator) ────────────────────
\echo ''
\echo '── 2. USERS WITH MULTIPLE ORGS (should be 1 each) ──'

SELECT
  uo."userId",
  COUNT(DISTINCT uo."organizationId") AS org_count,
  ARRAY_AGG(DISTINCT uo."organizationId") AS org_ids
FROM app.user_organizations uo
GROUP BY uo."userId"
HAVING COUNT(DISTINCT uo."organizationId") > 1;

-- ── 3. GHOST ORGS (exist but no members) ────────────────────────────────
\echo ''
\echo '── 3. GHOST ORGS (no members — potential orphans) ──'

SELECT o.id, LEFT(o.name, 30) AS name, o."createdAt"::date
FROM app."Org" o
LEFT JOIN app.user_organizations uo ON uo."organizationId" = o.id
WHERE uo.id IS NULL
ORDER BY o."createdAt";

-- ── 4. ORPHAN DATA (records under orgs with no members) ─────────────────
\echo ''
\echo '── 4. ORPHAN DATA (records under ghost orgs) ──'

SELECT 'contacts' AS tbl, c."orgId", COUNT(*) AS cnt
FROM app.contacts c
LEFT JOIN app.user_organizations uo ON uo."organizationId" = c."orgId"
WHERE uo.id IS NULL
GROUP BY c."orgId"

UNION ALL

SELECT 'properties', p."orgId", COUNT(*)
FROM app.properties p
LEFT JOIN app.user_organizations uo ON uo."organizationId" = p."orgId"
WHERE uo.id IS NULL
GROUP BY p."orgId"

UNION ALL

SELECT 'leads', l."orgId", COUNT(*)
FROM app.leads l
LEFT JOIN app.user_organizations uo ON uo."organizationId" = l."orgId"
WHERE uo.id IS NULL
GROUP BY l."orgId"

UNION ALL

SELECT 'jobs', j."orgId", COUNT(*)
FROM app.jobs j
LEFT JOIN app.user_organizations uo ON uo."organizationId" = j."orgId"
WHERE uo.id IS NULL
GROUP BY j."orgId"

UNION ALL

SELECT 'claims', cl."orgId", COUNT(*)
FROM app.claims cl
LEFT JOIN app.user_organizations uo ON uo."organizationId" = cl."orgId"
WHERE uo.id IS NULL
GROUP BY cl."orgId"

ORDER BY tbl;

-- ── 5. CROSS-ORG DATA DISTRIBUTION ─────────────────────────────────────
\echo ''
\echo '── 5. DATA PER ORG (should match user expectations) ──'

SELECT
  'contacts' AS tbl, "orgId", COUNT(*) AS cnt FROM app.contacts GROUP BY "orgId"
UNION ALL
SELECT 'properties', "orgId", COUNT(*) FROM app.properties GROUP BY "orgId"
UNION ALL
SELECT 'leads', "orgId", COUNT(*) FROM app.leads GROUP BY "orgId"
UNION ALL
SELECT 'jobs', "orgId", COUNT(*) FROM app.jobs GROUP BY "orgId"
UNION ALL
SELECT 'claims', "orgId", COUNT(*) FROM app.claims GROUP BY "orgId"
ORDER BY tbl, "orgId";

-- ── 6. NULL orgId VIOLATIONS ────────────────────────────────────────────
\echo ''
\echo '── 6. NULL orgId VIOLATIONS (should be 0 for all) ──'

SELECT 'contacts' AS tbl, COUNT(*) AS null_orgid FROM app.contacts WHERE "orgId" IS NULL
UNION ALL
SELECT 'properties', COUNT(*) FROM app.properties WHERE "orgId" IS NULL
UNION ALL
SELECT 'leads', COUNT(*) FROM app.leads WHERE "orgId" IS NULL
UNION ALL
SELECT 'jobs', COUNT(*) FROM app.jobs WHERE "orgId" IS NULL
UNION ALL
SELECT 'claims', COUNT(*) FROM app.claims WHERE "orgId" IS NULL;

\echo ''
\echo '✅ Audit complete. Review results above.'
\echo ''
