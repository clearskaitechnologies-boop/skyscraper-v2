-- Add marketplace fields to Template table
ALTER TABLE "Template" 
  ADD COLUMN IF NOT EXISTS "slug" TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS "Template_slug_idx" ON "Template"("slug");

-- Add foreign key relation from OrgTemplate to Template
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'OrgTemplate_templateId_fkey'
  ) THEN
    ALTER TABLE "OrgTemplate" 
      ADD CONSTRAINT "OrgTemplate_templateId_fkey" 
      FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE;
  END IF;
END $$;
