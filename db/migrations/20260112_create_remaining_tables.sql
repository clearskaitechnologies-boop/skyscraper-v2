-- =============================================================================
-- Create remaining missing tables for Pro side and Client Portal
-- Date: 2026-01-12
-- =============================================================================

-- =============================================================================
-- CLIENT NETWORKS TABLE (pro-side client management)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "client_networks" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "zip" TEXT,
  "propertyType" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'active',
  "category" TEXT NOT NULL DEFAULT 'Homeowner',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "client_networks_orgId_idx" ON "client_networks"("orgId");
CREATE INDEX IF NOT EXISTS "client_networks_status_idx" ON "client_networks"("status");
CREATE INDEX IF NOT EXISTS "client_networks_category_idx" ON "client_networks"("category");

-- =============================================================================
-- CLIENT CONTACTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "client_contacts" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientNetworkId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'Homeowner',
  "isPrimary" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "client_contacts_clientNetworkId_fkey" 
    FOREIGN KEY ("clientNetworkId") 
    REFERENCES "client_networks"("id") 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "client_contacts_clientNetworkId_idx" ON "client_contacts"("clientNetworkId");

-- =============================================================================
-- CLIENT SAVED TRADES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "client_saved_trades" (
  "id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientNetworkId" UUID NOT NULL,
  "companyId" UUID NOT NULL,
  "notes" TEXT,
  "rating" INTEGER,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "client_saved_trades_clientNetworkId_fkey" 
    FOREIGN KEY ("clientNetworkId") 
    REFERENCES "client_networks"("id") 
    ON DELETE CASCADE,
  CONSTRAINT "client_saved_trades_clientNetworkId_companyId_key" 
    UNIQUE ("clientNetworkId", "companyId")
);

CREATE INDEX IF NOT EXISTS "client_saved_trades_clientNetworkId_idx" ON "client_saved_trades"("clientNetworkId");
CREATE INDEX IF NOT EXISTS "client_saved_trades_companyId_idx" ON "client_saved_trades"("companyId");

-- =============================================================================
-- CLAIM TIMELINE EVENT TABLE (used by activity logs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClaimTimelineEvent" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "claimId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "createdById" TEXT,
  "visibleToClient" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ClaimTimelineEvent_claimId_idx" ON "ClaimTimelineEvent"("claimId");
CREATE INDEX IF NOT EXISTS "ClaimTimelineEvent_type_idx" ON "ClaimTimelineEvent"("type");
CREATE INDEX IF NOT EXISTS "ClaimTimelineEvent_createdAt_idx" ON "ClaimTimelineEvent"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ClaimTimelineEvent_visibleToClient_idx" ON "ClaimTimelineEvent"("visibleToClient");

SELECT 'All remaining tables created successfully!' as result;
