-- ============================================================
-- 20250703 — Measurement Orders + Smart Documents Indexes
-- ============================================================

-- Measurement orders table for GAF QuickMeasure / EagleView / manual
CREATE TABLE IF NOT EXISTS measurement_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          TEXT NOT NULL REFERENCES "Org"(id) ON DELETE CASCADE,
  claim_id        TEXT,
  job_id          TEXT,
  property_address TEXT NOT NULL,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  provider        TEXT NOT NULL DEFAULT 'gaf',
  order_type      TEXT NOT NULL DEFAULT 'roof',
  status          TEXT NOT NULL DEFAULT 'pending',
  report_url      TEXT,
  measurements    JSONB DEFAULT '{}',
  external_id     TEXT,
  ordered_by      TEXT NOT NULL,
  ordered_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  failed_at       TIMESTAMPTZ,
  failure_reason  TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_measurement_orders_org    ON measurement_orders(org_id);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_claim  ON measurement_orders(claim_id);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_job    ON measurement_orders(job_id);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_status ON measurement_orders(status);
CREATE INDEX IF NOT EXISTS idx_measurement_orders_provider ON measurement_orders(provider);

-- Smart-docs: additional index for SignatureEnvelope listing by org
CREATE INDEX IF NOT EXISTS idx_sig_envelope_created ON "SignatureEnvelope"("createdAt" DESC);

-- Done
SELECT 'migration 20250703_measurements_and_smart_docs applied' AS result;
