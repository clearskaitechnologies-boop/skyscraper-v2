-- Update Damien's profile to ClearSkai Technologies - Smart Home & Technology
-- "Moving Blue Collar into the Future"

SET search_path TO app;

UPDATE "tradesCompanyMember"
SET 
  "tradeType" = 'Smart Home & Technology',
  "companyName" = 'ClearSkai Technologies, LLC',
  "jobTitle" = 'Founder & Lead Technologist',
  bio = 'ClearSkai Technologies is pioneering the future of home automation and smart living in Arizona. We help homeowners and businesses embrace cutting-edge technology with white-glove installation and ongoing support. From smart lighting to complete home automation, we make the future accessible today.',
  "aboutCompany" = 'Founded with a vision to democratize smart home technology, ClearSkai Technologies, LLC brings enterprise-grade automation to everyday homes. We believe that technology should simplify life, not complicate it. Our team of certified technicians specializes in creating seamless, intuitive smart home experiences that enhance comfort, security, and energy efficiency.',
  tagline = 'Moving Blue Collar into the Future - Technology for the Modern Everyday Tradesman',
  "officePhone" = '(480) 995-5820',
  "mobilePhone" = '(480) 555-TECH',
  "hoursOfOperation" = '{"monday": {"open": "7:00 AM", "close": "6:00 PM"}, "tuesday": {"open": "7:00 AM", "close": "6:00 PM"}, "wednesday": {"open": "7:00 AM", "close": "6:00 PM"}, "thursday": {"open": "7:00 AM", "close": "6:00 PM"}, "friday": {"open": "7:00 AM", "close": "6:00 PM"}, "saturday": {"open": "8:00 AM", "close": "2:00 PM"}, "sunday": {"closed": true}}'::jsonb,
  "rocNumber" = 'ROC-345678',
  "rocExpiration" = '2027-12-31',
  "insuranceProvider" = 'State Farm',
  "insuranceExpiration" = '2027-06-30',
  "bondAmount" = 100000,
  "socialLinks" = '{"facebook": "https://facebook.com/clearskaitech", "instagram": "https://instagram.com/clearskaitech", "linkedin": "https://linkedin.com/company/clearskai-technologies", "youtube": "https://youtube.com/@clearskaitech"}'::jsonb,
  "paymentMethods" = ARRAY['Credit Card', 'Debit Card', 'ACH/Bank Transfer', 'Financing Available', 'Check'],
  languages = ARRAY['English', 'Spanish'],
  "emergencyAvailable" = true,
  "freeEstimates" = true,
  "warrantyInfo" = 'All installations include a 2-year labor warranty and lifetime tech support. Smart devices carry manufacturer warranties (typically 1-3 years). We offer extended service plans for complete peace of mind.',
  "foundedYear" = 2023,
  "teamSize" = 8,
  specialties = ARRAY['Smart Home Installation', 'Home Automation', 'Security Systems', 'Network Infrastructure', 'EV Charging', 'Solar Integration']::text[],
  "serviceArea" = 'Phoenix Metro, Prescott, Flagstaff, Northern Arizona'
WHERE "firstName" = 'Damien' AND "lastName" = 'Willingham';

-- Add some sample reviews for ClearSkai
-- Ensure demo clients exist first (trade_reviews requires clientId FK)
INSERT INTO "Client" (id, name, email, "createdAt", "updatedAt")
VALUES
  ('demo-review-sarah', 'Sarah M.', 'sarah.review@example.com', NOW(), NOW()),
  ('demo-review-mike', 'Mike T.', 'mike.review@example.com', NOW(), NOW()),
  ('demo-review-jennifer', 'Jennifer K.', 'jennifer.review@example.com', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "trade_reviews" (id, "contractorId", "clientId", rating, title, comment, "createdAt", "updatedAt", verified)
SELECT 
  gen_random_uuid(),
  id,
  'demo-review-sarah',
  5,
  'Absolutely transformed our home!',
  'ClearSkai Technologies turned our 90s home into a smart home paradise. They installed smart lighting throughout, integrated our thermostats, and set up the most intuitive security system. Damien and his team were professional, clean, and patient in teaching us how to use everything. Highly recommend!',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days',
  true
FROM "tradesCompanyMember" WHERE "firstName" = 'Damien' AND "lastName" = 'Willingham'
ON CONFLICT DO NOTHING;

INSERT INTO "trade_reviews" (id, "contractorId", "clientId", rating, title, comment, "createdAt", "updatedAt", verified)
SELECT 
  gen_random_uuid(),
  id,
  'demo-review-mike',
  5,
  'Future-proofed our new construction',
  'We hired ClearSkai during our new home build to wire everything for smart home from the start. Best decision ever. The pre-wire work they did means we can add any smart device seamlessly. Their knowledge of both the tech side AND the construction side is rare. True professionals.',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '45 days',
  true
FROM "tradesCompanyMember" WHERE "firstName" = 'Damien' AND "lastName" = 'Willingham'
ON CONFLICT DO NOTHING;

INSERT INTO "trade_reviews" (id, "contractorId", "clientId", rating, title, comment, "createdAt", "updatedAt", verified)
SELECT 
  gen_random_uuid(),
  id,
  'demo-review-jennifer',
  5,
  'EV Charger + Solar Integration Done Right',
  'Had ClearSkai install our Tesla charger and integrate it with our existing solar system. They handled the permit, the install, and the utility coordination. The app they set up shows exactly how much solar energy goes to charging vs the house. Amazing work!',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days',
  true
FROM "tradesCompanyMember" WHERE "firstName" = 'Damien' AND "lastName" = 'Willingham'
ON CONFLICT DO NOTHING;

SELECT 
  "companyName", 
  "tradeType", 
  tagline, 
  "officePhone",
  "emergencyAvailable",
  "freeEstimates"
FROM "tradesCompanyMember" 
WHERE "firstName" = 'Damien';
