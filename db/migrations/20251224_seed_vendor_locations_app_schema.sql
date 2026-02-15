-- Migration: Seed vendor locations for app schema
-- Date: 2024-12-24
-- Note: These locations use the vendor IDs from app schema (different from public schema)
-- lat/lng are TEXT columns in Prisma schema, no isPrimaryLocation column

-- Insert vendor locations with coordinates for map functionality
-- ABC Supply (id: 73111753-c51d-4f5f-958c-ad442ff6530c)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive")
VALUES
  (gen_random_uuid(), '73111753-c51d-4f5f-958c-ad442ff6530c', 'ABC Supply Phoenix', 'Phoenix', 'AZ', '85009', '33.4484', '-112.0740', true),
  (gen_random_uuid(), '73111753-c51d-4f5f-958c-ad442ff6530c', 'ABC Supply Tucson', 'Tucson', 'AZ', '85713', '32.2226', '-110.9747', true)
ON CONFLICT DO NOTHING;

-- GAF (id: 2e63a748-3af3-42a2-8025-886cba853d9b)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '2e63a748-3af3-42a2-8025-886cba853d9b', 'GAF Phoenix', 'Phoenix', 'AZ', '85034', 33.4342, -112.0178, true, true),
  (gen_random_uuid(), '2e63a748-3af3-42a2-8025-886cba853d9b', 'GAF Tempe', 'Tempe', 'AZ', '85281', 33.4255, -111.9400, true, false)
ON CONFLICT DO NOTHING;

-- Owens Corning (id: 453d42db-f724-4e62-87f8-2b41ad2932df)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '453d42db-f724-4e62-87f8-2b41ad2932df', 'Owens Corning Phoenix Distribution', 'Phoenix', 'AZ', '85043', 33.4080, -112.1070, true, true),
  (gen_random_uuid(), '453d42db-f724-4e62-87f8-2b41ad2932df', 'Owens Corning Mesa', 'Mesa', 'AZ', '85203', 33.4153, -111.8314, true, false)
ON CONFLICT DO NOTHING;

-- CertainTeed (id: 2977ac63-cd7f-472e-9c0f-f0559f1a9d8d)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '2977ac63-cd7f-472e-9c0f-f0559f1a9d8d', 'CertainTeed Phoenix', 'Phoenix', 'AZ', '85040', 33.3934, -112.0418, true, true),
  (gen_random_uuid(), '2977ac63-cd7f-472e-9c0f-f0559f1a9d8d', 'CertainTeed Scottsdale', 'Scottsdale', 'AZ', '85257', 33.4882, -111.9261, true, false)
ON CONFLICT DO NOTHING;

-- IKO (id: 2df1c1e4-0f06-47bc-9e43-4ffa66af1a49)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '2df1c1e4-0f06-47bc-9e43-4ffa66af1a49', 'IKO Phoenix', 'Phoenix', 'AZ', '85009', 33.4521, -112.1152, true, true)
ON CONFLICT DO NOTHING;

-- TAMKO (id: 2b4a04d8-1e65-4e8b-9af4-c4bcffeb7315)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '2b4a04d8-1e65-4e8b-9af4-c4bcffeb7315', 'TAMKO Phoenix', 'Phoenix', 'AZ', '85040', 33.3890, -112.0650, true, true),
  (gen_random_uuid(), '2b4a04d8-1e65-4e8b-9af4-c4bcffeb7315', 'TAMKO Glendale', 'Glendale', 'AZ', '85301', 33.5387, -112.1860, true, false)
ON CONFLICT DO NOTHING;

-- Malarkey (id: 1aa53c6a-d253-4e24-902c-d27c25d8bab2)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '1aa53c6a-d253-4e24-902c-d27c25d8bab2', 'Malarkey Phoenix', 'Phoenix', 'AZ', '85034', 33.4378, -112.0320, true, true)
ON CONFLICT DO NOTHING;

-- Boral (id: a1f3f1b6-afdb-406c-ae5a-99c68a8ddfd5)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'a1f3f1b6-afdb-406c-ae5a-99c68a8ddfd5', 'Boral Phoenix', 'Phoenix', 'AZ', '85043', 33.4123, -112.1234, true, true),
  (gen_random_uuid(), 'a1f3f1b6-afdb-406c-ae5a-99c68a8ddfd5', 'Boral Mesa', 'Mesa', 'AZ', '85201', 33.4150, -111.8315, true, false)
ON CONFLICT DO NOTHING;

-- Eagle Roofing (id: adea54f4-20cf-476e-8260-e64fb4511c36)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'adea54f4-20cf-476e-8260-e64fb4511c36', 'Eagle Roofing Phoenix', 'Phoenix', 'AZ', '85009', 33.4560, -112.1080, true, true),
  (gen_random_uuid(), 'adea54f4-20cf-476e-8260-e64fb4511c36', 'Eagle Roofing Chandler', 'Chandler', 'AZ', '85225', 33.3062, -111.8413, true, false)
ON CONFLICT DO NOTHING;

-- DECRA (id: f5a93c3f-6b58-43f8-b7a5-ad8afcb202b2)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'f5a93c3f-6b58-43f8-b7a5-ad8afcb202b2', 'DECRA Phoenix', 'Phoenix', 'AZ', '85034', 33.4342, -112.0270, true, true)
ON CONFLICT DO NOTHING;

-- Monier (id: ba203d79-f877-49b6-a772-fa488fb98dd2)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'ba203d79-f877-49b6-a772-fa488fb98dd2', 'Monier Phoenix', 'Phoenix', 'AZ', '85040', 33.3965, -112.0510, true, true)
ON CONFLICT DO NOTHING;

-- Westlake Royal (id: d485b973-94b9-4bd0-a2f0-4e05e06d978d)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'd485b973-94b9-4bd0-a2f0-4e05e06d978d', 'Westlake Royal Phoenix', 'Phoenix', 'AZ', '85034', 33.4321, -112.0185, true, true),
  (gen_random_uuid(), 'd485b973-94b9-4bd0-a2f0-4e05e06d978d', 'Westlake Royal Tucson', 'Tucson', 'AZ', '85705', 32.2480, -110.9730, true, false)
ON CONFLICT DO NOTHING;

-- SRS Distribution (id: 90fe4a26-3ff6-40b6-8a3a-c6f86b00f924)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '90fe4a26-3ff6-40b6-8a3a-c6f86b00f924', 'SRS Distribution Phoenix', 'Phoenix', 'AZ', '85009', 33.4510, -112.1050, true, true),
  (gen_random_uuid(), '90fe4a26-3ff6-40b6-8a3a-c6f86b00f924', 'SRS Distribution Mesa', 'Mesa', 'AZ', '85210', 33.3950, -111.8410, true, false),
  (gen_random_uuid(), '90fe4a26-3ff6-40b6-8a3a-c6f86b00f924', 'SRS Distribution Tucson', 'Tucson', 'AZ', '85714', 32.1890, -110.9510, true, false)
ON CONFLICT DO NOTHING;

-- Elite Roofing Supply (id: e9c1a509-9588-4726-9b2c-a08230cc747c)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'e9c1a509-9588-4726-9b2c-a08230cc747c', 'Elite Roofing Supply Phoenix', 'Phoenix', 'AZ', '85040', 33.3920, -112.0480, true, true),
  (gen_random_uuid(), 'e9c1a509-9588-4726-9b2c-a08230cc747c', 'Elite Roofing Supply Flagstaff', 'Flagstaff', 'AZ', '86001', 35.1983, -111.6513, true, false)
ON CONFLICT DO NOTHING;

-- Carlisle (id: 65ea2020-388d-430e-b10d-f71baa66ea96)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '65ea2020-388d-430e-b10d-f71baa66ea96', 'Carlisle Phoenix', 'Phoenix', 'AZ', '85034', 33.4380, -112.0190, true, true)
ON CONFLICT DO NOTHING;

-- Firestone (id: e2cfd6a1-4d75-415f-b456-73f1ab2db15b)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'e2cfd6a1-4d75-415f-b456-73f1ab2db15b', 'Firestone Phoenix', 'Phoenix', 'AZ', '85009', 33.4532, -112.1120, true, true)
ON CONFLICT DO NOTHING;

-- Versico (id: a054be13-7da3-4fac-9d56-cf00ed9bf2f1)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'a054be13-7da3-4fac-9d56-cf00ed9bf2f1', 'Versico Phoenix', 'Phoenix', 'AZ', '85040', 33.3890, -112.0520, true, true)
ON CONFLICT DO NOTHING;

-- Johns Manville (id: 13d2b842-2816-428d-a290-727519a95fdb)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '13d2b842-2816-428d-a290-727519a95fdb', 'Johns Manville Phoenix', 'Phoenix', 'AZ', '85034', 33.4365, -112.0230, true, true)
ON CONFLICT DO NOTHING;

-- GACO (id: 13abecd8-e281-4053-8b73-80bada138428)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '13abecd8-e281-4053-8b73-80bada138428', 'GACO Phoenix', 'Phoenix', 'AZ', '85009', 33.4498, -112.1065, true, true)
ON CONFLICT DO NOTHING;

-- Tremco (id: 1d25f923-7c8a-441c-b698-ea1d4cf2b537)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '1d25f923-7c8a-441c-b698-ea1d4cf2b537', 'Tremco Phoenix', 'Phoenix', 'AZ', '85040', 33.3945, -112.0475, true, true)
ON CONFLICT DO NOTHING;

-- Polyglass (id: 368bccb7-801f-440d-9615-9b7af044e989)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '368bccb7-801f-440d-9615-9b7af044e989', 'Polyglass Phoenix', 'Phoenix', 'AZ', '85034', 33.4310, -112.0265, true, true)
ON CONFLICT DO NOTHING;

-- APOC (id: e854a9e5-8678-48d8-9927-d96fdafc0b27)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'e854a9e5-8678-48d8-9927-d96fdafc0b27', 'APOC Phoenix', 'Phoenix', 'AZ', '85009', 33.4475, -112.1095, true, true)
ON CONFLICT DO NOTHING;

-- Metal Sales (id: 1351d73f-1a9b-48b3-8c9b-e8d5cf7dd994)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '1351d73f-1a9b-48b3-8c9b-e8d5cf7dd994', 'Metal Sales Phoenix', 'Phoenix', 'AZ', '85043', 33.4095, -112.1145, true, true)
ON CONFLICT DO NOTHING;

-- ATAS International (id: 30ef1bdf-ee32-47e0-b59b-719ceb71f458)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '30ef1bdf-ee32-47e0-b59b-719ceb71f458', 'ATAS Phoenix', 'Phoenix', 'AZ', '85034', 33.4355, -112.0195, true, true)
ON CONFLICT DO NOTHING;

-- Nucor Skyline (id: 0c4e0174-f917-46cf-b627-91e09d0fce34)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '0c4e0174-f917-46cf-b627-91e09d0fce34', 'Nucor Skyline Phoenix', 'Phoenix', 'AZ', '85043', 33.4110, -112.1180, true, true)
ON CONFLICT DO NOTHING;

-- Berridge (id: 253f7fb6-be40-4a38-be37-170265cfdb5f)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '253f7fb6-be40-4a38-be37-170265cfdb5f', 'Berridge Phoenix', 'Phoenix', 'AZ', '85040', 33.3975, -112.0435, true, true)
ON CONFLICT DO NOTHING;

-- Roof Hugger (id: f1431cc2-3eef-457a-9b71-5f6f8eef387f)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), 'f1431cc2-3eef-457a-9b71-5f6f8eef387f', 'Roof Hugger Phoenix', 'Phoenix', 'AZ', '85034', 33.4330, -112.0210, true, true)
ON CONFLICT DO NOTHING;

-- Standing Seam USA (id: 5fee8636-a144-4280-a29e-67ca8f259cab)
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '5fee8636-a144-4280-a29e-67ca8f259cab', 'Standing Seam USA Phoenix', 'Phoenix', 'AZ', '85009', 33.4505, -112.1030, true, true)
ON CONFLICT DO NOTHING;

-- Add Northern AZ locations for key vendors
INSERT INTO app."VendorLocation" (id, "vendorId", name, city, state, zip, lat, lng, "isActive", "isPrimaryLocation")
VALUES
  (gen_random_uuid(), '73111753-c51d-4f5f-958c-ad442ff6530c', 'ABC Supply Flagstaff', 'Flagstaff', 'AZ', '86001', 35.1983, -111.6513, true, false),
  (gen_random_uuid(), '73111753-c51d-4f5f-958c-ad442ff6530c', 'ABC Supply Prescott', 'Prescott', 'AZ', '86301', 34.5400, -112.4685, true, false),
  (gen_random_uuid(), '2e63a748-3af3-42a2-8025-886cba853d9b', 'GAF Flagstaff', 'Flagstaff', 'AZ', '86001', 35.2050, -111.6420, true, false),
  (gen_random_uuid(), '453d42db-f724-4e62-87f8-2b41ad2932df', 'Owens Corning Flagstaff', 'Flagstaff', 'AZ', '86004', 35.2127, -111.5891, true, false),
  (gen_random_uuid(), '90fe4a26-3ff6-40b6-8a3a-c6f86b00f924', 'SRS Distribution Flagstaff', 'Flagstaff', 'AZ', '86001', 35.1920, -111.6480, true, false)
ON CONFLICT DO NOTHING;

-- Verify the count
-- SELECT COUNT(*) as total_locations FROM app."VendorLocation";
