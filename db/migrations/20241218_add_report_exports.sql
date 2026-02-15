-- Migration: Add ReportExport table
-- Created: 2024-12-18
-- Purpose: Track all generated PDF exports (reports, supplements, mockups)

CREATE TABLE IF NOT EXISTS "ReportExport" (
  "id" TEXT PRIMARY KEY,
  "claimId" TEXT NOT NULL,
  "orgId" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- "report", "supplement", "mockup"
  "templateId" TEXT,
  "orgTemplateId" TEXT,
  "storagePath" TEXT NOT NULL,
  "storageUrl" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metadata" JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "ReportExport_claimId_idx" ON "ReportExport"("claimId");
CREATE INDEX IF NOT EXISTS "ReportExport_orgId_idx" ON "ReportExport"("orgId");
CREATE INDEX IF NOT EXISTS "ReportExport_type_idx" ON "ReportExport"("type");
CREATE INDEX IF NOT EXISTS "ReportExport_createdAt_idx" ON "ReportExport"("createdAt");
