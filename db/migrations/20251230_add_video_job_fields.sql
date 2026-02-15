-- Mission 4D: Add video job fields to jobs table
-- Enables retry logic, progress tracking, and error handling for video generation

-- Add video-specific columns to jobs table
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS "leadId" TEXT,
ADD COLUMN IF NOT EXISTS "stage" TEXT,
ADD COLUMN IF NOT EXISTS "progress" INTEGER,
ADD COLUMN IF NOT EXISTS "videoReportId" TEXT,
ADD COLUMN IF NOT EXISTS "photos" JSONB,
ADD COLUMN IF NOT EXISTS "inputData" JSONB,
ADD COLUMN IF NOT EXISTS "outputData" JSONB,
ADD COLUMN IF NOT EXISTS "errorCode" TEXT,
ADD COLUMN IF NOT EXISTS "errorMessage" TEXT,
ADD COLUMN IF NOT EXISTS "retryCount" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS "startedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "failedAt" TIMESTAMP(3);

-- Create indexes for video job queries
CREATE INDEX IF NOT EXISTS "jobs_leadId_jobType_idx" ON jobs("leadId", "jobType");
CREATE INDEX IF NOT EXISTS "jobs_videoReportId_idx" ON jobs("videoReportId");

-- Verify schema changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND column_name IN ('leadId', 'stage', 'progress', 'videoReportId', 'retryCount', 'errorCode')
ORDER BY column_name;
