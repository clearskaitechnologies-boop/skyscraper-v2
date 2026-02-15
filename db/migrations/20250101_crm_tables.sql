-- ============================================================================
-- Migration: CRM Subsystem Tables
-- Creates: crm_jobs, carrier_approvals, contractor_invoices, crm_documents,
--          fundings, reconciliations, supplements, team_performance,
--          CrewSchedule, api_keys
-- ============================================================================

-- ─── 1. api_keys (no FK dependencies) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id           TEXT PRIMARY KEY,
  org_id       TEXT NOT NULL,
  name         TEXT NOT NULL,
  key_hash     TEXT NOT NULL UNIQUE,
  prefix       TEXT NOT NULL,
  permissions  JSONB NOT NULL,
  last_used_at TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  revoked_at   TIMESTAMPTZ,
  created_by   TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_org ON api_keys(org_id);

-- ─── 2. crm_jobs (parent for many CRM tables) ───────────────────────────────
CREATE TABLE IF NOT EXISTS crm_jobs (
  id               TEXT PRIMARY KEY,
  org_id           TEXT NOT NULL,
  report_id        TEXT,
  status           TEXT NOT NULL,
  insured_name     TEXT,
  property_address TEXT,
  carrier          TEXT,
  claim_number     TEXT,
  date_of_loss     TIMESTAMPTZ,
  trade_scope      TEXT[] DEFAULT '{}',
  summary          JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_jobs_claim_number ON crm_jobs(claim_number);
CREATE INDEX IF NOT EXISTS idx_crm_jobs_org ON crm_jobs(org_id);
CREATE INDEX IF NOT EXISTS idx_crm_jobs_report ON crm_jobs(report_id);
CREATE INDEX IF NOT EXISTS idx_crm_jobs_status ON crm_jobs(status);

-- ─── 3. carrier_approvals ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carrier_approvals (
  id            TEXT PRIMARY KEY,
  job_id        TEXT NOT NULL REFERENCES crm_jobs(id) ON DELETE CASCADE,
  line_item_set JSONB NOT NULL,
  scope_totals  JSONB NOT NULL,
  version_tag   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carrier_approvals_created ON carrier_approvals(created_at);
CREATE INDEX IF NOT EXISTS idx_carrier_approvals_job ON carrier_approvals(job_id);

-- ─── 4. contractor_invoices ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contractor_invoices (
  id         TEXT PRIMARY KEY,
  job_id     TEXT NOT NULL REFERENCES crm_jobs(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL,
  items      JSONB NOT NULL,
  totals     JSONB NOT NULL,
  kind       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractor_invoices_no ON contractor_invoices(invoice_no);
CREATE INDEX IF NOT EXISTS idx_contractor_invoices_job ON contractor_invoices(job_id);
CREATE INDEX IF NOT EXISTS idx_contractor_invoices_kind ON contractor_invoices(kind);

-- ─── 5. crm_documents ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crm_documents (
  id         TEXT PRIMARY KEY,
  job_id     TEXT NOT NULL REFERENCES crm_jobs(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  source_url TEXT NOT NULL,
  parsed     JSONB,
  confidence DOUBLE PRECISION,
  status     TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crm_documents_job ON crm_documents(job_id);
CREATE INDEX IF NOT EXISTS idx_crm_documents_status ON crm_documents(status);
CREATE INDEX IF NOT EXISTS idx_crm_documents_type ON crm_documents(type);

-- ─── 6. fundings ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fundings (
  id            TEXT PRIMARY KEY,
  job_id        TEXT NOT NULL REFERENCES crm_jobs(id) ON DELETE CASCADE,
  payor         TEXT NOT NULL,
  method        TEXT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  memo          TEXT,
  check_no      TEXT,
  posted_date   TIMESTAMPTZ NOT NULL,
  attachments   JSONB,
  lender_status TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fundings_job ON fundings(job_id);
CREATE INDEX IF NOT EXISTS idx_fundings_lender ON fundings(lender_status);
CREATE INDEX IF NOT EXISTS idx_fundings_payor ON fundings(payor);
CREATE INDEX IF NOT EXISTS idx_fundings_posted ON fundings(posted_date);

-- ─── 7. reconciliations ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reconciliations (
  id         TEXT PRIMARY KEY,
  job_id     TEXT NOT NULL REFERENCES crm_jobs(id) ON DELETE CASCADE,
  snapshot   JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliations_created ON reconciliations(created_at);
CREATE INDEX IF NOT EXISTS idx_reconciliations_job ON reconciliations(job_id);

-- ─── 8. supplements ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS supplements (
  id                TEXT PRIMARY KEY,
  job_id            TEXT REFERENCES crm_jobs(id) ON DELETE CASCADE,
  status            TEXT NOT NULL DEFAULT 'DRAFT',
  ai_detected_items INTEGER NOT NULL DEFAULT 0,
  scope_items       JSONB,
  notes             TEXT,
  submitted_at      TIMESTAMPTZ,
  approved_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  adjuster_name     TEXT,
  auto_detected     JSONB,
  carrier           TEXT,
  carrier_pdf_url   TEXT,
  claim_id          TEXT REFERENCES claims(id) ON DELETE CASCADE,
  claim_number      TEXT,
  created_by        TEXT NOT NULL,
  date_of_loss      DATE,
  hover_data        JSONB,
  internal_notes    TEXT,
  lead_id           TEXT,
  loss_type         TEXT,
  op_amount         DOUBLE PRECISION DEFAULT 0,
  op_percent        DOUBLE PRECISION,
  op_type           TEXT,
  org_id            TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  policy_number     TEXT,
  profit_percent    DOUBLE PRECISION,
  scope_pdf_url     TEXT,
  subtotal          DOUBLE PRECISION DEFAULT 0,
  tax               DOUBLE PRECISION DEFAULT 0,
  tax_rate          DOUBLE PRECISION,
  total             DOUBLE PRECISION DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_supplements_claim ON supplements(claim_id);
CREATE INDEX IF NOT EXISTS idx_supplements_created_by ON supplements(created_by);
CREATE INDEX IF NOT EXISTS idx_supplements_job ON supplements(job_id);
CREATE INDEX IF NOT EXISTS idx_supplements_lead ON supplements(lead_id);
CREATE INDEX IF NOT EXISTS idx_supplements_org ON supplements(org_id);
CREATE INDEX IF NOT EXISTS idx_supplements_status ON supplements(status);

-- ─── 9. team_performance ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_performance (
  id                             TEXT PRIMARY KEY,
  "orgId"                        TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  "userId"                       TEXT NOT NULL,
  "stormEventId"                 TEXT,
  "periodStart"                  TIMESTAMPTZ NOT NULL,
  "periodEnd"                    TIMESTAMPTZ NOT NULL,
  "doorsKnocked"                 INTEGER NOT NULL DEFAULT 0,
  "contactsMade"                 INTEGER NOT NULL DEFAULT 0,
  "appointmentsBooked"           INTEGER NOT NULL DEFAULT 0,
  "inspectionsCompleted"         INTEGER NOT NULL DEFAULT 0,
  "claimsSigned"                 INTEGER NOT NULL DEFAULT 0,
  "claimsApproved"               INTEGER NOT NULL DEFAULT 0,
  "totalRevenueGenerated"        DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalInvoiced"                DECIMAL(10,2) NOT NULL DEFAULT 0,
  "totalDepreciationReleased"    DECIMAL(10,2) NOT NULL DEFAULT 0,
  "commissionOwed"               DECIMAL(10,2) NOT NULL DEFAULT 0,
  "commissionPaid"               DECIMAL(10,2) NOT NULL DEFAULT 0,
  "commissionPending"            DECIMAL(10,2) NOT NULL DEFAULT 0,
  "contactRate"                  DECIMAL(5,2) NOT NULL DEFAULT 0,
  "appointmentRate"              DECIMAL(5,2) NOT NULL DEFAULT 0,
  "closeRate"                    DECIMAL(5,2) NOT NULL DEFAULT 0,
  "approvalRate"                 DECIMAL(5,2) NOT NULL DEFAULT 0,
  "rankDoorsKnocked"             INTEGER,
  "rankClaimsSigned"             INTEGER,
  "rankRevenue"                  INTEGER,
  "createdAt"                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("orgId", "userId")
);

CREATE INDEX IF NOT EXISTS idx_team_performance_org_user ON team_performance("orgId", "userId");
CREATE INDEX IF NOT EXISTS idx_team_performance_period ON team_performance("periodStart", "periodEnd");
CREATE INDEX IF NOT EXISTS idx_team_performance_storm ON team_performance("stormEventId");

-- ─── 10. CrewSchedule ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CrewSchedule" (
  id                   TEXT PRIMARY KEY,
  "createdAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "orgId"              TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  "claimId"            TEXT NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  "crewLeadId"         TEXT NOT NULL REFERENCES users(id),
  "crewMemberIds"      TEXT[] DEFAULT '{}',
  "scheduledDate"      TIMESTAMPTZ NOT NULL,
  "startTime"          TEXT NOT NULL,
  "estimatedDuration"  INTEGER NOT NULL,
  complexity           TEXT NOT NULL,
  status               TEXT NOT NULL DEFAULT 'scheduled',
  "weatherRisk"        TEXT,
  "weatherCheckedAt"   TIMESTAMPTZ,
  "crewNotified"       BOOLEAN NOT NULL DEFAULT false,
  "crewNotifiedAt"     TIMESTAMPTZ,
  "homeownerNotified"  BOOLEAN NOT NULL DEFAULT false,
  "homeownerNotifiedAt" TIMESTAMPTZ,
  "actualStartTime"    TIMESTAMPTZ,
  "actualEndTime"      TIMESTAMPTZ,
  "completedBy"        TEXT,
  "scopeOfWork"        TEXT,
  "specialInstructions" TEXT,
  "safetyNotes"        TEXT,
  "accessInstructions" TEXT,
  metadata             JSONB
);

CREATE INDEX IF NOT EXISTS idx_crew_schedule_lead_date ON "CrewSchedule"("crewLeadId", "scheduledDate");
CREATE INDEX IF NOT EXISTS idx_crew_schedule_org_claim ON "CrewSchedule"("orgId", "claimId");
CREATE INDEX IF NOT EXISTS idx_crew_schedule_status_date ON "CrewSchedule"(status, "scheduledDate");

-- ─── Now add FK constraints to phase1 tables that reference crm_jobs ─────────
-- customer_payments.jobId → crm_jobs.id
DO $$ BEGIN
  ALTER TABLE customer_payments
    ADD CONSTRAINT fk_customer_payments_job
    FOREIGN KEY ("jobId") REFERENCES crm_jobs(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- permits.jobId → crm_jobs.id
DO $$ BEGIN
  ALTER TABLE permits
    ADD CONSTRAINT fk_permits_job
    FOREIGN KEY ("jobId") REFERENCES crm_jobs(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- mortgage_checks.jobId → crm_jobs.id
DO $$ BEGIN
  ALTER TABLE mortgage_checks
    ADD CONSTRAINT fk_mortgage_checks_job
    FOREIGN KEY ("jobId") REFERENCES crm_jobs(id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Done ────────────────────────────────────────────────────────────────────
