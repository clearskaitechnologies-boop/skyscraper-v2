-- ============================================================================
-- VENDOR EXPANSION MIGRATION
-- Date: 2026-02-09
-- Description: Adds foundedYear, updates hours, adds logos for all vendors
-- ============================================================================

BEGIN;

-- 1) Add foundedYear column to Vendor table
ALTER TABLE "Vendor"
  ADD COLUMN IF NOT EXISTS "foundedYear" INTEGER;

-- 2) Update foundedYear for all major manufacturers
UPDATE "Vendor" SET "foundedYear" = 1886 WHERE slug = 'gaf';
UPDATE "Vendor" SET "foundedYear" = 1938 WHERE slug = 'owens-corning';
UPDATE "Vendor" SET "foundedYear" = 1904 WHERE slug = 'certainteed';
UPDATE "Vendor" SET "foundedYear" = 1946 WHERE slug = 'iko';
UPDATE "Vendor" SET "foundedYear" = 1944 WHERE slug = 'tamko';
UPDATE "Vendor" SET "foundedYear" = 1956 WHERE slug = 'malarkey';
UPDATE "Vendor" SET "foundedYear" = 1982 WHERE slug = 'atlas-roofing';
UPDATE "Vendor" SET "foundedYear" = 1957 WHERE slug = 'decra';
UPDATE "Vendor" SET "foundedYear" = 1999 WHERE slug = 'davinci-roofscapes';

-- Windows
UPDATE "Vendor" SET "foundedYear" = 1903 WHERE slug = 'andersen-windows';
UPDATE "Vendor" SET "foundedYear" = 1925 WHERE slug = 'pella';
UPDATE "Vendor" SET "foundedYear" = 1977 WHERE slug = 'provia';
UPDATE "Vendor" SET "foundedYear" = 1958 WHERE slug = 'milgard';
UPDATE "Vendor" SET "foundedYear" = 1912 WHERE slug = 'marvin';
UPDATE "Vendor" SET "foundedYear" = 1946 WHERE slug = 'simonton';
UPDATE "Vendor" SET "foundedYear" = 1943 WHERE slug = 'jeld-wen';

-- Siding
UPDATE "Vendor" SET "foundedYear" = 1983 WHERE slug = 'james-hardie';
UPDATE "Vendor" SET "foundedYear" = 1997 WHERE slug = 'lp-smartside';
UPDATE "Vendor" SET "foundedYear" = 1970 WHERE slug = 'royal-building';
UPDATE "Vendor" SET "foundedYear" = 1947 WHERE slug = 'alside';

-- HVAC
UPDATE "Vendor" SET "foundedYear" = 1885 WHERE slug = 'trane';
UPDATE "Vendor" SET "foundedYear" = 1915 WHERE slug = 'carrier';
UPDATE "Vendor" SET "foundedYear" = 1895 WHERE slug = 'lennox';
UPDATE "Vendor" SET "foundedYear" = 1982 WHERE slug = 'goodman';
UPDATE "Vendor" SET "foundedYear" = 1924 WHERE slug = 'daikin';
UPDATE "Vendor" SET "foundedYear" = 1925 WHERE slug = 'rheem';
UPDATE "Vendor" SET "foundedYear" = 1874 WHERE slug = 'york';
UPDATE "Vendor" SET "foundedYear" = 1881 WHERE slug = 'american-standard-hvac';

-- Plumbing
UPDATE "Vendor" SET "foundedYear" = 1937 WHERE slug = 'moen';
UPDATE "Vendor" SET "foundedYear" = 1954 WHERE slug = 'delta-faucet';
UPDATE "Vendor" SET "foundedYear" = 1873 WHERE slug = 'kohler';
UPDATE "Vendor" SET "foundedYear" = 1875 WHERE slug = 'american-standard';
UPDATE "Vendor" SET "foundedYear" = 1920 WHERE slug = 'rinnai';
UPDATE "Vendor" SET "foundedYear" = 1874 WHERE slug = 'ao-smith';
UPDATE "Vendor" SET "foundedYear" = 1978 WHERE slug = 'navien';

-- Electrical
UPDATE "Vendor" SET "foundedYear" = 1911 WHERE slug = 'eaton';
UPDATE "Vendor" SET "foundedYear" = 1906 WHERE slug = 'leviton';
UPDATE "Vendor" SET "foundedYear" = 1902 WHERE slug = 'square-d';
UPDATE "Vendor" SET "foundedYear" = 1961 WHERE slug = 'lutron';
UPDATE "Vendor" SET "foundedYear" = 1959 WHERE slug = 'generac';
UPDATE "Vendor" SET "foundedYear" = 1847 WHERE slug = 'siemens-electrical';
UPDATE "Vendor" SET "foundedYear" = 1888 WHERE slug = 'hubbell';

-- Insulation
UPDATE "Vendor" SET "foundedYear" = 1858 WHERE slug = 'johns-manville';
UPDATE "Vendor" SET "foundedYear" = 1932 WHERE slug = 'knauf';
UPDATE "Vendor" SET "foundedYear" = 1937 WHERE slug = 'rockwool';
UPDATE "Vendor" SET "foundedYear" = 1986 WHERE slug = 'icynene';

-- Gutters
UPDATE "Vendor" SET "foundedYear" = 2005 WHERE slug = 'leaffilter';
UPDATE "Vendor" SET "foundedYear" = 2001 WHERE slug = 'leafguard';
UPDATE "Vendor" SET "foundedYear" = 1988 WHERE slug = 'spectra-metals';

-- Paint
UPDATE "Vendor" SET "foundedYear" = 1866 WHERE slug = 'sherwin-williams';
UPDATE "Vendor" SET "foundedYear" = 1883 WHERE slug = 'benjamin-moore';
UPDATE "Vendor" SET "foundedYear" = 1947 WHERE slug = 'behr';
UPDATE "Vendor" SET "foundedYear" = 1925 WHERE slug = 'dunn-edwards';

-- Flooring
UPDATE "Vendor" SET "foundedYear" = 1946 WHERE slug = 'shaw-industries';
UPDATE "Vendor" SET "foundedYear" = 1878 WHERE slug = 'mohawk';
UPDATE "Vendor" SET "foundedYear" = 1915 WHERE slug = 'mannington';

-- Distributors
UPDATE "Vendor" SET "foundedYear" = 1982 WHERE slug = 'abc-supply';
UPDATE "Vendor" SET "foundedYear" = 1928 WHERE slug = 'beacon-building';
UPDATE "Vendor" SET "foundedYear" = 2008 WHERE slug = 'srs-distribution';

-- 3) Update logo paths for all vendors (using CDN-ready paths)
UPDATE "Vendor" SET logo = '/vendors/gaf-logo.png' WHERE slug = 'gaf';
UPDATE "Vendor" SET logo = '/vendors/owens-corning-logo.png' WHERE slug = 'owens-corning';
UPDATE "Vendor" SET logo = '/vendors/certainteed-logo.png' WHERE slug = 'certainteed';
UPDATE "Vendor" SET logo = '/vendors/iko-logo.png' WHERE slug = 'iko';
UPDATE "Vendor" SET logo = '/vendors/tamko-logo.png' WHERE slug = 'tamko';
UPDATE "Vendor" SET logo = '/vendors/malarkey-logo.png' WHERE slug = 'malarkey';
UPDATE "Vendor" SET logo = '/vendors/atlas-roofing-logo.png' WHERE slug = 'atlas-roofing';
UPDATE "Vendor" SET logo = '/vendors/decra-logo.png' WHERE slug = 'decra';
UPDATE "Vendor" SET logo = '/vendors/andersen-logo.png' WHERE slug = 'andersen-windows';
UPDATE "Vendor" SET logo = '/vendors/pella-logo.png' WHERE slug = 'pella';
UPDATE "Vendor" SET logo = '/vendors/provia-logo.png' WHERE slug = 'provia';
UPDATE "Vendor" SET logo = '/vendors/milgard-logo.png' WHERE slug = 'milgard';
UPDATE "Vendor" SET logo = '/vendors/marvin-logo.png' WHERE slug = 'marvin';
UPDATE "Vendor" SET logo = '/vendors/james-hardie-logo.png' WHERE slug = 'james-hardie';
UPDATE "Vendor" SET logo = '/vendors/lp-smartside-logo.png' WHERE slug = 'lp-smartside';
UPDATE "Vendor" SET logo = '/vendors/trane-logo.png' WHERE slug = 'trane';
UPDATE "Vendor" SET logo = '/vendors/carrier-logo.png' WHERE slug = 'carrier';
UPDATE "Vendor" SET logo = '/vendors/lennox-logo.png' WHERE slug = 'lennox';
UPDATE "Vendor" SET logo = '/vendors/daikin-logo.png' WHERE slug = 'daikin';
UPDATE "Vendor" SET logo = '/vendors/rheem-logo.png' WHERE slug = 'rheem';
UPDATE "Vendor" SET logo = '/vendors/kohler-logo.png' WHERE slug = 'kohler';
UPDATE "Vendor" SET logo = '/vendors/moen-logo.png' WHERE slug = 'moen';
UPDATE "Vendor" SET logo = '/vendors/delta-logo.png' WHERE slug = 'delta-faucet';
UPDATE "Vendor" SET logo = '/vendors/generac-logo.png' WHERE slug = 'generac';
UPDATE "Vendor" SET logo = '/vendors/lutron-logo.png' WHERE slug = 'lutron';
UPDATE "Vendor" SET logo = '/vendors/eaton-logo.png' WHERE slug = 'eaton';
UPDATE "Vendor" SET logo = '/vendors/sherwin-williams-logo.png' WHERE slug = 'sherwin-williams';
UPDATE "Vendor" SET logo = '/vendors/benjamin-moore-logo.png' WHERE slug = 'benjamin-moore';
UPDATE "Vendor" SET logo = '/vendors/rockwool-logo.png' WHERE slug = 'rockwool';
UPDATE "Vendor" SET logo = '/vendors/leaffilter-logo.png' WHERE slug = 'leaffilter';
UPDATE "Vendor" SET logo = '/vendors/abc-supply-logo.png' WHERE slug = 'abc-supply';
UPDATE "Vendor" SET logo = '/vendors/beacon-logo.png' WHERE slug = 'beacon-building';
UPDATE "Vendor" SET logo = '/vendors/srs-logo.png' WHERE slug = 'srs-distribution';
UPDATE "Vendor" SET logo = '/vendors/shaw-logo.png' WHERE slug = 'shaw-industries';
UPDATE "Vendor" SET logo = '/vendors/mohawk-logo.png' WHERE slug = 'mohawk';

-- 4) Add hours to VendorLocation for distributors (typical branch hours)
UPDATE "VendorLocation" 
SET hours = '{
  "mon": "6:30 AM - 4:30 PM",
  "tue": "6:30 AM - 4:30 PM",
  "wed": "6:30 AM - 4:30 PM",
  "thu": "6:30 AM - 4:30 PM",
  "fri": "6:30 AM - 4:30 PM",
  "sat": "7:00 AM - 12:00 PM",
  "sun": "Closed"
}'::jsonb
WHERE "vendorId" IN (SELECT id FROM "Vendor" WHERE slug IN ('abc-supply', 'beacon-building', 'srs-distribution'));

-- Add hours for paint stores (Sherwin-Williams, Benjamin Moore)
UPDATE "VendorLocation"
SET hours = '{
  "mon": "7:00 AM - 6:00 PM",
  "tue": "7:00 AM - 6:00 PM",
  "wed": "7:00 AM - 6:00 PM",
  "thu": "7:00 AM - 6:00 PM",
  "fri": "7:00 AM - 6:00 PM",
  "sat": "8:00 AM - 5:00 PM",
  "sun": "10:00 AM - 4:00 PM"
}'::jsonb
WHERE "vendorId" IN (SELECT id FROM "Vendor" WHERE slug IN ('sherwin-williams', 'benjamin-moore', 'dunn-edwards', 'behr'));

COMMIT;

-- Verify counts (run separately after transaction commits)
-- SELECT 
--   (SELECT COUNT(*) FROM "Vendor" WHERE "foundedYear" IS NOT NULL) AS vendors_with_year,
--   (SELECT COUNT(*) FROM "Vendor" WHERE logo IS NOT NULL AND logo != '') AS vendors_with_logo,
--   (SELECT COUNT(*) FROM "VendorLocation" WHERE hours IS NOT NULL) AS locations_with_hours;
