-- ============================================================================
-- Vendor Location Hours Update Migration
-- Adds business hours to existing vendor locations
-- Execute: psql "$DATABASE_URL" -f ./db/migrations/20260209_vendor_location_hours.sql
-- ============================================================================

BEGIN;
SET search_path TO app, public;

-- Standard business hours JSON template
-- M-F 7am-5pm, Sat 8am-12pm (typical contractor supply hours)

-- Update ABC Supply locations with hours
UPDATE "VendorLocation" SET hours = '{
  "monday": "7:00 AM - 5:00 PM",
  "tuesday": "7:00 AM - 5:00 PM",
  "wednesday": "7:00 AM - 5:00 PM",
  "thursday": "7:00 AM - 5:00 PM",
  "friday": "7:00 AM - 5:00 PM",
  "saturday": "7:00 AM - 12:00 PM",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'abc-supply');

-- Update Beacon locations with hours
UPDATE "VendorLocation" SET hours = '{
  "monday": "6:30 AM - 5:00 PM",
  "tuesday": "6:30 AM - 5:00 PM",
  "wednesday": "6:30 AM - 5:00 PM",
  "thursday": "6:30 AM - 5:00 PM",
  "friday": "6:30 AM - 5:00 PM",
  "saturday": "7:00 AM - 12:00 PM",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'beacon');

-- Update SRS Distribution locations
UPDATE "VendorLocation" SET hours = '{
  "monday": "7:00 AM - 4:30 PM",
  "tuesday": "7:00 AM - 4:30 PM",
  "wednesday": "7:00 AM - 4:30 PM",
  "thursday": "7:00 AM - 4:30 PM",
  "friday": "7:00 AM - 4:30 PM",
  "saturday": "Closed",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'srs-distribution');

-- Update GAF locations (manufacturer - likely office hours)
UPDATE "VendorLocation" SET hours = '{
  "monday": "8:00 AM - 5:00 PM",
  "tuesday": "8:00 AM - 5:00 PM",
  "wednesday": "8:00 AM - 5:00 PM",
  "thursday": "8:00 AM - 5:00 PM",
  "friday": "8:00 AM - 5:00 PM",
  "saturday": "Closed",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'gaf');

-- Update Owens Corning locations
UPDATE "VendorLocation" SET hours = '{
  "monday": "8:00 AM - 5:00 PM",
  "tuesday": "8:00 AM - 5:00 PM",
  "wednesday": "8:00 AM - 5:00 PM",
  "thursday": "8:00 AM - 5:00 PM",
  "friday": "8:00 AM - 5:00 PM",
  "saturday": "Closed",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'owens-corning');

-- Update Home Depot Pro locations (extended hours)
UPDATE "VendorLocation" SET hours = '{
  "monday": "6:00 AM - 10:00 PM",
  "tuesday": "6:00 AM - 10:00 PM",
  "wednesday": "6:00 AM - 10:00 PM",
  "thursday": "6:00 AM - 10:00 PM",
  "friday": "6:00 AM - 10:00 PM",
  "saturday": "6:00 AM - 10:00 PM",
  "sunday": "7:00 AM - 9:00 PM"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'home-depot');

-- Update Lowes Pro locations (extended hours)
UPDATE "VendorLocation" SET hours = '{
  "monday": "6:00 AM - 10:00 PM",
  "tuesday": "6:00 AM - 10:00 PM",
  "wednesday": "6:00 AM - 10:00 PM",
  "thursday": "6:00 AM - 10:00 PM",
  "friday": "6:00 AM - 10:00 PM",
  "saturday": "6:00 AM - 10:00 PM",
  "sunday": "7:00 AM - 9:00 PM"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'lowes');

-- Update Elite Roofing Supply (typical distributor hours)
UPDATE "VendorLocation" SET hours = '{
  "monday": "6:30 AM - 4:30 PM",
  "tuesday": "6:30 AM - 4:30 PM",
  "wednesday": "6:30 AM - 4:30 PM",
  "thursday": "6:30 AM - 4:30 PM",
  "friday": "6:30 AM - 4:30 PM",
  "saturday": "7:00 AM - 12:00 PM",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'elite-roofing-supply');

-- Update Ferguson Enterprises locations
UPDATE "VendorLocation" SET hours = '{
  "monday": "7:00 AM - 5:00 PM",
  "tuesday": "7:00 AM - 5:00 PM",
  "wednesday": "7:00 AM - 5:00 PM",
  "thursday": "7:00 AM - 5:00 PM",
  "friday": "7:00 AM - 5:00 PM",
  "saturday": "7:00 AM - 12:00 PM",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'ferguson');

-- Update Grainger locations
UPDATE "VendorLocation" SET hours = '{
  "monday": "7:00 AM - 5:00 PM",
  "tuesday": "7:00 AM - 5:00 PM",
  "wednesday": "7:00 AM - 5:00 PM",
  "thursday": "7:00 AM - 5:00 PM",
  "friday": "7:00 AM - 5:00 PM",
  "saturday": "8:00 AM - 12:00 PM",
  "sunday": "Closed"
}'::jsonb
WHERE "vendorId" = (SELECT id FROM "Vendor" WHERE slug = 'grainger');

-- Set default hours for any location without hours (typical supply house)
UPDATE "VendorLocation" 
SET hours = '{
  "monday": "7:00 AM - 5:00 PM",
  "tuesday": "7:00 AM - 5:00 PM",
  "wednesday": "7:00 AM - 5:00 PM",
  "thursday": "7:00 AM - 5:00 PM",
  "friday": "7:00 AM - 5:00 PM",
  "saturday": "Closed",
  "sunday": "Closed"
}'::jsonb
WHERE hours IS NULL;

COMMIT;

-- Summary
SELECT 
  v.name as vendor_name,
  COUNT(vl.id) as locations_with_hours
FROM "Vendor" v
LEFT JOIN "VendorLocation" vl ON v.id = vl."vendorId" AND vl.hours IS NOT NULL
GROUP BY v.name
ORDER BY locations_with_hours DESC
LIMIT 20;
