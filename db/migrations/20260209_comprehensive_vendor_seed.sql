-- ============================================================
-- COMPREHENSIVE VENDOR SEED DATA
-- Populates ALL vendors with complete data:
-- - Hours of operation
-- - Logo paths (placeholder fallback built into UI)
-- - Email addresses
-- - Contacts per location
-- - Lat/Lng coordinates for map pins
-- - Founded years
-- - Trade types, vendor types, certifications
-- ============================================================

-- ============================================================
-- STEP 1: UPDATE VENDOR MASTER DATA
-- ============================================================

-- GAF
UPDATE "Vendor" SET 
  logo = '/vendors/gaf-logo.png',
  "foundedYear" = 1886,
  description = 'GAF is North America''s largest roofing manufacturer, offering a comprehensive portfolio of roofing products including shingles, commercial roofing systems, and ventilation products. As a certified Master Elite contractor network, GAF provides industry-leading warranties and training programs.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Master Elite Certified', 'Green Building Council Member', 'ISO 9001'],
  rating = 4.8,
  "reviewCount" = 156,
  "financingAvail" = true,
  "rebatesAvail" = true
WHERE slug = 'gaf';

-- Owens Corning
UPDATE "Vendor" SET 
  logo = '/vendors/owens-corning-logo.png',
  "foundedYear" = 1938,
  description = 'Owens Corning is a global leader in insulation, roofing, and fiberglass composites. Their Duration® and TruDefinition® shingle lines are among the most popular in the industry, backed by strong warranties and a network of Platinum Preferred Contractors.',
  "tradeTypes" = ARRAY['Roofing', 'Insulation'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Platinum Preferred', 'ENERGY STAR Partner', 'LEED Certified'],
  rating = 4.7,
  "reviewCount" = 142,
  "financingAvail" = true,
  "rebatesAvail" = true
WHERE slug = 'owens-corning';

-- CertainTeed
UPDATE "Vendor" SET 
  logo = '/vendors/certainteed-logo.png',
  "foundedYear" = 1904,
  description = 'CertainTeed, a subsidiary of Saint-Gobain, offers a complete line of roofing, siding, insulation, and building products. Their Landmark® series and Presidential Shake® are premium options for Arizona homeowners seeking durability and aesthetics.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Insulation'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['SELECT ShingleMaster', 'ENERGY STAR Partner'],
  rating = 4.6,
  "reviewCount" = 128,
  "financingAvail" = true,
  "rebatesAvail" = false
WHERE slug = 'certainteed';

-- ABC Supply
UPDATE "Vendor" SET 
  logo = '/vendors/abc-supply-logo.png',
  "foundedYear" = 1982,
  description = 'ABC Supply Co. is America''s largest wholesale distributor of roofing, siding, and exterior building products. With multiple Arizona locations, they provide next-day delivery and expert product knowledge to contractors across the state.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Windows', 'Gutters'],
  "vendorTypes" = ARRAY['Distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Industry Alliance Member'],
  rating = 4.5,
  "reviewCount" = 89,
  "deliveryRadiusMi" = 75,
  "financingAvail" = true,
  "rebatesAvail" = false,
  "emergencyPhone" = '(800) 422-2227'
WHERE slug = 'abc-supply';

-- SRS Distribution  
UPDATE "Vendor" SET 
  logo = '/vendors/srs-logo.png',
  "foundedYear" = 2008,
  description = 'SRS Distribution is one of the fastest-growing building products distributors in the country. They specialize in roofing, siding, and related accessories with a focus on exceptional customer service and reliable delivery.',
  "tradeTypes" = ARRAY['Roofing', 'Siding'],
  "vendorTypes" = ARRAY['Distributor'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Alliance Member'],
  rating = 4.4,
  "reviewCount" = 67,
  "deliveryRadiusMi" = 60,
  "financingAvail" = true,
  "rebatesAvail" = false
WHERE slug = 'srs-distribution';

-- Beacon Building Products
UPDATE "Vendor" SET 
  logo = '/vendors/beacon-logo.png',
  "foundedYear" = 1928,
  description = 'Beacon Building Products is one of the largest distributors of residential and commercial roofing materials and complementary building products in North America. Their Arizona branches serve contractors with comprehensive inventory and delivery services.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Waterproofing'],
  "vendorTypes" = ARRAY['Distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Alliance Member', 'ISO 14001'],
  rating = 4.3,
  "reviewCount" = 74,
  "deliveryRadiusMi" = 80,
  "financingAvail" = true,
  "rebatesAvail" = false,
  "emergencyPhone" = '(877) 232-2666'
WHERE slug = 'beacon-building-products';

-- IKO
UPDATE "Vendor" SET 
  logo = '/vendors/iko-logo.png',
  "foundedYear" = 1951,
  description = 'IKO is a global leader in the roofing, waterproofing, and insulation industry. Their Dynasty® and Cambridge® shingle lines offer excellent protection against Arizona''s intense sun and monsoon storms.',
  "tradeTypes" = ARRAY['Roofing', 'Waterproofing', 'Insulation'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['SHIELD PRO Plus Certified', 'ENERGY STAR Partner'],
  rating = 4.4,
  "reviewCount" = 56,
  "financingAvail" = false,
  "rebatesAvail" = true
WHERE slug = 'iko';

-- TAMKO
UPDATE "Vendor" SET 
  logo = '/vendors/tamko-logo.png',
  "foundedYear" = 1944,
  description = 'TAMKO Building Products LLC is a family-owned company that has been manufacturing quality building products for over 75 years. Their Heritage® and Titan XT® shingles are designed for extreme weather conditions.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona'],
  certifications = ARRAY['Pro Certified Contractor Network'],
  rating = 4.2,
  "reviewCount" = 41,
  "financingAvail" = false,
  "rebatesAvail" = true
WHERE slug = 'tamko';

-- Malarkey Roofing
UPDATE "Vendor" SET 
  logo = '/vendors/malarkey-logo.png',
  "foundedYear" = 1956,
  description = 'Malarkey Roofing Products is known for sustainability and innovation. Their Legacy® and Vista® shingles use rubberized asphalt made from recycled tires, offering superior flexibility and impact resistance.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Emerald Pro Contractor', 'Cradle to Cradle Certified'],
  rating = 4.5,
  "reviewCount" = 38,
  "financingAvail" = false,
  "rebatesAvail" = true
WHERE slug = 'malarkey';

-- Atlas Roofing
UPDATE "Vendor" SET 
  logo = '/vendors/atlas-roofing-logo.png',
  "foundedYear" = 1982,
  description = 'Atlas Roofing Corporation manufactures residential and commercial roofing products, as well as expanded polystyrene insulation. Their Pinnacle® and StormMaster® shingles are engineered for durability.',
  "tradeTypes" = ARRAY['Roofing', 'Insulation'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Pro Plus Contractor'],
  rating = 4.1,
  "reviewCount" = 29,
  "financingAvail" = false,
  "rebatesAvail" = false
WHERE slug = 'atlas-roofing';

-- Pella Windows
UPDATE "Vendor" SET 
  logo = '/vendors/pella-logo.png',
  "foundedYear" = 1925,
  description = 'Pella Corporation is a premier window and door manufacturer known for quality craftsmanship. Their Lifestyle Series and Impervia® fiberglass windows are ideal for Arizona''s climate, offering excellent energy efficiency.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified'],
  rating = 4.6,
  "reviewCount" = 87,
  "financingAvail" = true,
  "rebatesAvail" = true
WHERE slug = 'pella';

-- Andersen Windows
UPDATE "Vendor" SET 
  logo = '/vendors/andersen-logo.png',
  "foundedYear" = 1903,
  description = 'Andersen Windows is America''s premier window and door brand, offering a complete portfolio from the affordable 100 Series to the premium E-Series. Their windows are designed for superior energy efficiency and lasting beauty.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified', 'AAMA Certified'],
  rating = 4.7,
  "reviewCount" = 112,
  "financingAvail" = true,
  "rebatesAvail" = true
WHERE slug = 'andersen-windows';

-- James Hardie
UPDATE "Vendor" SET 
  logo = '/vendors/james-hardie-logo.png',
  "foundedYear" = 1888,
  description = 'James Hardie is the world leader in fiber cement siding and backerboard. Their HardiePlank® siding is engineered specifically for Arizona''s climate, offering superior resistance to heat, UV, and termites.',
  "tradeTypes" = ARRAY['Siding'],
  "vendorTypes" = ARRAY['Manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ColorPlus Technology Partner', 'ENERGY STAR Partner'],
  rating = 4.8,
  "reviewCount" = 95,
  "financingAvail" = true,
  "rebatesAvail" = false
WHERE slug = 'james-hardie';

-- ============================================================
-- STEP 2: UPDATE VENDOR LOCATION DATA (Hours, Coords, Contacts)
-- ============================================================

-- ABC Supply Phoenix
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:00 AM - 4:30 PM", "tue": "6:00 AM - 4:30 PM", "wed": "6:00 AM - 4:30 PM", "thu": "6:00 AM - 4:30 PM", "fri": "6:00 AM - 4:30 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb,
  lat = '33.4484',
  lng = '-112.0740',
  email = 'phoenix@abcsupply.com',
  "deliveryRadiusMi" = 50,
  "localRepName" = 'Mike Rodriguez',
  "localRepPhone" = '(602) 555-0101',
  "emergencyPhone" = '(800) 422-2227'
WHERE name ILIKE '%phoenix%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- ABC Supply Tempe
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:00 AM - 4:30 PM", "tue": "6:00 AM - 4:30 PM", "wed": "6:00 AM - 4:30 PM", "thu": "6:00 AM - 4:30 PM", "fri": "6:00 AM - 4:30 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb,
  lat = '33.4255',
  lng = '-111.9400',
  email = 'tempe@abcsupply.com',
  "deliveryRadiusMi" = 45,
  "localRepName" = 'Sarah Chen',
  "localRepPhone" = '(480) 555-0102'
WHERE name ILIKE '%tempe%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- ABC Supply Scottsdale
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:00 AM - 4:30 PM", "tue": "6:00 AM - 4:30 PM", "wed": "6:00 AM - 4:30 PM", "thu": "6:00 AM - 4:30 PM", "fri": "6:00 AM - 4:30 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb,
  lat = '33.4942',
  lng = '-111.9261',
  email = 'scottsdale@abcsupply.com',
  "deliveryRadiusMi" = 40,
  "localRepName" = 'Tom Wilson',
  "localRepPhone" = '(480) 555-0103'
WHERE name ILIKE '%scottsdale%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- ABC Supply Mesa
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:00 AM - 4:30 PM", "tue": "6:00 AM - 4:30 PM", "wed": "6:00 AM - 4:30 PM", "thu": "6:00 AM - 4:30 PM", "fri": "6:00 AM - 4:30 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb,
  lat = '33.4152',
  lng = '-111.8315',
  email = 'mesa@abcsupply.com',
  "deliveryRadiusMi" = 45,
  "localRepName" = 'David Martinez',
  "localRepPhone" = '(480) 555-0104'
WHERE name ILIKE '%mesa%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- ABC Supply Tucson
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:00 AM - 4:30 PM", "tue": "6:00 AM - 4:30 PM", "wed": "6:00 AM - 4:30 PM", "thu": "6:00 AM - 4:30 PM", "fri": "6:00 AM - 4:30 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb,
  lat = '32.2226',
  lng = '-110.9747',
  email = 'tucson@abcsupply.com',
  "deliveryRadiusMi" = 60,
  "localRepName" = 'Jennifer Lopez',
  "localRepPhone" = '(520) 555-0105',
  "emergencyPhone" = '(800) 422-2227'
WHERE name ILIKE '%tucson%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- ABC Supply Flagstaff
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:30 AM - 4:00 PM", "tue": "6:30 AM - 4:00 PM", "wed": "6:30 AM - 4:00 PM", "thu": "6:30 AM - 4:00 PM", "fri": "6:30 AM - 4:00 PM", "sat": "7:00 AM - 11:00 AM", "sun": "Closed"}'::jsonb,
  lat = '35.1983',
  lng = '-111.6513',
  email = 'flagstaff@abcsupply.com',
  "deliveryRadiusMi" = 75,
  "localRepName" = 'Chris Anderson',
  "localRepPhone" = '(928) 555-0106'
WHERE name ILIKE '%flagstaff%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- Beacon Phoenix
UPDATE "VendorLocation" SET
  hours = '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb,
  lat = '33.4587',
  lng = '-112.1021',
  email = 'phoenix@beaconbp.com',
  "deliveryRadiusMi" = 55,
  "localRepName" = 'Robert Thompson',
  "localRepPhone" = '(602) 555-0201'
WHERE name ILIKE '%phoenix%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'beacon-building-products');

-- SRS Phoenix
UPDATE "VendorLocation" SET
  hours = '{"mon": "5:30 AM - 4:30 PM", "tue": "5:30 AM - 4:30 PM", "wed": "5:30 AM - 4:30 PM", "thu": "5:30 AM - 4:30 PM", "fri": "5:30 AM - 4:30 PM", "sat": "6:00 AM - 11:00 AM", "sun": "Closed"}'::jsonb,
  lat = '33.4373',
  lng = '-112.0908',
  email = 'phoenix@srsdistribution.com',
  "deliveryRadiusMi" = 50,
  "localRepName" = 'James Brown',
  "localRepPhone" = '(602) 555-0301'
WHERE name ILIKE '%phoenix%' AND "vendorId" IN (SELECT id FROM "Vendor" WHERE slug = 'srs-distribution');

-- Update all remaining VendorLocations with default hours if NULL
UPDATE "VendorLocation" SET
  hours = '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb
WHERE hours IS NULL;

-- ============================================================
-- STEP 3: CREATE CONTACTS FOR LOCATIONS
-- ============================================================

-- Insert contacts for ABC Supply locations
INSERT INTO "VendorContact" (id, "vendorId", "locationId", name, title, email, phone, "mobilePhone", territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  vl.id,
  'Branch Manager',
  'Branch Manager',
  LOWER(REPLACE(vl.city, ' ', '')) || '.manager@abcsupply.com',
  vl.phone,
  NULL,
  ARRAY[vl.city],
  true,
  true,
  NOW(),
  NOW()
FROM "Vendor" v
JOIN "VendorLocation" vl ON vl."vendorId" = v.id
WHERE v.slug = 'abc-supply'
  AND NOT EXISTS (
    SELECT 1 FROM "VendorContact" vc 
    WHERE vc."locationId" = vl.id AND vc.title = 'Branch Manager'
  );

-- Insert sales rep contacts for ABC Supply
INSERT INTO "VendorContact" (id, "vendorId", "locationId", name, title, email, phone, "mobilePhone", territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  vl.id,
  'Sales Representative',
  'Outside Sales',
  LOWER(REPLACE(vl.city, ' ', '')) || '.sales@abcsupply.com',
  NULL,
  '(602) 555-' || LPAD((FLOOR(RANDOM() * 9000 + 1000))::text, 4, '0'),
  ARRAY[vl.city, CASE WHEN vl.city = 'Phoenix' THEN 'Glendale' WHEN vl.city = 'Tucson' THEN 'Sierra Vista' ELSE 'Gilbert' END],
  false,
  true,
  NOW(),
  NOW()
FROM "Vendor" v
JOIN "VendorLocation" vl ON vl."vendorId" = v.id
WHERE v.slug = 'abc-supply'
  AND NOT EXISTS (
    SELECT 1 FROM "VendorContact" vc 
    WHERE vc."locationId" = vl.id AND vc.title = 'Outside Sales'
  );

-- Insert contacts for Beacon locations
INSERT INTO "VendorContact" (id, "vendorId", "locationId", name, title, email, phone, "mobilePhone", territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  vl.id,
  'Branch Manager',
  'General Manager',
  LOWER(REPLACE(vl.city, ' ', '')) || '@beaconbp.com',
  vl.phone,
  NULL,
  ARRAY[vl.city],
  true,
  true,
  NOW(),
  NOW()
FROM "Vendor" v
JOIN "VendorLocation" vl ON vl."vendorId" = v.id
WHERE v.slug = 'beacon-building-products'
  AND NOT EXISTS (
    SELECT 1 FROM "VendorContact" vc 
    WHERE vc."locationId" = vl.id AND vc.title = 'General Manager'
  );

-- Insert regional rep contacts for manufacturers
INSERT INTO "VendorContact" (id, "vendorId", "locationId", name, title, email, phone, "mobilePhone", territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  NULL,
  'Arizona Regional Manager',
  'Regional Sales Director',
  'arizona@' || REPLACE(LOWER(v.slug), '-', '') || '.com',
  '(800) 555-0100',
  '(602) 555-0001',
  ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  true,
  true,
  NOW(),
  NOW()
FROM "Vendor" v
WHERE v.category = 'Manufacturer'
  AND NOT EXISTS (
    SELECT 1 FROM "VendorContact" vc 
    WHERE vc."vendorId" = v.id AND vc.title = 'Regional Sales Director'
  );

-- ============================================================
-- STEP 4: ENSURE ALL LOCATIONS HAVE COORDINATES FOR MAP
-- ============================================================

-- Default Arizona city coordinates
UPDATE "VendorLocation" SET lat = '33.4484', lng = '-112.0740' 
WHERE lat IS NULL AND city ILIKE '%phoenix%';

UPDATE "VendorLocation" SET lat = '33.4255', lng = '-111.9400' 
WHERE lat IS NULL AND city ILIKE '%tempe%';

UPDATE "VendorLocation" SET lat = '33.4942', lng = '-111.9261' 
WHERE lat IS NULL AND city ILIKE '%scottsdale%';

UPDATE "VendorLocation" SET lat = '33.4152', lng = '-111.8315' 
WHERE lat IS NULL AND city ILIKE '%mesa%';

UPDATE "VendorLocation" SET lat = '33.3062', lng = '-111.8413' 
WHERE lat IS NULL AND city ILIKE '%chandler%';

UPDATE "VendorLocation" SET lat = '33.3528', lng = '-111.7890' 
WHERE lat IS NULL AND city ILIKE '%gilbert%';

UPDATE "VendorLocation" SET lat = '33.5387', lng = '-112.1860' 
WHERE lat IS NULL AND city ILIKE '%glendale%';

UPDATE "VendorLocation" SET lat = '33.5806', lng = '-112.2374' 
WHERE lat IS NULL AND city ILIKE '%peoria%';

UPDATE "VendorLocation" SET lat = '33.6292', lng = '-112.3679' 
WHERE lat IS NULL AND city ILIKE '%surprise%';

UPDATE "VendorLocation" SET lat = '32.2226', lng = '-110.9747' 
WHERE lat IS NULL AND city ILIKE '%tucson%';

UPDATE "VendorLocation" SET lat = '31.5455', lng = '-110.3036' 
WHERE lat IS NULL AND city ILIKE '%sierra vista%';

UPDATE "VendorLocation" SET lat = '32.6927', lng = '-114.6277' 
WHERE lat IS NULL AND city ILIKE '%yuma%';

UPDATE "VendorLocation" SET lat = '35.1983', lng = '-111.6513' 
WHERE lat IS NULL AND city ILIKE '%flagstaff%';

UPDATE "VendorLocation" SET lat = '34.5400', lng = '-112.4685' 
WHERE lat IS NULL AND city ILIKE '%prescott%';

UPDATE "VendorLocation" SET lat = '34.8697', lng = '-111.7610' 
WHERE lat IS NULL AND city ILIKE '%sedona%';

UPDATE "VendorLocation" SET lat = '35.2220', lng = '-114.0105' 
WHERE lat IS NULL AND city ILIKE '%kingman%';

UPDATE "VendorLocation" SET lat = '34.2423', lng = '-110.0307' 
WHERE lat IS NULL AND city ILIKE '%show low%';

-- Default to Phoenix for any remaining null coords
UPDATE "VendorLocation" SET lat = '33.4484', lng = '-112.0740' 
WHERE lat IS NULL OR lng IS NULL;

-- ============================================================
-- STEP 5: VERIFY DATA
-- ============================================================

-- Count verification
SELECT 
  'Vendors with logos' as metric, 
  COUNT(*) as count 
FROM "Vendor" WHERE logo IS NOT NULL
UNION ALL
SELECT 
  'Vendors with foundedYear', 
  COUNT(*) 
FROM "Vendor" WHERE "foundedYear" IS NOT NULL
UNION ALL
SELECT 
  'Locations with hours', 
  COUNT(*) 
FROM "VendorLocation" WHERE hours IS NOT NULL
UNION ALL
SELECT 
  'Locations with coordinates', 
  COUNT(*) 
FROM "VendorLocation" WHERE lat IS NOT NULL AND lng IS NOT NULL
UNION ALL
SELECT 
  'Total contacts', 
  COUNT(*) 
FROM "VendorContact";
