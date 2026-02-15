-- Migration: Create vendors table
-- Date: 2025-11-26
-- Purpose: Fix "vendors table does not exist" error on dashboard load

-- Create vendors table matching Prisma schema
CREATE TABLE IF NOT EXISTS vendors (
  id TEXT PRIMARY KEY,
  org_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  service_types TEXT[] DEFAULT '{}',
  region TEXT,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS vendors_region_idx ON vendors(region);
CREATE INDEX IF NOT EXISTS vendors_type_idx ON vendors(type);
CREATE INDEX IF NOT EXISTS vendors_org_id_idx ON vendors(org_id);

-- Add foreign key constraint to Org table (optional, only if Org table uses 'id' column)
-- Uncomment the line below if you want referential integrity:
-- ALTER TABLE vendors ADD CONSTRAINT vendors_org_id_fkey FOREIGN KEY (org_id) REFERENCES "Org"(id) ON DELETE SET NULL;

COMMENT ON TABLE vendors IS 'Vendor directory for contractors and manufacturers';
