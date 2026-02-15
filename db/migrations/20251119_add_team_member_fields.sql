-- Add phone, title, and jobHistory columns to team_members table
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "jobHistory" JSONB DEFAULT '[]'::jsonb;

-- Add composite index for phone lookups within an org
CREATE INDEX IF NOT EXISTS "team_members_org_id_phone_idx" ON "team_members"("org_id", "phone");

-- Add comments for documentation
COMMENT ON COLUMN "team_members"."phone" IS 'Contact phone number for team member';
COMMENT ON COLUMN "team_members"."title" IS 'Job title or role (e.g., Project Manager, Foreman, Estimator)';
COMMENT ON COLUMN "team_members"."jobHistory" IS 'Array of completed projects/jobs for experience tracking';
