-- =============================================================================
-- Multi-Category Distributor Mapping
-- Distributors like ABC Supply, Beacon, and SRS carry products across many trades.
-- This migration ensures their tradeTypes arrays reflect the full range of
-- product categories they actually sell.
-- =============================================================================

BEGIN;

-- ABC Supply — roofing, siding, gutters, windows/doors, insulation, carpentry (decking),
-- fencing, plus building materials broadly
UPDATE "Vendor" SET
  "tradeTypes" = ARRAY[
    'roofing',
    'siding',
    'gutters',
    'windows_doors',
    'insulation',
    'carpentry',
    'fencing',
    'concrete'
  ],
  "updatedAt" = NOW()
WHERE slug = 'abc-supply';

-- SRS Distribution — roofing, siding, windows/doors, gutters, insulation
UPDATE "Vendor" SET
  "tradeTypes" = ARRAY[
    'roofing',
    'siding',
    'windows_doors',
    'gutters',
    'insulation'
  ],
  "updatedAt" = NOW()
WHERE slug = 'srs-distribution';

-- Beacon Building Products — roofing, siding, windows/doors, insulation, gutters, carpentry
UPDATE "Vendor" SET
  "tradeTypes" = ARRAY[
    'roofing',
    'siding',
    'windows_doors',
    'gutters',
    'insulation',
    'carpentry'
  ],
  "updatedAt" = NOW()
WHERE slug = 'beacon-building';

COMMIT;

-- Verify
SELECT slug, name, "tradeTypes", "vendorTypes"
FROM "Vendor"
WHERE slug IN ('abc-supply', 'srs-distribution', 'beacon-building');
