-- Create client_activity table for tracking portal activity
CREATE TABLE IF NOT EXISTS client_activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientNetworkId" UUID NOT NULL REFERENCES client_networks(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  message         TEXT,
  "actorType"     TEXT NOT NULL DEFAULT 'system',
  "actorId"       TEXT,
  metadata        JSONB DEFAULT '{}',
  "createdAt"     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_activity_network ON client_activity("clientNetworkId");
CREATE INDEX IF NOT EXISTS idx_client_activity_created ON client_activity("createdAt" DESC);
