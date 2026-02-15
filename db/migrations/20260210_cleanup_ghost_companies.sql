-- ============================================================================
-- Migration: Cleanup Ghost Company Records
-- Date: 2026-02-10
-- Purpose: Remove auto-created "Damien's Company" ghost and ensure 
--          Damien Willingham's member record links to ClearSkai Technologies
-- ============================================================================

BEGIN;

-- 1) Find and log ghost companies (companies like "X's Company" auto-created by self-healing)
DO $$
DECLARE
  ghost RECORD;
  clearskai_id UUID;
  damien_member_id UUID;
BEGIN
  -- Find the real ClearSkai Technologies company
  SELECT id INTO clearskai_id
    FROM "tradesCompany"
   WHERE slug = 'clearskai-technologies'
      OR name ILIKE 'ClearSkai Technologies%'
   ORDER BY "createdAt" ASC
   LIMIT 1;

  IF clearskai_id IS NULL THEN
    RAISE NOTICE '⚠️  ClearSkai Technologies company not found — skipping migration';
    RETURN;
  END IF;

  RAISE NOTICE '✅ ClearSkai Technologies company ID: %', clearskai_id;

  -- 2) Find Damien's member record (the owner/admin)
  SELECT id INTO damien_member_id
    FROM "tradesCompanyMember"
   WHERE ("firstName" ILIKE 'Damien' AND "lastName" ILIKE 'Willingham')
      OR ("companyName" ILIKE 'ClearSkai%')
      OR ("companyName" ILIKE 'Damien%Company%')
   ORDER BY "isOwner" DESC, "isAdmin" DESC, "createdAt" ASC
   LIMIT 1;

  IF damien_member_id IS NOT NULL THEN
    -- Link member to the real company + fix companyName
    UPDATE "tradesCompanyMember"
       SET "companyId" = clearskai_id,
           "companyName" = 'ClearSkai Technologies',
           "isActive" = true,
           "status" = 'active'
     WHERE id = damien_member_id;

    RAISE NOTICE '✅ Linked member % to ClearSkai Technologies', damien_member_id;
  ELSE
    RAISE NOTICE '⚠️  No Damien Willingham member record found';
  END IF;

  -- 3) Re-link any other members pointing at ghost companies to ClearSkai
  UPDATE "tradesCompanyMember"
     SET "companyId" = clearskai_id,
         "companyName" = 'ClearSkai Technologies'
   WHERE "companyName" ILIKE 'Damien%Company%'
     AND "companyId" != clearskai_id;

  -- 4) Delete orphaned ghost companies
  FOR ghost IN
    SELECT c.id, c.name, c.slug
      FROM "tradesCompany" c
     WHERE (c.name ILIKE '%''s Company' OR c.name ILIKE 'Damien%Company%')
       AND c.id != clearskai_id
       AND NOT EXISTS (
         SELECT 1 FROM "tradesCompanyMember" m
          WHERE m."companyId" = c.id
       )
  LOOP
    RAISE NOTICE '🗑️  Deleting ghost company: % (id=%)', ghost.name, ghost.id;

    -- Clean up any connections to ghost companies first
    DELETE FROM "clientProConnection" WHERE "contractorId" = ghost.id;
    DELETE FROM "tradesCompany" WHERE id = ghost.id;
  END LOOP;

  -- 5) Also clean up any ghost companies that still have members (re-link first)
  FOR ghost IN
    SELECT c.id, c.name, c.slug
      FROM "tradesCompany" c
     WHERE (c.name ILIKE '%''s Company' OR c.name ILIKE 'Damien%Company%')
       AND c.id != clearskai_id
  LOOP
    -- Re-link members from ghost to ClearSkai
    UPDATE "tradesCompanyMember"
       SET "companyId" = clearskai_id,
           "companyName" = 'ClearSkai Technologies'
     WHERE "companyId" = ghost.id;

    -- Re-link connections from ghost to ClearSkai
    UPDATE "clientProConnection"
       SET "contractorId" = clearskai_id
     WHERE "contractorId" = ghost.id;

    RAISE NOTICE '🗑️  Deleting ghost company (with re-linked members): % (id=%)', ghost.name, ghost.id;
    DELETE FROM "tradesCompany" WHERE id = ghost.id;
  END LOOP;

  RAISE NOTICE '✅ Ghost company cleanup complete';
END $$;

COMMIT;
