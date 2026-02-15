-- Add headshot_url column to users table for profile photos
-- Schema has headshotUrl mapped to headshot_url but column doesn't exist in DB

ALTER TABLE users ADD COLUMN IF NOT EXISTS headshot_url TEXT;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS users_headshot_url_idx ON users(headshot_url) WHERE headshot_url IS NOT NULL;
