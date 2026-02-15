-- Create ai_sessions table for AI assistant conversation tracking
-- Date: 2025-12-05
-- Resolves: PrismaClientKnownRequestError code 42P01 "relation ai_sessions does not exist"

BEGIN;

-- Create ai_sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ai_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  user_id text NOT NULL,
  voice_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON public.ai_sessions(user_id);

-- Create index on org_id for org-level queries
CREATE INDEX IF NOT EXISTS idx_ai_sessions_org_id ON public.ai_sessions(org_id);

-- Create ai_messages table if it doesn't exist (for conversation history)
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  is_voice boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create index on session_id for conversation history queries
CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON public.ai_messages(session_id);

-- Verify tables were created
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'ai_sessions'
  ) THEN
    RAISE NOTICE '✅ ai_sessions table created/verified';
  ELSE
    RAISE EXCEPTION '❌ ai_sessions table creation failed';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'ai_messages'
  ) THEN
    RAISE NOTICE '✅ ai_messages table created/verified';
  ELSE
    RAISE EXCEPTION '❌ ai_messages table creation failed';
  END IF;
END $$;

COMMIT;

-- How to run this migration:
-- psql "$DATABASE_URL" -f db/migrations/20251205_create_ai_sessions_tables.sql
