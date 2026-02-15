-- Template Intelligence & Community System Migration
-- Date: 2025-12-19

-- Add template readiness and intelligence fields to Template table
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "hasHtml" BOOLEAN DEFAULT false;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "previewReady" BOOLEAN DEFAULT true;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "generateReady" BOOLEAN DEFAULT false;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "batchReady" BOOLEAN DEFAULT false;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "aiEnriched" BOOLEAN DEFAULT false;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "intendedUse" TEXT;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "requiredData" JSONB;
ALTER TABLE "Template" ADD COLUMN IF NOT EXISTS "autoFillMap" JSONB;

-- Create Community table
CREATE TABLE IF NOT EXISTS "Community" (
  "id" TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "geometry" JSONB NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "zipCodes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "homeCount" INTEGER NOT NULL,
  "homeCountMethod" TEXT DEFAULT 'ESTIMATE',
  "stormEventId" TEXT,
  "stormDate" TIMESTAMP(3),
  "status" TEXT DEFAULT 'DRAFT',
  "addressListUrl" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE INDEX IF NOT EXISTS "Community_orgId_idx" ON "Community"("orgId");
CREATE INDEX IF NOT EXISTS "Community_createdByUserId_idx" ON "Community"("createdByUserId");
CREATE INDEX IF NOT EXISTS "Community_status_idx" ON "Community"("status");

-- Create CommunityOrder table
CREATE TABLE IF NOT EXISTS "CommunityOrder" (
  "id" TEXT PRIMARY KEY,
  "communityId" TEXT NOT NULL REFERENCES "Community"("id") ON DELETE CASCADE,
  "orgId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "homeCount" INTEGER NOT NULL,
  "templateIds" TEXT[] NOT NULL,
  "pricePerHome" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "status" TEXT DEFAULT 'PENDING',
  "generatedCount" INTEGER DEFAULT 0,
  "failedCount" INTEGER DEFAULT 0,
  "batchPdfUrl" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3)
);

CREATE INDEX IF NOT EXISTS "CommunityOrder_communityId_idx" ON "CommunityOrder"("communityId");
CREATE INDEX IF NOT EXISTS "CommunityOrder_orgId_idx" ON "CommunityOrder"("orgId");
CREATE INDEX IF NOT EXISTS "CommunityOrder_status_idx" ON "CommunityOrder"("status");

-- Update existing templates with correct readiness flags
-- All HTML templates get hasHtml + generateReady = true
UPDATE "Template" 
SET 
  "hasHtml" = true,
  "generateReady" = true,
  "intendedUse" = 'claim'
WHERE "slug" IN (
  'roofing-inspection',
  'property-inspection', 
  'emergency-mitigation',
  'supplement-estimate',
  'depreciation-rebuttal',
  'contractor-proposal'
);

-- Roofing templates are batch-ready
UPDATE "Template"
SET 
  "batchReady" = true,
  "aiEnriched" = true
WHERE "slug" IN (
  'roofing-inspection',
  'property-inspection'
);

-- Contractor template gets different intended use
UPDATE "Template"
SET "intendedUse" = 'contractor'
WHERE "slug" = 'contractor-proposal';
