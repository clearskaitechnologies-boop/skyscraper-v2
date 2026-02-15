-- Migration: Message System and Client-Pro Connections
-- Created: 2026-01-11
-- Purpose: Enable messaging between clients and pros, and client invitation system

-- ============================================================================
-- MESSAGE THREAD TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "MessageThread" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "claimId" TEXT,
  "tradePartnerId" TEXT,
  "clientId" TEXT,
  "participants" TEXT[] NOT NULL DEFAULT '{}',
  "subject" TEXT,
  "isPortalThread" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "MessageThread_orgId_idx" ON "MessageThread"("orgId");
CREATE INDEX IF NOT EXISTS "MessageThread_claimId_idx" ON "MessageThread"("claimId");
CREATE INDEX IF NOT EXISTS "MessageThread_tradePartnerId_idx" ON "MessageThread"("tradePartnerId");
CREATE INDEX IF NOT EXISTS "MessageThread_clientId_idx" ON "MessageThread"("clientId");
CREATE INDEX IF NOT EXISTS "MessageThread_isPortalThread_idx" ON "MessageThread"("isPortalThread");

-- ============================================================================
-- MESSAGE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS "Message" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "threadId" TEXT NOT NULL,
  "senderUserId" TEXT NOT NULL,
  "senderType" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "fromPortal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Message_threadId_idx" ON "Message"("threadId");
CREATE INDEX IF NOT EXISTS "Message_senderUserId_idx" ON "Message"("senderUserId");
CREATE INDEX IF NOT EXISTS "Message_senderType_idx" ON "Message"("senderType");
CREATE INDEX IF NOT EXISTS "Message_fromPortal_idx" ON "Message"("fromPortal");

-- ============================================================================
-- CLIENT CONNECTION TABLE (Invitation System)
-- ============================================================================

CREATE TABLE IF NOT EXISTS "ClientConnection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedBy" TEXT NOT NULL,
  "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "connectedAt" TIMESTAMP(3)
);

CREATE UNIQUE INDEX IF NOT EXISTS "ClientConnection_orgId_clientId_key" ON "ClientConnection"("orgId", "clientId");
CREATE INDEX IF NOT EXISTS "ClientConnection_orgId_idx" ON "ClientConnection"("orgId");
CREATE INDEX IF NOT EXISTS "ClientConnection_clientId_idx" ON "ClientConnection"("clientId");
CREATE INDEX IF NOT EXISTS "ClientConnection_status_idx" ON "ClientConnection"("status");

-- ============================================================================
-- ALSO CREATE IN APP SCHEMA FOR PRODUCTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS app."MessageThread" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "claimId" TEXT,
  "tradePartnerId" TEXT,
  "clientId" TEXT,
  "participants" TEXT[] NOT NULL DEFAULT '{}',
  "subject" TEXT,
  "isPortalThread" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "app_MessageThread_orgId_idx" ON app."MessageThread"("orgId");
CREATE INDEX IF NOT EXISTS "app_MessageThread_claimId_idx" ON app."MessageThread"("claimId");
CREATE INDEX IF NOT EXISTS "app_MessageThread_clientId_idx" ON app."MessageThread"("clientId");
CREATE INDEX IF NOT EXISTS "app_MessageThread_isPortalThread_idx" ON app."MessageThread"("isPortalThread");

CREATE TABLE IF NOT EXISTS app."Message" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "threadId" TEXT NOT NULL,
  "senderUserId" TEXT NOT NULL,
  "senderType" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "fromPortal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES app."MessageThread"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "app_Message_threadId_idx" ON app."Message"("threadId");
CREATE INDEX IF NOT EXISTS "app_Message_senderUserId_idx" ON app."Message"("senderUserId");

CREATE TABLE IF NOT EXISTS app."ClientConnection" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedBy" TEXT NOT NULL,
  "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "connectedAt" TIMESTAMP(3)
);

CREATE UNIQUE INDEX IF NOT EXISTS "app_ClientConnection_orgId_clientId_key" ON app."ClientConnection"("orgId", "clientId");
CREATE INDEX IF NOT EXISTS "app_ClientConnection_orgId_idx" ON app."ClientConnection"("orgId");
CREATE INDEX IF NOT EXISTS "app_ClientConnection_clientId_idx" ON app."ClientConnection"("clientId");
CREATE INDEX IF NOT EXISTS "app_ClientConnection_status_idx" ON app."ClientConnection"("status");

-- Comments
COMMENT ON TABLE "MessageThread" IS 'Message threads for pro-client and pro-trade communication';
COMMENT ON TABLE "Message" IS 'Individual messages within threads';
COMMENT ON TABLE "ClientConnection" IS 'Client-Pro invitation and connection tracking';
