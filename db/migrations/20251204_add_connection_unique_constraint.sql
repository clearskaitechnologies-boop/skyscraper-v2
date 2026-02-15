-- Add unique constraint to ClientProConnection to prevent duplicate connections
-- This ensures one contractor cannot connect to the same client multiple times

-- First, remove any existing duplicates (keep only the first connection)
WITH ranked_connections AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY "contractorId", "clientId" ORDER BY "createdAt" ASC) as rn
  FROM "client_pro_connections"
)
DELETE FROM "client_pro_connections"
WHERE id IN (
  SELECT id FROM ranked_connections WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE "client_pro_connections" 
ADD CONSTRAINT "client_pro_connections_contractorId_clientId_key" 
UNIQUE ("contractorId", "clientId");
