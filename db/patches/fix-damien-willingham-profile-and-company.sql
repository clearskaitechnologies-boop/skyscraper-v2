-- ============================================================
-- FIX: Damien Willingham Profile & Company — Complete Cleanup
-- ============================================================
-- 
-- PROBLEM:
-- 1. Profile keeps vanishing because userId doesn't match Clerk
-- 2. "Damien Ray" ghost profile created by auto-create from Clerk's name
-- 3. Company page needs single admin (Damien Willingham)
-- 4. Duplicate member records confuse the system
--
-- THIS SCRIPT:
-- Step 1: Find ALL tradesCompanyMember records for Damien
-- Step 2: Remove ghost/duplicate profiles (Damien Ray, etc.)
-- Step 3: Ensure Damien Willingham profile exists with correct userId
-- Step 4: Create/fix the ClearSkai Technologies company
-- Step 5: Link profile to company as sole owner
-- Step 6: Clean up any orphaned companies
--
-- USAGE:
--   First, find your Clerk userId and orgId from the Clerk dashboard.
--   Then run:
--     SET app.clerk_user_id = 'user_XXXXXXXXXXXXX';
--     SET app.clerk_org_id = 'org_XXXXXXXXXXXXX';
--     \i db/patches/fix-damien-willingham-profile-and-company.sql
-- ============================================================

-- ============================================
-- STEP 0: DIAGNOSTIC — Show current state
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNOSTIC: Current Damien profiles';
  RAISE NOTICE '========================================';
END $$;

SELECT id, "userId", "firstName", "lastName", email, "companyName", "companyId", role, "isOwner", status, "isActive"
FROM "tradesCompanyMember"
WHERE "firstName" ILIKE '%damien%' 
   OR "lastName" ILIKE '%willingham%'
   OR "lastName" ILIKE '%ray%'
   OR email ILIKE '%damien%'
   OR email ILIKE '%clearskai%'
   OR email ILIKE '%buildwithdamienray%'
ORDER BY "createdAt" DESC;

-- Show any companies linked to Damien
SELECT tc.id, tc.name, tc.description, 
       (SELECT COUNT(*) FROM "tradesCompanyMember" WHERE "companyId" = tc.id) AS member_count
FROM "tradesCompany" tc
WHERE tc.name ILIKE '%clearskai%' 
   OR tc.name ILIKE '%damien%'
   OR tc.name ILIKE '%ray%'
   OR tc.id IN (
     SELECT "companyId" FROM "tradesCompanyMember" 
     WHERE "firstName" ILIKE '%damien%' AND "companyId" IS NOT NULL
   );

-- ============================================
-- STEP 1: DELETE ghost "Damien Ray" profiles
-- (Any profile with lastName='Ray' that's not the real one)
-- ============================================
DELETE FROM "tradesCompanyMember"
WHERE "lastName" = 'Ray' 
  AND "firstName" = 'Damien'
  AND id NOT IN (
    -- Keep the one with the most data (if any)
    SELECT id FROM "tradesCompanyMember" 
    WHERE "firstName" = 'Damien' AND "lastName" = 'Willingham'
    LIMIT 1
  );

-- Also delete any pending_* placeholder profiles for Damien
DELETE FROM "tradesCompanyMember"
WHERE "userId" LIKE 'pending_%'
  AND (email ILIKE '%damien%' OR email ILIKE '%clearskai%' OR email ILIKE '%buildwithdamienray%');

-- ============================================
-- STEP 2: DELETE orphaned companies named "Damien Ray" or similar
-- (Auto-created ghost companies with no real members)
-- ============================================
DELETE FROM "tradesCompany"
WHERE (name ILIKE '%damien ray%' OR name ILIKE '%damien r%')
  AND name NOT ILIKE '%clearskai%'
  AND id NOT IN (
    SELECT DISTINCT "companyId" FROM "tradesCompanyMember" 
    WHERE "companyId" IS NOT NULL 
      AND "firstName" = 'Damien' AND "lastName" = 'Willingham'
  );

-- ============================================
-- STEP 3: UPSERT Damien Willingham profile
-- Uses the Clerk userId from session variable
-- ============================================
INSERT INTO "tradesCompanyMember" (
  id,
  "userId",
  "orgId",
  "firstName",
  "lastName",
  email,
  phone,
  "tradeType",
  "companyName",
  "jobTitle",
  bio,
  "aboutCompany",
  tagline,
  "officePhone",
  "mobilePhone",
  "hoursOfOperation",
  "rocNumber",
  "rocExpiration",
  "insuranceProvider",
  "insuranceExpiration",
  "bondAmount",
  "socialLinks",
  "paymentMethods",
  languages,
  "emergencyAvailable",
  "freeEstimates",
  "warrantyInfo",
  "foundedYear",
  "teamSize",
  specialties,
  "serviceArea",
  city,
  state,
  zip,
  status,
  "isActive",
  role,
  "isOwner",
  "isAdmin",
  "onboardingStep",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  current_setting('app.clerk_user_id', true),
  current_setting('app.clerk_org_id', true),
  'Damien',
  'Willingham',
  'damien@clearskai.com',
  '(480) 995-5820',
  'Smart Home & Technology',
  'ClearSkai Technologies, LLC',
  'Founder & Lead Technologist',
  'ClearSkai Technologies is pioneering the future of home automation and smart living in Arizona. We help homeowners and businesses embrace cutting-edge technology with white-glove installation and ongoing support. From smart lighting to complete home automation, we make the future accessible today.',
  'Founded with a vision to democratize smart home technology, ClearSkai Technologies, LLC brings enterprise-grade automation to everyday homes. We believe that technology should simplify life, not complicate it. Our team of certified technicians specializes in creating seamless, intuitive smart home experiences that enhance comfort, security, and energy efficiency.',
  'Moving Blue Collar into the Future - Technology for the Modern Everyday Tradesman',
  '(480) 995-5820',
  NULL,
  '{"monday": {"open": "7:00 AM", "close": "6:00 PM"}, "tuesday": {"open": "7:00 AM", "close": "6:00 PM"}, "wednesday": {"open": "7:00 AM", "close": "6:00 PM"}, "thursday": {"open": "7:00 AM", "close": "6:00 PM"}, "friday": {"open": "7:00 AM", "close": "6:00 PM"}, "saturday": {"open": "8:00 AM", "close": "2:00 PM"}, "sunday": {"closed": true}}'::jsonb,
  'ROC-345678',
  '2027-12-31',
  'State Farm',
  '2027-06-30',
  100000,
  '{"facebook": "https://facebook.com/clearskaitech", "instagram": "https://instagram.com/clearskaitech", "linkedin": "https://linkedin.com/company/clearskai-technologies", "youtube": "https://youtube.com/@clearskaitech"}'::jsonb,
  ARRAY['Credit Card', 'Debit Card', 'ACH/Bank Transfer', 'Financing Available', 'Check'],
  ARRAY['English', 'Spanish'],
  true,
  true,
  'All installations include a 2-year labor warranty and lifetime tech support. Smart devices carry manufacturer warranties (typically 1-3 years). We offer extended service plans for complete peace of mind.',
  2023,
  8,
  ARRAY['Smart Home Installation', 'Home Automation', 'Security Systems', 'Network Infrastructure', 'EV Charging', 'Solar Integration']::text[],
  'Phoenix Metro, Prescott, Flagstaff, Northern Arizona',
  'Phoenix',
  'AZ',
  '85001',
  'active',
  true,
  'owner',
  true,
  true,
  'complete',
  NOW(),
  NOW()
)
ON CONFLICT ("userId") DO UPDATE SET
  "firstName" = 'Damien',
  "lastName" = 'Willingham',
  email = COALESCE(NULLIF("tradesCompanyMember".email, ''), 'damien@clearskai.com'),
  "tradeType" = COALESCE(NULLIF("tradesCompanyMember"."tradeType", ''), 'Smart Home & Technology'),
  "companyName" = COALESCE(NULLIF("tradesCompanyMember"."companyName", ''), 'ClearSkai Technologies, LLC'),
  "jobTitle" = COALESCE(NULLIF("tradesCompanyMember"."jobTitle", ''), 'Founder & Lead Technologist'),
  bio = COALESCE("tradesCompanyMember".bio, EXCLUDED.bio),
  "aboutCompany" = COALESCE("tradesCompanyMember"."aboutCompany", EXCLUDED."aboutCompany"),
  tagline = COALESCE("tradesCompanyMember".tagline, EXCLUDED.tagline),
  role = 'owner',
  "isOwner" = true,
  "isAdmin" = true,
  status = 'active',
  "isActive" = true,
  "onboardingStep" = 'complete',
  "updatedAt" = NOW();

-- ============================================
-- STEP 4: Ensure ClearSkai Technologies company exists
-- ============================================
INSERT INTO "tradesCompany" (
  id, name, description, specialties, phone, email, city, state, zip
) VALUES (
  gen_random_uuid(),
  'ClearSkai Technologies, LLC',
  'Pioneering the future of home automation and smart living in Arizona.',
  ARRAY['Smart Home Installation', 'Home Automation', 'Security Systems', 'Network Infrastructure']::text[],
  '(480) 995-5820',
  'damien@clearskai.com',
  'Phoenix',
  'AZ',
  '85001'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 5: Link Damien to ClearSkai Technologies company
-- (Find the company, then update the member)
-- ============================================
DO $$
DECLARE
  v_member_id UUID;
  v_company_id UUID;
  v_user_id TEXT;
BEGIN
  v_user_id := current_setting('app.clerk_user_id', true);
  
  -- Find the member
  SELECT id INTO v_member_id
  FROM "tradesCompanyMember"
  WHERE "userId" = v_user_id;
  
  IF v_member_id IS NULL THEN
    RAISE NOTICE 'ERROR: No member found for userId %', v_user_id;
    RETURN;
  END IF;
  
  -- Find or get the company
  SELECT id INTO v_company_id
  FROM "tradesCompany"
  WHERE name ILIKE '%clearskai%'
  ORDER BY "createdAt" ASC
  LIMIT 1;
  
  IF v_company_id IS NULL THEN
    -- Create the company
    INSERT INTO "tradesCompany" (name, description)
    VALUES ('ClearSkai Technologies, LLC', 'Smart Home & Technology')
    RETURNING id INTO v_company_id;
    
    RAISE NOTICE 'Created new company: %', v_company_id;
  END IF;
  
  -- Link member to company
  UPDATE "tradesCompanyMember"
  SET "companyId" = v_company_id,
      role = 'owner',
      "isOwner" = true,
      "isAdmin" = true,
      status = 'active',
      "isActive" = true,
      "updatedAt" = NOW()
  WHERE id = v_member_id;
  
  RAISE NOTICE 'Linked member % to company %', v_member_id, v_company_id;
  
  -- Remove any other owners on this company (Damien is sole admin)
  UPDATE "tradesCompanyMember"
  SET "isOwner" = false,
      role = CASE WHEN "isAdmin" THEN 'admin' ELSE role END
  WHERE "companyId" = v_company_id
    AND id != v_member_id
    AND "isOwner" = true;
    
  RAISE NOTICE 'Cleaned up other owners on company %', v_company_id;
  
  -- Remove any non-Damien members who are ghosts (pending_ users on this company)
  DELETE FROM "tradesCompanyMember"
  WHERE "companyId" = v_company_id
    AND "userId" LIKE 'pending_%'
    AND status = 'pending';
    
  RAISE NOTICE 'Cleaned up ghost pending members on company %', v_company_id;
  
END $$;

-- ============================================
-- STEP 6: VERIFY — Final state
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION: Final state';
  RAISE NOTICE '========================================';
END $$;

SELECT 
  m.id AS member_id,
  m."userId",
  m."firstName",
  m."lastName",
  m.email,
  m."companyName",
  m."companyId",
  m.role,
  m."isOwner",
  m."isAdmin",
  m.status,
  m."isActive",
  m."onboardingStep",
  c.name AS company_name,
  c.id AS company_id
FROM "tradesCompanyMember" m
LEFT JOIN "tradesCompany" c ON m."companyId" = c.id
WHERE m."firstName" = 'Damien'
ORDER BY m."isOwner" DESC, m."createdAt" DESC;
