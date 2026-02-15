DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='job_schedules'
  ) THEN
    CREATE TABLE job_schedules (
      id TEXT PRIMARY KEY,
      "claimId" TEXT NOT NULL,
      "date" TIMESTAMPTZ NOT NULL,
      crew TEXT,
      notes TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "orgId" TEXT NOT NULL
    );
    CREATE INDEX job_schedules_claimId_date_idx ON job_schedules("claimId", "date");
    CREATE INDEX job_schedules_org_claim_date_idx ON job_schedules("orgId", "claimId", "date");
    RAISE NOTICE '✅ job_schedules table created (simple version)';
  ELSE
    RAISE NOTICE '✅ job_schedules already exists';
  END IF;
END $$;