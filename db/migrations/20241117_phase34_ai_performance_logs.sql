-- PHASE 34: AI Performance Logging Table
-- Tracks all AI calls for cost analysis, performance monitoring, and optimization

CREATE TABLE IF NOT EXISTS ai_performance_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Context
  route TEXT NOT NULL,
  org_id TEXT NOT NULL,
  lead_id TEXT,
  claim_id TEXT,
  
  -- Performance metrics
  duration_ms INTEGER NOT NULL,
  model TEXT NOT NULL,
  tokens_in INTEGER NOT NULL DEFAULT 0,
  tokens_out INTEGER NOT NULL DEFAULT 0,
  cache_hit BOOLEAN NOT NULL DEFAULT false,
  cost_usd DECIMAL(10, 6),
  error TEXT,
  
  -- Indexes for fast queries
  CONSTRAINT ai_performance_logs_pkey PRIMARY KEY (id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_ai_perf_org_id ON ai_performance_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_ai_perf_created_at ON ai_performance_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_perf_route ON ai_performance_logs(route);
CREATE INDEX IF NOT EXISTS idx_ai_perf_cache_hit ON ai_performance_logs(cache_hit);
CREATE INDEX IF NOT EXISTS idx_ai_perf_org_date ON ai_performance_logs(org_id, created_at DESC);

-- Add comment
COMMENT ON TABLE ai_performance_logs IS 'PHASE 34: Tracks AI call performance, costs, and cache efficiency';

-- Add AI settings columns to Org table
ALTER TABLE public."Org" ADD COLUMN IF NOT EXISTS "aiModeDefault" TEXT DEFAULT 'auto';
ALTER TABLE public."Org" ADD COLUMN IF NOT EXISTS "aiCacheEnabled" BOOLEAN DEFAULT true;
ALTER TABLE public."Org" ADD COLUMN IF NOT EXISTS "aiCacheTTL" INTEGER DEFAULT 604800;
ALTER TABLE public."Org" ADD COLUMN IF NOT EXISTS "aiDedupeEnabled" BOOLEAN DEFAULT true;

COMMENT ON COLUMN public."Org"."aiModeDefault" IS 'Default AI model selection mode: cheap, smart, or auto';
COMMENT ON COLUMN public."Org"."aiCacheEnabled" IS 'Whether AI response caching is enabled for this org';
COMMENT ON COLUMN public."Org"."aiCacheTTL" IS 'Cache TTL in seconds (default 7 days = 604800)';
COMMENT ON COLUMN public."Org"."aiDedupeEnabled" IS 'Whether AI request deduplication is enabled';
