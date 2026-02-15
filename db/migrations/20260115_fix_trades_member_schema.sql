-- Fix tradesCompanyMember schema drift
-- Add all missing columns that Prisma expects

ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "pendingCompanyToken" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "orgId" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "firstName" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "lastName" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "tradeType" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "workHistory" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS certifications TEXT[] DEFAULT '{}';
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "lookingFor" TEXT[] DEFAULT '{}';
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "yearsExperience" INTEGER;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "profilePhoto" TEXT;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN DEFAULT false;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "canEditCompany" BOOLEAN DEFAULT false;
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE app."tradesCompanyMember" ADD COLUMN IF NOT EXISTS "onboardingStep" TEXT DEFAULT 'profile';

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_trades_member_orgId ON app."tradesCompanyMember"("orgId");
CREATE INDEX IF NOT EXISTS idx_trades_member_status ON app."tradesCompanyMember"(status);
