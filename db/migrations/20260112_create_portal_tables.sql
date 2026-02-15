-- =============================================================================
-- Create missing Client Portal tables in PUBLIC schema
-- Date: 2026-01-12
-- =============================================================================

-- =============================================================================
-- CLIENT PRO CONNECTION TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientProConnection" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "contractorId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedBy" TEXT,
  "notes" TEXT,
  "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "connectedAt" TIMESTAMP(3)
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientProConnection_clientId_idx" ON "ClientProConnection"("clientId");
CREATE INDEX IF NOT EXISTS "ClientProConnection_contractorId_idx" ON "ClientProConnection"("contractorId");
CREATE INDEX IF NOT EXISTS "ClientProConnection_status_idx" ON "ClientProConnection"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientProConnection_clientId_contractorId_key" ON "ClientProConnection"("clientId", "contractorId");

-- =============================================================================
-- CLIENT SAVED PRO TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientSavedPro" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "companyId" UUID NOT NULL,
  "category" TEXT,
  "notes" TEXT,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientSavedPro_clientId_idx" ON "ClientSavedPro"("clientId");
CREATE INDEX IF NOT EXISTS "ClientSavedPro_companyId_idx" ON "ClientSavedPro"("companyId");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientSavedPro_clientId_companyId_key" ON "ClientSavedPro"("clientId", "companyId");

-- =============================================================================
-- CLIENT WORK REQUEST TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientWorkRequest" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "targetType" TEXT NOT NULL DEFAULT 'BOARD',
  "targetCompanyId" UUID,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
  "category" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "budget" TEXT,
  "preferredDate" TIMESTAMP(3),
  "attachmentUrls" JSONB DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_clientId_idx" ON "ClientWorkRequest"("clientId");
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_status_idx" ON "ClientWorkRequest"("status");
CREATE INDEX IF NOT EXISTS "ClientWorkRequest_targetType_idx" ON "ClientWorkRequest"("targetType");

-- =============================================================================
-- DOCUMENT SHARE TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "DocumentShare" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL,
  "documentType" TEXT NOT NULL DEFAULT 'CLAIM',
  "sharedBy" TEXT,
  "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "accessLevel" TEXT NOT NULL DEFAULT 'VIEW'
);

-- Indexes
CREATE INDEX IF NOT EXISTS "DocumentShare_clientId_idx" ON "DocumentShare"("clientId");
CREATE INDEX IF NOT EXISTS "DocumentShare_documentId_idx" ON "DocumentShare"("documentId");

-- =============================================================================
-- CLIENT PORTAL ACCESS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientPortalAccess" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "accessLevel" TEXT NOT NULL DEFAULT 'VIEW',
  "grantedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3)
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientPortalAccess_clientId_idx" ON "ClientPortalAccess"("clientId");
CREATE INDEX IF NOT EXISTS "ClientPortalAccess_claimId_idx" ON "ClientPortalAccess"("claimId");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientPortalAccess_clientId_claimId_key" ON "ClientPortalAccess"("clientId", "claimId");

-- =============================================================================
-- CLAIM CLIENT LINK TABLE (if not exists)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClaimClientLink" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "claimId" TEXT NOT NULL,
  "clientEmail" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "ClaimClientLink_claimId_idx" ON "ClaimClientLink"("claimId");
CREATE INDEX IF NOT EXISTS "ClaimClientLink_clientEmail_idx" ON "ClaimClientLink"("clientEmail");
CREATE INDEX IF NOT EXISTS "ClaimClientLink_status_idx" ON "ClaimClientLink"("status");

SELECT 'All client portal tables created successfully!' as result;
