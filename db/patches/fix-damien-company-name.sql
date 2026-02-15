-- ============================================================
-- Fix Damien's Company Name → ClearSkai Technologies LLC
-- Also enrich profile with known details
-- Run: psql "$DATABASE_URL" -f ./db/patches/fix-damien-company-name.sql
-- ============================================================

BEGIN;

-- Step 1: Show current state
SELECT id, "userId", "firstName", "lastName", email, "companyName", "tradeType", status
FROM "TradesCompanyMember"
WHERE email = 'buildwithdamienray@gmail.com'
   OR ("firstName" = 'Damien' AND "lastName" IN ('Willingham', 'Ray'));

-- Step 2: Update company name + enrich profile
UPDATE "TradesCompanyMember"
SET
  "companyName"   = 'ClearSkai Technologies LLC',
  "tradeType"     = COALESCE(NULLIF("tradeType", 'GENERAL_CONTRACTOR'), 'GENERAL_CONTRACTOR'),
  "bio"           = COALESCE("bio", 'Founder of ClearSkai Technologies — building AI-powered tools for insurance restoration, pre-loss documentation, and trades network management.'),
  "phone"         = COALESCE("phone", ''),
  "isOwner"       = true,
  "isAdmin"       = true,
  "isActive"      = true,
  status          = 'active',
  "onboardingStep" = 'complete',
  "updatedAt"     = NOW()
WHERE email = 'buildwithdamienray@gmail.com'
   OR ("firstName" = 'Damien' AND "lastName" = 'Willingham');

-- Step 3: Verify
SELECT id, "userId", "firstName", "lastName", email, "companyName", "tradeType", status, "onboardingStep"
FROM "TradesCompanyMember"
WHERE email = 'buildwithdamienray@gmail.com'
   OR ("firstName" = 'Damien' AND "lastName" = 'Willingham');

COMMIT;
