-- ============================================================================
-- FIX: GAF document library PDFs now return 403 (BlobNotFound)
-- GAF locked down their Azure-hosted document library.
-- Replacing dead PDF links with live product pages on gaf.com.
-- Run: psql "$DATABASE_URL" -f ./db/migrations/20260213_fix_gaf_brochure_urls.sql
-- ============================================================================

SET search_path TO app;

BEGIN;

-- Timberline HDZ → product page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles/timberline-hdz-shingles'
WHERE sku = 'GAF-HDZ-01';

-- Timberline UHDZ → product page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/timberline-shingles/timberline-uhdz-shingles'
WHERE sku = 'GAF-UHDZ-01';

-- Algae Shield → warranties page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/for-homeowners/warranties/stainguard-plus-algae-protection-limited-warranty'
WHERE sku = 'GAF-AS2-01';

-- Camelot II → designer shingles page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/designer-shingles/camelot-ii-shingles'
WHERE sku = 'GAF-CAMELOT2-01';

-- WeatherWatch → leak barriers page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/leak-barriers/weatherwatch-mineral-surfaced-leak-barrier'
WHERE sku = 'GAF-WW-01';

-- StormGuard → leak barriers page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/leak-barriers/stormguard-film-surfaced-leak-barrier'
WHERE sku = 'GAF-SG-01';

-- FeltBuster → roof deck protection page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/roof-deck-protection/feltbuster-synthetic-roofing-underlayment'
WHERE sku = 'GAF-FB-01';

-- TimberTex → ridge caps page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/hip-and-ridge-cap-shingles/timbertex-premium-ridge-cap-shingles'
WHERE sku = 'GAF-TIMBERTEX-01';

-- Cobra Ventilation → ventilation page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/ventilation'
WHERE sku = 'GAF-COBRAVR-01';

-- Master Flow → ventilation page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials/residential-roofing-products/ventilation'
WHERE sku = 'GAF-MASTFLOW-01';

-- Catch-all: Any remaining gaf.com/en-us/document-library PDFs → main product page
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/roofing-materials'
WHERE "brochureUrl" LIKE '%gaf.com/en-us/document-library%';

COMMIT;

-- Verify
SELECT sku, "brochureUrl" FROM vendor_products_v2 WHERE "vendorSlug" = 'gaf' ORDER BY sku;
