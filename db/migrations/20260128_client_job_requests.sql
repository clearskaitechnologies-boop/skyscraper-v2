-- Client Job Request Feature
-- Allows clients to post what they're looking for, with photos and summary
-- "What the client is looking for, who they're wanting to work with"

SET search_path TO app;

-- Create client job requests table
CREATE TABLE IF NOT EXISTS "clientJobRequest" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  
  -- Job Details
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  "tradeType" TEXT NOT NULL,
  
  -- Location
  city TEXT,
  state TEXT,
  zip TEXT,
  "serviceArea" TEXT,
  
  -- Preferences
  "preferredContractorType" TEXT[], -- e.g., ['licensed', 'insured', 'veteran_owned']
  budget TEXT, -- e.g., "$5,000 - $10,000"
  "budgetMin" DECIMAL(12,2),
  "budgetMax" DECIMAL(12,2),
  timeline TEXT, -- e.g., "ASAP", "Within 2 weeks", "Flexible"
  urgency TEXT DEFAULT 'normal', -- emergency, urgent, high, normal, flexible
  
  -- Photos and media
  photos TEXT[] DEFAULT '{}',
  "coverPhoto" TEXT,
  
  -- What they're looking for
  "lookingFor" TEXT[], -- e.g., ['Free estimates', '24/7 availability', 'Financing options']
  requirements TEXT[], -- e.g., ['Must be licensed', 'Insurance required']
  
  -- Visibility & Status
  status TEXT DEFAULT 'active', -- active, paused, fulfilled, expired, cancelled
  visibility TEXT DEFAULT 'public', -- public, network, private
  "expiresAt" TIMESTAMP WITH TIME ZONE,
  
  -- Engagement metrics
  "viewCount" INTEGER DEFAULT 0,
  "responseCount" INTEGER DEFAULT 0,
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for searching
CREATE INDEX IF NOT EXISTS idx_client_job_request_trade_type ON "clientJobRequest"("tradeType");
CREATE INDEX IF NOT EXISTS idx_client_job_request_status ON "clientJobRequest"(status);
CREATE INDEX IF NOT EXISTS idx_client_job_request_city_state ON "clientJobRequest"(city, state);
CREATE INDEX IF NOT EXISTS idx_client_job_request_client ON "clientJobRequest"("clientId");
CREATE INDEX IF NOT EXISTS idx_client_job_request_user ON "clientJobRequest"("userId");

-- Create responses table for contractors responding to job requests
CREATE TABLE IF NOT EXISTS "clientJobResponse" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "jobRequestId" UUID NOT NULL REFERENCES "clientJobRequest"(id) ON DELETE CASCADE,
  "contractorId" TEXT NOT NULL, -- tradesCompanyMember id
  "companyName" TEXT NOT NULL,
  
  -- Response details
  message TEXT NOT NULL,
  "estimatedPrice" TEXT,
  "estimatedPriceMin" DECIMAL(12,2),
  "estimatedPriceMax" DECIMAL(12,2),
  "estimatedTimeline" TEXT,
  "availableDate" DATE,
  
  -- Attachments
  attachments TEXT[] DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'pending', -- pending, viewed, shortlisted, accepted, declined
  
  -- Timestamps
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "viewedAt" TIMESTAMP WITH TIME ZONE,
  
  -- Ensure one response per contractor per job
  UNIQUE("jobRequestId", "contractorId")
);

CREATE INDEX IF NOT EXISTS idx_client_job_response_job ON "clientJobResponse"("jobRequestId");
CREATE INDEX IF NOT EXISTS idx_client_job_response_contractor ON "clientJobResponse"("contractorId");
CREATE INDEX IF NOT EXISTS idx_client_job_response_status ON "clientJobResponse"(status);

-- Add comments
COMMENT ON TABLE "clientJobRequest" IS 'Client job requests - what homeowners are looking for';
COMMENT ON TABLE "clientJobResponse" IS 'Contractor responses to client job requests';
COMMENT ON COLUMN "clientJobRequest"."tradeType" IS 'Type of trade needed (roofing, plumbing, smart_home, pool_contractor, etc.)';
COMMENT ON COLUMN "clientJobRequest"."lookingFor" IS 'What the client is specifically looking for in a contractor';
COMMENT ON COLUMN "clientJobRequest".requirements IS 'Mandatory requirements for contractors';

SELECT 'Client job request tables created successfully' as status;
