-- ============================================================================
-- CRITICAL FIX: Change tradesCompanyMember → tradesCompany from CASCADE to SET NULL
-- Date: 2026-02-11
-- 
-- ROOT CAUSE OF DISAPPEARING PROFILES:
-- The old FK constraint says ON DELETE CASCADE — when a tradesCompany is deleted
-- (ghost cleanup, admin action, migration), ALL its members are silently deleted.
-- This is what wiped Damien Willingham's profile 3+ times.
--
-- FIX: Change to ON DELETE SET NULL — deleting a company just unlinks members
-- (sets companyId = NULL) instead of destroying their entire profile.
-- ============================================================================

BEGIN;

-- 1) Drop the old CASCADE foreign key
ALTER TABLE "tradesCompanyMember"
  DROP CONSTRAINT IF EXISTS "tradesCompanyMember_companyId_fkey";

-- 2) Re-add with SET NULL instead of CASCADE
ALTER TABLE "tradesCompanyMember"
  ADD CONSTRAINT "tradesCompanyMember_companyId_fkey"
  FOREIGN KEY ("companyId")
  REFERENCES "tradesCompany"("id")
  ON DELETE SET NULL
  ON UPDATE NO ACTION;

RAISE NOTICE '✅ Changed tradesCompanyMember.companyId FK from CASCADE to SET NULL';

-- 3) Also fix the trade_reviews FK if it cascades through member
-- (reviews should survive even if the member is deleted)
ALTER TABLE "trade_reviews"
  DROP CONSTRAINT IF EXISTS "trade_reviews_contractorId_fkey";

ALTER TABLE "trade_reviews"
  ADD CONSTRAINT "trade_reviews_contractorId_fkey"
  FOREIGN KEY ("contractorId")
  REFERENCES "tradesCompanyMember"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- 4) Now restore Damien Willingham's profile if it's missing
-- First check if ClearSkai Technologies company exists
DO $$
DECLARE
  v_company_id UUID;
  v_member_id UUID;
  v_existing_member RECORD;
BEGIN
  -- Find ClearSkai Technologies
  SELECT id INTO v_company_id
    FROM "tradesCompany"
   WHERE name ILIKE '%ClearSkai Technologies%'
      OR slug = 'clearskai-technologies'
   ORDER BY "createdAt" ASC
   LIMIT 1;

  IF v_company_id IS NULL THEN
    -- Create it fresh
    INSERT INTO "tradesCompany" (
      name, slug, description, specialties, phone, email, city, state, zip,
      "isActive", "isVerified"
    ) VALUES (
      'ClearSkai Technologies, LLC',
      'clearskai-technologies',
      'Pioneering the future of home automation and smart living in Arizona.',
      ARRAY['Smart Home Installation', 'Home Automation', 'Security Systems', 'Network Infrastructure', 'EV Charging', 'Solar Integration'],
      '(480) 995-5820',
      'damien@clearskai.com',
      'Phoenix', 'AZ', '85001',
      true, false
    )
    RETURNING id INTO v_company_id;
    RAISE NOTICE '✅ Created ClearSkai Technologies company: %', v_company_id;
  ELSE
    RAISE NOTICE '✅ Found ClearSkai Technologies company: %', v_company_id;
  END IF;

  -- Find Damien's member record (by email or name)
  SELECT * INTO v_existing_member
    FROM "tradesCompanyMember"
   WHERE email ILIKE '%buildwithdamienray%'
      OR email ILIKE '%damien@clearskai%'
      OR email ILIKE '%clearskai%'
      OR ("firstName" ILIKE 'Damien' AND "lastName" ILIKE 'Willingham')
   ORDER BY "updatedAt" DESC
   LIMIT 1;

  IF v_existing_member IS NOT NULL THEN
    -- Fix existing member: ensure correct name + link to company
    UPDATE "tradesCompanyMember"
       SET "companyId"    = v_company_id,
           "companyName"  = 'ClearSkai Technologies, LLC',
           "firstName"    = 'Damien',
           "lastName"     = 'Willingham',
           "isActive"     = true,
           "status"       = 'active',
           "isOwner"      = true,
           "isAdmin"      = true,
           role           = 'owner',
           "onboardingStep" = 'complete',
           "updatedAt"    = NOW()
     WHERE id = v_existing_member.id;

    RAISE NOTICE '✅ Healed existing member % → linked to ClearSkai Technologies', v_existing_member.id;
  ELSE
    RAISE NOTICE '⚠️  No existing member found for Damien — self-healing on next page load will create one';
  END IF;

  -- Clean up ghost companies (but now SET NULL means this won't delete members!)
  DELETE FROM "tradesCompany"
   WHERE (name ILIKE '%''s Company' OR name ILIKE 'Damien%Company%')
     AND id != v_company_id;

  RAISE NOTICE '✅ Cleaned up ghost companies (members preserved thanks to SET NULL)';
END $$;

COMMIT;
