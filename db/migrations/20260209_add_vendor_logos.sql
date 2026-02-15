-- Add logos to existing vendors
-- Execute with: psql "$DATABASE_URL" -f ./db/migrations/20260209_add_vendor_logos.sql

BEGIN;

-- Update major vendors with their official logos
-- Using CDN-hosted SVG/PNG logos where available

-- ABC Supply
UPDATE "Vendor" 
SET 
  logo = 'https://www.abcsupply.com/-/media/ABCSupply/Logo/abc-supply-logo.png',
  "tradeTypes" = ARRAY['roofing', 'siding', 'windows_doors', 'gutters'],
  "vendorTypes" = ARRAY['distributor'],
  "isFeatured" = true,
  "isVerified" = true
WHERE slug = 'abc-supply';

-- SRS Distribution  
UPDATE "Vendor"
SET
  logo = 'https://logo.clearbit.com/srsdistribution.com',
  "tradeTypes" = ARRAY['roofing', 'siding', 'insulation'],
  "vendorTypes" = ARRAY['distributor'],
  "isFeatured" = true,
  "isVerified" = true
WHERE slug = 'srs';

-- Add more vendors with logos via upsert
INSERT INTO "Vendor" (
  "id", "slug", "name", "description", "category", "logo",
  "website", "primaryPhone", "primaryEmail",
  "tradeTypes", "vendorTypes", "serviceRegions",
  "isActive", "isVerified", "isFeatured",
  "financingAvail", "rebatesAvail", "certifications"
) VALUES
  (
    'vendor-gaf',
    'gaf',
    'GAF Materials',
    'North America''s largest roofing manufacturer with 130+ years of innovation.',
    'Roofing Manufacturer',
    'https://logo.clearbit.com/gaf.com',
    'https://www.gaf.com',
    '(877) 423-7663',
    'info@gaf.com',
    ARRAY['roofing'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Master Elite Certified', 'Energy Star Partner']
  ),
  (
    'vendor-owens-corning',
    'owens-corning',
    'Owens Corning',
    'Global leader in roofing, insulation, and fiberglass composites.',
    'Roofing & Insulation Manufacturer',
    'https://logo.clearbit.com/owenscorning.com',
    'https://www.owenscorning.com',
    '(800) 438-7465',
    'info@owenscorning.com',
    ARRAY['roofing', 'insulation'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Platinum Preferred', 'Energy Star Partner']
  ),
  (
    'vendor-certainteed',
    'certainteed',
    'CertainTeed',
    'Premium building materials manufacturer - roofing, siding, insulation.',
    'Building Materials Manufacturer',
    'https://logo.clearbit.com/certainteed.com',
    'https://www.certainteed.com',
    '(800) 233-8990',
    'info@certainteed.com',
    ARRAY['roofing', 'siding', 'insulation'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['SELECT ShingleMaster', 'Master Craftsman']
  ),
  (
    'vendor-beacon',
    'beacon-building-products',
    'Beacon Building Products',
    'Leading roofing and building products distributor with nationwide coverage.',
    'Roofing Distributor',
    'https://logo.clearbit.com/becn.com',
    'https://www.becn.com',
    '(602) 276-5811',
    'info@becn.com',
    ARRAY['roofing', 'siding', 'windows_doors', 'insulation'],
    ARRAY['distributor'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Beacon Pro+']
  ),
  (
    'vendor-home-depot',
    'home-depot',
    'The Home Depot',
    'The largest home improvement retailer in the United States.',
    'Home Improvement Retailer',
    'https://logo.clearbit.com/homedepot.com',
    'https://www.homedepot.com',
    '(800) 466-3337',
    'pro@homedepot.com',
    ARRAY['roofing', 'plumbing', 'electrical', 'hvac', 'painting', 'flooring', 'landscaping', 'windows_doors'],
    ARRAY['retailer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Pro Xtra']
  ),
  (
    'vendor-lowes',
    'lowes',
    'Lowe''s',
    'Home improvement and appliance store serving DIYers and professionals.',
    'Home Improvement Retailer',
    'https://logo.clearbit.com/lowes.com',
    'https://www.lowes.com',
    '(800) 445-6937',
    'pro@lowes.com',
    ARRAY['roofing', 'plumbing', 'electrical', 'hvac', 'painting', 'flooring', 'landscaping', 'windows_doors'],
    ARRAY['retailer'],
    ARRAY['arizona', 'national'],
    true, true, false,
    true, true, ARRAY['MVPs Pro Rewards']
  ),
  (
    'vendor-ferguson',
    'ferguson',
    'Ferguson Enterprises',
    'Largest distributor of plumbing supplies and HVAC equipment.',
    'Plumbing & HVAC Distributor',
    'https://logo.clearbit.com/ferguson.com',
    'https://www.ferguson.com',
    '(800) 638-8875',
    'info@ferguson.com',
    ARRAY['plumbing', 'hvac', 'electrical'],
    ARRAY['distributor', 'wholesaler'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, false, ARRAY['Ferguson Pro']
  ),
  (
    'vendor-sunbelt-rentals',
    'sunbelt-rentals',
    'Sunbelt Rentals',
    'Equipment rental company serving contractors and industry professionals.',
    'Equipment Rental',
    'https://logo.clearbit.com/sunbeltrentals.com',
    'https://www.sunbeltrentals.com',
    '(800) 667-9328',
    'info@sunbeltrentals.com',
    ARRAY['general_contractor', 'demolition', 'excavation', 'landscaping'],
    ARRAY['rental_yard'],
    ARRAY['arizona', 'national'],
    true, true, false,
    false, false, ARRAY[]
  ),
  (
    'vendor-united-rentals',
    'united-rentals',
    'United Rentals',
    'World''s largest equipment rental company with extensive inventory.',
    'Equipment Rental',
    'https://logo.clearbit.com/unitedrentals.com',
    'https://www.unitedrentals.com',
    '(800) 877-8368',
    'customercare@ur.com',
    ARRAY['general_contractor', 'demolition', 'excavation', 'landscaping', 'concrete'],
    ARRAY['rental_yard'],
    ARRAY['arizona', 'national'],
    true, true, true,
    false, false, ARRAY['Total Control']
  ),
  (
    'vendor-servpro',
    'servpro',
    'SERVPRO',
    'Fire and water damage cleanup and restoration specialists.',
    'Restoration Services',
    'https://logo.clearbit.com/servpro.com',
    'https://www.servpro.com',
    '(800) 737-8776',
    'info@servpro.com',
    ARRAY['restoration', 'water_mold', 'fire'],
    ARRAY['specialty'],
    ARRAY['arizona', 'national'],
    true, true, true,
    false, false, ARRAY['IICRC Certified', 'EPA Lead-Safe Certified']
  ),
  (
    'vendor-pella',
    'pella',
    'Pella Windows & Doors',
    'Premium windows and doors manufacturer with innovative designs.',
    'Windows & Doors Manufacturer',
    'https://logo.clearbit.com/pella.com',
    'https://www.pella.com',
    '(877) 473-5527',
    'info@pella.com',
    ARRAY['windows_doors'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Pella Certified Contractor']
  ),
  (
    'vendor-andersen',
    'andersen-windows',
    'Andersen Windows',
    'The most trusted window and door brand for over 115 years.',
    'Windows & Doors Manufacturer',
    'https://logo.clearbit.com/andersenwindows.com',
    'https://www.andersenwindows.com',
    '(888) 888-7020',
    'info@andersencorp.com',
    ARRAY['windows_doors'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Andersen Certified Contractor']
  ),
  (
    'vendor-lennox',
    'lennox',
    'Lennox International',
    'Leading provider of climate control solutions for heating and cooling.',
    'HVAC Manufacturer',
    'https://logo.clearbit.com/lennox.com',
    'https://www.lennox.com',
    '(800) 953-6669',
    'info@lennoxinternational.com',
    ARRAY['hvac'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Lennox Premier Dealer']
  ),
  (
    'vendor-carrier',
    'carrier',
    'Carrier',
    'World leader in HVAC, refrigeration, and fire & security solutions.',
    'HVAC Manufacturer',
    'https://logo.clearbit.com/carrier.com',
    'https://www.carrier.com',
    '(800) 227-7437',
    'info@carrier.com',
    ARRAY['hvac'],
    ARRAY['manufacturer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    true, true, ARRAY['Carrier Factory Authorized']
  ),
  (
    'vendor-sherwin-williams',
    'sherwin-williams',
    'Sherwin-Williams',
    'America''s largest specialty paint retailer and manufacturer.',
    'Paint & Coatings',
    'https://logo.clearbit.com/sherwin-williams.com',
    'https://www.sherwin-williams.com',
    '(800) 474-3794',
    'pro@sherwin.com',
    ARRAY['painting'],
    ARRAY['manufacturer', 'retailer'],
    ARRAY['arizona', 'national'],
    true, true, true,
    false, true, ARRAY['Pro Account']
  ),
  (
    'vendor-floor-and-decor',
    'floor-and-decor',
    'Floor & Decor',
    'Hard surface flooring and tile retailer for professionals and DIY.',
    'Flooring Retailer',
    'https://logo.clearbit.com/flooranddecor.com',
    'https://www.flooranddecor.com',
    '(877) 675-0002',
    'pro@flooranddecor.com',
    ARRAY['flooring', 'tile'],
    ARRAY['retailer'],
    ARRAY['arizona', 'national'],
    true, true, false,
    true, false, ARRAY['PRO Premier']
  )
ON CONFLICT ("slug") DO UPDATE SET
  logo = EXCLUDED.logo,
  "tradeTypes" = EXCLUDED."tradeTypes",
  "vendorTypes" = EXCLUDED."vendorTypes",
  "isFeatured" = EXCLUDED."isFeatured",
  "isVerified" = EXCLUDED."isVerified",
  "financingAvail" = EXCLUDED."financingAvail",
  "rebatesAvail" = EXCLUDED."rebatesAvail",
  "certifications" = EXCLUDED."certifications",
  "updatedAt" = NOW();

-- Add service regions to existing vendors
UPDATE "Vendor"
SET "serviceRegions" = ARRAY['arizona']
WHERE "serviceRegions" = ARRAY[]::text[] OR "serviceRegions" IS NULL;

COMMIT;

SELECT 'Vendor logos and metadata updated' AS status;
