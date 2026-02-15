-- =============================================================================
-- ENHANCED PRO PROFILE FIELDS
-- Adds hours of operation, multiple phone numbers, licensing info
-- Migration: 20260128_enhance_trades_profile.sql
-- =============================================================================

-- Add new columns to tradesCompanyMember for enhanced profile features
ALTER TABLE "tradesCompanyMember"
ADD COLUMN IF NOT EXISTS "officePhone" TEXT,
ADD COLUMN IF NOT EXISTS "mobilePhone" TEXT,
ADD COLUMN IF NOT EXISTS "hoursOfOperation" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "rocNumber" TEXT,
ADD COLUMN IF NOT EXISTS "rocExpiration" DATE,
ADD COLUMN IF NOT EXISTS "insuranceProvider" TEXT,
ADD COLUMN IF NOT EXISTS "insuranceExpiration" DATE,
ADD COLUMN IF NOT EXISTS "bondAmount" TEXT,
ADD COLUMN IF NOT EXISTS "bondExpiration" DATE,
ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
ADD COLUMN IF NOT EXISTS "emergencyAvailable" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "freeEstimates" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT,
ADD COLUMN IF NOT EXISTS "aboutCompany" TEXT,
ADD COLUMN IF NOT EXISTS "tagline" TEXT,
ADD COLUMN IF NOT EXISTS "foundedYear" INT,
ADD COLUMN IF NOT EXISTS "teamSize" TEXT,
ADD COLUMN IF NOT EXISTS "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add similar columns to tradesCompany for company-level info
ALTER TABLE "tradesCompany"
ADD COLUMN IF NOT EXISTS "officePhone" TEXT,
ADD COLUMN IF NOT EXISTS "hoursOfOperation" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "rocNumber" TEXT,
ADD COLUMN IF NOT EXISTS "rocExpiration" DATE,
ADD COLUMN IF NOT EXISTS "insuranceProvider" TEXT,
ADD COLUMN IF NOT EXISTS "insuranceExpiration" DATE,
ADD COLUMN IF NOT EXISTS "bondAmount" TEXT,
ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS "paymentMethods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "languages" TEXT[] DEFAULT ARRAY['English']::TEXT[],
ADD COLUMN IF NOT EXISTS "emergencyAvailable" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "freeEstimates" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "warrantyInfo" TEXT,
ADD COLUMN IF NOT EXISTS "aboutCompany" TEXT,
ADD COLUMN IF NOT EXISTS "tagline" TEXT,
ADD COLUMN IF NOT EXISTS "foundedYear" INT,
ADD COLUMN IF NOT EXISTS "teamSize" TEXT,
ADD COLUMN IF NOT EXISTS "portfolioImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Comments for documentation
COMMENT ON COLUMN "tradesCompanyMember"."officePhone" IS 'Main office phone number';
COMMENT ON COLUMN "tradesCompanyMember"."mobilePhone" IS 'Personal/work mobile number';
COMMENT ON COLUMN "tradesCompanyMember"."hoursOfOperation" IS 'JSON object with days as keys and hours as values, e.g. {"monday": "8:00 AM - 5:00 PM", "saturday": "By Appointment"}';
COMMENT ON COLUMN "tradesCompanyMember"."rocNumber" IS 'Arizona ROC (Registrar of Contractors) license number';
COMMENT ON COLUMN "tradesCompanyMember"."rocExpiration" IS 'ROC license expiration date';
COMMENT ON COLUMN "tradesCompanyMember"."socialLinks" IS 'JSON object with social media links, e.g. {"facebook": "url", "instagram": "url", "linkedin": "url"}';
COMMENT ON COLUMN "tradesCompanyMember"."portfolioImages" IS 'Array of URLs to portfolio/project images';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trades_member_roc ON "tradesCompanyMember"("rocNumber") WHERE "rocNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trades_member_emergency ON "tradesCompanyMember"("emergencyAvailable") WHERE "emergencyAvailable" = true;

-- Update Drytop Roofing with enhanced profile data
UPDATE "tradesCompanyMember"
SET 
  "officePhone" = '(928) 555-0123',
  "mobilePhone" = '(928) 555-0124',
  "hoursOfOperation" = '{
    "monday": "7:00 AM - 6:00 PM",
    "tuesday": "7:00 AM - 6:00 PM", 
    "wednesday": "7:00 AM - 6:00 PM",
    "thursday": "7:00 AM - 6:00 PM",
    "friday": "7:00 AM - 6:00 PM",
    "saturday": "8:00 AM - 2:00 PM",
    "sunday": "Emergency Only"
  }'::jsonb,
  "rocNumber" = 'ROC-123456',
  "rocExpiration" = '2027-12-31',
  "insuranceProvider" = 'State Farm Commercial',
  "insuranceExpiration" = '2026-06-30',
  "bondAmount" = '$1,000,000',
  "socialLinks" = '{
    "facebook": "https://facebook.com/drytoproofing",
    "instagram": "https://instagram.com/drytoproofingaz",
    "youtube": "https://youtube.com/@drytoproofing",
    "google": "https://g.page/drytop-roofing"
  }'::jsonb,
  "paymentMethods" = ARRAY['Cash', 'Check', 'Credit Card', 'Financing Available', 'Insurance Claims'],
  "languages" = ARRAY['English', 'Spanish'],
  "emergencyAvailable" = true,
  "freeEstimates" = true,
  "warrantyInfo" = '25-year manufacturer warranty on materials, 10-year workmanship warranty on all installations',
  "aboutCompany" = 'Drytop Roofing has been serving Northern Arizona since 2011. We are a family-owned business committed to providing the highest quality roofing services at fair prices. Our team of certified professionals handles everything from minor repairs to complete roof replacements. We specialize in all roofing types suited for Arizona climate - tile, shingle, metal, and flat roofing systems.',
  "tagline" = 'Your Trusted Northern Arizona Roofing Experts',
  "foundedYear" = 2011,
  "teamSize" = '10-15 employees'
WHERE id = 'pro-1';

-- Verify the update
SELECT 
  id,
  "firstName",
  "lastName",
  "companyName",
  "officePhone",
  "mobilePhone",
  "rocNumber",
  "hoursOfOperation",
  "emergencyAvailable",
  "tagline"
FROM "tradesCompanyMember"
WHERE id = 'pro-1';
