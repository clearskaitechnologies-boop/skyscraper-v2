-- Client Bridge Migration
-- Creates tables for Pro ↔ Client connections, messages, trades network, directory

-- 1. ClaimClientLink: Pro ↔ Client connection table
CREATE TABLE IF NOT EXISTS claim_client_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "claimId" UUID NOT NULL,
  "clientUserId" TEXT NOT NULL,
  "clientEmail" TEXT NOT NULL,
  "clientName" TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "invitedBy" TEXT NOT NULL,
  "invitedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "acceptedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("claimId", "clientEmail")
);

CREATE INDEX IF NOT EXISTS idx_claim_client_links_claim_id ON claim_client_links("claimId");
CREATE INDEX IF NOT EXISTS idx_claim_client_links_client_user_id ON claim_client_links("clientUserId");
CREATE INDEX IF NOT EXISTS idx_claim_client_links_status ON claim_client_links(status);

-- 2. ClaimMessageThread: Message threads per claim connection
CREATE TABLE IF NOT EXISTS claim_message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "claimClientLinkId" UUID NOT NULL,
  "claimId" UUID NOT NULL,
  "lastMessageAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("claimClientLinkId")
);

CREATE INDEX IF NOT EXISTS idx_claim_message_threads_claim_id ON claim_message_threads("claimId");

-- 3. ClaimMessage: Individual messages in Pro ↔ Client chat
CREATE TABLE IF NOT EXISTS claim_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "threadId" UUID NOT NULL REFERENCES claim_message_threads(id) ON DELETE CASCADE,
  "senderId" TEXT NOT NULL,
  "senderRole" TEXT NOT NULL,
  content TEXT NOT NULL,
  "attachmentUrl" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_claim_messages_thread_id_created_at ON claim_messages("threadId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_claim_messages_sender_id ON claim_messages("senderId");

-- 4. TradesPost: Social feed posts for trades network
CREATE TABLE IF NOT EXISTS trades_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orgId" UUID NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorAvatar" TEXT,
  content TEXT NOT NULL,
  "imageUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  visibility TEXT NOT NULL DEFAULT 'PUBLIC',
  "likesCount" INT NOT NULL DEFAULT 0,
  "commentsCount" INT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trades_posts_org_id ON trades_posts("orgId");
CREATE INDEX IF NOT EXISTS idx_trades_posts_author_id ON trades_posts("authorId");
CREATE INDEX IF NOT EXISTS idx_trades_posts_visibility_created_at ON trades_posts(visibility, "createdAt" DESC);

-- 5. DirectoryProfile: Public directory profiles for pros/vendors
CREATE TABLE IF NOT EXISTS directory_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  "ownerOrgId" UUID,
  "ownerUserId" TEXT,
  slug TEXT NOT NULL UNIQUE,
  "displayName" TEXT NOT NULL,
  "avatarUrl" TEXT,
  "bannerUrl" TEXT,
  "serviceAreas" TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT FALSE,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_directory_profiles_type ON directory_profiles(type);
CREATE INDEX IF NOT EXISTS idx_directory_profiles_is_public ON directory_profiles("isPublic");
CREATE INDEX IF NOT EXISTS idx_directory_profiles_owner_org_id ON directory_profiles("ownerOrgId");
CREATE INDEX IF NOT EXISTS idx_directory_profiles_owner_user_id ON directory_profiles("ownerUserId");

-- 6. JobRequest: Client job requests
CREATE TABLE IF NOT EXISTS job_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "clientUserId" TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  "propertyType" TEXT,
  urgency TEXT NOT NULL,
  budget TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_requests_status ON job_requests(status);
CREATE INDEX IF NOT EXISTS idx_job_requests_client_user_id ON job_requests("clientUserId");
CREATE INDEX IF NOT EXISTS idx_job_requests_created_at ON job_requests("createdAt" DESC);

-- 7. JobResponse: Pro responses to job requests
CREATE TABLE IF NOT EXISTS job_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "jobRequestId" UUID NOT NULL REFERENCES job_requests(id) ON DELETE CASCADE,
  "proOrgId" UUID NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_responses_job_request_id ON job_responses("jobRequestId");
CREATE INDEX IF NOT EXISTS idx_job_responses_pro_org_id ON job_responses("proOrgId");

-- Verification query
SELECT 
  'claim_client_links' as table_name, 
  COUNT(*) as row_count 
FROM claim_client_links
UNION ALL
SELECT 'claim_message_threads', COUNT(*) FROM claim_message_threads
UNION ALL
SELECT 'claim_messages', COUNT(*) FROM claim_messages
UNION ALL
SELECT 'trades_posts', COUNT(*) FROM trades_posts
UNION ALL
SELECT 'directory_profiles', COUNT(*) FROM directory_profiles
UNION ALL
SELECT 'job_requests', COUNT(*) FROM job_requests
UNION ALL
SELECT 'job_responses', COUNT(*) FROM job_responses;
