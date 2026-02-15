-- Recreate missing core tables for drifted database using conditional blocks.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='claims'
  ) THEN
    CREATE TABLE claims (
      id TEXT PRIMARY KEY,
      "orgId" TEXT NOT NULL,
      "propertyId" TEXT NOT NULL,
      "projectId" TEXT,
      "claimNumber" TEXT NOT NULL UNIQUE,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "damageType" TEXT NOT NULL,
      "dateOfLoss" TIMESTAMPTZ NOT NULL,
      "carrier" TEXT,
      "adjusterName" TEXT,
      "adjusterPhone" TEXT,
      "adjusterEmail" TEXT,
      "status" TEXT NOT NULL DEFAULT 'new',
      "priority" TEXT NOT NULL DEFAULT 'medium',
      "estimatedValue" INTEGER,
      "approvedValue" INTEGER,
      "deductible" INTEGER,
      "assignedTo" TEXT,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      exposure_cents INTEGER,
      insured_name TEXT,
      lifecycle_stage TEXT,
      policy_number TEXT,
      adjuster_packet_sent_at TIMESTAMPTZ,
      homeowner_email TEXT,
      homeowner_summary_sent_at TIMESTAMPTZ,
      last_contacted_at TIMESTAMPTZ,
      catStormEventId TEXT
    );
    CREATE INDEX idx_claims_org_status ON claims("orgId", "status");
    CREATE INDEX idx_claims_org_assigned ON claims("orgId", "assignedTo");
    CREATE INDEX idx_claims_org_stage ON claims("orgId", lifecycle_stage);
    RAISE NOTICE '✅ claims table created';
  ELSE
    RAISE NOTICE '✅ claims table already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='claim_bad_faith_analysis'
  ) THEN
    CREATE TABLE claim_bad_faith_analysis (
      id TEXT PRIMARY KEY,
      claim_id TEXT UNIQUE NOT NULL,
      analysis JSONB,
      severity INT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX idx_claim_bad_faith_claim ON claim_bad_faith_analysis(claim_id);
    RAISE NOTICE '✅ claim_bad_faith_analysis table created';
  ELSE
    RAISE NOTICE '✅ claim_bad_faith_analysis table already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='tokens_ledger'
  ) THEN
    CREATE TABLE tokens_ledger (
      id TEXT PRIMARY KEY,
      org_id TEXT NOT NULL,
      delta INT NOT NULL,
      reason TEXT NOT NULL,
      ref_id TEXT,
      balance_after INT NOT NULL,
      metadata JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX idx_tokens_ledger_org_created ON tokens_ledger(org_id, created_at);
    CREATE INDEX idx_tokens_ledger_org_reason ON tokens_ledger(org_id, reason);
    RAISE NOTICE '✅ tokens_ledger table created';
  ELSE
    RAISE NOTICE '✅ tokens_ledger table already exists';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='usage_tokens'
  ) THEN
    CREATE TABLE usage_tokens (
      id TEXT PRIMARY KEY,
      "orgId" TEXT UNIQUE NOT NULL,
      balance INT NOT NULL DEFAULT 0,
      tier TEXT NOT NULL DEFAULT 'beta',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX usage_tokens_orgid_idx ON usage_tokens("orgId");
    RAISE NOTICE '✅ usage_tokens table created';
  ELSE
    RAISE NOTICE '✅ usage_tokens table already exists';
  END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '✅ Missing core tables reconciliation applied'; END $$;
