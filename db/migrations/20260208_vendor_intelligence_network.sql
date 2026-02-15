-- ============================================================================
-- VENDOR INTELLIGENCE NETWORK (VIN) Migration
-- Date: 2026-02-08
-- Description: Expands vendor system into full procurement + intelligence hub
-- ============================================================================

BEGIN;

-- 1) Extend existing "Vendor" table with new columns
ALTER TABLE "Vendor"
  ADD COLUMN IF NOT EXISTS "emergencyPhone"    TEXT,
  ADD COLUMN IF NOT EXISTS "isFeatured"        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerified"        BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "tradeTypes"        TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "vendorTypes"       TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "serviceRegions"    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "rating"            DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS "reviewCount"       INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "deliveryRadiusMi"  INTEGER,
  ADD COLUMN IF NOT EXISTS "financingAvail"    BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "rebatesAvail"      BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "certifications"    TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS "Vendor_isFeatured_idx" ON "Vendor" ("isFeatured");
CREATE INDEX IF NOT EXISTS "Vendor_tradeTypes_idx" ON "Vendor" USING GIN ("tradeTypes");
CREATE INDEX IF NOT EXISTS "Vendor_vendorTypes_idx" ON "Vendor" USING GIN ("vendorTypes");

-- 2) Extend "VendorLocation" table
ALTER TABLE "VendorLocation"
  ADD COLUMN IF NOT EXISTS "deliveryRadiusMi"   INTEGER,
  ADD COLUMN IF NOT EXISTS "deliveryCutoffTime" TEXT,
  ADD COLUMN IF NOT EXISTS "localRepName"       TEXT,
  ADD COLUMN IF NOT EXISTS "localRepPhone"      TEXT,
  ADD COLUMN IF NOT EXISTS "emergencyPhone"     TEXT;

-- 3) Vendor Products V2 — full catalog
CREATE TABLE IF NOT EXISTS "vendor_products_v2" (
  "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId"        TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "tradeType"       TEXT NOT NULL,
  "sku"             TEXT,
  "name"            TEXT NOT NULL,
  "category"        TEXT,
  "subcategory"     TEXT,
  "manufacturer"    TEXT,
  "description"     TEXT,
  "brochureUrl"     TEXT,
  "specSheetUrl"    TEXT,
  "warrantyUrl"     TEXT,
  "msdsUrl"         TEXT,
  "codeApprovalUrl" TEXT,
  "dataSheetUrl"    TEXT,
  "imageUrl"        TEXT,
  "priceRangeLow"   DECIMAL(10,2),
  "priceRangeHigh"  DECIMAL(10,2),
  "unit"            TEXT DEFAULT 'each',
  "inStock"         BOOLEAN DEFAULT true,
  "leadTimeDays"    INTEGER,
  "features"        TEXT[] DEFAULT '{}',
  "tags"            TEXT[] DEFAULT '{}',
  "isActive"        BOOLEAN DEFAULT true,
  "createdAt"       TIMESTAMPTZ DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "vp2_vendorId_idx" ON "vendor_products_v2" ("vendorId");
CREATE INDEX IF NOT EXISTS "vp2_tradeType_idx" ON "vendor_products_v2" ("tradeType");
CREATE INDEX IF NOT EXISTS "vp2_category_idx" ON "vendor_products_v2" ("category");
CREATE INDEX IF NOT EXISTS "vp2_manufacturer_idx" ON "vendor_products_v2" ("manufacturer");
CREATE INDEX IF NOT EXISTS "vp2_isActive_idx" ON "vendor_products_v2" ("isActive");

-- 4) Vendor Assets — brochures, flyers, pitch decks
CREATE TABLE IF NOT EXISTS "vendor_assets" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId"    TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "type"        TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "jobUseCase"  TEXT,
  "pdfUrl"      TEXT NOT NULL,
  "fileSize"    TEXT,
  "tradeType"   TEXT,
  "isActive"    BOOLEAN DEFAULT true,
  "downloads"   INTEGER DEFAULT 0,
  "createdAt"   TIMESTAMPTZ DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "va_vendorId_idx" ON "vendor_assets" ("vendorId");
CREATE INDEX IF NOT EXISTS "va_type_idx" ON "vendor_assets" ("type");
CREATE INDEX IF NOT EXISTS "va_tradeType_idx" ON "vendor_assets" ("tradeType");

-- 5) Vendor Programs — rebates, financing, certifications
CREATE TABLE IF NOT EXISTS "vendor_programs" (
  "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId"        TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "programType"     TEXT NOT NULL,
  "name"            TEXT NOT NULL,
  "description"     TEXT,
  "eligibility"     TEXT,
  "amount"          DECIMAL(10,2),
  "percentOff"      DECIMAL(5,2),
  "validFrom"       TIMESTAMPTZ,
  "validTo"         TIMESTAMPTZ,
  "applicationUrl"  TEXT,
  "terms"           TEXT,
  "isActive"        BOOLEAN DEFAULT true,
  "createdAt"       TIMESTAMPTZ DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "vprog_vendorId_idx" ON "vendor_programs" ("vendorId");
CREATE INDEX IF NOT EXISTS "vprog_programType_idx" ON "vendor_programs" ("programType");
CREATE INDEX IF NOT EXISTS "vprog_isActive_idx" ON "vendor_programs" ("isActive");

-- 6) Job Vendors — link vendors to jobs/claims
CREATE TABLE IF NOT EXISTS "job_vendors" (
  "id"             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId"       TEXT NOT NULL REFERENCES "Vendor"("id") ON DELETE CASCADE,
  "claimId"        TEXT,
  "jobId"          TEXT,
  "orgId"          TEXT NOT NULL,
  "role"           TEXT,
  "notes"          TEXT,
  "attachedBy"     TEXT,
  "status"         TEXT DEFAULT 'active',
  "brochuresSent"  BOOLEAN DEFAULT false,
  "clientNotified" BOOLEAN DEFAULT false,
  "createdAt"      TIMESTAMPTZ DEFAULT now(),
  "updatedAt"      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "jv_vendorId_idx" ON "job_vendors" ("vendorId");
CREATE INDEX IF NOT EXISTS "jv_claimId_idx" ON "job_vendors" ("claimId");
CREATE INDEX IF NOT EXISTS "jv_jobId_idx" ON "job_vendors" ("jobId");
CREATE INDEX IF NOT EXISTS "jv_orgId_idx" ON "job_vendors" ("orgId");

-- 7) Supplier Connectors — external purchasing integrations
CREATE TABLE IF NOT EXISTS "supplier_connectors" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "vendorId"    TEXT REFERENCES "Vendor"("id") ON DELETE SET NULL,
  "orgId"       TEXT NOT NULL,
  "supplier"    TEXT NOT NULL,
  "authType"    TEXT DEFAULT 'api_key',
  "credentials" JSONB,
  "isActive"    BOOLEAN DEFAULT true,
  "lastSyncAt"  TIMESTAMPTZ,
  "syncStatus"  TEXT DEFAULT 'idle',
  "config"      JSONB,
  "createdAt"   TIMESTAMPTZ DEFAULT now(),
  "updatedAt"   TIMESTAMPTZ DEFAULT now(),
  UNIQUE("orgId", "supplier")
);

CREATE INDEX IF NOT EXISTS "sc_orgId_idx" ON "supplier_connectors" ("orgId");
CREATE INDEX IF NOT EXISTS "sc_supplier_idx" ON "supplier_connectors" ("supplier");

-- 8) Material Carts — persistent per-job carts
CREATE TABLE IF NOT EXISTS "material_carts" (
  "id"        TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orgId"     TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "claimId"   TEXT,
  "jobId"     TEXT,
  "name"      TEXT DEFAULT 'Untitled Cart',
  "status"    TEXT DEFAULT 'open',
  "supplier"  TEXT,
  "metadata"  JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "mc_orgId_idx" ON "material_carts" ("orgId");
CREATE INDEX IF NOT EXISTS "mc_userId_idx" ON "material_carts" ("userId");
CREATE INDEX IF NOT EXISTS "mc_claimId_idx" ON "material_carts" ("claimId");
CREATE INDEX IF NOT EXISTS "mc_status_idx" ON "material_carts" ("status");

-- 9) Material Cart Items
CREATE TABLE IF NOT EXISTS "material_cart_items" (
  "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "cartId"          TEXT NOT NULL REFERENCES "material_carts"("id") ON DELETE CASCADE,
  "productName"     TEXT NOT NULL,
  "sku"             TEXT,
  "manufacturer"    TEXT,
  "category"        TEXT,
  "color"           TEXT,
  "quantity"        DECIMAL(10,2) NOT NULL,
  "unit"            TEXT DEFAULT 'each',
  "unitPrice"       DECIMAL(10,2),
  "lineTotal"       DECIMAL(10,2),
  "supplier"        TEXT,
  "supplierUrl"     TEXT,
  "imageUrl"        TEXT,
  "specifications"  JSONB,
  "notes"           TEXT,
  "createdAt"       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "mci_cartId_idx" ON "material_cart_items" ("cartId");

-- 10) Material Receipts — parsed digital receipts
CREATE TABLE IF NOT EXISTS "material_receipts" (
  "id"              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orgId"           TEXT NOT NULL,
  "orderId"         TEXT,
  "claimId"         TEXT,
  "supplier"        TEXT NOT NULL,
  "receiptNumber"   TEXT,
  "receiptUrl"      TEXT,
  "purchaseDate"    TIMESTAMPTZ,
  "subtotal"        DECIMAL(10,2),
  "tax"             DECIMAL(10,2),
  "total"           DECIMAL(10,2),
  "paymentMethod"   TEXT,
  "parsedItems"     JSONB,
  "rawText"         TEXT,
  "parseConfidence" DECIMAL(5,4),
  "eta"             TIMESTAMPTZ,
  "trackingNumber"  TEXT,
  "status"          TEXT DEFAULT 'pending',
  "createdAt"       TIMESTAMPTZ DEFAULT now(),
  "updatedAt"       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "mr_orgId_idx" ON "material_receipts" ("orgId");
CREATE INDEX IF NOT EXISTS "mr_orderId_idx" ON "material_receipts" ("orderId");
CREATE INDEX IF NOT EXISTS "mr_claimId_idx" ON "material_receipts" ("claimId");
CREATE INDEX IF NOT EXISTS "mr_supplier_idx" ON "material_receipts" ("supplier");

-- 11) Vendor Workflow Events — event-driven automation
CREATE TABLE IF NOT EXISTS "vendor_workflow_events" (
  "id"          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orgId"       TEXT NOT NULL,
  "eventType"   TEXT NOT NULL,
  "entityType"  TEXT NOT NULL,
  "entityId"    TEXT NOT NULL,
  "claimId"     TEXT,
  "jobId"       TEXT,
  "payload"     JSONB,
  "processed"   BOOLEAN DEFAULT false,
  "processedAt" TIMESTAMPTZ,
  "createdAt"   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "vwe_orgId_idx" ON "vendor_workflow_events" ("orgId");
CREATE INDEX IF NOT EXISTS "vwe_eventType_idx" ON "vendor_workflow_events" ("eventType");
CREATE INDEX IF NOT EXISTS "vwe_entity_idx" ON "vendor_workflow_events" ("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "vwe_processed_idx" ON "vendor_workflow_events" ("processed");
CREATE INDEX IF NOT EXISTS "vwe_claimId_idx" ON "vendor_workflow_events" ("claimId");

COMMIT;
