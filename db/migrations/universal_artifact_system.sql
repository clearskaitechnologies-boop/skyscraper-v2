-- Universal Artifact System Migration
-- Run with: psql "$DATABASE_URL" -f db/migrations/universal_artifact_system.sql

-- Create enums
DO $$ BEGIN
  CREATE TYPE "ArtifactType" AS ENUM (
    'ROOF_PLAN',
    'WATER_RESTORATION_REPORT',
    'SUPPLEMENT_REPORT',
    'REBUTTAL_REPORT',
    'MOISTURE_REPORT',
    'DEPRECIATION_WORKSHEET',
    'INSPECTION_REPORT',
    'SCOPE_OF_WORK',
    'INVOICE',
    'WORK_AUTHORIZATION',
    'CHANGE_ORDER',
    'SITE_REPORT',
    'PORTFOLIO_RISK_SNAPSHOT',
    'DENIAL_REBUTTAL',
    'CLAIM_REPORT',
    'GENERAL_REPORT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ArtifactStatus" AS ENUM (
    'DRAFT',
    'FINAL',
    'ARCHIVED',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create UniversalTemplate table
CREATE TABLE IF NOT EXISTS "UniversalTemplate" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "type" "ArtifactType" NOT NULL,
  "pdfBaseUrl" TEXT,
  "htmlTemplate" TEXT,
  "thumbnailUrl" TEXT,
  "isMarketplace" BOOLEAN NOT NULL DEFAULT false,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "orgId" TEXT,
  "version" TEXT NOT NULL DEFAULT '1.0.0',
  "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create GeneratedArtifact table
CREATE TABLE IF NOT EXISTS "GeneratedArtifact" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "claimId" TEXT,
  "jobId" TEXT,
  "createdByUserId" TEXT NOT NULL,
  "type" "ArtifactType" NOT NULL,
  "title" TEXT NOT NULL,
  "status" "ArtifactStatus" NOT NULL DEFAULT 'DRAFT',
  "contentText" TEXT,
  "contentJson" JSONB,
  "pdfUrl" TEXT,
  "thumbnailUrl" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "sourceTemplateId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finalizedAt" TIMESTAMP(3),
  CONSTRAINT "GeneratedArtifact_sourceTemplateId_fkey" FOREIGN KEY ("sourceTemplateId") REFERENCES "UniversalTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for UniversalTemplate
CREATE INDEX IF NOT EXISTS "UniversalTemplate_orgId_idx" ON "UniversalTemplate"("orgId");
CREATE INDEX IF NOT EXISTS "UniversalTemplate_type_idx" ON "UniversalTemplate"("type");
CREATE INDEX IF NOT EXISTS "UniversalTemplate_isMarketplace_idx" ON "UniversalTemplate"("isMarketplace");
CREATE INDEX IF NOT EXISTS "UniversalTemplate_category_idx" ON "UniversalTemplate"("category");

-- Create indexes for GeneratedArtifact
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_orgId_idx" ON "GeneratedArtifact"("orgId");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_claimId_idx" ON "GeneratedArtifact"("claimId");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_type_idx" ON "GeneratedArtifact"("type");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_status_idx" ON "GeneratedArtifact"("status");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_createdByUserId_idx" ON "GeneratedArtifact"("createdByUserId");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_createdAt_idx" ON "GeneratedArtifact"("createdAt");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_orgId_claimId_idx" ON "GeneratedArtifact"("orgId", "claimId");
CREATE INDEX IF NOT EXISTS "GeneratedArtifact_orgId_type_idx" ON "GeneratedArtifact"("orgId", "type");

-- Success message
DO $$ BEGIN
  RAISE NOTICE '✅ Universal Artifact System tables created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Created tables:';
  RAISE NOTICE '  - UniversalTemplate';
  RAISE NOTICE '  - GeneratedArtifact';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Created enums:';
  RAISE NOTICE '  - ArtifactType (16 types)';
  RAISE NOTICE '  - ArtifactStatus (6 statuses)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '  1. Run: node scripts/seed-universal-templates.js';
  RAISE NOTICE '  2. Test API: curl http://localhost:3000/api/templates?universal=true';
END $$;
