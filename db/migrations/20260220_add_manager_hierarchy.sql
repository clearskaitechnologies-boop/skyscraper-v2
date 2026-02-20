-- Add manager hierarchy to tradesCompanyMember
-- Allows assigning employees to managers for team structure

ALTER TABLE "tradesCompanyMember" 
ADD COLUMN IF NOT EXISTS "managerId" UUID REFERENCES "tradesCompanyMember"(id) ON DELETE SET NULL;

-- Add index for efficient manager lookups
CREATE INDEX IF NOT EXISTS idx_trades_member_manager ON "tradesCompanyMember"("managerId");

-- Add isManager flag for quick filtering
ALTER TABLE "tradesCompanyMember"
ADD COLUMN IF NOT EXISTS "isManager" BOOLEAN DEFAULT false;

-- Comments for documentation
COMMENT ON COLUMN "tradesCompanyMember"."managerId" IS 'References another tradesCompanyMember who manages this employee';
COMMENT ON COLUMN "tradesCompanyMember"."isManager" IS 'True if this member manages other team members';
