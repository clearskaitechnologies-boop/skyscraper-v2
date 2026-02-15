-- Ensure composite unique constraint for org_branding upserts exists
-- Addresses error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
ALTER TABLE org_branding
ADD CONSTRAINT IF NOT EXISTS org_branding_orgId_ownerId_key UNIQUE ("orgId", "ownerId");
