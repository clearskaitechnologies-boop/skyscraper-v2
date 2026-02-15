-- Add VendorLocation records with lat/lng coordinates for map display
-- Execute with: psql "$DATABASE_URL" -f ./db/migrations/20251224_add_vendor_locations.sql

BEGIN;

-- Helper: Insert location if vendor exists
-- Uses subquery to get vendor ID dynamically since we use gen_random_uuid()

-- 1. GAF - HQ Wayne, NJ
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'GAF Headquarters', '1 Campus Drive', 'Parsippany', 'NJ', '07054', '1-877-423-7663', '40.8598', '-74.4265', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'gaf' AND NOT EXISTS (SELECT 1 FROM "VendorLocation" WHERE "vendorId" = "Vendor".id);

-- GAF Arizona Distribution
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'GAF Phoenix Distribution', '4020 E. Indian School Rd', 'Phoenix', 'AZ', '85018', '1-602-277-0281', '33.4942', '-111.9993', '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"Closed","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'gaf' ON CONFLICT DO NOTHING;

-- 2. ABC Supply locations
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'ABC Supply - Phoenix Central', '2222 W. Peoria Ave', 'Phoenix', 'AZ', '85029', '602-864-0100', '33.5811', '-112.0958', '{"mon":"6:00 AM - 5:00 PM","tue":"6:00 AM - 5:00 PM","wed":"6:00 AM - 5:00 PM","thu":"6:00 AM - 5:00 PM","fri":"6:00 AM - 5:00 PM","sat":"7:00 AM - 12:00 PM","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'abc-supply' ON CONFLICT DO NOTHING;

INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'ABC Supply - Mesa', '1330 S. Country Club Dr', 'Mesa', 'AZ', '85210', '480-834-2002', '33.3900', '-111.8389', '{"mon":"6:00 AM - 5:00 PM","tue":"6:00 AM - 5:00 PM","wed":"6:00 AM - 5:00 PM","thu":"6:00 AM - 5:00 PM","fri":"6:00 AM - 5:00 PM","sat":"7:00 AM - 12:00 PM","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'abc-supply' ON CONFLICT DO NOTHING;

INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'ABC Supply - Tucson', '4325 E. Speedway Blvd', 'Tucson', 'AZ', '85712', '520-881-0277', '32.2361', '-110.8929', '{"mon":"6:00 AM - 5:00 PM","tue":"6:00 AM - 5:00 PM","wed":"6:00 AM - 5:00 PM","thu":"6:00 AM - 5:00 PM","fri":"6:00 AM - 5:00 PM","sat":"7:00 AM - 12:00 PM","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'abc-supply' ON CONFLICT DO NOTHING;

-- 3. SRS Distribution
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'SRS Distribution - Phoenix', '3640 E. McDowell Rd', 'Phoenix', 'AZ', '85008', '602-275-5515', '33.4652', '-111.9995', '{"mon":"6:00 AM - 5:00 PM","tue":"6:00 AM - 5:00 PM","wed":"6:00 AM - 5:00 PM","thu":"6:00 AM - 5:00 PM","fri":"6:00 AM - 5:00 PM","sat":"7:00 AM - 12:00 PM","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'srs-distribution' ON CONFLICT DO NOTHING;

-- 4. CertainTeed
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'CertainTeed HQ', '20 Moores Road', 'Malvern', 'PA', '19355', '1-800-233-8990', '40.0379', '-75.5135', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'certainteed' ON CONFLICT DO NOTHING;

-- 5. Owens Corning
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Owens Corning HQ', '1 Owens Corning Pkwy', 'Toledo', 'OH', '43659', '1-800-438-7465', '41.6528', '-83.5379', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'owens-corning' ON CONFLICT DO NOTHING;

INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Owens Corning Phoenix Plant', '2121 S. 24th St', 'Phoenix', 'AZ', '85034', '602-256-6000', '33.4294', '-112.0297', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'owens-corning' ON CONFLICT DO NOTHING;

-- 6. TAMKO
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'TAMKO HQ', '220 W. 4th St', 'Joplin', 'MO', '64801', '1-800-641-4691', '37.0842', '-94.5133', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'tamko' ON CONFLICT DO NOTHING;

-- 7. IKO
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'IKO Industries', '120 Hay Rd', 'Wilmington', 'DE', '19809', '1-888-456-7663', '39.7606', '-75.5399', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'iko' ON CONFLICT DO NOTHING;

-- 8. Malarkey
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Malarkey Roofing HQ', '3131 N. Columbia Blvd', 'Portland', 'OR', '97217', '1-800-545-1191', '45.5800', '-122.6823', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'malarkey' ON CONFLICT DO NOTHING;

-- 9. Eagle Roofing
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Eagle Roofing Phoenix', '8000 E. Raintree Dr', 'Scottsdale', 'AZ', '85260', '480-948-6000', '33.6175', '-111.8987', '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"Closed","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'eagle-roofing' ON CONFLICT DO NOTHING;

-- 10. Boral
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Boral Roofing Phoenix', '1900 E. University Dr', 'Phoenix', 'AZ', '85034', '602-258-6000', '33.4215', '-112.0440', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'boral' ON CONFLICT DO NOTHING;

-- 11. Monier
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Monier Lifetile AZ', '3555 N. 83rd Ave', 'Phoenix', 'AZ', '85033', '623-849-4900', '33.4879', '-112.2164', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'monier' ON CONFLICT DO NOTHING;

-- 12. DECRA
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'DECRA Roofing Systems', '1230 Railroad St', 'Corona', 'CA', '92882', '1-800-258-9693', '33.8698', '-117.5456', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'decra' ON CONFLICT DO NOTHING;

-- 13. Carlisle
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Carlisle SynTec Phoenix', '1400 W. Rio Salado Pkwy', 'Tempe', 'AZ', '85281', '480-756-5000', '33.4359', '-111.9645', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'carlisle' ON CONFLICT DO NOTHING;

-- 14. Firestone
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Firestone Building Products', '200 4th Ave S', 'Nashville', 'TN', '37201', '1-800-428-4442', '36.1567', '-86.7772', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'firestone' ON CONFLICT DO NOTHING;

-- 15. Versico
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Versico Roofing Systems', '250 Underpass Rd', 'Carlisle', 'PA', '17015', '1-800-992-7663', '40.2012', '-77.1895', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'versico' ON CONFLICT DO NOTHING;

-- 16. Johns Manville
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Johns Manville HQ', '717 17th St', 'Denver', 'CO', '80202', '1-800-654-3103', '39.7466', '-104.9897', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'johns-manville' ON CONFLICT DO NOTHING;

-- 17. Polyglass
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Polyglass USA HQ', '1111 W. Newport Center Dr', 'Deerfield Beach', 'FL', '33442', '1-800-832-3826', '26.3087', '-80.1300', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'polyglass' ON CONFLICT DO NOTHING;

-- 18. Tremco
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Tremco Roofing HQ', '3735 Green Rd', 'Beachwood', 'OH', '44122', '1-800-321-6357', '41.4649', '-81.5101', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'tremco' ON CONFLICT DO NOTHING;

-- 19. Gaco
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Gaco Western HQ', '200 W. Mercer St', 'Seattle', 'WA', '98119', '1-800-331-0196', '47.6266', '-122.3561', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'gaco' ON CONFLICT DO NOTHING;

-- 20. APOC
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'APOC Coatings', '14142 W. 95th St', 'Lenexa', 'KS', '66215', '1-888-994-2762', '38.9467', '-94.7401', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'apoc' ON CONFLICT DO NOTHING;

-- 21. Metal Sales
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Metal Sales Manufacturing', '7950 Woodland Dr', 'Indianapolis', 'IN', '46278', '1-800-406-7387', '39.8956', '-86.1819', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'metal-sales' ON CONFLICT DO NOTHING;

-- 22. Berridge
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Berridge Manufacturing HQ', '1720 Maury St', 'Houston', 'TX', '77026', '1-800-669-0009', '29.8003', '-95.3401', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'berridge' ON CONFLICT DO NOTHING;

-- 23. ATAS
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'ATAS International', '6612 Snowdrift Rd', 'Allentown', 'PA', '18106', '1-800-468-1441', '40.5855', '-75.5597', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'atas-intl' ON CONFLICT DO NOTHING;

-- 24. Nucor
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Nucor Building Systems', '1915 Rexford Rd', 'Charlotte', 'NC', '28211', '1-800-527-6823', '35.1654', '-80.8279', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'nucor-skyline' ON CONFLICT DO NOTHING;

-- 25. Roof Hugger
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Roof Hugger HQ', '4934 Guide Meridian', 'Bellingham', 'WA', '98226', '1-800-771-1711', '48.8052', '-122.4846', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'roof-hugger' ON CONFLICT DO NOTHING;

-- 26. Standing Seam USA
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Standing Seam USA', '2700 E. Chambers St', 'Phoenix', 'AZ', '85040', '1-844-776-6537', '33.4073', '-112.0290', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'standing-seam-usa' ON CONFLICT DO NOTHING;

-- 27. Westlake Royal
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Westlake Royal Phoenix', '3601 W. Lower Buckeye Rd', 'Phoenix', 'AZ', '85043', '1-888-333-4552', '33.4342', '-112.1445', true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'westlake-royal' ON CONFLICT DO NOTHING;

-- 28. Elite Roofing Supply
INSERT INTO "VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, lat, lng, hours, "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid(), id, 'Elite Roofing Supply Phoenix', '2210 W. Deer Valley Rd', 'Phoenix', 'AZ', '85027', '602-437-1276', '33.6835', '-112.0992', '{"mon":"6:00 AM - 4:30 PM","tue":"6:00 AM - 4:30 PM","wed":"6:00 AM - 4:30 PM","thu":"6:00 AM - 4:30 PM","fri":"6:00 AM - 4:30 PM","sat":"Closed","sun":"Closed"}'::jsonb, true, NOW(), NOW()
FROM "Vendor" WHERE slug = 'elite-roofing-supply' ON CONFLICT DO NOTHING;

COMMIT;

-- Verify
SELECT v.name as vendor, vl.name as location, vl.city, vl.state, vl.lat, vl.lng
FROM "VendorLocation" vl
JOIN "Vendor" v ON v.id = vl."vendorId"
ORDER BY v.name, vl.city;
