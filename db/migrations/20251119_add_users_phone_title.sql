-- Adds phone and title columns to users table if they do not already exist.
-- Add phone and title columns if missing (Postgres syntax)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS title text;

-- Optional index to optimize org + phone lookups
CREATE INDEX IF NOT EXISTS users_orgId_phone_idx ON users ("orgId", phone);
