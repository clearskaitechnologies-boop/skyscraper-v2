-- AI Assistant Sessions Table
-- Stores conversation threads between users and Skai AI

CREATE TABLE IF NOT EXISTS ai_sessions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  -- Session metadata
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Session state
  is_active BOOLEAN NOT NULL DEFAULT true,
  message_count INTEGER NOT NULL DEFAULT 0,
  
  -- Voice settings
  voice_enabled BOOLEAN NOT NULL DEFAULT false,
  
  -- Indexes for performance
  INDEX idx_ai_sessions_org_id (org_id),
  INDEX idx_ai_sessions_user_id (user_id),
  INDEX idx_ai_sessions_created_at (created_at DESC)
);

-- AI Session Messages Table
CREATE TABLE IF NOT EXISTS ai_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id TEXT NOT NULL REFERENCES ai_sessions(id) ON DELETE CASCADE,
  
  -- Message content
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  -- Voice metadata
  is_voice BOOLEAN NOT NULL DEFAULT false,
  audio_duration_ms INTEGER,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  INDEX idx_ai_messages_session_id (session_id),
  INDEX idx_ai_messages_created_at (created_at)
);

-- Update trigger for ai_sessions
CREATE OR REPLACE FUNCTION update_ai_sessions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_sessions_updated_at
BEFORE UPDATE ON ai_sessions
FOR EACH ROW
EXECUTE FUNCTION update_ai_sessions_timestamp();
