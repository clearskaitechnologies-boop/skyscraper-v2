-- Add TradesPostComment table for social feed
-- Migration: 20241224_create_trades_post_comment.sql

CREATE TABLE IF NOT EXISTS "TradesPostComment" (
  "id" TEXT PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorAvatar" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  
  CONSTRAINT "TradesPostComment_postId_fkey" FOREIGN KEY ("postId") 
    REFERENCES "TradesPost"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "TradesPostComment_postId_idx" ON "TradesPostComment"("postId");
CREATE INDEX IF NOT EXISTS "TradesPostComment_authorId_idx" ON "TradesPostComment"("authorId");
CREATE INDEX IF NOT EXISTS "TradesPostComment_createdAt_idx" ON "TradesPostComment"("createdAt" DESC);
