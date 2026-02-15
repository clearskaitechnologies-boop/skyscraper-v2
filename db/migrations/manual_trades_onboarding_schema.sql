-- Trades Onboarding Schema Migration
-- Run this manually on your Supabase database
-- Or use: psql <your-database-url> -f this-file.sql

-- Add new columns to TradesCompanyMember table
ALTER TABLE "TradesCompanyMember" 
  ADD COLUMN IF NOT EXISTS "tradeType" TEXT,
  ADD COLUMN IF NOT EXISTS "jobTitle" TEXT,
  ADD COLUMN IF NOT EXISTS "bio" TEXT,
  ADD COLUMN IF NOT EXISTS "workHistory" JSONB,
  ADD COLUMN IF NOT EXISTS "lookingFor" TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN "TradesCompanyMember"."tradeType" IS 'Primary trade category (Roofing, Solar, HVAC, etc)';
COMMENT ON COLUMN "TradesCompanyMember"."jobTitle" IS 'Specific job title (Owner/Contractor, Project Manager, etc)';
COMMENT ON COLUMN "TradesCompanyMember"."bio" IS 'Professional bio (max 500 characters)';
COMMENT ON COLUMN "TradesCompanyMember"."workHistory" IS 'JSON array of work history: [{"company": "...", "role": "...", "years": "..."}]';
COMMENT ON COLUMN "TradesCompanyMember"."lookingFor" IS 'Array of networking needs: Subcontractors, Work, Labor, Materials, etc';

-- Verify columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'TradesCompanyMember' 
  AND column_name IN ('tradeType', 'jobTitle', 'bio', 'workHistory', 'lookingFor')
ORDER BY column_name;
