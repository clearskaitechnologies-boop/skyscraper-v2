-- Add ContactType enum to contacts table
-- This migration is OPTIONAL and can be run later when ready to categorize contacts

-- Step 1: Create the ContactType enum
DO $$ BEGIN
  CREATE TYPE "ContactType" AS ENUM (
    'CONTRACTOR',
    'SUBCONTRACTOR',
    'REP',
    'SALES',
    'CLIENT_HOMEOWNER',
    'CLIENT_COMMERCIAL',
    'REALTOR',
    'BROKER',
    'PROPERTY_MANAGER',
    'INDEPENDENT_ADJUSTER',
    'PUBLIC_ADJUSTER',
    'OTHER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add contactType column to contacts table
ALTER TABLE contacts 
ADD COLUMN IF NOT EXISTS "contactType" "ContactType";

-- Step 3: Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts("contactType");

-- Step 4: (Optional) Set default values for existing contacts based on company/title patterns
-- Uncomment and adjust patterns as needed:

-- UPDATE contacts SET "contactType" = 'CONTRACTOR'
-- WHERE "contactType" IS NULL
--   AND (company ILIKE '%construction%' OR company ILIKE '%contractor%' OR company ILIKE '%builder%');

-- UPDATE contacts SET "contactType" = 'REALTOR'
-- WHERE "contactType" IS NULL
--   AND (title ILIKE '%realtor%' OR title ILIKE '%real estate agent%' OR company ILIKE '%realty%');

-- UPDATE contacts SET "contactType" = 'INDEPENDENT_ADJUSTER'
-- WHERE "contactType" IS NULL
--   AND (title ILIKE '%adjuster%' AND NOT title ILIKE '%public%');

-- UPDATE contacts SET "contactType" = 'PUBLIC_ADJUSTER'
-- WHERE "contactType" IS NULL
--   AND title ILIKE '%public%adjuster%';

-- UPDATE contacts SET "contactType" = 'CLIENT_HOMEOWNER'
-- WHERE "contactType" IS NULL
--   AND (title ILIKE '%homeowner%' OR title IS NULL);

COMMENT ON COLUMN contacts."contactType" IS 'Categorizes contact by their role in the network';
