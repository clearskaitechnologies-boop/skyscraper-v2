-- ============================================================
-- RESTORE: Damien Willingham — ClearSkai Technologies Profile
-- ============================================================
-- This script safely restores Damien's trades profile.
-- Uses UPSERT (ON CONFLICT userId DO UPDATE) so it's safe to re-run.
-- All data is preserved if the profile already exists.
--
-- IMPORTANT: Replace 'CLERK_USER_ID_HERE' with the actual Clerk userId
-- from the Clerk dashboard before running.
-- ============================================================

SET search_path TO app;

-- Step 1: Ensure the tradesCompanyMember profile exists
-- If it was deleted, re-create it. If it exists, update ONLY if fields are NULL.
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
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  current_setting('app.restore_user_id', true),  -- Set via: SET app.restore_user_id = 'user_xxx';
  current_setting('app.restore_org_id', true),    -- Set via: SET app.restore_org_id = 'org_xxx';
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
  '(480) 555-TECH',
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
  NOW(),
  NOW()
)
ON CONFLICT ("userId") DO UPDATE SET
  "firstName" = COALESCE(NULLIF("tradesCompanyMember"."firstName", ''), EXCLUDED."firstName"),
  "lastName" = COALESCE(NULLIF("tradesCompanyMember"."lastName", ''), EXCLUDED."lastName"),
  "tradeType" = COALESCE(NULLIF("tradesCompanyMember"."tradeType", ''), EXCLUDED."tradeType"),
  "companyName" = COALESCE(NULLIF("tradesCompanyMember"."companyName", ''), EXCLUDED."companyName"),
  "jobTitle" = COALESCE(NULLIF("tradesCompanyMember"."jobTitle", ''), EXCLUDED."jobTitle"),
  bio = COALESCE("tradesCompanyMember".bio, EXCLUDED.bio),
  "aboutCompany" = COALESCE("tradesCompanyMember"."aboutCompany", EXCLUDED."aboutCompany"),
  tagline = COALESCE("tradesCompanyMember".tagline, EXCLUDED.tagline),
  "officePhone" = COALESCE(NULLIF("tradesCompanyMember"."officePhone", ''), EXCLUDED."officePhone"),
  "emergencyAvailable" = COALESCE("tradesCompanyMember"."emergencyAvailable", EXCLUDED."emergencyAvailable"),
  "freeEstimates" = COALESCE("tradesCompanyMember"."freeEstimates", EXCLUDED."freeEstimates"),
  status = 'active',
  "isActive" = true,
  "updatedAt" = NOW();

-- Step 2: Verify the restore
SELECT 
  id,
  "userId",
  "firstName",
  "lastName",
  "companyName",
  "tradeType",
  tagline,
  status,
  "isActive",
  "companyId"
FROM "tradesCompanyMember"
WHERE "firstName" = 'Damien' AND "lastName" = 'Willingham';
