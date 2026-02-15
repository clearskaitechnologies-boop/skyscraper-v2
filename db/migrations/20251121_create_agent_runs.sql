-- agent_runs execution log table
-- Mirrors Prisma model `agent_runs` (mixed-case column names quoted)
-- Provides persistence for AI/system agent execution metadata

CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "agentName" TEXT NOT NULL,
  "version" TEXT,
  "orgId" TEXT,
  "userId" TEXT,
  "claimId" TEXT,
  "durationMs" INT NOT NULL,
  "success" BOOLEAN NOT NULL,
  "errorType" TEXT,
  "errorMsg" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "metadata" JSONB
);

-- Indexes aligned with Prisma schema @@index declarations
CREATE INDEX idx_agent_runs_agentName_createdAt ON agent_runs("agentName", "createdAt");
CREATE INDEX idx_agent_runs_orgId_createdAt ON agent_runs("orgId", "createdAt");
CREATE INDEX idx_agent_runs_claimId ON agent_runs("claimId");
CREATE INDEX idx_agent_runs_success ON agent_runs("success");

-- Safety: If re-run, fail loudly rather than silently skipping (no IF NOT EXISTS) to catch drift intentionally