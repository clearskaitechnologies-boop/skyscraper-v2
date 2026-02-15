-- Add brochure URL to vendors (orgs table)
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS "brochureUrl" TEXT;

-- Add vendor type field to distinguish manufacturers vs distributors
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS "vendorType" TEXT CHECK ("vendorType" IN ('manufacturer', 'distributor', 'service_provider', 'other'));

-- Add logo URL for vendor branding
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;

-- Add description field for vendor profile
ALTER TABLE orgs ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN orgs."brochureUrl" IS 'URL to vendor brochure PDF (for Report Builder)';
COMMENT ON COLUMN orgs."vendorType" IS 'Type of vendor: manufacturer, distributor, service_provider, other';
COMMENT ON COLUMN orgs."logoUrl" IS 'URL to vendor logo image';
COMMENT ON COLUMN orgs.description IS 'Vendor company description for profile page';
