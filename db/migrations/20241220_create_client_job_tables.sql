-- Add ClientJob table for client job postings
-- This replaces the shared claims functionality with a comprehensive job management system

CREATE TABLE IF NOT EXISTS "ClientJob" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "orgId" TEXT,
    
    -- Job Details
    "title" TEXT NOT NULL,
    "description" TEXT,
    "tradeType" TEXT,
    "urgency" TEXT DEFAULT 'normal', -- normal, urgent, emergency
    "status" TEXT DEFAULT 'draft', -- draft, active, paused, completed, cancelled
    
    -- Location & Scope
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "propertyType" TEXT, -- residential, commercial, industrial
    "accessInstructions" TEXT,
    
    -- Budget & Timeline
    "budget" INTEGER,
    "budgetType" TEXT DEFAULT 'fixed', -- fixed, hourly, estimate_needed
    "preferredStartDate" TIMESTAMP,
    "expectedDuration" TEXT, -- "1 day", "2-3 weeks", etc
    
    -- Requirements
    "licenseRequired" BOOLEAN DEFAULT false,
    "insuranceRequired" BOOLEAN DEFAULT true,
    "bondingRequired" BOOLEAN DEFAULT false,
    "backgroundCheckRequired" BOOLEAN DEFAULT false,
    
    -- Media & Documents
    "photos" JSONB DEFAULT '[]'::jsonb, -- Array of photo URLs
    "documents" JSONB DEFAULT '[]'::jsonb, -- Array of document URLs
    "attachments" JSONB DEFAULT '[]'::jsonb, -- Additional files
    
    -- Metadata
    "source" TEXT DEFAULT 'client_portal', -- client_portal, api, import
    "externalId" TEXT, -- For integrations
    "tags" JSONB DEFAULT '[]'::jsonb, -- Array of tags for categorization
    "metadata" JSONB DEFAULT '{}'::jsonb, -- Additional metadata
    
    -- Timestamps
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "deletedAt" TIMESTAMP,

    CONSTRAINT "ClientJob_pkey" PRIMARY KEY ("id")
);

-- Add JobInvitation table for pro invitations
CREATE TABLE IF NOT EXISTS "JobInvitation" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "proId" TEXT NOT NULL, -- References ContractorProfile or TradesCompanyMember
    "clientId" TEXT NOT NULL,
    
    -- Invitation Details
    "invitedBy" TEXT NOT NULL, -- client or system
    "message" TEXT, -- Custom message from client
    "status" TEXT DEFAULT 'pending', -- pending, accepted, declined, expired
    
    -- Pro Response
    "responseMessage" TEXT,
    "proposedBudget" INTEGER,
    "proposedTimeline" TEXT,
    "availabilityDate" TIMESTAMP,
    
    -- Metadata
    "source" TEXT DEFAULT 'manual', -- manual, auto_match, referral
    "metadata" JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,

    CONSTRAINT "JobInvitation_pkey" PRIMARY KEY ("id")
);

-- Add JobConnection table for tracking client-pro relationships
CREATE TABLE IF NOT EXISTS "JobConnection" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "proId" TEXT NOT NULL,
    
    -- Connection Details
    "connectionType" TEXT NOT NULL, -- invited, applied, matched, hired
    "status" TEXT DEFAULT 'active', -- active, paused, completed, terminated
    "rating" INTEGER, -- 1-5 rating from client
    "review" TEXT, -- Client review text
    
    -- Financial
    "agreedBudget" INTEGER,
    "finalCost" INTEGER,
    "paymentStatus" TEXT, -- pending, partial, paid, dispute
    
    -- Timestamps
    "connectedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP,
    "ratedAt" TIMESTAMP,

    CONSTRAINT "JobConnection_pkey" PRIMARY KEY ("id")
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_clientjob_clientid" ON "ClientJob"("clientId");
CREATE INDEX IF NOT EXISTS "idx_clientjob_status" ON "ClientJob"("status");
CREATE INDEX IF NOT EXISTS "idx_clientjob_tradetype" ON "ClientJob"("tradeType");
CREATE INDEX IF NOT EXISTS "idx_clientjob_createdat" ON "ClientJob"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_clientjob_orgid" ON "ClientJob"("orgId");

CREATE INDEX IF NOT EXISTS "idx_jobinvitation_jobid" ON "JobInvitation"("jobId");
CREATE INDEX IF NOT EXISTS "idx_jobinvitation_proid" ON "JobInvitation"("proId");
CREATE INDEX IF NOT EXISTS "idx_jobinvitation_clientid" ON "JobInvitation"("clientId");
CREATE INDEX IF NOT EXISTS "idx_jobinvitation_status" ON "JobInvitation"("status");

CREATE INDEX IF NOT EXISTS "idx_jobconnection_jobid" ON "JobConnection"("jobId");
CREATE INDEX IF NOT EXISTS "idx_jobconnection_clientid" ON "JobConnection"("clientId");
CREATE INDEX IF NOT EXISTS "idx_jobconnection_proid" ON "JobConnection"("proId");
CREATE INDEX IF NOT EXISTS "idx_jobconnection_status" ON "JobConnection"("status");

-- Add foreign key constraints (if needed)
-- ALTER TABLE "ClientJob" ADD CONSTRAINT "ClientJob_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "JobInvitation" ADD CONSTRAINT "JobInvitation_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ClientJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- ALTER TABLE "JobConnection" ADD CONSTRAINT "JobConnection_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ClientJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientjob_updated_at BEFORE UPDATE ON "ClientJob" FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();