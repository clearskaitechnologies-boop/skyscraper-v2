-- Fix for client_pro_connections constraint error
-- Run this BEFORE prisma db push or prisma migrate deploy

-- Drop the existing unique constraint (which is causing the blocker)
ALTER TABLE client_pro_connections 
DROP CONSTRAINT IF EXISTS client_pro_connections_proClerkId_clientClerkId_key;

-- Drop the dependent index (if it exists)
DROP INDEX IF EXISTS client_pro_connections_proClerkId_clientClerkId_key;

-- Recreate as non-unique index (allows multiple connections)
CREATE INDEX IF NOT EXISTS idx_client_pro_connections_pro_client 
ON client_pro_connections (proClerkId, clientClerkId);

-- After running this, you can safely run:
-- npx prisma db push --accept-data-loss
-- OR
-- npx prisma migrate deploy
