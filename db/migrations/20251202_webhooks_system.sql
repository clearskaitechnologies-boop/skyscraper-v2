// ============================================================================
// H-18: Webhook System - Database Migration
// ============================================================================

-- Create webhooks table
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id VARCHAR(255) NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Configuration
  url TEXT NOT NULL,
  secret VARCHAR(255) NOT NULL, -- Used to sign webhook payloads
  events TEXT[] NOT NULL, -- Array of subscribed events
  
  -- Status
  active BOOLEAN DEFAULT TRUE,
  failed_deliveries INT DEFAULT 0,
  last_delivery_at TIMESTAMP,
  last_failure_at TIMESTAMP,
  
  -- Metadata
  name VARCHAR(100),
  description TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT webhooks_events_check CHECK (array_length(events, 1) > 0)
);

-- Create webhook_logs table
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks(id) ON DELETE CASCADE,
  
  -- Request
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  
  -- Response
  status_code INT,
  response_body TEXT,
  error_message TEXT,
  
  -- Timing
  delivered_at TIMESTAMP DEFAULT NOW(),
  duration_ms INT,
  
  -- Retry info
  attempt_number INT DEFAULT 1,
  max_attempts INT DEFAULT 3,
  next_retry_at TIMESTAMP,
  
  success BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_org_id ON public.webhooks(org_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON public.webhooks(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_next_retry ON public.webhook_logs(next_retry_at) WHERE success = FALSE AND attempt_number < max_attempts;

-- Function to clean old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_webhook_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.webhook_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT * FROM public.webhooks LIMIT 5;
SELECT * FROM public.webhook_logs LIMIT 5;
