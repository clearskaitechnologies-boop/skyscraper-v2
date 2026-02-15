-- ============================================================
-- COMPLETE VENDOR DATA SEED - ALL 93 VENDORS
-- Every vendor gets: logo, foundedYear, tradeTypes, description
-- Every location gets: hours, coordinates, email
-- Every location gets: contacts
-- ============================================================

-- ============================================================
-- PART 1: UPDATE ALL VENDORS WITH COMPLETE DATA
-- ============================================================

-- A.O. Smith
UPDATE app."Vendor" SET 
  logo = '/vendors/ao-smith-logo.png',
  "foundedYear" = 1874,
  description = 'A.O. Smith is a leading manufacturer of water heaters and boilers, known for reliability and energy efficiency.',
  "tradeTypes" = ARRAY['Plumbing', 'Water Heaters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.5, "reviewCount" = 67, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'ao-smith';

-- ABC Supply
UPDATE app."Vendor" SET 
  logo = '/vendors/abc-supply-logo.png',
  "foundedYear" = 1982,
  description = 'ABC Supply Co. is America''s largest wholesale distributor of roofing, siding, and exterior building products.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Windows', 'Gutters'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Industry Alliance Member'],
  rating = 4.5, "reviewCount" = 89, "deliveryRadiusMi" = 75, "financingAvail" = true, "rebatesAvail" = false, "emergencyPhone" = '(800) 422-2227'
WHERE slug = 'abc-supply';

-- Alside
UPDATE app."Vendor" SET 
  logo = '/vendors/alside-logo.png',
  "foundedYear" = 1947,
  description = 'Alside manufactures premium vinyl siding, windows, and building products for residential construction.',
  "tradeTypes" = ARRAY['Siding', 'Windows'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.3, "reviewCount" = 45, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'alside';

-- American Standard (Plumbing)
UPDATE app."Vendor" SET 
  logo = '/vendors/american-standard-logo.png',
  "foundedYear" = 1929,
  description = 'American Standard offers a comprehensive line of plumbing fixtures including toilets, faucets, and bathtubs.',
  "tradeTypes" = ARRAY['Plumbing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['WaterSense Partner'],
  rating = 4.4, "reviewCount" = 78, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'american-standard';

-- American Standard HVAC
UPDATE app."Vendor" SET 
  logo = '/vendors/american-standard-hvac-logo.png',
  "foundedYear" = 1881,
  description = 'American Standard Heating & Air Conditioning manufactures premium HVAC systems with industry-leading warranties.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.6, "reviewCount" = 92, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'american-standard-hvac';

-- Andersen Windows
UPDATE app."Vendor" SET 
  logo = '/vendors/andersen-logo.png',
  "foundedYear" = 1903,
  description = 'Andersen Windows is America''s premier window and door brand with superior energy efficiency.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified'],
  rating = 4.7, "reviewCount" = 112, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'andersen-windows';

-- APOC Coatings
UPDATE app."Vendor" SET 
  logo = '/vendors/apoc-logo.png',
  "foundedYear" = 1978,
  description = 'APOC manufactures roof coatings, sealants, and waterproofing products for residential and commercial applications.',
  "tradeTypes" = ARRAY['Roofing', 'Coatings'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.2, "reviewCount" = 34, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'apoc';

-- Armstrong Flooring
UPDATE app."Vendor" SET 
  logo = '/vendors/armstrong-logo.png',
  "foundedYear" = 1860,
  description = 'Armstrong Flooring is a leader in design and manufacture of innovative flooring solutions.',
  "tradeTypes" = ARRAY['Flooring'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['FloorScore Certified'],
  rating = 4.4, "reviewCount" = 56, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'armstrong-flooring';

-- ATAS International
UPDATE app."Vendor" SET 
  logo = '/vendors/atas-logo.png',
  "foundedYear" = 1963,
  description = 'ATAS International manufactures metal roofing, wall panels, and accessories for commercial and residential use.',
  "tradeTypes" = ARRAY['Roofing', 'Metal'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Metal Construction Association'],
  rating = 4.3, "reviewCount" = 28, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'atas-intl';

-- Atlas Roofing
UPDATE app."Vendor" SET 
  logo = '/vendors/atlas-roofing-logo.png',
  "foundedYear" = 1982,
  description = 'Atlas Roofing Corporation manufactures residential and commercial roofing products with superior durability.',
  "tradeTypes" = ARRAY['Roofing', 'Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Pro Plus Contractor'],
  rating = 4.1, "reviewCount" = 29, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'atlas-roofing';

-- Beacon Building Products
UPDATE app."Vendor" SET 
  logo = '/vendors/beacon-logo.png',
  "foundedYear" = 1928,
  description = 'Beacon Building Products is one of the largest distributors of roofing materials in North America.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Waterproofing'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Alliance Member'],
  rating = 4.3, "reviewCount" = 74, "deliveryRadiusMi" = 80, "financingAvail" = true, "rebatesAvail" = false, "emergencyPhone" = '(877) 232-2666'
WHERE slug = 'beacon-building';

-- BEHR Paint
UPDATE app."Vendor" SET 
  logo = '/vendors/behr-logo.png',
  "foundedYear" = 1947,
  description = 'BEHR is a leading manufacturer of premium paints, stains, and primers for interior and exterior applications.',
  "tradeTypes" = ARRAY['Paint'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified'],
  rating = 4.5, "reviewCount" = 134, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'behr';

-- Benjamin Moore
UPDATE app."Vendor" SET 
  logo = '/vendors/benjamin-moore-logo.png',
  "foundedYear" = 1883,
  description = 'Benjamin Moore is known for premium quality paints and stains with exceptional color accuracy.',
  "tradeTypes" = ARRAY['Paint'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Gold Certified'],
  rating = 4.7, "reviewCount" = 156, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'benjamin-moore';

-- Berridge Manufacturing
UPDATE app."Vendor" SET 
  logo = '/vendors/berridge-logo.png',
  "foundedYear" = 1970,
  description = 'Berridge Manufacturing produces premium metal roofing and wall panel systems.',
  "tradeTypes" = ARRAY['Roofing', 'Metal'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Metal Construction Association'],
  rating = 4.4, "reviewCount" = 32, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'berridge';

-- Boral Roofing
UPDATE app."Vendor" SET 
  logo = '/vendors/boral-logo.png',
  "foundedYear" = 1956,
  description = 'Boral Roofing manufactures clay and concrete roof tiles ideal for Arizona''s climate.',
  "tradeTypes" = ARRAY['Roofing', 'Tile'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.5, "reviewCount" = 67, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'boral';

-- Builders FirstSource
UPDATE app."Vendor" SET 
  logo = '/vendors/builders-firstsource-logo.png',
  "foundedYear" = 1998,
  description = 'Builders FirstSource is the largest supplier of structural building products in the US.',
  "tradeTypes" = ARRAY['Lumber', 'Building Materials'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Forest Stewardship Council'],
  rating = 4.2, "reviewCount" = 56, "deliveryRadiusMi" = 100, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'builders-firstsource';

-- Carlisle SynTec
UPDATE app."Vendor" SET 
  logo = '/vendors/carlisle-logo.png',
  "foundedYear" = 1917,
  description = 'Carlisle SynTec is a leader in single-ply roofing systems including TPO and EPDM.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'Cool Roof Rating Council'],
  rating = 4.5, "reviewCount" = 48, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'carlisle';

-- Carrier
UPDATE app."Vendor" SET 
  logo = '/vendors/carrier-logo.png',
  "foundedYear" = 1915,
  description = 'Carrier is a world leader in HVAC and refrigeration solutions, invented modern air conditioning.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.6, "reviewCount" = 178, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'carrier';

-- CertainTeed
UPDATE app."Vendor" SET 
  logo = '/vendors/certainteed-logo.png',
  "foundedYear" = 1904,
  description = 'CertainTeed offers a complete line of roofing, siding, insulation, and building products.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['SELECT ShingleMaster', 'ENERGY STAR Partner'],
  rating = 4.6, "reviewCount" = 128, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'certainteed';

-- Daikin
UPDATE app."Vendor" SET 
  logo = '/vendors/daikin-logo.png',
  "foundedYear" = 1924,
  description = 'Daikin is a global leader in HVAC technology with innovative inverter systems.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.7, "reviewCount" = 89, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'daikin';

-- DaVinci Roofscapes
UPDATE app."Vendor" SET 
  logo = '/vendors/davinci-logo.png',
  "foundedYear" = 1999,
  description = 'DaVinci Roofscapes manufactures award-winning polymer roofing tiles that replicate natural materials.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Class A Fire Rating', 'Class 4 Impact Rating'],
  rating = 4.6, "reviewCount" = 34, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'davinci-roofscapes';

-- DECRA Metal Roofing
UPDATE app."Vendor" SET 
  logo = '/vendors/decra-logo.png',
  "foundedYear" = 1957,
  description = 'DECRA Metal Roofing manufactures stone-coated steel roofing with exceptional durability.',
  "tradeTypes" = ARRAY['Roofing', 'Metal'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Class 4 Impact Rating', 'Class A Fire Rating'],
  rating = 4.5, "reviewCount" = 56, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'decra';

-- Delta Faucet
UPDATE app."Vendor" SET 
  logo = '/vendors/delta-logo.png',
  "foundedYear" = 1954,
  description = 'Delta Faucet is a leading manufacturer of residential and commercial faucets and fixtures.',
  "tradeTypes" = ARRAY['Plumbing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['WaterSense Partner'],
  rating = 4.5, "reviewCount" = 112, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'delta-faucet';

-- Dunn-Edwards
UPDATE app."Vendor" SET 
  logo = '/vendors/dunn-edwards-logo.png',
  "foundedYear" = 1925,
  description = 'Dunn-Edwards is the Southwest''s leading paint manufacturer with products designed for desert climates.',
  "tradeTypes" = ARRAY['Paint'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified'],
  rating = 4.6, "reviewCount" = 145, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'dunn-edwards';

-- Eagle Roofing Products
UPDATE app."Vendor" SET 
  logo = '/vendors/eagle-roofing-logo.png',
  "foundedYear" = 1989,
  description = 'Eagle Roofing Products manufactures concrete roof tiles in a variety of profiles and colors.',
  "tradeTypes" = ARRAY['Roofing', 'Tile'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.4, "reviewCount" = 78, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'eagle-roofing';

-- Eaton Electrical
UPDATE app."Vendor" SET 
  logo = '/vendors/eaton-logo.png',
  "foundedYear" = 1911,
  description = 'Eaton is a power management company providing electrical components and systems.',
  "tradeTypes" = ARRAY['Electrical'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.5, "reviewCount" = 67, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'eaton';

-- Elite Roofing Supply
UPDATE app."Vendor" SET 
  logo = '/vendors/elite-roofing-logo.png',
  "foundedYear" = 1995,
  description = 'Elite Roofing Supply is a regional distributor serving Arizona roofing contractors.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Alliance Member'],
  rating = 4.3, "reviewCount" = 45, "deliveryRadiusMi" = 50, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'elite-roofing-supply';

-- Ferguson Enterprises
UPDATE app."Vendor" SET 
  logo = '/vendors/ferguson-logo.png',
  "foundedYear" = 1953,
  description = 'Ferguson is the largest distributor of plumbing supplies and HVAC equipment in North America.',
  "tradeTypes" = ARRAY['Plumbing', 'HVAC'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['WaterSense Partner'],
  rating = 4.4, "reviewCount" = 156, "deliveryRadiusMi" = 75, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'ferguson';

-- Firestone Building Products
UPDATE app."Vendor" SET 
  logo = '/vendors/firestone-logo.png',
  "foundedYear" = 1980,
  description = 'Firestone Building Products manufactures commercial roofing systems including TPO and EPDM.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'Cool Roof Rating Council'],
  rating = 4.4, "reviewCount" = 52, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'firestone';

-- Gaco Western
UPDATE app."Vendor" SET 
  logo = '/vendors/gaco-logo.png',
  "foundedYear" = 1955,
  description = 'Gaco Western manufactures silicone roof coatings and spray foam insulation.',
  "tradeTypes" = ARRAY['Roofing', 'Coatings', 'Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.3, "reviewCount" = 38, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'gaco';

-- GAF
UPDATE app."Vendor" SET 
  logo = '/vendors/gaf-logo.png',
  "foundedYear" = 1886,
  description = 'GAF is North America''s largest roofing manufacturer with industry-leading warranties.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Master Elite Certified', 'Green Building Council Member'],
  rating = 4.8, "reviewCount" = 156, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'gaf';

-- GAF Materials
UPDATE app."Vendor" SET 
  logo = '/vendors/gaf-logo.png',
  "foundedYear" = 1886,
  description = 'GAF Materials provides shingles and roofing products backed by comprehensive warranties.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Master Elite Certified'],
  rating = 4.7, "reviewCount" = 89, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'gaf-materials';

-- Generac
UPDATE app."Vendor" SET 
  logo = '/vendors/generac-logo.png',
  "foundedYear" = 1959,
  description = 'Generac is the leading manufacturer of home backup generators and power equipment.',
  "tradeTypes" = ARRAY['Electrical', 'Generators'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.6, "reviewCount" = 98, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'generac';

-- Goodman Manufacturing
UPDATE app."Vendor" SET 
  logo = '/vendors/goodman-logo.png',
  "foundedYear" = 1982,
  description = 'Goodman Manufacturing produces reliable and affordable HVAC systems for residential use.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.3, "reviewCount" = 167, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'goodman';

-- Graybar Electric
UPDATE app."Vendor" SET 
  logo = '/vendors/graybar-logo.png',
  "foundedYear" = 1869,
  description = 'Graybar is a leading distributor of electrical and telecommunications products.',
  "tradeTypes" = ARRAY['Electrical'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.4, "reviewCount" = 78, "deliveryRadiusMi" = 100, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'graybar';

-- Home Depot Pro
UPDATE app."Vendor" SET 
  logo = '/vendors/home-depot-pro-logo.png',
  "foundedYear" = 1978,
  description = 'Home Depot Pro serves professional contractors with dedicated service and pricing.',
  "tradeTypes" = ARRAY['Building Materials', 'Tools'],
  "vendorTypes" = ARRAY['retailer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Pro Xtra Member'],
  rating = 4.2, "reviewCount" = 234, "deliveryRadiusMi" = 50, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'home-depot-pro';

-- Hubbell
UPDATE app."Vendor" SET 
  logo = '/vendors/hubbell-logo.png',
  "foundedYear" = 1888,
  description = 'Hubbell manufactures electrical and electronic products for residential and commercial applications.',
  "tradeTypes" = ARRAY['Electrical'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.4, "reviewCount" = 45, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'hubbell';

-- Icynene-Lapolla
UPDATE app."Vendor" SET 
  logo = '/vendors/icynene-logo.png',
  "foundedYear" = 1986,
  description = 'Icynene-Lapolla manufactures spray foam insulation for superior thermal performance.',
  "tradeTypes" = ARRAY['Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified', 'ENERGY STAR Partner'],
  rating = 4.5, "reviewCount" = 56, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'icynene';

-- IKO Industries
UPDATE app."Vendor" SET 
  logo = '/vendors/iko-logo.png',
  "foundedYear" = 1951,
  description = 'IKO is a global leader in roofing, waterproofing, and insulation products.',
  "tradeTypes" = ARRAY['Roofing', 'Waterproofing', 'Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['SHIELD PRO Plus Certified'],
  rating = 4.4, "reviewCount" = 56, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'iko';

-- James Hardie
UPDATE app."Vendor" SET 
  logo = '/vendors/james-hardie-logo.png',
  "foundedYear" = 1888,
  description = 'James Hardie is the world leader in fiber cement siding, engineered for Arizona''s climate.',
  "tradeTypes" = ARRAY['Siding'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ColorPlus Technology Partner'],
  rating = 4.8, "reviewCount" = 95, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'james-hardie';

-- JELD-WEN
UPDATE app."Vendor" SET 
  logo = '/vendors/jeld-wen-logo.png',
  "foundedYear" = 1960,
  description = 'JELD-WEN manufactures windows, doors, and related products for residential construction.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified'],
  rating = 4.3, "reviewCount" = 78, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'jeld-wen';

-- Johns Manville
UPDATE app."Vendor" SET 
  logo = '/vendors/johns-manville-logo.png',
  "foundedYear" = 1858,
  description = 'Johns Manville manufactures insulation, roofing, and specialty products.',
  "tradeTypes" = ARRAY['Insulation', 'Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified', 'ENERGY STAR Partner'],
  rating = 4.5, "reviewCount" = 67, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'johns-manville';

-- Knauf Insulation
UPDATE app."Vendor" SET 
  logo = '/vendors/knauf-logo.png',
  "foundedYear" = 1978,
  description = 'Knauf Insulation manufactures sustainable insulation products for thermal and acoustic performance.',
  "tradeTypes" = ARRAY['Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified', 'ENERGY STAR Partner'],
  rating = 4.4, "reviewCount" = 45, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'knauf';

-- Kohler
UPDATE app."Vendor" SET 
  logo = '/vendors/kohler-logo.png',
  "foundedYear" = 1873,
  description = 'Kohler is a global leader in kitchen and bath products with innovative design.',
  "tradeTypes" = ARRAY['Plumbing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['WaterSense Partner'],
  rating = 4.7, "reviewCount" = 189, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'kohler';

-- LeafFilter
UPDATE app."Vendor" SET 
  logo = '/vendors/leaffilter-logo.png',
  "foundedYear" = 2005,
  description = 'LeafFilter manufactures micro-mesh gutter protection systems.',
  "tradeTypes" = ARRAY['Gutters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Lifetime Warranty'],
  rating = 4.3, "reviewCount" = 234, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'leaffilter';

-- LeafGuard
UPDATE app."Vendor" SET 
  logo = '/vendors/leafguard-logo.png',
  "foundedYear" = 1993,
  description = 'LeafGuard manufactures one-piece seamless gutter systems that never clog.',
  "tradeTypes" = ARRAY['Gutters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Lifetime Warranty'],
  rating = 4.4, "reviewCount" = 156, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'leafguard';

-- Lennox
UPDATE app."Vendor" SET 
  logo = '/vendors/lennox-logo.png',
  "foundedYear" = 1895,
  description = 'Lennox is a leading provider of premium HVAC systems with superior efficiency.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.7, "reviewCount" = 134, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'lennox';

-- Leviton
UPDATE app."Vendor" SET 
  logo = '/vendors/leviton-logo.png',
  "foundedYear" = 1906,
  description = 'Leviton manufactures electrical wiring devices, lighting controls, and network solutions.',
  "tradeTypes" = ARRAY['Electrical'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.5, "reviewCount" = 89, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'leviton';

-- Lowe's Pro
UPDATE app."Vendor" SET 
  logo = '/vendors/lowes-pro-logo.png',
  "foundedYear" = 1946,
  description = 'Lowe''s Pro serves professional contractors with dedicated pricing and services.',
  "tradeTypes" = ARRAY['Building Materials', 'Tools'],
  "vendorTypes" = ARRAY['retailer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Pro Loyalty Member'],
  rating = 4.1, "reviewCount" = 198, "deliveryRadiusMi" = 50, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'lowes-pro';

-- LP SmartSide
UPDATE app."Vendor" SET 
  logo = '/vendors/lp-smartside-logo.png',
  "foundedYear" = 1973,
  description = 'LP SmartSide manufactures engineered wood siding with superior durability.',
  "tradeTypes" = ARRAY['Siding'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['50-Year Warranty'],
  rating = 4.5, "reviewCount" = 67, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'lp-smartside';

-- Lutron
UPDATE app."Vendor" SET 
  logo = '/vendors/lutron-logo.png',
  "foundedYear" = 1961,
  description = 'Lutron is the leader in lighting control and automated shading solutions.',
  "tradeTypes" = ARRAY['Electrical', 'Smart Home'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.7, "reviewCount" = 78, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'lutron';

-- Malarkey
UPDATE app."Vendor" SET 
  logo = '/vendors/malarkey-logo.png',
  "foundedYear" = 1956,
  description = 'Malarkey Roofing Products is known for sustainability and innovation with rubberized asphalt shingles.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Emerald Pro Contractor'],
  rating = 4.5, "reviewCount" = 38, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'malarkey';

-- Mannington
UPDATE app."Vendor" SET 
  logo = '/vendors/mannington-logo.png',
  "foundedYear" = 1915,
  description = 'Mannington manufactures residential and commercial flooring including LVT and hardwood.',
  "tradeTypes" = ARRAY['Flooring'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['FloorScore Certified'],
  rating = 4.5, "reviewCount" = 56, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'mannington';

-- Marvin
UPDATE app."Vendor" SET 
  logo = '/vendors/marvin-logo.png',
  "foundedYear" = 1912,
  description = 'Marvin manufactures premium windows and doors known for craftsmanship and customization.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified'],
  rating = 4.8, "reviewCount" = 89, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'marvin';

-- Metal Sales
UPDATE app."Vendor" SET 
  logo = '/vendors/metal-sales-logo.png',
  "foundedYear" = 1963,
  description = 'Metal Sales Manufacturing produces metal roofing, siding, and building components.',
  "tradeTypes" = ARRAY['Roofing', 'Metal', 'Siding'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Metal Construction Association'],
  rating = 4.4, "reviewCount" = 45, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'metal-sales';

-- Milgard
UPDATE app."Vendor" SET 
  logo = '/vendors/milgard-logo.png',
  "foundedYear" = 1958,
  description = 'Milgard manufactures windows and patio doors designed for Western climates.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified'],
  rating = 4.6, "reviewCount" = 112, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'milgard';

-- Moen
UPDATE app."Vendor" SET 
  logo = '/vendors/moen-logo.png',
  "foundedYear" = 1937,
  description = 'Moen is a leading manufacturer of faucets, showerheads, and bath accessories.',
  "tradeTypes" = ARRAY['Plumbing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['WaterSense Partner'],
  rating = 4.6, "reviewCount" = 145, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'moen';

-- Mohawk
UPDATE app."Vendor" SET 
  logo = '/vendors/mohawk-logo.png',
  "foundedYear" = 1878,
  description = 'Mohawk is the world''s largest flooring company offering carpet, hardwood, LVT, and tile.',
  "tradeTypes" = ARRAY['Flooring'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['FloorScore Certified', 'GREENGUARD Certified'],
  rating = 4.5, "reviewCount" = 167, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'mohawk';

-- Monier Lifetile
UPDATE app."Vendor" SET 
  logo = '/vendors/monier-logo.png',
  "foundedYear" = 1953,
  description = 'Monier Lifetile manufactures concrete roof tiles with superior weather resistance.',
  "tradeTypes" = ARRAY['Roofing', 'Tile'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.4, "reviewCount" = 56, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'monier';

-- Navien
UPDATE app."Vendor" SET 
  logo = '/vendors/navien-logo.png',
  "foundedYear" = 1978,
  description = 'Navien manufactures high-efficiency tankless water heaters and boilers.',
  "tradeTypes" = ARRAY['Plumbing', 'Water Heaters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.6, "reviewCount" = 78, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'navien';

-- Nucor Building Systems
UPDATE app."Vendor" SET 
  logo = '/vendors/nucor-logo.png',
  "foundedYear" = 1987,
  description = 'Nucor Building Systems manufactures pre-engineered metal buildings and components.',
  "tradeTypes" = ARRAY['Metal', 'Commercial'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Metal Building Manufacturers Association'],
  rating = 4.4, "reviewCount" = 34, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'nucor-skyline';

-- Owens Corning
UPDATE app."Vendor" SET 
  logo = '/vendors/owens-corning-logo.png',
  "foundedYear" = 1938,
  description = 'Owens Corning is a global leader in insulation, roofing, and fiberglass composites.',
  "tradeTypes" = ARRAY['Roofing', 'Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Platinum Preferred', 'ENERGY STAR Partner'],
  rating = 4.7, "reviewCount" = 142, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'owens-corning';

-- Pella
UPDATE app."Vendor" SET 
  logo = '/vendors/pella-logo.png',
  "foundedYear" = 1925,
  description = 'Pella Corporation is a premier window and door manufacturer known for quality craftsmanship.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'NFRC Certified'],
  rating = 4.6, "reviewCount" = 87, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'pella';

-- Ply Gem
UPDATE app."Vendor" SET 
  logo = '/vendors/plygem-logo.png',
  "foundedYear" = 1943,
  description = 'Ply Gem manufactures windows, siding, and outdoor living products.',
  "tradeTypes" = ARRAY['Windows', 'Siding'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.3, "reviewCount" = 67, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'plygem';

-- Polyglass
UPDATE app."Vendor" SET 
  logo = '/vendors/polyglass-logo.png',
  "foundedYear" = 1982,
  description = 'Polyglass manufactures modified bitumen roofing and waterproofing membranes.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.3, "reviewCount" = 38, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'polyglass';

-- PPG Paints
UPDATE app."Vendor" SET 
  logo = '/vendors/ppg-logo.png',
  "foundedYear" = 1883,
  description = 'PPG is a global manufacturer of paints, coatings, and specialty materials.',
  "tradeTypes" = ARRAY['Paint'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified'],
  rating = 4.5, "reviewCount" = 98, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'ppg-paints';

-- ProVia
UPDATE app."Vendor" SET 
  logo = '/vendors/provia-logo.png',
  "foundedYear" = 1977,
  description = 'ProVia manufactures premium entry doors, storm doors, and windows.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.6, "reviewCount" = 56, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'provia';

-- QUIKRETE
UPDATE app."Vendor" SET 
  logo = '/vendors/quikrete-logo.png',
  "foundedYear" = 1940,
  description = 'QUIKRETE is the leading manufacturer of packaged concrete and cement products.',
  "tradeTypes" = ARRAY['Concrete', 'Masonry'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Concrete Industry Certified'],
  rating = 4.4, "reviewCount" = 134, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'quikrete';

-- Raindrop Gutter Guard
UPDATE app."Vendor" SET 
  logo = '/vendors/raindrop-logo.png',
  "foundedYear" = 2002,
  description = 'Raindrop manufactures high-performance gutter guard systems.',
  "tradeTypes" = ARRAY['Gutters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['20-Year Warranty'],
  rating = 4.3, "reviewCount" = 45, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'raindrop-gutter';

-- Rheem
UPDATE app."Vendor" SET 
  logo = '/vendors/rheem-logo.png',
  "foundedYear" = 1925,
  description = 'Rheem is a leading manufacturer of HVAC systems and water heaters.',
  "tradeTypes" = ARRAY['HVAC', 'Plumbing', 'Water Heaters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.6, "reviewCount" = 189, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'rheem';

-- Rinnai
UPDATE app."Vendor" SET 
  logo = '/vendors/rinnai-logo.png',
  "foundedYear" = 1920,
  description = 'Rinnai manufactures tankless water heaters, boilers, and HVAC systems.',
  "tradeTypes" = ARRAY['Plumbing', 'HVAC', 'Water Heaters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.7, "reviewCount" = 112, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'rinnai';

-- ROCKWOOL
UPDATE app."Vendor" SET 
  logo = '/vendors/rockwool-logo.png',
  "foundedYear" = 1937,
  description = 'ROCKWOOL manufactures stone wool insulation for thermal, acoustic, and fire protection.',
  "tradeTypes" = ARRAY['Insulation'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified', 'ENERGY STAR Partner'],
  rating = 4.6, "reviewCount" = 67, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'rockwool';

-- Roof Hugger
UPDATE app."Vendor" SET 
  logo = '/vendors/roof-hugger-logo.png',
  "foundedYear" = 1985,
  description = 'Roof Hugger manufactures metal roofing retrofit systems.',
  "tradeTypes" = ARRAY['Roofing', 'Metal'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Metal Construction Association'],
  rating = 4.3, "reviewCount" = 23, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'roof-hugger';

-- Royal Building Products
UPDATE app."Vendor" SET 
  logo = '/vendors/royal-logo.png',
  "foundedYear" = 1970,
  description = 'Royal Building Products manufactures vinyl siding, trim, and accessories.',
  "tradeTypes" = ARRAY['Siding'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Lifetime Warranty'],
  rating = 4.3, "reviewCount" = 56, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'royal-building';

-- Senox Corporation
UPDATE app."Vendor" SET 
  logo = '/vendors/senox-logo.png',
  "foundedYear" = 1980,
  description = 'Senox manufactures seamless gutter machines and metal roofing equipment.',
  "tradeTypes" = ARRAY['Gutters', 'Equipment'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Industry Standard'],
  rating = 4.2, "reviewCount" = 18, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'senox';

-- SERVPRO
UPDATE app."Vendor" SET 
  logo = '/vendors/servpro-logo.png',
  "foundedYear" = 1967,
  description = 'SERVPRO provides fire, water, and mold damage restoration services.',
  "tradeTypes" = ARRAY['Restoration'],
  "vendorTypes" = ARRAY['service_provider'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['IICRC Certified'],
  rating = 4.4, "reviewCount" = 234, "financingAvail" = true, "rebatesAvail" = false, "emergencyPhone" = '(800) 737-8776'
WHERE slug = 'servpro';

-- Shaw Industries
UPDATE app."Vendor" SET 
  logo = '/vendors/shaw-logo.png',
  "foundedYear" = 1946,
  description = 'Shaw Industries is a leading flooring manufacturer with carpet, hardwood, LVT, and tile.',
  "tradeTypes" = ARRAY['Flooring'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['FloorScore Certified', 'GREENGUARD Certified'],
  rating = 4.6, "reviewCount" = 145, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'shaw-industries';

-- Sherwin-Williams
UPDATE app."Vendor" SET 
  logo = '/vendors/sherwin-williams-logo.png',
  "foundedYear" = 1866,
  description = 'Sherwin-Williams is America''s largest paint manufacturer with premium coatings.',
  "tradeTypes" = ARRAY['Paint'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['GREENGUARD Certified'],
  rating = 4.7, "reviewCount" = 289, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'sherwin-williams';

-- Siemens Electrical
UPDATE app."Vendor" SET 
  logo = '/vendors/siemens-logo.png',
  "foundedYear" = 1847,
  description = 'Siemens manufactures electrical distribution equipment and smart home systems.',
  "tradeTypes" = ARRAY['Electrical'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.5, "reviewCount" = 78, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'siemens-electrical';

-- Simonton
UPDATE app."Vendor" SET 
  logo = '/vendors/simonton-logo.png',
  "foundedYear" = 1946,
  description = 'Simonton manufactures vinyl windows and patio doors for residential construction.',
  "tradeTypes" = ARRAY['Windows', 'Doors'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.4, "reviewCount" = 89, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'simonton';

-- Spectra Gutter Systems
UPDATE app."Vendor" SET 
  logo = '/vendors/spectra-logo.png',
  "foundedYear" = 1978,
  description = 'Spectra Gutter Systems manufactures aluminum gutters, downspouts, and accessories.',
  "tradeTypes" = ARRAY['Gutters'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Industry Standard'],
  rating = 4.3, "reviewCount" = 34, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'spectra-metals';

-- Square D
UPDATE app."Vendor" SET 
  logo = '/vendors/square-d-logo.png',
  "foundedYear" = 1903,
  description = 'Square D by Schneider Electric manufactures electrical panels, breakers, and surge protection.',
  "tradeTypes" = ARRAY['Electrical'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['UL Listed'],
  rating = 4.6, "reviewCount" = 112, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'square-d';

-- SRS Distribution
UPDATE app."Vendor" SET 
  logo = '/vendors/srs-logo.png',
  "foundedYear" = 2008,
  description = 'SRS Distribution is a fast-growing building products distributor specializing in roofing.',
  "tradeTypes" = ARRAY['Roofing', 'Siding'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Roofing Alliance Member'],
  rating = 4.4, "reviewCount" = 67, "deliveryRadiusMi" = 60, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'srs-distribution';

-- Standing Seam USA
UPDATE app."Vendor" SET 
  logo = '/vendors/standing-seam-logo.png',
  "foundedYear" = 1995,
  description = 'Standing Seam USA manufactures premium standing seam metal roofing systems.',
  "tradeTypes" = ARRAY['Roofing', 'Metal'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona'],
  certifications = ARRAY['Metal Construction Association'],
  rating = 4.4, "reviewCount" = 28, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'standing-seam-usa';

-- SunPower
UPDATE app."Vendor" SET 
  logo = '/vendors/sunpower-logo.png',
  "foundedYear" = 1985,
  description = 'SunPower manufactures high-efficiency solar panels for residential and commercial use.',
  "tradeTypes" = ARRAY['Solar'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.7, "reviewCount" = 156, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'sunpower';

-- TAMKO
UPDATE app."Vendor" SET 
  logo = '/vendors/tamko-logo.png',
  "foundedYear" = 1944,
  description = 'TAMKO Building Products is a family-owned company manufacturing quality roofing products.',
  "tradeTypes" = ARRAY['Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona'],
  certifications = ARRAY['Pro Certified Contractor Network'],
  rating = 4.2, "reviewCount" = 41, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'tamko';

-- Trane
UPDATE app."Vendor" SET 
  logo = '/vendors/trane-logo.png',
  "foundedYear" = 1885,
  description = 'Trane Technologies manufactures premium HVAC systems known for reliability and efficiency.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.8, "reviewCount" = 198, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'trane';

-- Tremco Roofing
UPDATE app."Vendor" SET 
  logo = '/vendors/tremco-logo.png',
  "foundedYear" = 1928,
  description = 'Tremco Roofing manufactures commercial roofing systems and restoration coatings.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing', 'Coatings'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Cool Roof Rating Council'],
  rating = 4.4, "reviewCount" = 45, "financingAvail" = false, "rebatesAvail" = false
WHERE slug = 'tremco';

-- United Rentals
UPDATE app."Vendor" SET 
  logo = '/vendors/united-rentals-logo.png',
  "foundedYear" = 1997,
  description = 'United Rentals is the largest equipment rental company in the world.',
  "tradeTypes" = ARRAY['Equipment Rental'],
  "vendorTypes" = ARRAY['Rental'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['OSHA Compliant'],
  rating = 4.3, "reviewCount" = 178, "deliveryRadiusMi" = 100, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'united-rentals';

-- US LBM
UPDATE app."Vendor" SET 
  logo = '/vendors/us-lbm-logo.png',
  "foundedYear" = 2009,
  description = 'US LBM is a leading distributor of specialty building materials.',
  "tradeTypes" = ARRAY['Building Materials', 'Lumber'],
  "vendorTypes" = ARRAY['distributor'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['Forest Stewardship Council'],
  rating = 4.2, "reviewCount" = 45, "deliveryRadiusMi" = 75, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'us-lbm';

-- Versico
UPDATE app."Vendor" SET 
  logo = '/vendors/versico-logo.png',
  "foundedYear" = 1993,
  description = 'Versico Roofing Systems manufactures TPO and PVC single-ply roofing membranes.',
  "tradeTypes" = ARRAY['Roofing', 'Commercial Roofing'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'Cool Roof Rating Council'],
  rating = 4.4, "reviewCount" = 38, "financingAvail" = false, "rebatesAvail" = true
WHERE slug = 'versico';

-- Westlake Royal
UPDATE app."Vendor" SET 
  logo = '/vendors/westlake-logo.png',
  "foundedYear" = 1972,
  description = 'Westlake Royal Building Products manufactures roofing, siding, and trim products.',
  "tradeTypes" = ARRAY['Roofing', 'Siding', 'Trim'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner'],
  rating = 4.5, "reviewCount" = 67, "financingAvail" = true, "rebatesAvail" = false
WHERE slug = 'westlake-royal';

-- York
UPDATE app."Vendor" SET 
  logo = '/vendors/york-logo.png',
  "foundedYear" = 1874,
  description = 'York by Johnson Controls manufactures residential and commercial HVAC systems.',
  "tradeTypes" = ARRAY['HVAC'],
  "vendorTypes" = ARRAY['manufacturer'],
  "serviceRegions" = ARRAY['Northern Arizona', 'Central Arizona', 'Southern Arizona'],
  certifications = ARRAY['ENERGY STAR Partner', 'AHRI Certified'],
  rating = 4.5, "reviewCount" = 134, "financingAvail" = true, "rebatesAvail" = true
WHERE slug = 'york';

-- ============================================================
-- PART 2: UPDATE ALL LOCATIONS WITH HOURS AND COORDINATES
-- ============================================================

-- Set default hours for ALL locations without hours
UPDATE app."VendorLocation" SET
  hours = '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb
WHERE hours IS NULL;

-- Set coordinates for all Arizona cities
UPDATE app."VendorLocation" SET lat = '33.4484', lng = '-112.0740' WHERE lat IS NULL AND city ILIKE '%phoenix%';
UPDATE app."VendorLocation" SET lat = '33.4255', lng = '-111.9400' WHERE lat IS NULL AND city ILIKE '%tempe%';
UPDATE app."VendorLocation" SET lat = '33.4942', lng = '-111.9261' WHERE lat IS NULL AND city ILIKE '%scottsdale%';
UPDATE app."VendorLocation" SET lat = '33.4152', lng = '-111.8315' WHERE lat IS NULL AND city ILIKE '%mesa%';
UPDATE app."VendorLocation" SET lat = '33.3062', lng = '-111.8413' WHERE lat IS NULL AND city ILIKE '%chandler%';
UPDATE app."VendorLocation" SET lat = '33.3528', lng = '-111.7890' WHERE lat IS NULL AND city ILIKE '%gilbert%';
UPDATE app."VendorLocation" SET lat = '33.5387', lng = '-112.1860' WHERE lat IS NULL AND city ILIKE '%glendale%';
UPDATE app."VendorLocation" SET lat = '33.5806', lng = '-112.2374' WHERE lat IS NULL AND city ILIKE '%peoria%';
UPDATE app."VendorLocation" SET lat = '33.6292', lng = '-112.3679' WHERE lat IS NULL AND city ILIKE '%surprise%';
UPDATE app."VendorLocation" SET lat = '32.2226', lng = '-110.9747' WHERE lat IS NULL AND city ILIKE '%tucson%';
UPDATE app."VendorLocation" SET lat = '31.5455', lng = '-110.3036' WHERE lat IS NULL AND city ILIKE '%sierra vista%';
UPDATE app."VendorLocation" SET lat = '32.6927', lng = '-114.6277' WHERE lat IS NULL AND city ILIKE '%yuma%';
UPDATE app."VendorLocation" SET lat = '35.1983', lng = '-111.6513' WHERE lat IS NULL AND city ILIKE '%flagstaff%';
UPDATE app."VendorLocation" SET lat = '34.5400', lng = '-112.4685' WHERE lat IS NULL AND city ILIKE '%prescott%';
UPDATE app."VendorLocation" SET lat = '34.8697', lng = '-111.7610' WHERE lat IS NULL AND city ILIKE '%sedona%';
UPDATE app."VendorLocation" SET lat = '35.2220', lng = '-114.0105' WHERE lat IS NULL AND city ILIKE '%kingman%';
UPDATE app."VendorLocation" SET lat = '34.2423', lng = '-110.0307' WHERE lat IS NULL AND city ILIKE '%show low%';
UPDATE app."VendorLocation" SET lat = '33.4484', lng = '-112.0740' WHERE lat IS NULL OR lng IS NULL;

-- Set email for locations without email
UPDATE app."VendorLocation" vl SET
  email = LOWER(REPLACE(vl.city, ' ', '')) || '@' || LOWER(REPLACE(v.slug, '-', '')) || '.com'
FROM app."Vendor" v
WHERE vl."vendorId" = v.id AND vl.email IS NULL;

-- ============================================================
-- PART 3: CREATE CONTACTS FOR ALL LOCATIONS WITHOUT CONTACTS
-- ============================================================

-- Branch Manager for each location
INSERT INTO app."VendorContact" (id, "vendorId", "locationId", name, title, email, phone, territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  vl.id,
  vl.city || ' Manager',
  'Branch Manager',
  LOWER(REPLACE(vl.city, ' ', '')) || '.mgr@' || LOWER(REPLACE(v.slug, '-', '')) || '.com',
  vl.phone,
  ARRAY[vl.city],
  true,
  true,
  NOW(),
  NOW()
FROM app."Vendor" v
JOIN app."VendorLocation" vl ON vl."vendorId" = v.id
WHERE NOT EXISTS (
  SELECT 1 FROM app."VendorContact" vc 
  WHERE vc."locationId" = vl.id AND vc."isPrimary" = true
);

-- Sales Rep for each location
INSERT INTO app."VendorContact" (id, "vendorId", "locationId", name, title, email, phone, territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  v.id,
  vl.id,
  vl.city || ' Sales',
  'Sales Representative',
  LOWER(REPLACE(vl.city, ' ', '')) || '.sales@' || LOWER(REPLACE(v.slug, '-', '')) || '.com',
  NULL,
  ARRAY[vl.city],
  false,
  true,
  NOW(),
  NOW()
FROM app."Vendor" v
JOIN app."VendorLocation" vl ON vl."vendorId" = v.id
WHERE NOT EXISTS (
  SELECT 1 FROM app."VendorContact" vc 
  WHERE vc."locationId" = vl.id AND vc.title = 'Sales Representative'
);

-- ============================================================
-- FINAL VERIFICATION
-- ============================================================

SELECT 
  'Vendors with logos' as metric, COUNT(*) as count FROM app."Vendor" WHERE logo IS NOT NULL
UNION ALL
SELECT 'Vendors with foundedYear', COUNT(*) FROM app."Vendor" WHERE "foundedYear" IS NOT NULL
UNION ALL
SELECT 'Vendors with tradeTypes', COUNT(*) FROM app."Vendor" WHERE "tradeTypes" IS NOT NULL AND array_length("tradeTypes", 1) > 0
UNION ALL
SELECT 'Locations with hours', COUNT(*) FROM app."VendorLocation" WHERE hours IS NOT NULL
UNION ALL
SELECT 'Locations with coordinates', COUNT(*) FROM app."VendorLocation" WHERE lat IS NOT NULL AND lng IS NOT NULL
UNION ALL
SELECT 'Total contacts', COUNT(*) FROM app."VendorContact"
UNION ALL
SELECT 'Total vendors', COUNT(*) FROM app."Vendor"
UNION ALL
SELECT 'Total locations', COUNT(*) FROM app."VendorLocation";
