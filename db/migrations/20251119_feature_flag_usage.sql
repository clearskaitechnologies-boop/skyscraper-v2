-- Usage aggregation table for feature flags
CREATE TABLE IF NOT EXISTS app.feature_flag_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  org_id text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  hits integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (key, org_id, date)
);
