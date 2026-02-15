-- Add isDemo column to claims table
-- This column marks demo/test data that can be toggled off

ALTER TABLE claims ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false;

-- Add isDemo column to contacts table  
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false;

-- Add isDemo column to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS "isDemo" BOOLEAN DEFAULT false;

-- Update existing demo data to have isDemo = true
-- (John Smith claim, Jane Smith lead, Bob Smith lead)
UPDATE claims SET "isDemo" = true WHERE "claimNumber" LIKE 'DEMO%' OR title LIKE '%Demo%' OR title LIKE '%Test%';
UPDATE contacts SET "isDemo" = true WHERE "firstName" IN ('John', 'Jane', 'Bob') AND "lastName" = 'Smith';
UPDATE leads SET "isDemo" = true WHERE title LIKE '%Demo%' OR title LIKE '%Smith%';
