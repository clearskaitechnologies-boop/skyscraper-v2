-- Migration: Ensure snake_case user profile columns exist
-- Date: 2025-11-20
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "title" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "headshot_url" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "public_skills" JSONB DEFAULT '[]';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "job_history" JSONB DEFAULT '[]';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "client_testimonials" JSONB DEFAULT '[]';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "earned_badges" JSONB DEFAULT '[]';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "years_experience" INT DEFAULT 0;

-- Indexes (optional)
CREATE INDEX IF NOT EXISTS users_title_idx ON "users"("title");
CREATE INDEX IF NOT EXISTS users_years_experience_idx ON "users"("years_experience");