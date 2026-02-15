-- Add real preview URLs to marketplace templates
-- Run with: psql "$DATABASE_URL" -f db/migrations/20251220_add_template_preview_urls.sql

-- Update existing marketplace templates with preview assets
UPDATE "Template"
SET 
  "thumbnailUrl" = '/template-previews/thumbnails/water-damage-restoration.svg',
  "previewPdfUrl" = '/template-previews/pdfs/water-damage-restoration.pdf'
WHERE 
  "title" ILIKE '%water%restoration%'
  AND "isPublished" = true;

UPDATE "Template"
SET 
  "thumbnailUrl" = '/template-previews/thumbnails/roofing-specialist-report.svg',
  "previewPdfUrl" = '/template-previews/pdfs/roofing-specialist-report.pdf'
WHERE 
  "title" ILIKE '%roof%'
  AND "isPublished" = true;

UPDATE "Template"
SET 
  "thumbnailUrl" = '/template-previews/thumbnails/public-adjuster-premium.svg',
  "previewPdfUrl" = '/template-previews/pdfs/public-adjuster-premium.pdf'
WHERE 
  "title" ILIKE '%adjuster%'
  AND "isPublished" = true;

-- Verification
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM "Template"
  WHERE "isPublished" = true 
    AND "thumbnailUrl" IS NOT NULL 
    AND "previewPdfUrl" IS NOT NULL;
  
  RAISE NOTICE '✓ % published templates now have preview URLs', updated_count;
END $$;
