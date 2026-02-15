-- Phase 4 Core Migration
-- Job events, weather results, proposals, and token ledger

-- Ensure UUID extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Job status mirror (read-only for UI; populated by worker after each job)
CREATE TABLE IF NOT EXISTS job_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  job_id TEXT NOT NULL,
  status TEXT NOT NULL, -- queued|working|completed|failed|cancelled|retry
  message TEXT,
  payload JSONB,
  result JSONB,
  attempts INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Weather cache (simple)
CREATE TABLE IF NOT EXISTS weather_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_lat NUMERIC,
  property_lng NUMERIC,
  date_from DATE,
  date_to DATE,
  vendor TEXT DEFAULT 'placeholder',
  raw JSONB,
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Proposals (note: may conflict with existing proposals table, using proposals_v2 if needed)
CREATE TABLE IF NOT EXISTS proposals_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID,
  org_id UUID,
  title TEXT,
  status TEXT DEFAULT 'draft', -- draft|building|ready|failed
  data JSONB,
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Token ledger
CREATE TABLE IF NOT EXISTS token_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID,
  user_id UUID,
  feature TEXT NOT NULL, -- damage-analyze|weather-analyze|proposal-generate|...
  delta INT NOT NULL,    -- negative for spend
  ref_job_id TEXT,
  meta JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_job_events_job ON job_events(job_id);
CREATE INDEX IF NOT EXISTS idx_job_events_name ON job_events(job_name);
CREATE INDEX IF NOT EXISTS idx_job_events_status ON job_events(status);
CREATE INDEX IF NOT EXISTS idx_job_events_created ON job_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_ledger_org ON token_ledger(org_id);
CREATE INDEX IF NOT EXISTS idx_token_ledger_feature ON token_ledger(feature);
CREATE INDEX IF NOT EXISTS idx_weather_results_coords ON weather_results(property_lat, property_lng);
CREATE INDEX IF NOT EXISTS idx_proposals_v2_org ON proposals_v2(org_id);

COMMENT ON TABLE job_events IS 'Real-time job status mirror for UI - populated by worker';
COMMENT ON TABLE weather_results IS 'Cached weather analysis results from vendor APIs';
COMMENT ON TABLE proposals_v2 IS 'Phase 4 proposal generation results';
COMMENT ON TABLE token_ledger IS 'Token spend tracking per feature per job';
