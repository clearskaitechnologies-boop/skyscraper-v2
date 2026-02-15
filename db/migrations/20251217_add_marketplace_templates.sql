-- Create Template table (marketplace templates)
CREATE TABLE IF NOT EXISTS "Template" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "version" TEXT NOT NULL DEFAULT '1.0.0',
  "templateJson" JSONB NOT NULL,
  "placeholders" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "thumbnailUrl" TEXT,
  "previewPdfUrl" TEXT,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- Create OrgTemplate table (org-specific template instances)
CREATE TABLE IF NOT EXISTS "OrgTemplate" (
  "id" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "titleOverride" TEXT,
  "templateJsonOverride" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrgTemplate_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint for org + template combination
CREATE UNIQUE INDEX IF NOT EXISTS "OrgTemplate_orgId_templateId_key" ON "OrgTemplate"("orgId", "templateId");

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS "OrgTemplate_orgId_idx" ON "OrgTemplate"("orgId");
CREATE INDEX IF NOT EXISTS "OrgTemplate_templateId_idx" ON "OrgTemplate"("templateId");

-- Add comment explaining these tables
COMMENT ON TABLE "Template" IS 'Marketplace templates - global templates available for all orgs';
COMMENT ON TABLE "OrgTemplate" IS 'Org-specific template instances - links orgs to marketplace templates with optional customization';
