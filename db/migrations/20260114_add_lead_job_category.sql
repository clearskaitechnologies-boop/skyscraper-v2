-- Add jobCategory field to leads table for routing to different job types
-- Categories: 'claim', 'financed', 'out_of_pocket', 'repair', 'lead' (default)

-- Add the column with default value
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "jobCategory" VARCHAR(50) DEFAULT 'lead';

-- Add clientId for attaching clients to leads/jobs
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "clientId" VARCHAR(255);

-- Create index for filtering by job category
CREATE INDEX IF NOT EXISTS "leads_jobCategory_idx" ON "leads"("jobCategory");
CREATE INDEX IF NOT EXISTS "leads_clientId_idx" ON "leads"("clientId");

-- Update existing leads that have claimId to be 'claim' category
UPDATE "leads" SET "jobCategory" = 'claim' WHERE "claimId" IS NOT NULL AND "jobCategory" = 'lead';

COMMENT ON COLUMN "leads"."jobCategory" IS 'Job type: claim, financed, out_of_pocket, repair, or lead (default)';
COMMENT ON COLUMN "leads"."clientId" IS 'Optional link to Client record for client attachment';
