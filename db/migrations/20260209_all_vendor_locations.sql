-- ============================================================
-- COMPREHENSIVE VENDOR LOCATIONS SEED
-- Creates at least 1 location per vendor across Arizona
-- ============================================================

-- Helper: Arizona city coordinates
-- Phoenix: 33.4484, -112.0740
-- Tucson: 32.2226, -110.9747
-- Scottsdale: 33.4942, -111.9261
-- Mesa: 33.4152, -111.8315
-- Tempe: 33.4255, -111.9400
-- Chandler: 33.3062, -111.8413
-- Gilbert: 33.3528, -111.7890
-- Glendale: 33.5387, -112.1860
-- Peoria: 33.5806, -112.2374
-- Flagstaff: 35.1983, -111.6513
-- Prescott: 34.5400, -112.4685
-- Sedona: 34.8697, -111.7610
-- Yuma: 32.6927, -114.6277
-- Sierra Vista: 31.5455, -110.3036
-- Surprise: 33.6292, -112.3679

-- Default hours JSON
-- {"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}

-- Insert locations for all vendors that don't have any
-- We'll create 2-3 locations per vendor across different regions

-- ============================================================
-- A.O. Smith - Water Heaters
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'A.O. Smith Phoenix Distribution', '2150 W University Dr', 'Phoenix', 'AZ', '85034', '(602) 555-0101', 'phoenix@aosmith.com', '33.4484', '-112.0740', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'ao-smith' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'A.O. Smith Tucson', '3920 E Irvington Rd', 'Tucson', 'AZ', '85714', '(520) 555-0102', 'tucson@aosmith.com', '32.2226', '-110.9747', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'ao-smith' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Alside - Siding/Windows
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Alside Phoenix', '4545 E McDowell Rd', 'Phoenix', 'AZ', '85008', '(602) 555-0201', 'phoenix@alside.com', '33.4655', '-111.9950', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'alside' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- American Standard Plumbing
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'American Standard Phoenix Showroom', '1200 W Camelback Rd', 'Phoenix', 'AZ', '85015', '(602) 555-0301', 'phoenix@americanstandard.com', '33.5094', '-112.0836', '{"mon": "8:00 AM - 6:00 PM", "tue": "8:00 AM - 6:00 PM", "wed": "8:00 AM - 6:00 PM", "thu": "8:00 AM - 6:00 PM", "fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'american-standard' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'American Standard Tucson', '5810 E Broadway Blvd', 'Tucson', 'AZ', '85711', '(520) 555-0302', 'tucson@americanstandard.com', '32.2217', '-110.8979', '{"mon": "8:00 AM - 6:00 PM", "tue": "8:00 AM - 6:00 PM", "wed": "8:00 AM - 6:00 PM", "thu": "8:00 AM - 6:00 PM", "fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'american-standard' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- American Standard HVAC
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'American Standard HVAC Phoenix', '3030 N 44th St', 'Phoenix', 'AZ', '85018', '(602) 555-0401', 'phoenix@amstd-hvac.com', '33.4814', '-111.9846', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'american-standard-hvac' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Andersen Windows
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Andersen Windows Scottsdale Showroom', '8787 E Frank Lloyd Wright Blvd', 'Scottsdale', 'AZ', '85260', '(480) 555-0501', 'scottsdale@andersenwindows.com', '33.6183', '-111.9053', '{"mon": "9:00 AM - 6:00 PM", "tue": "9:00 AM - 6:00 PM", "wed": "9:00 AM - 6:00 PM", "thu": "9:00 AM - 6:00 PM", "fri": "9:00 AM - 6:00 PM", "sat": "10:00 AM - 4:00 PM", "sun": "12:00 PM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'andersen-windows' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Andersen Windows Tucson', '4310 N Oracle Rd', 'Tucson', 'AZ', '85705', '(520) 555-0502', 'tucson@andersenwindows.com', '32.2662', '-110.9716', '{"mon": "9:00 AM - 6:00 PM", "tue": "9:00 AM - 6:00 PM", "wed": "9:00 AM - 6:00 PM", "thu": "9:00 AM - 6:00 PM", "fri": "9:00 AM - 6:00 PM", "sat": "10:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'andersen-windows' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Armstrong Flooring
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Armstrong Flooring Phoenix', '2424 E Thomas Rd', 'Phoenix', 'AZ', '85016', '(602) 555-0601', 'phoenix@armstrongflooring.com', '33.4806', '-112.0301', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "9:00 AM - 2:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'armstrong-flooring' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Atlas Roofing
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Atlas Roofing Phoenix Distribution', '1850 W Grant St', 'Phoenix', 'AZ', '85007', '(602) 555-0701', 'phoenix@atlasroofing.com', '33.4363', '-112.0898', '{"mon": "6:00 AM - 4:00 PM", "tue": "6:00 AM - 4:00 PM", "wed": "6:00 AM - 4:00 PM", "thu": "6:00 AM - 4:00 PM", "fri": "6:00 AM - 4:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'atlas-roofing' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Beacon Building Products
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Beacon Building Products Phoenix', '2601 W Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-0801', 'phoenix@becn.com', '33.4337', '-112.0996', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'beacon-building' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Beacon Building Products Mesa', '1030 S Country Club Dr', 'Mesa', 'AZ', '85210', '(480) 555-0802', 'mesa@becn.com', '33.3962', '-111.8410', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'beacon-building' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Mesa');

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Beacon Building Products Tucson', '3501 S Palo Verde Rd', 'Tucson', 'AZ', '85713', '(520) 555-0803', 'tucson@becn.com', '32.1893', '-110.9330', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'beacon-building' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- BEHR Paint
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'BEHR Paint Phoenix (via Home Depot)', '2525 W Camelback Rd', 'Phoenix', 'AZ', '85017', '(602) 555-0901', 'phoenix@behr.com', '33.5094', '-112.1057', '{"mon": "6:00 AM - 9:00 PM", "tue": "6:00 AM - 9:00 PM", "wed": "6:00 AM - 9:00 PM", "thu": "6:00 AM - 9:00 PM", "fri": "6:00 AM - 9:00 PM", "sat": "6:00 AM - 9:00 PM", "sun": "7:00 AM - 8:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'behr' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Benjamin Moore
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Benjamin Moore Phoenix', '3149 E Indian School Rd', 'Phoenix', 'AZ', '85016', '(602) 555-1001', 'phoenix@benjaminmoore.com', '33.4941', '-112.0151', '{"mon": "7:00 AM - 6:00 PM", "tue": "7:00 AM - 6:00 PM", "wed": "7:00 AM - 6:00 PM", "thu": "7:00 AM - 6:00 PM", "fri": "7:00 AM - 6:00 PM", "sat": "8:00 AM - 5:00 PM", "sun": "10:00 AM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'benjamin-moore' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Benjamin Moore Scottsdale', '7001 E Shea Blvd', 'Scottsdale', 'AZ', '85254', '(480) 555-1002', 'scottsdale@benjaminmoore.com', '33.5802', '-111.9251', '{"mon": "7:00 AM - 6:00 PM", "tue": "7:00 AM - 6:00 PM", "wed": "7:00 AM - 6:00 PM", "thu": "7:00 AM - 6:00 PM", "fri": "7:00 AM - 6:00 PM", "sat": "8:00 AM - 5:00 PM", "sun": "10:00 AM - 4:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'benjamin-moore' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Scottsdale');

-- ============================================================
-- Builders FirstSource
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Builders FirstSource Phoenix', '4020 E Washington St', 'Phoenix', 'AZ', '85034', '(602) 555-1101', 'phoenix@bldr.com', '33.4483', '-111.9996', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'builders-firstsource' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Builders FirstSource Flagstaff', '2200 E Route 66', 'Flagstaff', 'AZ', '86004', '(928) 555-1102', 'flagstaff@bldr.com', '35.1983', '-111.6018', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'builders-firstsource' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Flagstaff');

-- ============================================================
-- Carrier HVAC
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Carrier Phoenix Distribution', '1850 S 7th Ave', 'Phoenix', 'AZ', '85007', '(602) 555-1201', 'phoenix@carrier.com', '33.4297', '-112.0856', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'carrier' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Carrier Tucson', '2940 E Drexel Rd', 'Tucson', 'AZ', '85706', '(520) 555-1202', 'tucson@carrier.com', '32.1647', '-110.9366', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'carrier' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Daikin
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Daikin Phoenix', '2020 S 16th St', 'Phoenix', 'AZ', '85034', '(602) 555-1301', 'phoenix@daikin.com', '33.4297', '-112.0509', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'daikin' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- DaVinci Roofscapes
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'DaVinci Roofscapes Scottsdale', '8501 E Princess Dr', 'Scottsdale', 'AZ', '85255', '(480) 555-1401', 'scottsdale@davinciroofscapes.com', '33.6317', '-111.9141', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "By Appointment", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'davinci-roofscapes' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Delta Faucet
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Delta Faucet Phoenix Showroom', '1919 E Camelback Rd', 'Phoenix', 'AZ', '85016', '(602) 555-1501', 'phoenix@deltafaucet.com', '33.5094', '-112.0471', '{"mon": "9:00 AM - 6:00 PM", "tue": "9:00 AM - 6:00 PM", "wed": "9:00 AM - 6:00 PM", "thu": "9:00 AM - 6:00 PM", "fri": "9:00 AM - 6:00 PM", "sat": "10:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'delta-faucet' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Dunn-Edwards
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Dunn-Edwards Phoenix Central', '3240 N 16th St', 'Phoenix', 'AZ', '85016', '(602) 555-1601', 'phoenix@dunnedwards.com', '33.4813', '-112.0509', '{"mon": "6:30 AM - 6:00 PM", "tue": "6:30 AM - 6:00 PM", "wed": "6:30 AM - 6:00 PM", "thu": "6:30 AM - 6:00 PM", "fri": "6:30 AM - 6:00 PM", "sat": "7:00 AM - 5:00 PM", "sun": "9:00 AM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'dunn-edwards' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Dunn-Edwards Tucson', '4150 N Oracle Rd', 'Tucson', 'AZ', '85705', '(520) 555-1602', 'tucson@dunnedwards.com', '32.2630', '-110.9716', '{"mon": "6:30 AM - 6:00 PM", "tue": "6:30 AM - 6:00 PM", "wed": "6:30 AM - 6:00 PM", "thu": "6:30 AM - 6:00 PM", "fri": "6:30 AM - 6:00 PM", "sat": "7:00 AM - 5:00 PM", "sun": "9:00 AM - 4:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'dunn-edwards' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Dunn-Edwards Scottsdale', '7373 E Doubletree Ranch Rd', 'Scottsdale', 'AZ', '85258', '(480) 555-1603', 'scottsdale@dunnedwards.com', '33.5592', '-111.9282', '{"mon": "6:30 AM - 6:00 PM", "tue": "6:30 AM - 6:00 PM", "wed": "6:30 AM - 6:00 PM", "thu": "6:30 AM - 6:00 PM", "fri": "6:30 AM - 6:00 PM", "sat": "7:00 AM - 5:00 PM", "sun": "9:00 AM - 4:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'dunn-edwards' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Scottsdale');

-- ============================================================
-- Eaton Electrical
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Eaton Phoenix', '3820 E University Dr', 'Phoenix', 'AZ', '85034', '(602) 555-1701', 'phoenix@eaton.com', '33.4213', '-111.9996', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'eaton' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Ferguson Enterprises
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Ferguson Phoenix Showroom', '3050 N 29th Ave', 'Phoenix', 'AZ', '85017', '(602) 555-1801', 'phoenix@ferguson.com', '33.4797', '-112.1220', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'ferguson' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Ferguson Tempe', '2100 E University Dr', 'Tempe', 'AZ', '85281', '(480) 555-1802', 'tempe@ferguson.com', '33.4213', '-111.9159', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'ferguson' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tempe');

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Ferguson Tucson', '5301 E Speedway Blvd', 'Tucson', 'AZ', '85712', '(520) 555-1803', 'tucson@ferguson.com', '32.2362', '-110.8681', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'ferguson' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- GAF Materials (separate from GAF)
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'GAF Materials Phoenix', '2701 W Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-1901', 'phoenix@gaf.com', '33.4337', '-112.1013', '{"mon": "6:00 AM - 4:30 PM", "tue": "6:00 AM - 4:30 PM", "wed": "6:00 AM - 4:30 PM", "thu": "6:00 AM - 4:30 PM", "fri": "6:00 AM - 4:30 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'gaf-materials' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Generac
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Generac Arizona (via Dealers)', '4435 E Baseline Rd', 'Phoenix', 'AZ', '85042', '(602) 555-2001', 'arizona@generac.com', '33.3779', '-111.9996', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "By Appointment", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'generac' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Goodman Manufacturing
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Goodman HVAC Phoenix', '2525 S 19th Ave', 'Phoenix', 'AZ', '85009', '(602) 555-2101', 'phoenix@goodmanmfg.com', '33.4213', '-112.0939', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'goodman' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Goodman HVAC Tucson', '3715 E 34th St', 'Tucson', 'AZ', '85713', '(520) 555-2102', 'tucson@goodmanmfg.com', '32.1863', '-110.9330', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'goodman' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Graybar Electric
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Graybar Phoenix', '3620 E Washington St', 'Phoenix', 'AZ', '85034', '(602) 555-2201', 'phoenix@graybar.com', '33.4483', '-112.0057', '{"mon": "6:30 AM - 5:00 PM", "tue": "6:30 AM - 5:00 PM", "wed": "6:30 AM - 5:00 PM", "thu": "6:30 AM - 5:00 PM", "fri": "6:30 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'graybar' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Graybar Tucson', '2920 E Valencia Rd', 'Tucson', 'AZ', '85706', '(520) 555-2202', 'tucson@graybar.com', '32.1379', '-110.9330', '{"mon": "6:30 AM - 5:00 PM", "tue": "6:30 AM - 5:00 PM", "wed": "6:30 AM - 5:00 PM", "thu": "6:30 AM - 5:00 PM", "fri": "6:30 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'graybar' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Home Depot Pro
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Home Depot Pro Phoenix', '4848 E Cactus Rd', 'Phoenix', 'AZ', '85032', '(602) 555-2301', 'phoenix@homedepotpro.com', '33.5973', '-111.9996', '{"mon": "6:00 AM - 9:00 PM", "tue": "6:00 AM - 9:00 PM", "wed": "6:00 AM - 9:00 PM", "thu": "6:00 AM - 9:00 PM", "fri": "6:00 AM - 9:00 PM", "sat": "6:00 AM - 9:00 PM", "sun": "7:00 AM - 8:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'home-depot-pro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Home Depot Pro Tucson', '4575 N Oracle Rd', 'Tucson', 'AZ', '85705', '(520) 555-2302', 'tucson@homedepotpro.com', '32.2703', '-110.9716', '{"mon": "6:00 AM - 9:00 PM", "tue": "6:00 AM - 9:00 PM", "wed": "6:00 AM - 9:00 PM", "thu": "6:00 AM - 9:00 PM", "fri": "6:00 AM - 9:00 PM", "sat": "6:00 AM - 9:00 PM", "sun": "7:00 AM - 8:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'home-depot-pro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Hubbell
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Hubbell Phoenix', '2020 W Lower Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-2401', 'phoenix@hubbell.com', '33.4213', '-112.0939', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'hubbell' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Icynene
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Icynene Arizona (Contractor Network)', '1717 E Bell Rd', 'Phoenix', 'AZ', '85022', '(602) 555-2501', 'arizona@icynene.com', '33.6401', '-112.0509', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'icynene' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- James Hardie
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'James Hardie Phoenix', '2045 W Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-2601', 'phoenix@jameshardie.com', '33.4337', '-112.0873', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'james-hardie' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- JELD-WEN
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'JELD-WEN Phoenix Showroom', '3030 E Thomas Rd', 'Phoenix', 'AZ', '85016', '(602) 555-2701', 'phoenix@jeldwen.com', '33.4806', '-112.0189', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "9:00 AM - 2:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'jeld-wen' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Knauf Insulation
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Knauf Insulation Phoenix', '2101 W Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-2801', 'phoenix@knaufinsulation.com', '33.4337', '-112.0891', '{"mon": "7:00 AM - 4:00 PM", "tue": "7:00 AM - 4:00 PM", "wed": "7:00 AM - 4:00 PM", "thu": "7:00 AM - 4:00 PM", "fri": "7:00 AM - 4:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'knauf' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Kohler
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Kohler Signature Store Scottsdale', '15215 N Kierland Blvd', 'Scottsdale', 'AZ', '85254', '(480) 555-2901', 'scottsdale@kohler.com', '33.5835', '-111.9282', '{"mon": "10:00 AM - 6:00 PM", "tue": "10:00 AM - 6:00 PM", "wed": "10:00 AM - 6:00 PM", "thu": "10:00 AM - 6:00 PM", "fri": "10:00 AM - 6:00 PM", "sat": "10:00 AM - 5:00 PM", "sun": "12:00 PM - 5:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'kohler' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- LeafFilter
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'LeafFilter Arizona', '4747 N 32nd St', 'Phoenix', 'AZ', '85018', '(602) 555-3001', 'arizona@leaffilter.com', '33.5092', '-112.0055', '{"mon": "8:00 AM - 8:00 PM", "tue": "8:00 AM - 8:00 PM", "wed": "8:00 AM - 8:00 PM", "thu": "8:00 AM - 8:00 PM", "fri": "8:00 AM - 8:00 PM", "sat": "8:00 AM - 6:00 PM", "sun": "10:00 AM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'leaffilter' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- LeafGuard
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'LeafGuard Arizona', '4040 E McDowell Rd', 'Phoenix', 'AZ', '85008', '(602) 555-3101', 'arizona@leafguard.com', '33.4655', '-111.9996', '{"mon": "8:00 AM - 7:00 PM", "tue": "8:00 AM - 7:00 PM", "wed": "8:00 AM - 7:00 PM", "thu": "8:00 AM - 7:00 PM", "fri": "8:00 AM - 7:00 PM", "sat": "9:00 AM - 5:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'leafguard' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Lennox
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Lennox Phoenix', '1525 W Deer Valley Rd', 'Phoenix', 'AZ', '85027', '(602) 555-3201', 'phoenix@lennox.com', '33.6826', '-112.0730', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'lennox' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Lennox Tucson', '2810 E Valencia Rd', 'Tucson', 'AZ', '85706', '(520) 555-3202', 'tucson@lennox.com', '32.1379', '-110.9399', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'lennox' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Leviton
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Leviton Arizona (via Distributors)', '3420 E University Dr', 'Phoenix', 'AZ', '85034', '(602) 555-3301', 'arizona@leviton.com', '33.4213', '-112.0088', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'leviton' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Lowe's Pro
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Lowes Pro Phoenix Camelback', '1620 E Camelback Rd', 'Phoenix', 'AZ', '85016', '(602) 555-3401', 'phoenix@lowespro.com', '33.5094', '-112.0525', '{"mon": "6:00 AM - 10:00 PM", "tue": "6:00 AM - 10:00 PM", "wed": "6:00 AM - 10:00 PM", "thu": "6:00 AM - 10:00 PM", "fri": "6:00 AM - 10:00 PM", "sat": "6:00 AM - 10:00 PM", "sun": "7:00 AM - 8:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'lowes-pro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Lowes Pro Gilbert', '1620 S Gilbert Rd', 'Gilbert', 'AZ', '85296', '(480) 555-3402', 'gilbert@lowespro.com', '33.3253', '-111.7890', '{"mon": "6:00 AM - 10:00 PM", "tue": "6:00 AM - 10:00 PM", "wed": "6:00 AM - 10:00 PM", "thu": "6:00 AM - 10:00 PM", "fri": "6:00 AM - 10:00 PM", "sat": "6:00 AM - 10:00 PM", "sun": "7:00 AM - 8:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'lowes-pro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Gilbert');

-- ============================================================
-- LP SmartSide
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'LP SmartSide Arizona', '2150 W University Dr', 'Phoenix', 'AZ', '85034', '(602) 555-3501', 'arizona@lpcorp.com', '33.4213', '-112.0891', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'lp-smartside' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Lutron
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Lutron Experience Center Scottsdale', '7373 N Scottsdale Rd', 'Scottsdale', 'AZ', '85253', '(480) 555-3601', 'scottsdale@lutron.com', '33.5248', '-111.9261', '{"mon": "9:00 AM - 5:00 PM", "tue": "9:00 AM - 5:00 PM", "wed": "9:00 AM - 5:00 PM", "thu": "9:00 AM - 5:00 PM", "fri": "9:00 AM - 5:00 PM", "sat": "By Appointment", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'lutron' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Mannington
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Mannington Flooring Phoenix', '3310 E Thomas Rd', 'Phoenix', 'AZ', '85018', '(602) 555-3701', 'phoenix@mannington.com', '33.4806', '-112.0088', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "9:00 AM - 2:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'mannington' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Marvin Windows
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Marvin Scottsdale Showroom', '8920 E Pinnacle Peak Rd', 'Scottsdale', 'AZ', '85255', '(480) 555-3801', 'scottsdale@marvin.com', '33.6945', '-111.8937', '{"mon": "9:00 AM - 5:00 PM", "tue": "9:00 AM - 5:00 PM", "wed": "9:00 AM - 5:00 PM", "thu": "9:00 AM - 5:00 PM", "fri": "9:00 AM - 5:00 PM", "sat": "10:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'marvin' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Milgard
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Milgard Windows Phoenix', '3838 N Central Ave', 'Phoenix', 'AZ', '85012', '(602) 555-3901', 'phoenix@milgard.com', '33.4925', '-112.0742', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "9:00 AM - 3:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'milgard' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Moen
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Moen Arizona (via Ferguson)', '3050 N 29th Ave', 'Phoenix', 'AZ', '85017', '(602) 555-4001', 'arizona@moen.com', '33.4797', '-112.1220', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'moen' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Mohawk Flooring
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Mohawk Flooring Phoenix', '2020 E Camelback Rd', 'Phoenix', 'AZ', '85016', '(602) 555-4101', 'phoenix@mohawkind.com', '33.5094', '-112.0425', '{"mon": "8:00 AM - 6:00 PM", "tue": "8:00 AM - 6:00 PM", "wed": "8:00 AM - 6:00 PM", "thu": "8:00 AM - 6:00 PM", "fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 5:00 PM", "sun": "11:00 AM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'mohawk' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Navien
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Navien Arizona (via Ferguson)', '3050 N 29th Ave', 'Phoenix', 'AZ', '85017', '(602) 555-4201', 'arizona@navien.com', '33.4797', '-112.1220', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'navien' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Pella
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Pella Windows Phoenix', '2424 E Camelback Rd', 'Phoenix', 'AZ', '85016', '(602) 555-4301', 'phoenix@pella.com', '33.5094', '-112.0356', '{"mon": "9:00 AM - 6:00 PM", "tue": "9:00 AM - 6:00 PM", "wed": "9:00 AM - 6:00 PM", "thu": "9:00 AM - 6:00 PM", "fri": "9:00 AM - 6:00 PM", "sat": "10:00 AM - 4:00 PM", "sun": "12:00 PM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'pella' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Pella Windows Tucson', '5870 E Broadway Blvd', 'Tucson', 'AZ', '85711', '(520) 555-4302', 'tucson@pella.com', '32.2217', '-110.8917', '{"mon": "9:00 AM - 6:00 PM", "tue": "9:00 AM - 6:00 PM", "wed": "9:00 AM - 6:00 PM", "thu": "9:00 AM - 6:00 PM", "fri": "9:00 AM - 6:00 PM", "sat": "10:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'pella' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Ply Gem
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Ply Gem Arizona', '1515 W Deer Valley Rd', 'Phoenix', 'AZ', '85027', '(602) 555-4401', 'arizona@plygem.com', '33.6826', '-112.0764', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'plygem' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- PPG Paints
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'PPG Paints Phoenix', '3430 E Indian School Rd', 'Phoenix', 'AZ', '85018', '(602) 555-4501', 'phoenix@ppg.com', '33.4941', '-112.0057', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'ppg-paints' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- ProVia
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'ProVia Arizona (via Dealers)', '4545 E Shea Blvd', 'Phoenix', 'AZ', '85028', '(602) 555-4601', 'arizona@provia.com', '33.5802', '-111.9996', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "By Appointment", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'provia' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- QUIKRETE
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'QUIKRETE Phoenix Plant', '501 S 48th St', 'Phoenix', 'AZ', '85034', '(602) 555-4701', 'phoenix@quikrete.com', '33.4401', '-111.9721', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'quikrete' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'QUIKRETE Tucson', '3700 S Dodge Blvd', 'Tucson', 'AZ', '85713', '(520) 555-4702', 'tucson@quikrete.com', '32.1826', '-110.9330', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'quikrete' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Raindrop Gutter
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Raindrop Gutter Arizona', '3636 E Thomas Rd', 'Phoenix', 'AZ', '85018', '(602) 555-4801', 'arizona@raindropgutterguard.com', '33.4806', '-112.0025', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "By Appointment", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'raindrop-gutter' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Rheem
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Rheem Phoenix', '2424 S 19th Ave', 'Phoenix', 'AZ', '85009', '(602) 555-4901', 'phoenix@rheem.com', '33.4255', '-112.0939', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'rheem' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Rheem Tucson', '3620 E 44th St', 'Tucson', 'AZ', '85713', '(520) 555-4902', 'tucson@rheem.com', '32.1678', '-110.9330', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'rheem' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Rinnai
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Rinnai Arizona (via Ferguson)', '3050 N 29th Ave', 'Phoenix', 'AZ', '85017', '(602) 555-5001', 'arizona@rinnai.us', '33.4797', '-112.1220', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "8:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'rinnai' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- ROCKWOOL
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'ROCKWOOL Arizona', '2020 W Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-5101', 'arizona@rockwool.com', '33.4337', '-112.0873', '{"mon": "7:00 AM - 4:00 PM", "tue": "7:00 AM - 4:00 PM", "wed": "7:00 AM - 4:00 PM", "thu": "7:00 AM - 4:00 PM", "fri": "7:00 AM - 4:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'rockwool' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Royal Building Products
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Royal Building Products Phoenix', '2525 S 35th Ave', 'Phoenix', 'AZ', '85009', '(602) 555-5201', 'phoenix@royalbuildingproducts.com', '33.4213', '-112.1287', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'royal-building' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Senox
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Senox Arizona', '3030 E Buckeye Rd', 'Phoenix', 'AZ', '85034', '(602) 555-5301', 'arizona@senox.com', '33.4337', '-112.0189', '{"mon": "7:00 AM - 4:00 PM", "tue": "7:00 AM - 4:00 PM", "wed": "7:00 AM - 4:00 PM", "thu": "7:00 AM - 4:00 PM", "fri": "7:00 AM - 4:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'senox' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- SERVPRO
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'SERVPRO Phoenix Central', '2828 N Central Ave', 'Phoenix', 'AZ', '85004', '(602) 555-5401', 'phoenix@servpro.com', '33.4757', '-112.0742', '{"mon": "24/7 Emergency", "tue": "24/7 Emergency", "wed": "24/7 Emergency", "thu": "24/7 Emergency", "fri": "24/7 Emergency", "sat": "24/7 Emergency", "sun": "24/7 Emergency"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'servpro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'SERVPRO Tucson', '3940 E 29th St', 'Tucson', 'AZ', '85711', '(520) 555-5402', 'tucson@servpro.com', '32.2062', '-110.9099', '{"mon": "24/7 Emergency", "tue": "24/7 Emergency", "wed": "24/7 Emergency", "thu": "24/7 Emergency", "fri": "24/7 Emergency", "sat": "24/7 Emergency", "sun": "24/7 Emergency"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'servpro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'SERVPRO Flagstaff', '2500 E Route 66', 'Flagstaff', 'AZ', '86004', '(928) 555-5403', 'flagstaff@servpro.com', '35.1983', '-111.5956', '{"mon": "24/7 Emergency", "tue": "24/7 Emergency", "wed": "24/7 Emergency", "thu": "24/7 Emergency", "fri": "24/7 Emergency", "sat": "24/7 Emergency", "sun": "24/7 Emergency"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'servpro' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Flagstaff');

-- ============================================================
-- Shaw Industries
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Shaw Flooring Phoenix', '2626 E Indian School Rd', 'Phoenix', 'AZ', '85016', '(602) 555-5501', 'phoenix@shawinc.com', '33.4941', '-112.0364', '{"mon": "8:00 AM - 6:00 PM", "tue": "8:00 AM - 6:00 PM", "wed": "8:00 AM - 6:00 PM", "thu": "8:00 AM - 6:00 PM", "fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 5:00 PM", "sun": "11:00 AM - 4:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'shaw-industries' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Sherwin-Williams
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Sherwin-Williams Phoenix Central', '3340 N Central Ave', 'Phoenix', 'AZ', '85012', '(602) 555-5601', 'phoenix@sherwin.com', '33.4858', '-112.0742', '{"mon": "7:00 AM - 7:00 PM", "tue": "7:00 AM - 7:00 PM", "wed": "7:00 AM - 7:00 PM", "thu": "7:00 AM - 7:00 PM", "fri": "7:00 AM - 7:00 PM", "sat": "8:00 AM - 6:00 PM", "sun": "10:00 AM - 6:00 PM"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'sherwin-williams' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Sherwin-Williams Scottsdale', '7001 E Shea Blvd', 'Scottsdale', 'AZ', '85254', '(480) 555-5602', 'scottsdale@sherwin.com', '33.5802', '-111.9251', '{"mon": "7:00 AM - 7:00 PM", "tue": "7:00 AM - 7:00 PM", "wed": "7:00 AM - 7:00 PM", "thu": "7:00 AM - 7:00 PM", "fri": "7:00 AM - 7:00 PM", "sat": "8:00 AM - 6:00 PM", "sun": "10:00 AM - 6:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'sherwin-williams' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Scottsdale');

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Sherwin-Williams Tucson', '5051 E Speedway Blvd', 'Tucson', 'AZ', '85712', '(520) 555-5603', 'tucson@sherwin.com', '32.2362', '-110.8804', '{"mon": "7:00 AM - 7:00 PM", "tue": "7:00 AM - 7:00 PM", "wed": "7:00 AM - 7:00 PM", "thu": "7:00 AM - 7:00 PM", "fri": "7:00 AM - 7:00 PM", "sat": "8:00 AM - 6:00 PM", "sun": "10:00 AM - 6:00 PM"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'sherwin-williams' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Siemens Electrical
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Siemens Arizona (via Graybar)', '3620 E Washington St', 'Phoenix', 'AZ', '85034', '(602) 555-5701', 'arizona@siemens.com', '33.4483', '-112.0057', '{"mon": "6:30 AM - 5:00 PM", "tue": "6:30 AM - 5:00 PM", "wed": "6:30 AM - 5:00 PM", "thu": "6:30 AM - 5:00 PM", "fri": "6:30 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'siemens-electrical' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Simonton Windows
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Simonton Windows Phoenix', '2828 E Van Buren St', 'Phoenix', 'AZ', '85008', '(602) 555-5801', 'phoenix@simonton.com', '33.4524', '-112.0239', '{"mon": "8:00 AM - 5:00 PM", "tue": "8:00 AM - 5:00 PM", "wed": "8:00 AM - 5:00 PM", "thu": "8:00 AM - 5:00 PM", "fri": "8:00 AM - 5:00 PM", "sat": "9:00 AM - 2:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'simonton' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Spectra Metals
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Spectra Gutter Systems Phoenix', '3333 E Van Buren St', 'Phoenix', 'AZ', '85008', '(602) 555-5901', 'phoenix@spectrametalroofing.com', '33.4524', '-112.0130', '{"mon": "7:00 AM - 4:00 PM", "tue": "7:00 AM - 4:00 PM", "wed": "7:00 AM - 4:00 PM", "thu": "7:00 AM - 4:00 PM", "fri": "7:00 AM - 4:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'spectra-metals' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- Square D
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Square D (Schneider) Phoenix', '3820 E University Dr', 'Phoenix', 'AZ', '85034', '(602) 555-6001', 'phoenix@squared.com', '33.4213', '-111.9996', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'square-d' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- SunPower
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'SunPower Arizona', '7575 E Redfield Rd', 'Scottsdale', 'AZ', '85260', '(480) 555-6101', 'arizona@sunpower.com', '33.5913', '-111.9025', '{"mon": "8:00 AM - 6:00 PM", "tue": "8:00 AM - 6:00 PM", "wed": "8:00 AM - 6:00 PM", "thu": "8:00 AM - 6:00 PM", "fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'sunpower' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'SunPower Tucson', '5151 E Broadway Blvd', 'Tucson', 'AZ', '85711', '(520) 555-6102', 'tucson@sunpower.com', '32.2217', '-110.8866', '{"mon": "8:00 AM - 6:00 PM", "tue": "8:00 AM - 6:00 PM", "wed": "8:00 AM - 6:00 PM", "thu": "8:00 AM - 6:00 PM", "fri": "8:00 AM - 6:00 PM", "sat": "9:00 AM - 4:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'sunpower' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- Trane
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Trane Phoenix', '4400 N 36th Ave', 'Phoenix', 'AZ', '85017', '(602) 555-6201', 'phoenix@trane.com', '33.5031', '-112.1220', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'trane' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'Trane Tucson', '3830 E 34th St', 'Tucson', 'AZ', '85713', '(520) 555-6202', 'tucson@trane.com', '32.1863', '-110.9261', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'trane' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- United Rentals
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'United Rentals Phoenix', '2020 W Buckeye Rd', 'Phoenix', 'AZ', '85009', '(602) 555-6301', 'phoenix@ur.com', '33.4337', '-112.0873', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'united-rentals' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'United Rentals Tucson', '3340 E Irvington Rd', 'Tucson', 'AZ', '85714', '(520) 555-6302', 'tucson@ur.com', '32.1493', '-110.9330', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'united-rentals' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'United Rentals Flagstaff', '3200 E Route 66', 'Flagstaff', 'AZ', '86004', '(928) 555-6303', 'flagstaff@ur.com', '35.1983', '-111.5894', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'united-rentals' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Flagstaff');

-- ============================================================
-- US LBM
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'US LBM Phoenix', '4545 E Washington St', 'Phoenix', 'AZ', '85034', '(602) 555-6401', 'phoenix@uslbm.com', '33.4483', '-111.9933', '{"mon": "6:00 AM - 5:00 PM", "tue": "6:00 AM - 5:00 PM", "wed": "6:00 AM - 5:00 PM", "thu": "6:00 AM - 5:00 PM", "fri": "6:00 AM - 5:00 PM", "sat": "7:00 AM - 12:00 PM", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'us-lbm' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

-- ============================================================
-- York HVAC
-- ============================================================
INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'York HVAC Phoenix', '1750 W Deer Valley Rd', 'Phoenix', 'AZ', '85027', '(602) 555-6501', 'phoenix@york.com', '33.6826', '-112.0798', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, true, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'york' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id);

INSERT INTO app."VendorLocation" (id, "vendorId", name, address, city, state, zip, phone, email, lat, lng, hours, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, v.id, 'York HVAC Tucson', '2920 E Drexel Rd', 'Tucson', 'AZ', '85706', '(520) 555-6502', 'tucson@york.com', '32.1647', '-110.9399', '{"mon": "7:00 AM - 5:00 PM", "tue": "7:00 AM - 5:00 PM", "wed": "7:00 AM - 5:00 PM", "thu": "7:00 AM - 5:00 PM", "fri": "7:00 AM - 5:00 PM", "sat": "Closed", "sun": "Closed"}'::jsonb, false, true, NOW(), NOW()
FROM app."Vendor" v WHERE v.slug = 'york' AND NOT EXISTS (SELECT 1 FROM app."VendorLocation" vl WHERE vl."vendorId" = v.id AND vl.city = 'Tucson');

-- ============================================================
-- CREATE CONTACTS FOR ALL NEW LOCATIONS
-- ============================================================

-- Branch Manager for each new location without a primary contact
INSERT INTO app."VendorContact" (id, "vendorId", "locationId", name, title, email, phone, territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  vl."vendorId",
  vl.id,
  vl.city || ' Manager',
  'Branch Manager',
  vl.email,
  vl.phone,
  ARRAY[vl.city],
  true,
  true,
  NOW(),
  NOW()
FROM app."VendorLocation" vl
WHERE NOT EXISTS (
  SELECT 1 FROM app."VendorContact" vc 
  WHERE vc."locationId" = vl.id AND vc."isPrimary" = true
);

-- Sales contact for each new location without a sales contact  
INSERT INTO app."VendorContact" (id, "vendorId", "locationId", name, title, email, phone, territory, "isPrimary", "isActive", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  vl."vendorId",
  vl.id,
  vl.city || ' Sales',
  'Sales Representative',
  REPLACE(vl.email, '@', '.sales@'),
  NULL,
  ARRAY[vl.city],
  false,
  true,
  NOW(),
  NOW()
FROM app."VendorLocation" vl
WHERE NOT EXISTS (
  SELECT 1 FROM app."VendorContact" vc 
  WHERE vc."locationId" = vl.id AND vc.title = 'Sales Representative'
);
