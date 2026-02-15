-- Migration: Add TradePost and TradeComment tables
-- Date: 2025-12-24
-- Description: Adds social feed functionality to Trades Network

-- Create TradePost table
CREATE TABLE "TradePost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "photoUrl" TEXT,
  "photoKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Create TradeComment table
CREATE TABLE "TradeComment" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TradeComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "TradePost"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for TradePost
CREATE INDEX "TradePost_authorId_idx" ON "TradePost"("authorId");
CREATE INDEX "TradePost_companyId_idx" ON "TradePost"("companyId");
CREATE INDEX "TradePost_createdAt_idx" ON "TradePost"("createdAt");

-- Create indexes for TradeComment
CREATE INDEX "TradeComment_postId_idx" ON "TradeComment"("postId");
CREATE INDEX "TradeComment_authorId_idx" ON "TradeComment"("authorId");
CREATE INDEX "TradeComment_createdAt_idx" ON "TradeComment"("createdAt");
