-- Migration: Add AI Insight Snapshots Table
-- Phase H9: Store weekly GPT-generated org insights
-- Created: 2026-01-14

CREATE TABLE IF NOT EXISTS ai_insight_snapshots (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL,
  insights JSONB NOT NULL,
  recommendations JSONB,
  metrics JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for efficient org queries with newest-first sorting
CREATE INDEX IF NOT EXISTS ai_insight_snapshots_org_created_idx 
  ON ai_insight_snapshots (org_id, created_at DESC);

-- Comment
COMMENT ON TABLE ai_insight_snapshots IS 'Weekly GPT-powered AI insights and recommendations for organizations';
COMMENT ON COLUMN ai_insight_snapshots.insights IS 'Array of 3-5 AI-generated insights about org performance';
COMMENT ON COLUMN ai_insight_snapshots.recommendations IS 'Recommended actions based on insights';
COMMENT ON COLUMN ai_insight_snapshots.metrics IS 'Aggregated org metrics used to generate insights';
