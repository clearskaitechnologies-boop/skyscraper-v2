-- Fix GAF brochure URLs — replace generic commercial catalog with product-specific PDFs
-- Run: psql "$DATABASE_URL" -f ./db/migrations/20260211_fix_brochure_urls.sql

SET search_path TO app;

UPDATE vendor_products_v2 SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/camelot-ii-brochure-resdg141.pdf'
WHERE sku = 'GAF-CAMELOT2-01';

UPDATE vendor_products_v2 SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/weatherwatch-leak-barrier-sell-sheet-resgn466.pdf'
WHERE sku = 'GAF-WW-01';

UPDATE vendor_products_v2 SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/stormguard-leak-barrier-sell-sheet-resgn467.pdf'
WHERE sku = 'GAF-SG-01';

UPDATE vendor_products_v2 SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/feltbuster-synthetic-underlayment-sell-sheet-resgn468.pdf'
WHERE sku = 'GAF-FB-01';

UPDATE vendor_products_v2 SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/cobra-ventilation-brochure-resvn175.pdf'
WHERE sku = 'GAF-COBRAVR-01';

UPDATE vendor_products_v2 SET "brochureUrl" = 'https://www.gaf.com/en-us/document-library/documents/brochures-&-literature/master-flow-ventilation-brochure-resvn176.pdf'
WHERE sku = 'GAF-MASTFLOW-01';
