-- ============================================================================
-- TEMPLATE MARKETPLACE SYSTEM
-- Created: 2026-01-14
-- Purpose: Add template and orgTemplate tables for marketplace functionality
-- ============================================================================

-- Template table (marketplace templates)
CREATE TABLE IF NOT EXISTS template (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  "thumbnailUrl" TEXT,
  "previewUrl" TEXT,
  content JSONB,
  fields JSONB,
  "isPublished" BOOLEAN DEFAULT FALSE,
  "isMarketplace" BOOLEAN DEFAULT TRUE,
  "authorId" TEXT,
  "authorName" TEXT,
  price INTEGER DEFAULT 0,
  "downloadCount" INTEGER DEFAULT 0,
  rating DECIMAL(2,1),
  "reviewCount" INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  version TEXT DEFAULT '1.0',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_template_category ON template(category);
CREATE INDEX IF NOT EXISTS idx_template_ispublished ON template("isPublished");
CREATE INDEX IF NOT EXISTS idx_template_ismarketplace ON template("isMarketplace");
CREATE INDEX IF NOT EXISTS idx_template_authorid ON template("authorId");

-- OrgTemplate table (links orgs to marketplace templates)
CREATE TABLE IF NOT EXISTS "orgTemplate" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "orgId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL REFERENCES template(id) ON DELETE CASCADE,
  "customName" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("orgId", "templateId")
);

CREATE INDEX IF NOT EXISTS idx_orgtemplate_orgid ON "orgTemplate"("orgId");
CREATE INDEX IF NOT EXISTS idx_orgtemplate_templateid ON "orgTemplate"("templateId");

-- Trigger to auto-update updatedAt
CREATE OR REPLACE FUNCTION update_template_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS template_updated_at ON template;
CREATE TRIGGER template_updated_at
  BEFORE UPDATE ON template
  FOR EACH ROW EXECUTE FUNCTION update_template_timestamp();

DROP TRIGGER IF EXISTS orgtemplate_updated_at ON "orgTemplate";
CREATE TRIGGER orgtemplate_updated_at
  BEFORE UPDATE ON "orgTemplate"
  FOR EACH ROW EXECUTE FUNCTION update_template_timestamp();

-- ============================================================================
-- SEED DEFAULT TEMPLATES (marketplace starters)
-- ============================================================================

INSERT INTO template (id, name, description, category, "isPublished", "isMarketplace", "authorName", tags, version)
VALUES 
  ('tpl_roof_inspection', 'Roof Inspection Report', 'Professional roof inspection template with photo sections', 'inspection', TRUE, TRUE, 'SkaiScraper', ARRAY['roof', 'inspection', 'photos'], '1.0'),
  ('tpl_damage_assessment', 'Storm Damage Assessment', 'Comprehensive storm damage documentation template', 'damage', TRUE, TRUE, 'SkaiScraper', ARRAY['storm', 'damage', 'hail', 'wind'], '1.0'),
  ('tpl_repair_proposal', 'Repair Proposal', 'Customer-facing repair proposal with itemized costs', 'proposal', TRUE, TRUE, 'SkaiScraper', ARRAY['proposal', 'estimate', 'customer'], '1.0'),
  ('tpl_supplement', 'Supplement Request', 'Insurance supplement documentation template', 'supplement', TRUE, TRUE, 'SkaiScraper', ARRAY['supplement', 'insurance', 'claim'], '1.0'),
  ('tpl_final_invoice', 'Final Invoice', 'Professional invoice template for completed work', 'invoice', TRUE, TRUE, 'SkaiScraper', ARRAY['invoice', 'billing', 'payment'], '1.0')
ON CONFLICT (id) DO NOTHING;

-- Done
COMMENT ON TABLE template IS 'Marketplace templates available for organizations to add';
COMMENT ON TABLE "orgTemplate" IS 'Links organizations to marketplace templates they have added';
