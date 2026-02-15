-- Create voice_notes and activity_log tables
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS voice_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  related_type text CHECK (related_type IN ('lead','claim')) NOT NULL,
  related_id uuid NOT NULL,
  storage_path text NOT NULL,
  duration_seconds integer,
  transcript text,
  ai_summary text,
  ai_struct jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_voice_notes_org ON voice_notes(org_id);

CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  user_id uuid NOT NULL,
  related_type text CHECK (related_type IN ('lead','claim')) NOT NULL,
  related_id uuid NOT NULL,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_org ON activity_log(org_id);

-- Enable RLS and add minimal org-scoped policy (assumes user_profiles mapping exists)
ALTER TABLE IF EXISTS voice_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS voice_notes_org_isolation ON public.voice_notes;
CREATE POLICY voice_notes_org_isolation ON public.voice_notes
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.org_id = voice_notes.org_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.org_id = voice_notes.org_id)
  );

DROP POLICY IF EXISTS activity_log_org_isolation ON public.activity_log;
CREATE POLICY activity_log_org_isolation ON public.activity_log
  USING (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.org_id = activity_log.org_id)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.user_id = auth.uid() AND up.org_id = activity_log.org_id)
  );
