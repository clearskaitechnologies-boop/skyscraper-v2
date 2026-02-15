-- Add telemetry tables used by Admin Dashboard

CREATE TABLE IF NOT EXISTS telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NULL,
  user_id text NULL,
  kind text NOT NULL,
  ref_type text NULL,
  ref_id text NULL,
  title text NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_org_created
  ON telemetry_events (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_kind_created
  ON telemetry_events (kind, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_telemetry_events_org_kind_created
  ON telemetry_events (org_id, kind, created_at DESC);


CREATE TABLE IF NOT EXISTS job_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NULL,
  queue text NULL,
  job_name text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  success boolean NOT NULL DEFAULT true,
  attempts int NOT NULL DEFAULT 1,
  duration_ms int NULL,
  error_message text NULL,
  started_at timestamptz NULL,
  finished_at timestamptz NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_runs_org_created
  ON job_runs (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_runs_queue_created
  ON job_runs (queue, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_runs_job_created
  ON job_runs (job_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_job_runs_success_created
  ON job_runs (success, created_at DESC);


CREATE TABLE IF NOT EXISTS cache_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id text NULL,
  cache_name text NOT NULL,
  op text NOT NULL,
  hit boolean NULL,
  key text NULL,
  ttl_seconds int NULL,
  duration_ms int NULL,
  meta jsonb NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cache_stats_org_name_created
  ON cache_stats (org_id, cache_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cache_stats_name_created
  ON cache_stats (cache_name, created_at DESC);
