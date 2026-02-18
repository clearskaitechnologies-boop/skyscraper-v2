-- 2026-02-18: Reconcile public schema with Prisma model definitions
-- Root cause: Prisma schema evolved but the public.* tables were never updated.
-- The app schema had the columns but Prisma targets public schema by default.
-- This migration adds all missing columns, tables, and indexes.

-- ════════════════════════════════════════════════════
-- 1. claims — missing columns
-- ════════════════════════════════════════════════════
ALTER TABLE public.claims
  ADD COLUMN IF NOT EXISTS lifecycle_stage TEXT,
  ADD COLUMN IF NOT EXISTS policy_number TEXT,
  ADD COLUMN IF NOT EXISTS adjuster_packet_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "homeownerEmail" TEXT,
  ADD COLUMN IF NOT EXISTS homeowner_summary_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "catStormEventId" TEXT,
  ADD COLUMN IF NOT EXISTS homeowner_email TEXT,
  ADD COLUMN IF NOT EXISTS "clientId" TEXT,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

CREATE INDEX IF NOT EXISTS idx_claims_org_stage ON public.claims("orgId", lifecycle_stage);
CREATE INDEX IF NOT EXISTS idx_claims_clientid ON public.claims("clientId");
CREATE INDEX IF NOT EXISTS idx_claims_org_created ON public.claims("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_claims_org_damage_type ON public.claims("orgId", "damageType");
CREATE INDEX IF NOT EXISTS idx_claims_org_external ON public.claims("orgId", "externalId", "externalSource");

-- ════════════════════════════════════════════════════
-- 2. leads — missing columns
-- ════════════════════════════════════════════════════
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "externalId" TEXT,
  ADD COLUMN IF NOT EXISTS "externalSource" TEXT;

-- ════════════════════════════════════════════════════
-- 3. projects — missing columns
-- ════════════════════════════════════════════════════
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMPTZ;

-- ════════════════════════════════════════════════════
-- 4. Vendor — missing columns
-- ════════════════════════════════════════════════════
ALTER TABLE public."Vendor"
  ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tradeTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "vendorTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "serviceRegions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS "reviewCount" INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "deliveryRadiusMi" INT,
  ADD COLUMN IF NOT EXISTS "financingAvail" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "rebatesAvail" BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ════════════════════════════════════════════════════
-- 5. VendorLocation — missing columns
-- ════════════════════════════════════════════════════
ALTER TABLE public."VendorLocation"
  ADD COLUMN IF NOT EXISTS "deliveryRadiusMi" INT,
  ADD COLUMN IF NOT EXISTS "deliveryCutoffTime" TEXT,
  ADD COLUMN IF NOT EXISTS "localRepName" TEXT,
  ADD COLUMN IF NOT EXISTS "localRepPhone" TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyPhone" TEXT;

-- ════════════════════════════════════════════════════
-- 6. VendorContact — missing columns
-- ════════════════════════════════════════════════════
ALTER TABLE public."VendorContact"
  ADD COLUMN IF NOT EXISTS "mobilePhone" TEXT;

-- ════════════════════════════════════════════════════
-- 7. depreciation_items — new table
-- ════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.depreciation_items (
  id TEXT PRIMARY KEY,
  "claimId" TEXT NOT NULL REFERENCES public.claims(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  age INT NOT NULL,
  "expectedLife" INT NOT NULL,
  rcv DOUBLE PRECISION NOT NULL,
  acv DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_depreciation_items_claim ON public.depreciation_items("claimId");

-- ════════════════════════════════════════════════════
-- 8. vendor_products_v2 — new table
-- ════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vendor_products_v2 (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId" UUID NOT NULL REFERENCES public."Vendor"(id) ON DELETE CASCADE,
  "tradeType" TEXT NOT NULL,
  sku TEXT,
  name TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  manufacturer TEXT,
  description TEXT,
  "brochureUrl" TEXT,
  "specSheetUrl" TEXT,
  "warrantyUrl" TEXT,
  "msdsUrl" TEXT,
  "codeApprovalUrl" TEXT,
  "dataSheetUrl" TEXT,
  "imageUrl" TEXT,
  "priceRangeLow" DECIMAL(10,2),
  "priceRangeHigh" DECIMAL(10,2),
  unit TEXT DEFAULT 'each',
  "inStock" BOOLEAN DEFAULT true,
  "leadTimeDays" INT,
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- ════════════════════════════════════════════════════
-- 9. vendor_programs — new table
-- ════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vendor_programs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId" UUID NOT NULL REFERENCES public."Vendor"(id) ON DELETE CASCADE,
  "programType" TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  eligibility TEXT,
  amount DECIMAL(10,2),
  "percentOff" DECIMAL(5,2),
  "validFrom" TIMESTAMP,
  "validTo" TIMESTAMP,
  "applicationUrl" TEXT,
  terms TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- ════════════════════════════════════════════════════
-- 10. Backfill vendor metadata
-- ════════════════════════════════════════════════════
-- Set tradeTypes for existing vendors
UPDATE public."Vendor"
SET "tradeTypes" = ARRAY['roofing']::TEXT[],
    "serviceRegions" = ARRAY['arizona']::TEXT[]
WHERE array_length("tradeTypes", 1) IS NULL OR "tradeTypes" = ARRAY[]::TEXT[];

-- Distributors
UPDATE public."Vendor"
SET "vendorTypes" = ARRAY['distributor']::TEXT[]
WHERE category IN ('Distributor', 'Building Supply')
  AND ("vendorTypes" = ARRAY[]::TEXT[] OR "vendorTypes" IS NULL);

-- Suppliers (everything else — NOT 'manufacturer' to avoid VIN filter exclusion)
UPDATE public."Vendor"
SET "vendorTypes" = ARRAY['supplier']::TEXT[]
WHERE ("vendorTypes" = ARRAY[]::TEXT[] OR "vendorTypes" IS NULL);

DO $$ BEGIN RAISE NOTICE '✅ Public schema reconciliation complete'; END $$;
