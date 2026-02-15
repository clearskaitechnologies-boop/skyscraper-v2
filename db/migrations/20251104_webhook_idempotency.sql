-- ============================================================================
-- WEBHOOK EVENTS IDEMPOTENCY TABLE
-- ============================================================================
-- Purpose: Prevent duplicate processing of Stripe webhook events
-- Usage: Check event.id before processing, insert after success
-- ============================================================================

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE, -- Stripe event.id (evt_...)
  event_type TEXT NOT NULL,      -- e.g., "customer.subscription.updated"
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB,                -- Optional: store full event payload
  
  -- Indexes
  CONSTRAINT webhook_events_event_id_unique UNIQUE (event_id)
);

-- Index for fast lookups by event_id
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);

-- Index for cleanup queries (delete old events after 90 days)
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at ON webhook_events(processed_at);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- 1. Check if event already processed
-- SELECT EXISTS(SELECT 1 FROM webhook_events WHERE event_id = 'evt_...');

-- 2. Recent webhook events (last 50)
-- SELECT event_id, event_type, processed_at 
-- FROM webhook_events 
-- ORDER BY processed_at DESC 
-- LIMIT 50;

-- 3. Cleanup old events (run monthly)
-- DELETE FROM webhook_events WHERE processed_at < NOW() - INTERVAL '90 days';

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- DROP TABLE IF EXISTS webhook_events CASCADE;
