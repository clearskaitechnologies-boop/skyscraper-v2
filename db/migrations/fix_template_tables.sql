-- Fix Template tables in app schema
SET search_path TO app;

-- Base Template table
CREATE TABLE IF NOT EXISTS "Template" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    slug TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    "thumbnailUrl" TEXT,
    version TEXT DEFAULT '1.0',
    tags TEXT[] DEFAULT '{}',
    "isPublished" BOOLEAN DEFAULT FALSE,
    "isActive" BOOLEAN DEFAULT TRUE,
    "isMarketplace" BOOLEAN DEFAULT FALSE,
    sections JSONB DEFAULT '[]',
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- OrgTemplate (company's templates)
CREATE TABLE IF NOT EXISTS "OrgTemplate" (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "orgId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL REFERENCES "Template"(id) ON DELETE CASCADE,
    "customName" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMPTZ DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("orgId", "templateId")
);

-- Seed the mandatory 'Initial Claim Inspection' template
INSERT INTO "Template" (
    id, slug, name, description, category, version, "isPublished", "isActive", "isMarketplace", tags
)
VALUES (
    'template-initial-claim-inspection',
    'initial-claim-inspection',
    'Initial Claim Inspection',
    'First response inspection report documenting initial damage findings and emergency mitigation.',
    'Inspections',
    '1.0',
    TRUE,
    TRUE,
    TRUE,
    ARRAY['initial', 'claim', 'inspection', 'mandatory']
)
ON CONFLICT (slug) DO UPDATE SET
    "isPublished" = TRUE,
    "isActive" = TRUE,
    "updatedAt" = NOW();

-- Seed more demo templates for the marketplace
INSERT INTO "Template" (id, slug, name, description, category, version, "isPublished", "isActive", "isMarketplace", tags)
VALUES 
(
    'template-roof-inspection',
    'roof-inspection',
    'Roof Inspection Report',
    'Comprehensive roof inspection documenting condition, damage, and recommended repairs.',
    'Inspections',
    '1.0',
    TRUE, TRUE, TRUE,
    ARRAY['roof', 'inspection', 'damage']
),
(
    'template-storm-damage',
    'storm-damage-assessment',
    'Storm Damage Assessment',
    'Complete storm damage documentation for insurance claims including photos and material analysis.',
    'Claims',
    '1.0',
    TRUE, TRUE, TRUE,
    ARRAY['storm', 'damage', 'hail', 'wind']
),
(
    'template-contractor-estimate',
    'contractor-estimate',
    'Contractor Estimate Template',
    'Professional estimate template with labor and materials breakdown.',
    'Estimates',
    '1.0',
    TRUE, TRUE, TRUE,
    ARRAY['estimate', 'contractor', 'bid']
),
(
    'template-supplement-request',
    'supplement-request',
    'Insurance Supplement Request',
    'Formal supplement request template for additional claim items.',
    'Claims',
    '1.0',
    TRUE, TRUE, TRUE,
    ARRAY['supplement', 'insurance', 'claim']
)
ON CONFLICT (slug) DO NOTHING;

SELECT COUNT(*) AS template_count FROM "Template";
