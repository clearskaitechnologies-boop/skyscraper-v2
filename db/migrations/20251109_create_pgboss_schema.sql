-- Create pgboss schema for pg-boss job queue
-- This schema will be populated automatically by pg-boss on first startup

CREATE SCHEMA IF NOT EXISTS pgboss;

-- Grant necessary permissions (adjust role names as needed)
-- If using Supabase/managed Postgres, this may already be handled
GRANT USAGE ON SCHEMA pgboss TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA pgboss TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA pgboss TO postgres;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA pgboss GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA pgboss GRANT ALL ON SEQUENCES TO postgres;

COMMENT ON SCHEMA pgboss IS 'pg-boss job queue tables - managed by pg-boss library';
