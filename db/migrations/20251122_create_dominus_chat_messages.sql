-- Migration: Create DominusChatMessage table for Ask Dominus persistence
CREATE TABLE IF NOT EXISTS "DominusChatMessage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT,
  "orgId" TEXT,
  "claimId" TEXT,
  "routeName" TEXT,
  "role" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_dominus_chat_messages_user_created_at" ON "DominusChatMessage"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_dominus_chat_messages_org_created_at" ON "DominusChatMessage"("orgId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_dominus_chat_messages_claim_created_at" ON "DominusChatMessage"("claimId", "createdAt");
