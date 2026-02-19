-- Create all missing tables referenced by raw SQL in API routes
-- Date: 2026-02-19
-- Context: Dead route audit found 5 tables referenced but missing in production DB
-- Tables: proposals, proposal_events, activity_events, ai_sessions, ai_messages, feature_flag_usage

BEGIN;

-- ═══════════════════════════════════════════════════════════════
-- 1. PROPOSALS — core proposal generation engine
-- Used by: /api/proposals (POST, GET), /api/proposals/[id]/status, /api/proposals/[id]/publish
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL,
  project_name text NOT NULL,
  property_address text NOT NULL,
  claim_id text,
  loss_type text DEFAULT 'General',
  template_id text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','generating','ready','failed','published')),
  generated_content jsonb,
  generated_document_id text,
  error_message text,
  tokens_used integer DEFAULT 0,
  published_url text,
  published_at timestamptz,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposals_org_id ON public.proposals(organization_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON public.proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON public.proposals(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 2. PROPOSAL_EVENTS — audit trail for proposal lifecycle
-- Used by: /api/ai/weather/run (try/catch wrapped)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.proposal_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES public.proposals(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_proposal_events_proposal_id ON public.proposal_events(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_events_type ON public.proposal_events(event_type);

-- ═══════════════════════════════════════════════════════════════
-- 3. ACTIVITY_EVENTS — org-level activity stream
-- Used by: /api/ai/weather/run, /api/ai/damage/upload (try/catch wrapped)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  "userId" text NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_org_id ON public.activity_events(org_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON public.activity_events("userId");
CREATE INDEX IF NOT EXISTS idx_activity_events_type ON public.activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_created ON public.activity_events(created_at DESC);

-- ═══════════════════════════════════════════════════════════════
-- 4. AI_SESSIONS — AI assistant conversation sessions
-- Used by: /api/ai/assistant (try/catch wrapped)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id uuid NOT NULL,
  user_id text NOT NULL,
  voice_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_id ON public.ai_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_org_id ON public.ai_sessions(org_id);

-- ═══════════════════════════════════════════════════════════════
-- 5. AI_MESSAGES — conversation history for AI sessions
-- Used by: /api/ai/assistant (try/catch wrapped)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.ai_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  is_voice boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session_id ON public.ai_messages(session_id);

-- ═══════════════════════════════════════════════════════════════
-- 6. FEATURE_FLAG_USAGE — analytics for feature flag hits
-- Used by: lib/flags.ts (upsert on key+org_id+date)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.feature_flag_usage (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL,
  org_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  hits integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE (key, org_id, date)
);

CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_key ON public.feature_flag_usage(key);
CREATE INDEX IF NOT EXISTS idx_feature_flag_usage_org ON public.feature_flag_usage(org_id);

-- ═══════════════════════════════════════════════════════════════
-- VERIFICATION
-- ═══════════════════════════════════════════════════════════════
DO $$
DECLARE
  tbl text;
  tbls text[] := ARRAY['proposals','proposal_events','activity_events','ai_sessions','ai_messages','feature_flag_usage'];
BEGIN
  FOREACH tbl IN ARRAY tbls
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=tbl) THEN
      RAISE NOTICE '✅ % exists', tbl;
    ELSE
      RAISE EXCEPTION '❌ % missing!', tbl;
    END IF;
  END LOOP;
END$$;

COMMIT;
