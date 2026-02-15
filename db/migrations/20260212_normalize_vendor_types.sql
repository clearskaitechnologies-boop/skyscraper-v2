-- ============================================================================
-- Normalize vendorTypes to lowercase snake_case
-- Fixes PascalCase values from 20260209_all_vendors_complete.sql
-- Execute: psql "$DATABASE_URL" -f ./db/migrations/20260212_normalize_vendor_types.sql
-- ============================================================================
-- Problem: 64 vendors have PascalCase vendorTypes like 'Manufacturer', 'Distributor',
-- 'Retailer', 'Service Provider'. The API filters use lowercase ('manufacturer',
-- 'distributor', etc.) so these vendors are INVISIBLE to both the client Products
-- page and the pro VIN.
-- ============================================================================

BEGIN;
SET search_path TO app, public;

-- ═══════════════════════════════════════════════════════════════════════════
-- Before counts
-- ═══════════════════════════════════════════════════════════════════════════
DO $$ BEGIN RAISE NOTICE '=== BEFORE NORMALIZATION ==='; END $$;

SELECT unnest AS vendor_type, count
FROM (
  SELECT DISTINCT unnest("vendorTypes") AS unnest, COUNT(*) AS count
  FROM "Vendor" WHERE "isActive" = true
  GROUP BY 1 ORDER BY 1
) sub;

-- ═══════════════════════════════════════════════════════════════════════════
-- Normalize: Replace each PascalCase array element with lowercase snake_case
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: 'Manufacturer' → 'manufacturer'
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Manufacturer', 'manufacturer')
WHERE 'Manufacturer' = ANY("vendorTypes");

-- Step 2: 'Distributor' → 'distributor'
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Distributor', 'distributor')
WHERE 'Distributor' = ANY("vendorTypes");

-- Step 3: 'Retailer' → 'retailer'
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Retailer', 'retailer')
WHERE 'Retailer' = ANY("vendorTypes");

-- Step 4: 'Service Provider' → 'service_provider'
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Service Provider', 'service_provider')
WHERE 'Service Provider' = ANY("vendorTypes");

-- Step 5: 'Supplier' → 'supplier' (just in case)
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Supplier', 'supplier')
WHERE 'Supplier' = ANY("vendorTypes");

-- Step 6: 'Dealer' → 'dealer' (just in case)
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Dealer', 'dealer')
WHERE 'Dealer' = ANY("vendorTypes");

-- Step 7: 'Wholesaler' → 'wholesaler' (just in case)
UPDATE "Vendor"
SET "vendorTypes" = array_replace("vendorTypes", 'Wholesaler', 'wholesaler')
WHERE 'Wholesaler' = ANY("vendorTypes");

-- ═══════════════════════════════════════════════════════════════════════════
-- Deduplicate: Some vendors may now have duplicate entries
-- e.g. {dealer,Manufacturer} → {dealer,manufacturer} but if they already
-- had {manufacturer}, it would be {dealer,manufacturer,manufacturer}
-- ═══════════════════════════════════════════════════════════════════════════
UPDATE "Vendor"
SET "vendorTypes" = (
  SELECT ARRAY(SELECT DISTINCT unnest("vendorTypes") ORDER BY 1)
)
WHERE array_length("vendorTypes", 1) != (
  SELECT COUNT(DISTINCT v) FROM unnest("vendorTypes") v
);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- After counts — verify everything is lowercase
-- ═══════════════════════════════════════════════════════════════════════════
SET search_path TO app, public;

DO $$ BEGIN RAISE NOTICE '=== AFTER NORMALIZATION ==='; END $$;

SELECT unnest AS vendor_type, count
FROM (
  SELECT DISTINCT unnest("vendorTypes") AS unnest, COUNT(*) AS count
  FROM "Vendor" WHERE "isActive" = true
  GROUP BY 1 ORDER BY 1
) sub;

-- Final summary
SELECT
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true AND "vendorTypes" @> '{distributor}') AS distributors,
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true AND "vendorTypes" @> '{dealer}') AS dealers,
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true AND "vendorTypes" @> '{supplier}') AS suppliers,
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true AND "vendorTypes" @> '{retailer}') AS retailers,
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true AND "vendorTypes" @> '{service_provider}') AS service_providers,
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true AND "vendorTypes" @> '{manufacturer}') AS manufacturers,
  (SELECT COUNT(*) FROM "Vendor" WHERE "isActive" = true) AS total;

-- Verify ZERO PascalCase remains
SELECT COUNT(*) AS remaining_pascalcase
FROM "Vendor"
WHERE "isActive" = true
  AND "vendorTypes"::text != lower("vendorTypes"::text);
