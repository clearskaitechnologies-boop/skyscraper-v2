-- ============================================================================
-- Enterprise Commission Engine + Financial Tracking
-- Migration: 20260214_enterprise_commission_engine.sql
-- Description: Adds commission_plans, job_financials, quickbooks_connections
-- ============================================================================

-- 1. Commission Plans — rule-based engine supporting all structures
CREATE TABLE IF NOT EXISTS app.commission_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        TEXT NOT NULL REFERENCES app."Org"(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  is_default    BOOLEAN NOT NULL DEFAULT false,
  -- Rule structure: percentage_revenue | profit_share | tiered | flat_bonus | hybrid
  rule_type     TEXT NOT NULL DEFAULT 'percentage_revenue',
  -- JSONB structure stores the full rule config:
  -- percentage_revenue: { "rate": 0.10 }
  -- profit_share: { "rate": 0.50, "overhead_pct": 0.40 }
  -- tiered: { "tiers": [{ "min": 0, "max": 50000, "rate": 0.08 }, { "min": 50001, "max": null, "rate": 0.12 }] }
  -- flat_bonus: { "amount": 500, "trigger": "claim_approved" }
  -- hybrid: { "base_rate": 0.10, "bonus_tiers": [...], "profit_share_rate": 0.50 }
  structure     JSONB NOT NULL DEFAULT '{}',
  -- Applies to: all | specific user IDs
  applies_to    TEXT NOT NULL DEFAULT 'all',
  user_ids      TEXT[] DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_plans_org ON app.commission_plans(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_plans_active ON app.commission_plans(org_id, is_active);

-- 2. Job Financials — per-job cost and revenue tracking
CREATE TABLE IF NOT EXISTS app.job_financials (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            TEXT NOT NULL REFERENCES app."Org"(id) ON DELETE CASCADE,
  job_id            TEXT NOT NULL REFERENCES app.crm_jobs(id) ON DELETE CASCADE,
  -- Revenue
  contract_amount   DECIMAL(12,2) NOT NULL DEFAULT 0,
  supplement_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_revenue     DECIMAL(12,2) GENERATED ALWAYS AS (contract_amount + supplement_amount) STORED,
  -- Costs
  material_cost     DECIMAL(12,2) NOT NULL DEFAULT 0,
  labor_cost        DECIMAL(12,2) NOT NULL DEFAULT 0,
  overhead_cost     DECIMAL(12,2) NOT NULL DEFAULT 0,
  other_cost        DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_cost        DECIMAL(12,2) GENERATED ALWAYS AS (material_cost + labor_cost + overhead_cost + other_cost) STORED,
  -- Profit
  gross_profit      DECIMAL(12,2) GENERATED ALWAYS AS (contract_amount + supplement_amount - material_cost - labor_cost - overhead_cost - other_cost) STORED,
  -- Payment tracking
  amount_invoiced   DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_collected  DECIMAL(12,2) NOT NULL DEFAULT 0,
  amount_outstanding DECIMAL(12,2) GENERATED ALWAYS AS (contract_amount + supplement_amount - amount_collected) STORED,
  -- Status
  financial_status  TEXT NOT NULL DEFAULT 'open',
  -- QB sync
  qb_invoice_id     TEXT,
  qb_synced_at      TIMESTAMPTZ,
  -- Metadata
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_job_financials_job ON app.job_financials(job_id);
CREATE INDEX IF NOT EXISTS idx_job_financials_org ON app.job_financials(org_id);
CREATE INDEX IF NOT EXISTS idx_job_financials_status ON app.job_financials(org_id, financial_status);

-- 3. Commission Records — individual commission calculations per rep per job
CREATE TABLE IF NOT EXISTS app.commission_records (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            TEXT NOT NULL REFERENCES app."Org"(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL,
  job_id            TEXT NOT NULL REFERENCES app.crm_jobs(id) ON DELETE CASCADE,
  plan_id           UUID REFERENCES app.commission_plans(id) ON DELETE SET NULL,
  -- Calculation
  rule_type         TEXT NOT NULL,
  base_amount       DECIMAL(12,2) NOT NULL DEFAULT 0,
  commission_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  -- Breakdown for audit trail
  calculation       JSONB NOT NULL DEFAULT '{}',
  -- Status: pending → approved → paid
  status            TEXT NOT NULL DEFAULT 'pending',
  approved_by       TEXT,
  approved_at       TIMESTAMPTZ,
  paid_at           TIMESTAMPTZ,
  payment_ref       TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_records_org ON app.commission_records(org_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_user ON app.commission_records(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_job ON app.commission_records(job_id);
CREATE INDEX IF NOT EXISTS idx_commission_records_status ON app.commission_records(org_id, status);

-- 4. QuickBooks Connections — OAuth + sync state
CREATE TABLE IF NOT EXISTS app.quickbooks_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          TEXT NOT NULL UNIQUE REFERENCES app."Org"(id) ON DELETE CASCADE,
  realm_id        TEXT NOT NULL,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  token_expires   TIMESTAMPTZ NOT NULL,
  company_name    TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_sync_at    TIMESTAMPTZ,
  sync_errors     JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE app.commission_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.job_financials ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE app.quickbooks_connections ENABLE ROW LEVEL SECURITY;

-- RLS policies (service role bypasses)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commission_plans' AND policyname = 'commission_plans_org_access') THEN
    CREATE POLICY commission_plans_org_access ON app.commission_plans FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'job_financials' AND policyname = 'job_financials_org_access') THEN
    CREATE POLICY job_financials_org_access ON app.job_financials FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commission_records' AND policyname = 'commission_records_org_access') THEN
    CREATE POLICY commission_records_org_access ON app.commission_records FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quickbooks_connections' AND policyname = 'quickbooks_connections_org_access') THEN
    CREATE POLICY quickbooks_connections_org_access ON app.quickbooks_connections FOR ALL USING (true);
  END IF;
END $$;

-- 6. Updated_at trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION app.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS trg_commission_plans_updated ON app.commission_plans;
CREATE TRIGGER trg_commission_plans_updated BEFORE UPDATE ON app.commission_plans
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_job_financials_updated ON app.job_financials;
CREATE TRIGGER trg_job_financials_updated BEFORE UPDATE ON app.job_financials
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_commission_records_updated ON app.commission_records;
CREATE TRIGGER trg_commission_records_updated BEFORE UPDATE ON app.commission_records
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

DROP TRIGGER IF EXISTS trg_quickbooks_connections_updated ON app.quickbooks_connections;
CREATE TRIGGER trg_quickbooks_connections_updated BEFORE UPDATE ON app.quickbooks_connections
  FOR EACH ROW EXECUTE FUNCTION app.set_updated_at();

-- Done ✅
