-- Fix: Change user_organizations.organization_id from UUID to TEXT
-- Reason: Org table uses mixed ID formats (some TEXT like "org_user_...", some UUID)
-- This migration allows storing any Org.id value in the junction table

BEGIN;

-- Change column type from UUID to TEXT
ALTER TABLE public.user_organizations 
ALTER COLUMN organization_id TYPE TEXT USING organization_id::TEXT;

-- Recreate foreign key if it exists
DO $$
BEGIN
  -- Drop existing FK if present
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_user_orgs_org'
      AND table_name = 'user_organizations'
  ) THEN
    ALTER TABLE public.user_organizations DROP CONSTRAINT fk_user_orgs_org;
  END IF;
  
  -- Recreate FK pointing to Org(id) which is TEXT
  ALTER TABLE public.user_organizations
  ADD CONSTRAINT fk_user_orgs_org
  FOREIGN KEY (organization_id) REFERENCES public."Org"(id) ON DELETE CASCADE;
END$$;

COMMIT;

-- Verification:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'user_organizations' AND column_name = 'organization_id';
