BEGIN;

CREATE TABLE IF NOT EXISTS job_schedules (
  id text PRIMARY KEY,
  "claimId" text NOT NULL,
  "date" timestamptz NOT NULL,
  crew text,
  notes text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now(),
  "orgId" text NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS job_schedules_claimId_date_idx ON job_schedules("claimId", "date");
CREATE INDEX IF NOT EXISTS job_schedules_org_claim_date_idx ON job_schedules("orgId", "claimId", "date");

-- Add exposure_cents column to claims if missing (mapped in Prisma as exposureCents)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='claims' AND column_name='exposure_cents'
  ) THEN
    ALTER TABLE claims ADD COLUMN exposure_cents integer; -- Int? in Prisma
  END IF;
END $$;

COMMIT;
