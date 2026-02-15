-- Add company info fields directly to tradesCompanyMember
-- This simplifies the flow so users can enter their company info without creating a separate company profile

ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "companyName" VARCHAR(255);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "companyEmail" VARCHAR(255);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "companyWebsite" VARCHAR(500);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "companyLicense" VARCHAR(100);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "coverPhoto" TEXT;
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "serviceArea" VARCHAR(255);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "city" VARCHAR(100);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "state" VARCHAR(50);
ALTER TABLE "tradesCompanyMember" ADD COLUMN IF NOT EXISTS "zip" VARCHAR(20);

-- Add index for searching by company name
CREATE INDEX IF NOT EXISTS idx_trades_member_company_name ON "tradesCompanyMember"("companyName");

COMMENT ON COLUMN "tradesCompanyMember"."companyName" IS 'Business/company name for this tradesperson';
COMMENT ON COLUMN "tradesCompanyMember"."companyEmail" IS 'Business email contact';
COMMENT ON COLUMN "tradesCompanyMember"."companyWebsite" IS 'Company website URL';
COMMENT ON COLUMN "tradesCompanyMember"."companyLicense" IS 'Contractor license number';
COMMENT ON COLUMN "tradesCompanyMember"."coverPhoto" IS 'Profile cover/banner photo URL';
COMMENT ON COLUMN "tradesCompanyMember"."serviceArea" IS 'Description of service area/radius';
