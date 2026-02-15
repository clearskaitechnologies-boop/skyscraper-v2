-- Add portal messaging flags to MessageThread and Message tables
-- Migration: add_portal_messaging_flags
-- Date: 2025-11-30

-- Add isPortalThread flag to MessageThread
ALTER TABLE "MessageThread" ADD COLUMN "isPortalThread" BOOLEAN NOT NULL DEFAULT false;

-- Add fromPortal flag to Message  
ALTER TABLE "Message" ADD COLUMN "fromPortal" BOOLEAN NOT NULL DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX "MessageThread_isPortalThread_idx" ON "MessageThread"("isPortalThread");
CREATE INDEX "Message_fromPortal_idx" ON "Message"("fromPortal");
