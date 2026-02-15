-- Migrate existing report_templates to new Template table
-- This copies MARKETPLACE templates to the new marketplace system

INSERT INTO "Template" (
  id,
  title,
  description,
  category,
  tags,
  version,
  "templateJson",
  placeholders,
  "thumbnailUrl",
  "previewPdfUrl",
  "isPublished",
  "createdAt",
  "updatedAt"
)
SELECT 
  id,
  name AS title,
  COALESCE(description, '') AS description,
  'damage-assessment' AS category,
  ARRAY[]::text[] AS tags,
  COALESCE(layout_version, '1.0.0') AS version,
  COALESCE(section_enabled, '{}'::jsonb) AS "templateJson",
  ARRAY[]::text[] AS placeholders,
  NULL AS "thumbnailUrl",
  NULL AS "previewPdfUrl",
  true AS "isPublished",
  created_at AS "createdAt",
  COALESCE(updated_at, created_at) AS "updatedAt"
FROM report_templates
WHERE template_type = 'MARKETPLACE'
ON CONFLICT (id) DO NOTHING;

-- Log result
SELECT COUNT(*) AS "Templates migrated" FROM "Template";
