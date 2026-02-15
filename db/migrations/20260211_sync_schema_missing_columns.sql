-- ============================================================================
-- 20260211: Sync missing columns from Prisma schema to production database
-- ============================================================================
-- The Prisma schema has ~30 columns on tradesCompanyMember and ~7 on
-- tradesCompany that were never migrated to production. This causes
-- Prisma queries to crash with "column does not exist" errors.
-- ============================================================================

BEGIN;

-- ── tradesCompanyMember: Add missing columns ──

ALTER TABLE "tradesCompanyMember"
  ADD COLUMN IF NOT EXISTS "isOwner"               BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isActive"               BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "officePhone"            TEXT,
  ADD COLUMN IF NOT EXISTS "mobilePhone"            TEXT,
  ADD COLUMN IF NOT EXISTS "hoursOfOperation"       JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "rocNumber"              TEXT,
  ADD COLUMN IF NOT EXISTS "rocExpiration"           DATE,
  ADD COLUMN IF NOT EXISTS "licenseNumber"          TEXT,
  ADD COLUMN IF NOT EXISTS "licenseState"           TEXT,
  ADD COLUMN IF NOT EXISTS "businessEntityType"     TEXT,
  ADD COLUMN IF NOT EXISTS "isBonded"               BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isInsured"              BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "insuranceProvider"      TEXT,
  ADD COLUMN IF NOT EXISTS "insuranceExpiration"    DATE,
  ADD COLUMN IF NOT EXISTS "insurancePolicyNumber"  TEXT,
  ADD COLUMN IF NOT EXISTS "bondAmount"             TEXT,
  ADD COLUMN IF NOT EXISTS "bondExpiration"          DATE,
  ADD COLUMN IF NOT EXISTS "additionalNotes"        TEXT,
  ADD COLUMN IF NOT EXISTS "coverageTypes"          TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "socialLinks"            JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "paymentMethods"         TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "languages"              TEXT[] DEFAULT '{English}',
  ADD COLUMN IF NOT EXISTS "emergencyAvailable"     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "freeEstimates"          BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS "warrantyInfo"           TEXT,
  ADD COLUMN IF NOT EXISTS "aboutCompany"           TEXT,
  ADD COLUMN IF NOT EXISTS "tagline"                TEXT,
  ADD COLUMN IF NOT EXISTS "foundedYear"            INTEGER,
  ADD COLUMN IF NOT EXISTS "teamSize"               TEXT,
  ADD COLUMN IF NOT EXISTS "portfolioImages"        TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "lastSeenAt"             TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS "customStatus"           TEXT,
  ADD COLUMN IF NOT EXISTS "statusEmoji"            TEXT;

-- ── tradesCompany: Add missing columns ──

ALTER TABLE "tradesCompany"
  ADD COLUMN IF NOT EXISTS "coverimage"         TEXT,
  ADD COLUMN IF NOT EXISTS "lat"                TEXT,
  ADD COLUMN IF NOT EXISTS "lng"                TEXT,
  ADD COLUMN IF NOT EXISTS "serviceArea"        TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "insuranceVerified"  BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isVerified"         BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isActive"           BOOLEAN DEFAULT true;

COMMIT;
