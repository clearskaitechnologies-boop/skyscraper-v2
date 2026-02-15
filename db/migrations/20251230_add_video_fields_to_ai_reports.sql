-- Mission 4B: Add video-specific fields to ai_reports table
-- These fields are required for Dominus Video AI (Phase 27) video generation pipeline

-- Add video-specific columns
ALTER TABLE ai_reports
ADD COLUMN IF NOT EXISTS "leadId" TEXT,
ADD COLUMN IF NOT EXISTS "scriptJson" JSONB,
ADD COLUMN IF NOT EXISTS "storyboardJson" JSONB,
ADD COLUMN IF NOT EXISTS "videoUrl" TEXT,
ADD COLUMN IF NOT EXISTS "thumbnailUrl" TEXT,
ADD COLUMN IF NOT EXISTS "audioUrl" TEXT,
ADD COLUMN IF NOT EXISTS "duration" INTEGER,
ADD COLUMN IF NOT EXISTS "sizeMb" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "publicId" TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS "isPublic" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "errorMessage" TEXT,
ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);

-- Create indexes for video-related queries
CREATE INDEX IF NOT EXISTS "ai_reports_leadId_idx" ON ai_reports("leadId");
CREATE INDEX IF NOT EXISTS "ai_reports_publicId_idx" ON ai_reports("publicId");

-- Verify schema changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'ai_reports'
  AND column_name IN ('leadId', 'scriptJson', 'videoUrl', 'publicId', 'duration')
ORDER BY column_name;
