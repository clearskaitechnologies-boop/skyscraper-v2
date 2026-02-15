-- Trades Network Platform - Full Schema
-- Date: November 12, 2025

-- Trades Profiles (Contractor/Company Profiles)
CREATE TABLE IF NOT EXISTS "TradesProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL UNIQUE,
    "orgId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "specialties" TEXT[],
    "certifications" TEXT[],
    "bio" TEXT,
    "logoUrl" TEXT,
    "website" TEXT,
    "yearsInBusiness" INTEGER,
    "crewSize" INTEGER,
    "rating" DOUBLE PRECISION DEFAULT 0,
    "reviewCount" INTEGER DEFAULT 0,
    "projectCount" INTEGER DEFAULT 0,
    "verified" BOOLEAN DEFAULT false,
    "active" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Trades Posts (Jobs, Opportunities, Updates)
CREATE TABLE IF NOT EXISTS "TradesPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "location" TEXT,
    "city" TEXT,
    "state" TEXT,
    "tags" TEXT[],
    "images" TEXT[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "payRate" TEXT,
    "requirements" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "active" BOOLEAN DEFAULT true,
    "featured" BOOLEAN DEFAULT false,
    "viewCount" INTEGER DEFAULT 0,
    "responseCount" INTEGER DEFAULT 0,
    "likeCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TradesPost_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "TradesProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Trades Messages (Direct Messaging)
CREATE TABLE IF NOT EXISTS "TradesMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromProfileId" TEXT NOT NULL,
    "toProfileId" TEXT NOT NULL,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "read" BOOLEAN DEFAULT false,
    "archived" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradesMessage_fromProfileId_fkey" FOREIGN KEY ("fromProfileId") REFERENCES "TradesProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradesMessage_toProfileId_fkey" FOREIGN KEY ("toProfileId") REFERENCES "TradesProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Trades Connections (Following/Followers)
CREATE TABLE IF NOT EXISTS "TradesConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradesConnection_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "TradesProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TradesConnection_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "TradesProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for TradesProfile
CREATE INDEX IF NOT EXISTS "TradesProfile_userId_idx" ON "TradesProfile"("userId");
CREATE INDEX IF NOT EXISTS "TradesProfile_orgId_idx" ON "TradesProfile"("orgId");
CREATE INDEX IF NOT EXISTS "TradesProfile_city_state_idx" ON "TradesProfile"("city", "state");
CREATE INDEX IF NOT EXISTS "TradesProfile_verified_active_idx" ON "TradesProfile"("verified", "active");

-- Indexes for TradesPost
CREATE INDEX IF NOT EXISTS "TradesPost_profileId_idx" ON "TradesPost"("profileId");
CREATE INDEX IF NOT EXISTS "TradesPost_authorId_idx" ON "TradesPost"("authorId");
CREATE INDEX IF NOT EXISTS "TradesPost_type_active_idx" ON "TradesPost"("type", "active");
CREATE INDEX IF NOT EXISTS "TradesPost_city_state_idx" ON "TradesPost"("city", "state");
CREATE INDEX IF NOT EXISTS "TradesPost_createdAt_idx" ON "TradesPost"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "TradesPost_featured_active_idx" ON "TradesPost"("featured", "active");

-- Indexes for TradesMessage
CREATE INDEX IF NOT EXISTS "TradesMessage_fromProfileId_idx" ON "TradesMessage"("fromProfileId");
CREATE INDEX IF NOT EXISTS "TradesMessage_toProfileId_idx" ON "TradesMessage"("toProfileId");
CREATE INDEX IF NOT EXISTS "TradesMessage_read_archived_idx" ON "TradesMessage"("read", "archived");
CREATE INDEX IF NOT EXISTS "TradesMessage_createdAt_idx" ON "TradesMessage"("createdAt" DESC);

-- Indexes for TradesConnection
CREATE UNIQUE INDEX IF NOT EXISTS "TradesConnection_followerId_followingId_key" ON "TradesConnection"("followerId", "followingId");
CREATE INDEX IF NOT EXISTS "TradesConnection_followerId_idx" ON "TradesConnection"("followerId");
CREATE INDEX IF NOT EXISTS "TradesConnection_followingId_idx" ON "TradesConnection"("followingId");
