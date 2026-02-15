-- ============================================================================
-- Migration: Create ClientJob Model
-- Description: Proper client job tracking separate from Claims
-- Date: 2026-02-04
-- ============================================================================

-- Create ClientJob table for tracking client projects/jobs
CREATE TABLE IF NOT EXISTS app."ClientJob" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "clientId" TEXT NOT NULL,
  "proCompanyId" UUID,
  "proMemberId" UUID,
  
  -- Job details
  "type" TEXT NOT NULL DEFAULT 'JOB', -- JOB, CLAIM, LEAD, RETAIL
  "title" TEXT NOT NULL,
  "description" TEXT,
  "tradeType" TEXT,
  "urgency" TEXT DEFAULT 'normal',
  
  -- Status tracking
  "status" TEXT NOT NULL DEFAULT 'new',
  "progress" INTEGER DEFAULT 0,
  "stage" TEXT DEFAULT 'intake', -- intake, scheduled, in_progress, review, completed, archived
  
  -- Property information
  "propertyAddress" TEXT,
  "propertyCity" TEXT,
  "propertyState" TEXT,
  "propertyZip" TEXT,
  "propertyType" TEXT,
  
  -- Financial
  "estimatedBudget" DECIMAL(12,2),
  "actualCost" DECIMAL(12,2),
  "paidAmount" DECIMAL(12,2) DEFAULT 0,
  
  -- Insurance (if claim)
  "claimNumber" TEXT,
  "insuranceCompany" TEXT,
  "adjusterName" TEXT,
  "adjusterPhone" TEXT,
  "adjusterEmail" TEXT,
  "claimApprovedAmount" DECIMAL(12,2),
  
  -- Scheduling
  "scheduledDate" TIMESTAMPTZ,
  "completedDate" TIMESTAMPTZ,
  
  -- Metadata
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "metadata" JSONB DEFAULT '{}',
  
  CONSTRAINT "ClientJob_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ClientJob_clientId_fkey" FOREIGN KEY ("clientId") 
    REFERENCES app."Client"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClientJob_proCompanyId_fkey" FOREIGN KEY ("proCompanyId") 
    REFERENCES app."tradesCompany"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "ClientJob_proMemberId_fkey" FOREIGN KEY ("proMemberId") 
    REFERENCES app."tradesCompanyMember"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS "ClientJob_clientId_idx" ON app."ClientJob"("clientId");
CREATE INDEX IF NOT EXISTS "ClientJob_proCompanyId_idx" ON app."ClientJob"("proCompanyId");
CREATE INDEX IF NOT EXISTS "ClientJob_status_idx" ON app."ClientJob"("status");
CREATE INDEX IF NOT EXISTS "ClientJob_type_idx" ON app."ClientJob"("type");
CREATE INDEX IF NOT EXISTS "ClientJob_createdAt_idx" ON app."ClientJob"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "ClientJob_stage_idx" ON app."ClientJob"("stage");

-- ============================================================================
-- Signature Envelope Table for E-Sign Integration
-- ============================================================================

CREATE TABLE IF NOT EXISTS app."SignatureEnvelope" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "provider" TEXT NOT NULL DEFAULT 'internal', -- internal, docusign, hellosign, pandadoc
  "externalId" TEXT, -- Provider's envelope/document ID
  
  -- Status tracking
  "status" TEXT NOT NULL DEFAULT 'draft', -- draft, sent, viewed, signed, declined, voided
  
  -- Document info
  "documentName" TEXT NOT NULL,
  "documentUrl" TEXT, -- URL to the document
  "signedDocumentUrl" TEXT, -- URL to signed PDF
  
  -- Relations
  "jobId" TEXT,
  "claimId" TEXT,
  "workRequestId" TEXT,
  
  -- Signer info
  "signerEmail" TEXT NOT NULL,
  "signerName" TEXT NOT NULL,
  "signerRole" TEXT DEFAULT 'client', -- client, contractor, adjuster
  
  -- Timestamps
  "sentAt" TIMESTAMPTZ,
  "viewedAt" TIMESTAMPTZ,
  "signedAt" TIMESTAMPTZ,
  "expiresAt" TIMESTAMPTZ,
  
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "metadata" JSONB DEFAULT '{}',
  
  CONSTRAINT "SignatureEnvelope_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SignatureEnvelope_jobId_fkey" FOREIGN KEY ("jobId") 
    REFERENCES app."ClientJob"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "SignatureEnvelope_jobId_idx" ON app."SignatureEnvelope"("jobId");
CREATE INDEX IF NOT EXISTS "SignatureEnvelope_status_idx" ON app."SignatureEnvelope"("status");
CREATE INDEX IF NOT EXISTS "SignatureEnvelope_signerEmail_idx" ON app."SignatureEnvelope"("signerEmail");

-- ============================================================================
-- Status Transition Audit Log
-- ============================================================================

CREATE TABLE IF NOT EXISTS app."StatusTransition" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  
  -- What changed
  "entityType" TEXT NOT NULL, -- ClientJob, Claim, Lead, WorkRequest
  "entityId" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT NOT NULL,
  
  -- Who changed it
  "userId" TEXT,
  "userName" TEXT,
  "userRole" TEXT, -- client, contractor, system
  
  -- Why
  "reason" TEXT,
  "notes" TEXT,
  
  -- Metadata
  "metadata" JSONB DEFAULT '{}',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "StatusTransition_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "StatusTransition_entityType_entityId_idx" 
  ON app."StatusTransition"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "StatusTransition_createdAt_idx" 
  ON app."StatusTransition"("createdAt" DESC);

-- ============================================================================
-- Activity/Analytics Event Log
-- ============================================================================

CREATE TABLE IF NOT EXISTS app."AnalyticsEvent" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  
  -- Event info
  "event" TEXT NOT NULL, -- e.g., 'job.created', 'message.sent', 'pdf.generated'
  "category" TEXT NOT NULL, -- job, claim, message, document, payment, user
  
  -- Context
  "userId" TEXT,
  "orgId" TEXT,
  "clientId" TEXT,
  "jobId" TEXT,
  "claimId" TEXT,
  
  -- Data
  "properties" JSONB DEFAULT '{}',
  
  -- Session info
  "sessionId" TEXT,
  "userAgent" TEXT,
  "ipAddress" TEXT,
  
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AnalyticsEvent_event_idx" ON app."AnalyticsEvent"("event");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_category_idx" ON app."AnalyticsEvent"("category");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_userId_idx" ON app."AnalyticsEvent"("userId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_orgId_idx" ON app."AnalyticsEvent"("orgId");
CREATE INDEX IF NOT EXISTS "AnalyticsEvent_createdAt_idx" ON app."AnalyticsEvent"("createdAt" DESC);

-- ============================================================================
-- Update timestamp trigger
-- ============================================================================

CREATE OR REPLACE FUNCTION app.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to new tables
DROP TRIGGER IF EXISTS "ClientJob_updated_at" ON app."ClientJob";
CREATE TRIGGER "ClientJob_updated_at"
  BEFORE UPDATE ON app."ClientJob"
  FOR EACH ROW
  EXECUTE FUNCTION app.update_updated_at();

DROP TRIGGER IF EXISTS "SignatureEnvelope_updated_at" ON app."SignatureEnvelope";
CREATE TRIGGER "SignatureEnvelope_updated_at"
  BEFORE UPDATE ON app."SignatureEnvelope"
  FOR EACH ROW
  EXECUTE FUNCTION app.update_updated_at();

-- ============================================================================
-- Done
-- ============================================================================
SELECT 'Migration complete: ClientJob, SignatureEnvelope, StatusTransition, AnalyticsEvent tables created' as result;
