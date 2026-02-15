-- PHASE F: Add is_archived column to org table for soft deletes
ALTER TABLE "org"
ADD COLUMN IF NOT EXISTS "is_archived" BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for filtering active orgs
CREATE INDEX IF NOT EXISTS "org_is_archived_idx" ON "org"("is_archived");
