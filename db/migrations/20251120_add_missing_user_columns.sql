-- Migration: Add missing user profile columns to align with Prisma schema
-- Date: 2025-11-20
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "headshotUrl" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "jobHistory" JSONB;

-- Optional indexes (safe no-op if columns empty)
CREATE INDEX IF NOT EXISTS users_title_idx ON "users"("title");
CREATE INDEX IF NOT EXISTS users_phone_idx ON "users"("phone");