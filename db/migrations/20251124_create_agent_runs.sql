-- Create agent_runs table to match Prisma model if missing
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name='agent_runs'
  ) THEN
    CREATE TABLE agent_runs (
      id text PRIMARY KEY,
      agentName text NOT NULL,
      version text,
      orgId text,
      userId text,
      claimId text,
      durationMs integer NOT NULL,
      success boolean NOT NULL,
      errorType text,
      errorMsg text,
      createdAt timestamptz NOT NULL DEFAULT now(),
      metadata jsonb
    );
  END IF;
END $$;

-- Indexes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='agent_runs_agentName_createdAt_idx') THEN
    CREATE INDEX agent_runs_agentName_createdAt_idx ON agent_runs("agentName", "createdAt");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='agent_runs_orgId_createdAt_idx') THEN
    CREATE INDEX agent_runs_orgId_createdAt_idx ON agent_runs("orgId", "createdAt");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='agent_runs_claimId_idx') THEN
    CREATE INDEX agent_runs_claimId_idx ON agent_runs("claimId");
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname='agent_runs_success_idx') THEN
    CREATE INDEX agent_runs_success_idx ON agent_runs("success");
  END IF;
END $$;
