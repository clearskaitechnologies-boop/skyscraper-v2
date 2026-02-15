-- Add ABC Supply Northern Arizona Locations
-- Migration: 20251221_abc_supply_northern_arizona.sql

INSERT INTO "VendorLocation" ("vendorId", "name", "address", "city", "state", "zip", "phone", "hours", "lat", "lng", "isActive")
VALUES 
  -- Flagstaff
  ('vendor-abc-supply', 'ABC Supply - Flagstaff', '2750 E Huntington Dr', 'Flagstaff', 'AZ', '86004', '(928) 526-4741',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   35.1981, -111.6051, true),
  
  -- Prescott
  ('vendor-abc-supply', 'ABC Supply - Prescott', '1250 E Sheldon St', 'Prescott', 'AZ', '86301', '(928) 445-8230',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   34.5400, -112.4321, true),
  
  -- Sedona (Verde Valley location)
  ('vendor-abc-supply', 'ABC Supply - Cottonwood', '2025 E Cherry St', 'Cottonwood', 'AZ', '86326', '(928) 634-9663',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   34.7242, -112.0090, true),
  
  -- Show Low (White Mountains location)
  ('vendor-abc-supply', 'ABC Supply - Show Low', '1951 E Deuce of Clubs', 'Show Low', 'AZ', '85901', '(928) 537-8644',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   34.2542, -110.0064, true)

ON CONFLICT DO NOTHING;

-- Verify Northern Arizona coverage
-- SELECT "name", "city", "state", "lat", "lng" 
-- FROM "VendorLocation" 
-- WHERE "vendorId" = 'vendor-abc-supply' 
-- AND "state" = 'AZ'
-- ORDER BY "city";
