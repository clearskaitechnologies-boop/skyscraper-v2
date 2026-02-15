-- Webhooks table: External webhook endpoints
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}', -- Array of event types
  secret TEXT NOT NULL, -- For HMAC signature
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, disabled, failed
  created_by TEXT NOT NULL,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhooks_org_id ON webhooks(org_id);
CREATE INDEX idx_webhooks_status ON webhooks(status);
CREATE INDEX idx_webhooks_events ON webhooks USING GIN(events);

-- Webhook Logs: Track webhook deliveries
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL, -- success, failed
  response_code INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- API Keys table: For external API access
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- SHA-256 hash of the key
  key_prefix TEXT NOT NULL, -- First 12 chars for display (sk_live_xxx...)
  status TEXT NOT NULL DEFAULT 'active', -- active, revoked, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_api_keys_org_id ON api_keys(org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_status ON api_keys(status);

-- CRM Connections table: Store CRM integration details
CREATE TABLE IF NOT EXISTS crm_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  provider TEXT NOT NULL, -- salesforce, hubspot, pipedrive, etc.
  credentials JSONB NOT NULL, -- Encrypted credentials
  config JSONB DEFAULT '{}', -- Sync settings, field mappings
  status TEXT NOT NULL DEFAULT 'active', -- active, disabled, error
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_errors TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(org_id, provider)
);

CREATE INDEX idx_crm_connections_org_id ON crm_connections(org_id);
CREATE INDEX idx_crm_connections_provider ON crm_connections(provider);
CREATE INDEX idx_crm_connections_status ON crm_connections(status);

-- Update triggers
CREATE TRIGGER update_webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_team_updated_at();

CREATE TRIGGER update_crm_connections_updated_at
  BEFORE UPDATE ON crm_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_team_updated_at();

-- Comments
COMMENT ON TABLE webhooks IS 'External webhook endpoints for real-time event notifications';
COMMENT ON TABLE webhook_logs IS 'Log of all webhook delivery attempts';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access to the platform';
COMMENT ON TABLE crm_connections IS 'CRM integration configurations';

COMMENT ON COLUMN webhooks.events IS 'Array of event types: claim.created, claim.updated, property.created, etc.';
COMMENT ON COLUMN webhooks.secret IS 'HMAC secret for signing webhook payloads';
COMMENT ON COLUMN api_keys.key_hash IS 'SHA-256 hash of the API key - never store plaintext keys';
COMMENT ON COLUMN crm_connections.credentials IS 'Encrypted OAuth tokens or API keys';
