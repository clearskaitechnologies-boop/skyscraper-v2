-- Master Prompt #73: Ensure jobs have explicit lead linkage (production integrity)
-- Adds leadId column + foreign key + index if missing (pre-dates later video migration)

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS leadId TEXT;

-- Foreign key constraint (will error if already exists; run once)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'jobs_leadId_fkey'
  ) THEN
    ALTER TABLE jobs ADD CONSTRAINT jobs_leadId_fkey FOREIGN KEY ("leadId") REFERENCES leads(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Indexes with proper quoting for case-sensitive columns
CREATE INDEX IF NOT EXISTS jobs_orgId_leadId_idx ON jobs("orgId", "leadId");
CREATE INDEX IF NOT EXISTS jobs_leadId_jobType_idx ON jobs("leadId", "jobType");
