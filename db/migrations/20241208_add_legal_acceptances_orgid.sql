-- Add orgId column to legal_acceptances table
ALTER TABLE legal_acceptances ADD COLUMN IF NOT EXISTS "orgId" TEXT;

-- Create index on orgId
CREATE INDEX IF NOT EXISTS "legal_acceptances_orgId_idx" ON legal_acceptances("orgId");

-- Make clerkOrgId nullable in organizations table (if not already)
ALTER TABLE organizations ALTER COLUMN "clerkOrgId" DROP NOT NULL;
