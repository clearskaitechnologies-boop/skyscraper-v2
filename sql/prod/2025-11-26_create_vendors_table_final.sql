-- PRODUCTION VENDORS TABLE MIGRATION
-- Date: 2025-11-26
-- Purpose: Create vendors table to fix sign-in crashes
-- Safe to run: Uses IF NOT EXISTS for idempotency

-- Create vendors table matching Prisma schema (model vendors)
CREATE TABLE IF NOT EXISTS public.vendors (
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
CREATE INDEX IF NOT EXISTS vendors_region_idx ON public.vendors(region);
CREATE INDEX IF NOT EXISTS vendors_type_idx ON public.vendors(type);
CREATE INDEX IF NOT EXISTS vendors_org_id_idx ON public.vendors(org_id);

-- Verify table was created
SELECT 'vendors table created successfully' as status, COUNT(*) as row_count FROM public.vendors;

-- Expected output: "vendors table created successfully" | 0
