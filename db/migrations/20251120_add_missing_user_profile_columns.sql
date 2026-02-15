-- Migration: Add missing user profile columns if they do not exist
-- Date: 2025-11-20
-- Purpose: Production drift fix for errors referencing users.title / phone / headshot_url / job_history

ALTER TABLE users ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS public_skills JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_history JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS client_testimonials JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS earned_badges JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS years_experience INT DEFAULT 0;

-- Verification query (optional):
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY column_name;
