-- Fix missing tables for production (post-app-schema drop)
-- Run with: psql "$DIRECT_DATABASE_URL" -f db/fix-missing-tables.sql

-- 1. Recreate trade_reviews with Prisma-matching schema
DROP TABLE IF EXISTS trade_reviews CASCADE;
CREATE TABLE trade_reviews (
  id TEXT PRIMARY KEY,
  "contractorId" UUID NOT NULL,
  "clientId" TEXT NOT NULL,
  rating INTEGER NOT NULL,
  title TEXT,
  comment TEXT NOT NULL,
  "jobType" TEXT,
  "projectCost" TEXT,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  helpful INTEGER DEFAULT 0,
  "proResponse" TEXT,
  "respondedAt" TIMESTAMPTZ,
  "importSource" TEXT,
  "externalId" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("contractorId", "clientId"),
  UNIQUE("importSource", "externalId")
);
CREATE INDEX idx_trade_reviews_clientId ON trade_reviews("clientId");
CREATE INDEX idx_trade_reviews_contractorId ON trade_reviews("contractorId");
CREATE INDEX idx_trade_reviews_rating ON trade_reviews(rating);
CREATE INDEX idx_trade_reviews_status ON trade_reviews(status);

-- 2. Create network_posts (needed by dashboard stats + portal)
CREATE TABLE IF NOT EXISTS network_posts (
  id TEXT PRIMARY KEY,
  "orgId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "contractorId" TEXT,
  content TEXT NOT NULL,
  photos JSONB,
  "postType" TEXT DEFAULT 'update',
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  "isPublic" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_network_posts_org_created ON network_posts("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS idx_network_posts_type_public ON network_posts("postType", "isPublic");

-- 3. Create pro_engagement (referenced by tradesCompanyMember relation)
CREATE TABLE IF NOT EXISTS pro_engagement (
  id TEXT PRIMARY KEY,
  "memberId" UUID NOT NULL UNIQUE,
  "profileViews" INTEGER DEFAULT 0,
  "searchAppearances" INTEGER DEFAULT 0,
  "contactClicks" INTEGER DEFAULT 0,
  "websiteClicks" INTEGER DEFAULT 0,
  "lastActivityAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pro_engagement_member ON pro_engagement("memberId");

-- 4. Create trades_feed_engagement
CREATE TABLE IF NOT EXISTS trades_feed_engagement (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  liked BOOLEAN DEFAULT false,
  comment_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_trades_feed_engagement_post ON trades_feed_engagement(post_id);
CREATE INDEX IF NOT EXISTS idx_trades_feed_engagement_user ON trades_feed_engagement(user_id);

-- 5. Create tradesConnection
CREATE TABLE IF NOT EXISTS "tradesConnection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "requesterId" TEXT NOT NULL,
  "addresseeId" TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  message TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("requesterId", "addresseeId")
);
CREATE INDEX IF NOT EXISTS idx_trades_connection_addressee ON "tradesConnection"("addresseeId");
CREATE INDEX IF NOT EXISTS idx_trades_connection_requester ON "tradesConnection"("requesterId");

-- 6. Create tradesGroup
CREATE TABLE IF NOT EXISTS "tradesGroup" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT,
  "coverImage" TEXT,
  "isPrivate" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "memberCount" INTEGER DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trades_group_created_by ON "tradesGroup"("createdBy");
CREATE INDEX IF NOT EXISTS idx_trades_group_slug ON "tradesGroup"(slug);

-- 7. Create tradesGroupMember
CREATE TABLE IF NOT EXISTS "tradesGroupMember" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "groupId" UUID NOT NULL,
  "userId" TEXT NOT NULL,
  role TEXT DEFAULT 'member',
  "joinedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE("groupId", "userId")
);
CREATE INDEX IF NOT EXISTS idx_trades_group_member_group ON "tradesGroupMember"("groupId");
CREATE INDEX IF NOT EXISTS idx_trades_group_member_user ON "tradesGroupMember"("userId");

-- 8. Create tradesGroupPost
CREATE TABLE IF NOT EXISTS "tradesGroupPost" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "groupId" UUID NOT NULL,
  "authorId" TEXT NOT NULL,
  content TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  "isPinned" BOOLEAN DEFAULT false,
  "isActive" BOOLEAN DEFAULT true,
  "likeCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trades_group_post_author ON "tradesGroupPost"("authorId");
CREATE INDEX IF NOT EXISTS idx_trades_group_post_group ON "tradesGroupPost"("groupId");
CREATE INDEX IF NOT EXISTS idx_trades_group_post_pinned ON "tradesGroupPost"("isPinned");

-- 9. Create tradesFeaturedWork
CREATE TABLE IF NOT EXISTS "tradesFeaturedWork" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "memberId" UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  category TEXT,
  "completedAt" TIMESTAMPTZ,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trades_featured_member ON "tradesFeaturedWork"("memberId");

-- 10. Create ClientJob
CREATE TABLE IF NOT EXISTS "ClientJob" (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "companyId" UUID,
  "memberId" UUID,
  title TEXT NOT NULL,
  description TEXT,
  "jobType" TEXT DEFAULT 'project',
  status TEXT DEFAULT 'posted',
  budget TEXT,
  location TEXT,
  urgency TEXT DEFAULT 'normal',
  "startDate" TIMESTAMPTZ,
  "endDate" TIMESTAMPTZ,
  "isPublic" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_job_client ON "ClientJob"("clientId");
CREATE INDEX IF NOT EXISTS idx_client_job_company ON "ClientJob"("companyId");
CREATE INDEX IF NOT EXISTS idx_client_job_status ON "ClientJob"(status);

-- 11. Create ClientJobResponse
CREATE TABLE IF NOT EXISTS "ClientJobResponse" (
  id TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "memberId" UUID NOT NULL,
  message TEXT,
  "estimateAmount" TEXT,
  status TEXT DEFAULT 'pending',
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_job_response_job ON "ClientJobResponse"("jobId");
CREATE INDEX IF NOT EXISTS idx_client_job_response_member ON "ClientJobResponse"("memberId");

-- 12. Create ClientJobDocument
CREATE TABLE IF NOT EXISTS "ClientJobDocument" (
  id TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  "mimeType" TEXT,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_job_doc_job ON "ClientJobDocument"("jobId");

-- 13. Create ClientNotification
CREATE TABLE IF NOT EXISTS "ClientNotification" (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "actionUrl" TEXT,
  metadata JSONB,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_notification_client ON "ClientNotification"("clientId");
CREATE INDEX IF NOT EXISTS idx_client_notification_read ON "ClientNotification"("isRead");

-- 14. Create ClientPropertyPhoto
CREATE TABLE IF NOT EXISTS "ClientPropertyPhoto" (
  id TEXT PRIMARY KEY,
  "clientId" TEXT NOT NULL,
  "propertyId" TEXT,
  url TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'general',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_client_property_photo_client ON "ClientPropertyPhoto"("clientId");

-- Done
SELECT 'All missing tables created successfully' AS result;
