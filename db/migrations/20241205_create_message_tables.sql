-- Migration: Create MessageThread and Message tables
-- Created: Phase F - Messages System
-- Run with: psql "$DATABASE_URL" -f ./db/migrations/20241205_create_message_tables.sql

-- Create MessageThread table
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

-- Create indexes for MessageThread
CREATE INDEX IF NOT EXISTS "MessageThread_orgId_idx" ON "MessageThread"("orgId");
CREATE INDEX IF NOT EXISTS "MessageThread_claimId_idx" ON "MessageThread"("claimId");
CREATE INDEX IF NOT EXISTS "MessageThread_tradePartnerId_idx" ON "MessageThread"("tradePartnerId");
CREATE INDEX IF NOT EXISTS "MessageThread_clientId_idx" ON "MessageThread"("clientId");
CREATE INDEX IF NOT EXISTS "MessageThread_isPortalThread_idx" ON "MessageThread"("isPortalThread");

-- Create Message table
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

-- Create indexes for Message
CREATE INDEX IF NOT EXISTS "Message_threadId_idx" ON "Message"("threadId");
CREATE INDEX IF NOT EXISTS "Message_senderUserId_idx" ON "Message"("senderUserId");
CREATE INDEX IF NOT EXISTS "Message_senderType_idx" ON "Message"("senderType");
CREATE INDEX IF NOT EXISTS "Message_fromPortal_idx" ON "Message"("fromPortal");

-- Add comment
COMMENT ON TABLE "MessageThread" IS 'Phase F: Message threads for contact/claim communication';
COMMENT ON TABLE "Message" IS 'Phase F: Individual messages within threads';
