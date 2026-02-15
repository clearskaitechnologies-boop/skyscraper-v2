-- Add VideoReport table and enum
-- Drop 4: AI Video Reports

-- Create enum for video report types
DO $$ BEGIN
    CREATE TYPE "VideoReportType" AS ENUM ('CLAIM', 'RETAIL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create VideoReport table
CREATE TABLE IF NOT EXISTS "VideoReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orgId" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "type" "VideoReportType" NOT NULL,
    "url" TEXT NOT NULL,
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "VideoReport_orgId_claimId_type_idx" ON "VideoReport"("orgId", "claimId", "type");
