-- ============================================================
-- COMPREHENSIVE VENDOR SEED DATA (Schema-aware version)
-- Uses app schema where the full Vendor model exists
-- ============================================================

-- Set search path to app schema
SET search_path TO app, public;

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
-- STEP 2: UPDATE VENDOR LOCATION DATA (Hours, Coords)
-- ============================================================

-- Update all VendorLocations with default hours if NULL
UPDATE "VendorLocation" SET
  hours = '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb
WHERE hours IS NULL;

-- Default Arizona city coordinates for map pins
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

-- Update location emails based on city
UPDATE "VendorLocation" vl SET
  email = LOWER(REPLACE(vl.city, ' ', '')) || '@' || LOWER(REPLACE(v.slug, '-', '')) || '.com'
FROM "Vendor" v
WHERE vl."vendorId" = v.id AND vl.email IS NULL;

-- ============================================================
-- STEP 3: CREATE CONTACTS (Simple version without mobilePhone)
-- ============================================================

-- Insert branch manager contacts for distributor locations
INSERT INTO "VendorContact" (id, "vendorId", "locationId", name, title, email, phone, territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  vl.id,
  vl.city || ' Branch Manager',
  'Branch Manager',
  LOWER(REPLACE(vl.city, ' ', '')) || '.manager@' || LOWER(REPLACE(v.slug, '-', '')) || '.com',
  vl.phone,
  ARRAY[vl.city],
  true,
  true,
  NOW(),
  NOW()
FROM "Vendor" v
JOIN "VendorLocation" vl ON vl."vendorId" = v.id
WHERE v."vendorTypes" @> ARRAY['Distributor']
  AND NOT EXISTS (
    SELECT 1 FROM "VendorContact" vc 
    WHERE vc."locationId" = vl.id AND vc."isPrimary" = true
  );

-- Insert regional reps for manufacturers (not tied to specific location)
INSERT INTO "VendorContact" (id, "vendorId", name, title, email, phone, territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  'Arizona Regional Manager',
  'Regional Sales Director',
  'arizona@' || LOWER(REPLACE(v.slug, '-', '')) || '.com',
  '(800) 555-' || LPAD((ROW_NUMBER() OVER (ORDER BY v.name) + 100)::text, 4, '0'),
  ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  true,
  true,
  NOW(),
  NOW()
FROM "Vendor" v
WHERE v."vendorTypes" @> ARRAY['Manufacturer']
  AND NOT EXISTS (
    SELECT 1 FROM "VendorContact" vc 
    WHERE vc."vendorId" = v.id AND vc."isPrimary" = true
  );

-- ============================================================
-- STEP 4: VERIFY DATA
-- ============================================================

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
  'Vendors with tradeTypes', 
  COUNT(*) 
FROM "Vendor" WHERE "tradeTypes" IS NOT NULL AND array_length("tradeTypes", 1) > 0
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
