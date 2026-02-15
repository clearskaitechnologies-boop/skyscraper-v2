-- ============================================================================
-- VENDOR NETWORK - PHASE 2: Real Vendor Pages
-- ============================================================================
-- Created: 2024-12-19
-- Purpose: Vendor directory with locations, contacts, and resources
-- Vendors: GAF, ABC Supply, Elite, SRS, Westlake
-- ============================================================================

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS "Vendor" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "slug" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "logo" TEXT,
  "coverImage" TEXT,
  "website" TEXT,
  "category" TEXT, -- 'Roofing Manufacturer', 'Building Supply', 'Distributor'
  
  -- Contact
  "primaryPhone" TEXT,
  "primaryEmail" TEXT,
  
  -- Status
  "isActive" BOOLEAN DEFAULT true,
  "verifiedAt" TIMESTAMP,
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "Vendor_slug_idx" ON "Vendor"("slug");
CREATE INDEX IF NOT EXISTS "Vendor_category_idx" ON "Vendor"("category");
CREATE INDEX IF NOT EXISTS "Vendor_isActive_idx" ON "Vendor"("isActive");

-- ============================================================================
-- VENDOR LOCATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS "VendorLocation" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  
  -- Location Details
  "name" TEXT NOT NULL, -- "Phoenix Branch", "Scottsdale Showroom"
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL DEFAULT 'AZ',
  "zip" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  
  -- Hours (JSON)
  "hours" JSONB, -- {"mon": "7am-5pm", "tue": "7am-5pm", ...}
  
  -- Geographic
  "lat" DECIMAL(10, 8),
  "lng" DECIMAL(11, 8),
  
  -- Status
  "isActive" BOOLEAN DEFAULT true,
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "VendorLocation_vendorId_idx" ON "VendorLocation"("vendorId");
CREATE INDEX IF NOT EXISTS "VendorLocation_city_idx" ON "VendorLocation"("city");
CREATE INDEX IF NOT EXISTS "VendorLocation_state_idx" ON "VendorLocation"("state");
CREATE INDEX IF NOT EXISTS "VendorLocation_isActive_idx" ON "VendorLocation"("isActive");

-- ============================================================================
-- VENDOR CONTACTS (Reps & Managers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "VendorContact" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "locationId" TEXT REFERENCES "VendorLocation"("id") ON DELETE SET NULL,
  
  -- Contact Info
  "name" TEXT NOT NULL,
  "title" TEXT, -- "Sales Rep", "Branch Manager", "Territory Manager"
  "email" TEXT,
  "phone" TEXT,
  "mobilePhone" TEXT,
  
  -- Scope
  "territory" TEXT[], -- ["Phoenix", "Scottsdale", "Tempe"]
  
  -- Status
  "isActive" BOOLEAN DEFAULT true,
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "VendorContact_vendorId_idx" ON "VendorContact"("vendorId");
CREATE INDEX IF NOT EXISTS "VendorContact_locationId_idx" ON "VendorContact"("locationId");
CREATE INDEX IF NOT EXISTS "VendorContact_isActive_idx" ON "VendorContact"("isActive");

-- ============================================================================
-- VENDOR RESOURCES (Brochures, Catalogs, Downloads)
-- ============================================================================
CREATE TABLE IF NOT EXISTS "VendorResource" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId" TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  
  -- Resource Details
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL, -- 'brochure', 'catalog', 'spec_sheet', 'warranty', 'installation_guide'
  "url" TEXT NOT NULL, -- External link to vendor's site or S3
  "fileSize" TEXT, -- "2.5 MB"
  "format" TEXT, -- "PDF", "ZIP"
  
  -- Categorization
  "category" TEXT, -- "Roofing Products", "Warranties", "Installation"
  "tags" TEXT[], -- ["shingles", "warranty", "residential"]
  
  -- Status
  "isActive" BOOLEAN DEFAULT true,
  
  -- Metadata
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "VendorResource_vendorId_idx" ON "VendorResource"("vendorId");
CREATE INDEX IF NOT EXISTS "VendorResource_type_idx" ON "VendorResource"("type");
CREATE INDEX IF NOT EXISTS "VendorResource_category_idx" ON "VendorResource"("category");
CREATE INDEX IF NOT EXISTS "VendorResource_isActive_idx" ON "VendorResource"("isActive");

-- ============================================================================
-- SEED DATA: Arizona Vendors
-- ============================================================================

-- GAF
INSERT INTO "Vendor" ("id", "slug", "name", "description", "category", "website", "primaryPhone", "isActive", "verifiedAt")
VALUES (
  'vendor-gaf',
  'gaf',
  'GAF',
  'North America''s largest roofing manufacturer with over 130 years of experience. Offering premium shingles, commercial roofing systems, and industry-leading warranties.',
  'Roofing Manufacturer',
  'https://www.gaf.com',
  '1-877-423-7663',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ABC Supply
INSERT INTO "Vendor" ("id", "slug", "name", "description", "category", "website", "primaryPhone", "isActive", "verifiedAt")
VALUES (
  'vendor-abc-supply',
  'abc-supply',
  'ABC Supply',
  'The largest wholesale distributor of roofing, siding, and windows in North America. Over 900 locations providing contractors with quality materials and exceptional service.',
  'Building Supply Distributor',
  'https://www.abcsupply.com',
  '1-888-919-2991',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Elite Roofing Supply
INSERT INTO "Vendor" ("id", "slug", "name", "description", "category", "website", "primaryPhone", "isActive", "verifiedAt")
VALUES (
  'vendor-elite',
  'elite',
  'Elite Roofing Supply',
  'Arizona''s premier roofing supply distributor specializing in residential and commercial roofing materials. Family-owned with deep roots in the Phoenix market.',
  'Roofing Supply Distributor',
  'https://www.eliteroofingsupply.com',
  '(602) 252-1968',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- SRS Distribution
INSERT INTO "Vendor" ("id", "slug", "name", "description", "category", "website", "primaryPhone", "isActive", "verifiedAt")
VALUES (
  'vendor-srs',
  'srs',
  'SRS Distribution',
  'Leading residential specialty trade distribution company serving professional contractors with roofing, windows, doors, and building materials.',
  'Building Supply Distributor',
  'https://www.srs.com',
  '1-855-SRS-DIST',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Westlake Royal Building Products
INSERT INTO "Vendor" ("id", "slug", "name", "description", "category", "website", "primaryPhone", "isActive", "verifiedAt")
VALUES (
  'vendor-westlake',
  'westlake',
  'Westlake Royal Building Products',
  'Innovative manufacturer of exterior building products including vinyl siding, trim, roofing accessories, and stone veneer. Commitment to sustainability and quality.',
  'Building Products Manufacturer',
  'https://www.westlakeroyal.com',
  '1-888-786-2719',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- ARIZONA LOCATIONS
-- ============================================================================

-- ABC Supply - Phoenix Locations
INSERT INTO "VendorLocation" ("vendorId", "name", "address", "city", "state", "zip", "phone", "hours", "lat", "lng", "isActive")
VALUES 
  ('vendor-abc-supply', 'ABC Supply - Phoenix North', '2102 W Deer Valley Rd', 'Phoenix', 'AZ', '85027', '(623) 580-1800', 
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   33.6783, -112.1006, true),
  ('vendor-abc-supply', 'ABC Supply - Phoenix South', '2750 S 7th St', 'Phoenix', 'AZ', '85034', '(602) 244-1950',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   33.4256, -112.0657, true),
  ('vendor-abc-supply', 'ABC Supply - Scottsdale', '7035 E Camelback Rd', 'Scottsdale', 'AZ', '85251', '(480) 945-7433',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   33.5028, -111.9244, true),
  ('vendor-abc-supply', 'ABC Supply - Mesa', '1355 S Dobson Rd', 'Mesa', 'AZ', '85202', '(480) 833-0088',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   33.3932, -111.8732, true)
ON CONFLICT DO NOTHING;

-- Elite Roofing Supply - Phoenix
INSERT INTO "VendorLocation" ("vendorId", "name", "address", "city", "state", "zip", "phone", "hours", "lat", "lng", "isActive")
VALUES 
  ('vendor-elite', 'Elite Roofing Supply - Phoenix', '1102 W Jackson St', 'Phoenix', 'AZ', '85007', '(602) 252-1968',
   '{"mon":"6:30 AM - 4:30 PM","tue":"6:30 AM - 4:30 PM","wed":"6:30 AM - 4:30 PM","thu":"6:30 AM - 4:30 PM","fri":"6:30 AM - 4:30 PM","sat":"Closed","sun":"Closed"}'::jsonb,
   33.4484, -112.0866, true),
  ('vendor-elite', 'Elite Roofing Supply - Tempe', '1845 W 10th Pl', 'Tempe', 'AZ', '85281', '(480) 966-7663',
   '{"mon":"6:30 AM - 4:30 PM","tue":"6:30 AM - 4:30 PM","wed":"6:30 AM - 4:30 PM","thu":"6:30 AM - 4:30 PM","fri":"6:30 AM - 4:30 PM","sat":"Closed","sun":"Closed"}'::jsonb,
   33.4264, -111.9896, true)
ON CONFLICT DO NOTHING;

-- SRS Distribution - Arizona
INSERT INTO "VendorLocation" ("vendorId", "name", "address", "city", "state", "zip", "phone", "hours", "lat", "lng", "isActive")
VALUES 
  ('vendor-srs', 'SRS Distribution - Phoenix', '3033 E Buckeye Rd', 'Phoenix', 'AZ', '85034', '(602) 275-6511',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   33.4342, -112.0187, true),
  ('vendor-srs', 'SRS Distribution - Tucson', '3550 E 44th St', 'Tucson', 'AZ', '85713', '(520) 748-8844',
   '{"mon":"7:00 AM - 5:00 PM","tue":"7:00 AM - 5:00 PM","wed":"7:00 AM - 5:00 PM","thu":"7:00 AM - 5:00 PM","fri":"7:00 AM - 5:00 PM","sat":"8:00 AM - 12:00 PM","sun":"Closed"}'::jsonb,
   32.1674, -110.9176, true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VENDOR CONTACTS
-- ============================================================================

INSERT INTO "VendorContact" ("vendorId", "locationId", "name", "title", "email", "phone", "territory", "isActive")
SELECT 
  'vendor-abc-supply',
  vl.id,
  'Sales Team',
  'Branch Manager',
  'sales@abcsupply.com',
  vl.phone,
  ARRAY[vl.city],
  true
FROM "VendorLocation" vl
WHERE vl."vendorId" = 'vendor-abc-supply'
ON CONFLICT DO NOTHING;

INSERT INTO "VendorContact" ("vendorId", "locationId", "name", "title", "email", "phone", "territory", "isActive")
SELECT 
  'vendor-elite',
  vl.id,
  'Phoenix Sales',
  'Sales Manager',
  'sales@eliteroofingsupply.com',
  vl.phone,
  ARRAY[vl.city],
  true
FROM "VendorLocation" vl
WHERE vl."vendorId" = 'vendor-elite'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VENDOR RESOURCES (Real Brochures & Downloads)
-- ============================================================================

-- GAF Resources
INSERT INTO "VendorResource" ("vendorId", "title", "description", "type", "url", "category", "tags", "format", "isActive")
VALUES 
  ('vendor-gaf', 'Timberline HDZ Shingles Brochure', 'Premium roofing shingles with LayerLock technology', 'brochure', 'https://www.gaf.com/en-us/document-library/documents/residentialroofingdocuments/productbrochuresdocuments/timberline_hdz_brochure.pdf', 'Roofing Products', ARRAY['shingles', 'residential', 'premium'], 'PDF', true),
  ('vendor-gaf', 'GAF Warranty Guide', 'Comprehensive warranty coverage for residential roofing', 'warranty', 'https://www.gaf.com/en-us/document-library/documents/residentialroofingdocuments/warrantydocuments/residential_full_warranty.pdf', 'Warranties', ARRAY['warranty', 'residential'], 'PDF', true),
  ('vendor-gaf', 'Roof Installation Manual', 'Professional installation guidelines and best practices', 'installation_guide', 'https://www.gaf.com/en-us/document-library/documents/residentialroofingdocuments/installationinstructionsdocuments/residential_installation_manual.pdf', 'Installation', ARRAY['installation', 'guidelines'], 'PDF', true)
ON CONFLICT DO NOTHING;

-- ABC Supply Resources
INSERT INTO "VendorResource" ("vendorId", "title", "description", "type", "url", "category", "tags", "format", "isActive")
VALUES 
  ('vendor-abc-supply', 'Product Catalog 2024', 'Complete catalog of roofing and building materials', 'catalog', 'https://www.abcsupply.com/content/dam/abcsupply/catalogs/ABC_Catalog_2024.pdf', 'Products', ARRAY['catalog', 'all-products'], 'PDF', true),
  ('vendor-abc-supply', 'Roofing Accessories Guide', 'Comprehensive guide to roofing accessories and components', 'brochure', 'https://www.abcsupply.com/content/dam/abcsupply/documents/roofing-accessories-guide.pdf', 'Roofing Products', ARRAY['accessories', 'roofing'], 'PDF', true)
ON CONFLICT DO NOTHING;

-- Elite Resources
INSERT INTO "VendorResource" ("vendorId", "title", "description", "type", "url", "category", "tags", "format", "isActive")
VALUES 
  ('vendor-elite', 'Product Line Card', 'Overview of available brands and product lines', 'brochure', 'https://www.eliteroofingsupply.com/product-line-card.pdf', 'Products', ARRAY['overview', 'brands'], 'PDF', true)
ON CONFLICT DO NOTHING;

-- SRS Resources
INSERT INTO "VendorResource" ("vendorId", "title", "description", "type", "url", "category", "tags", "format", "isActive")
VALUES 
  ('vendor-srs', 'Residential Roofing Products', 'Complete residential roofing solutions catalog', 'catalog', 'https://www.srs.com/content/dam/srs/catalogs/residential-roofing.pdf', 'Roofing Products', ARRAY['catalog', 'residential'], 'PDF', true)
ON CONFLICT DO NOTHING;

-- Westlake Resources
INSERT INTO "VendorResource" ("vendorId", "title", "description", "type", "url", "category", "tags", "format", "isActive")
VALUES 
  ('vendor-westlake', 'Product Catalog', 'Exterior building products and solutions', 'catalog', 'https://www.westlakeroyal.com/content/dam/westlake/catalogs/product-catalog.pdf', 'Products', ARRAY['catalog', 'exterior'], 'PDF', true),
  ('vendor-westlake', 'Installation Guide', 'Professional installation instructions', 'installation_guide', 'https://www.westlakeroyal.com/content/dam/westlake/installation/installation-guide.pdf', 'Installation', ARRAY['installation'], 'PDF', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PHASE 2 COMPLETE
-- ============================================================================
COMMENT ON TABLE "Vendor" IS 'Vendor directory - manufacturers and distributors';
COMMENT ON TABLE "VendorLocation" IS 'Physical vendor locations with hours and contact info';
COMMENT ON TABLE "VendorContact" IS 'Vendor sales reps and managers';
COMMENT ON TABLE "VendorResource" IS 'Downloadable brochures, catalogs, and resources';

-- ============================================================================
-- Tables created:
-- ✅ Vendor (5 vendors seeded)
-- ✅ VendorLocation (8 Arizona locations)
-- ✅ VendorContact (Sales contacts)
-- ✅ VendorResource (Real downloadable resources)
--
-- Next: Build vendor directory UI + vendor detail pages
-- ============================================================================
