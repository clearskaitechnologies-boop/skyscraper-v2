-- ============================================================================
-- FIX: Update brochure URLs from product pages to actual PDF brochures
-- Previously, brochureUrl pointed to product web pages (404s or HTML)
-- Now points to real downloadable PDF brochures
-- Run: psql "$DATABASE_URL" -f ./db/patches/fix-brochure-urls.sql
-- ============================================================================

SET search_path TO app;

BEGIN;

-- GAF products: fix all brochure URLs
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/timberline-hdz-brochure-restz145.pdf'
WHERE sku = 'GAF-HDZ-01';

UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/timberline-uhdz-brochure-restz264.pdf'
WHERE sku = 'GAF-UHDZ-01';

UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/advanced-algae-protection-sell-sheet-resgn439.pdf'
WHERE sku = 'GAF-AS2-01';

UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/brochure__commercial_roofing_products_catalog_comgn295.pdf'
WHERE sku IN ('GAF-CAMELOT2-01', 'GAF-WW-01', 'GAF-SG-01', 'GAF-FB-01', 'GAF-COBRAVR-01', 'GAF-MASTFLOW-01');

UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/timberline-hdz-brochure-restz145.pdf'
WHERE sku = 'GAF-TIMBERTEX-01';

-- Owens Corning products
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.owenscorning.com/en-us/roofing/documents/duration-shingles-brochure.pdf'
WHERE sku IN ('OC-TDX-01', 'OC-TDXD-01', 'OC-DECORIDGE-01');

UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.owenscorning.com/en-us/roofing/documents/roofing-warranty-brochure.pdf'
WHERE sku IN ('OC-WP-01', 'OC-PROARMOR-01');

-- CertainTeed products
UPDATE vendor_products_v2
SET "brochureUrl" = 'https://www.certainteed.com/resources/CertainTeed-Residential-Roofing-Brochure.pdf'
WHERE sku IN ('CT-LMK-01', 'CT-LMKPRO-01', 'CT-GP-01', 'CT-WINTERGUARD-01');

COMMIT;

SELECT 'Brochure URLs updated successfully' AS status,
  COUNT(*) FILTER (WHERE "brochureUrl" LIKE '%.pdf') AS pdf_urls,
  COUNT(*) FILTER (WHERE "brochureUrl" IS NOT NULL AND "brochureUrl" NOT LIKE '%.pdf') AS non_pdf_urls
FROM vendor_products_v2;
