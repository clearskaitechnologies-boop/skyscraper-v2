-- =============================================================================
-- Complete Client-Pro Integration & Document Sharing System
-- Date: 2026-01-12
-- Description: All tables needed for client directory, connections, and document sharing
-- =============================================================================

-- =============================================================================
-- CLIENT-CLAIM ASSOCIATIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientClaimAccess" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "addedBy" TEXT NOT NULL, -- Pro who added the client
  "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "accessLevel" TEXT NOT NULL DEFAULT 'read', -- read, comment, full
  "notified" BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientClaimAccess_clientId_idx" ON "ClientClaimAccess"("clientId");
CREATE INDEX IF NOT EXISTS "ClientClaimAccess_claimId_idx" ON "ClientClaimAccess"("claimId");
CREATE INDEX IF NOT EXISTS "ClientClaimAccess_addedBy_idx" ON "ClientClaimAccess"("addedBy");
CREATE UNIQUE INDEX IF NOT EXISTS "ClientClaimAccess_clientId_claimId_key" ON "ClientClaimAccess"("clientId", "claimId");

-- =============================================================================
-- SHARED DOCUMENT TRACKING
-- =============================================================================
CREATE TABLE IF NOT EXISTS "SharedDocument" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "documentId" TEXT NOT NULL, -- Reference to actual document
  "documentType" TEXT NOT NULL, -- photo, report, estimate, etc.
  "documentName" TEXT NOT NULL,
  "documentUrl" TEXT,
  "sharedBy" TEXT NOT NULL, -- Pro who shared it
  "sharedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "viewedAt" TIMESTAMP(3), -- When client first viewed it
  "viewedCount" INTEGER NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS "SharedDocument_clientId_idx" ON "SharedDocument"("clientId");
CREATE INDEX IF NOT EXISTS "SharedDocument_claimId_idx" ON "SharedDocument"("claimId");
CREATE INDEX IF NOT EXISTS "SharedDocument_documentId_idx" ON "SharedDocument"("documentId");
CREATE INDEX IF NOT EXISTS "SharedDocument_sharedBy_idx" ON "SharedDocument"("sharedBy");
CREATE UNIQUE INDEX IF NOT EXISTS "SharedDocument_clientId_claimId_documentId_key" ON "SharedDocument"("clientId", "claimId", "documentId");

-- =============================================================================
-- CLIENT INVITATION SYSTEM (if not exists from earlier)
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientInvitation" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "firstName" TEXT,
  "lastName" TEXT,
  "message" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, sent, viewed, accepted, expired
  "invitedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sentAt" TIMESTAMP(3),
  "viewedAt" TIMESTAMP(3),
  "acceptedAt" TIMESTAMP(3),
  "token" TEXT UNIQUE -- Unique invitation token
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientInvitation_email_idx" ON "ClientInvitation"("email");
CREATE INDEX IF NOT EXISTS "ClientInvitation_invitedBy_idx" ON "ClientInvitation"("invitedBy");
CREATE INDEX IF NOT EXISTS "ClientInvitation_status_idx" ON "ClientInvitation"("status");
CREATE INDEX IF NOT EXISTS "ClientInvitation_token_idx" ON "ClientInvitation"("token");

-- =============================================================================
-- CLIENT ACTIVITY TRACKING
-- =============================================================================
CREATE TABLE IF NOT EXISTS "ClientActivity" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "activityType" TEXT NOT NULL, -- view_document, view_claim, message_sent, etc.
  "resourceType" TEXT, -- claim, document, message
  "resourceId" TEXT, -- ID of the resource
  "metadata" JSONB, -- Additional activity data
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS "ClientActivity_clientId_idx" ON "ClientActivity"("clientId");
CREATE INDEX IF NOT EXISTS "ClientActivity_activityType_idx" ON "ClientActivity"("activityType");
CREATE INDEX IF NOT EXISTS "ClientActivity_timestamp_idx" ON "ClientActivity"("timestamp");
CREATE INDEX IF NOT EXISTS "ClientActivity_resourceType_resourceId_idx" ON "ClientActivity"("resourceType", "resourceId");

-- =============================================================================
-- DOCUMENT SHARING PERMISSIONS
-- =============================================================================
CREATE TABLE IF NOT EXISTS "DocumentSharingPermission" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "documentId" TEXT NOT NULL,
  "claimId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "canView" BOOLEAN NOT NULL DEFAULT true,
  "canDownload" BOOLEAN NOT NULL DEFAULT false,
  "canComment" BOOLEAN NOT NULL DEFAULT false,
  "sharedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3), -- Optional expiration
  "revokedAt" TIMESTAMP(3) -- If access was revoked
);

-- Indexes
CREATE INDEX IF NOT EXISTS "DocumentSharingPermission_documentId_idx" ON "DocumentSharingPermission"("documentId");
CREATE INDEX IF NOT EXISTS "DocumentSharingPermission_clientId_idx" ON "DocumentSharingPermission"("clientId");
CREATE INDEX IF NOT EXISTS "DocumentSharingPermission_claimId_idx" ON "DocumentSharingPermission"("claimId");
CREATE UNIQUE INDEX IF NOT EXISTS "DocumentSharingPermission_unique_permission" ON "DocumentSharingPermission"("documentId", "clientId", "claimId") WHERE "revokedAt" IS NULL;

-- =============================================================================
-- COMMENTS & METADATA TABLES
-- =============================================================================
COMMENT ON TABLE "ClientClaimAccess" IS 'Associates clients with claims they can access';
COMMENT ON TABLE "SharedDocument" IS 'Tracks documents shared between pros and clients';
COMMENT ON TABLE "ClientInvitation" IS 'Professional client invitation system';
COMMENT ON TABLE "ClientActivity" IS 'Tracks client engagement and activity';
COMMENT ON TABLE "DocumentSharingPermission" IS 'Fine-grained document sharing permissions';

-- =============================================================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================================================
-- Insert some sample data for testing if tables are empty
-- This helps with development and testing

-- Sample client invitation
INSERT INTO "ClientInvitation" ("email", "firstName", "lastName", "message", "invitedBy", "status", "token") 
VALUES ('john@example.com', 'John', 'Doe', 'I would love to work with you on upcoming projects!', 'pro_123', 'sent', 'inv_' || gen_random_uuid()::text)
ON CONFLICT DO NOTHING;

-- Sample client claim access
INSERT INTO "ClientClaimAccess" ("clientId", "claimId", "addedBy") 
VALUES ('client_123', 'claim_456', 'pro_123')
ON CONFLICT DO NOTHING;

-- Sample shared document
INSERT INTO "SharedDocument" ("clientId", "claimId", "documentId", "documentType", "documentName", "sharedBy") 
VALUES ('client_123', 'claim_456', 'doc_789', 'report', 'Assessment Report.pdf', 'pro_123')
ON CONFLICT DO NOTHING;