-- =============================================================================
-- FIX: Add missing chat_conversation_participants table
-- Migration: 20260128_fix_chat_participants.sql
-- =============================================================================

-- Chat conversation participants - normalized table for participants
CREATE TABLE IF NOT EXISTS chat_conversation_participants (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,
    role            TEXT DEFAULT 'client',    -- client or pro
    name            TEXT,
    avatar_url      TEXT,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    left_at         TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT chat_participants_unique UNIQUE (conversation_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_participants_conversation ON chat_conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_conversation_participants(user_id);

COMMENT ON TABLE chat_conversation_participants IS 'Participants in chat conversations';

-- Add message_id to read receipts if not exists (for individual message tracking)
ALTER TABLE chat_read_receipts 
ADD COLUMN IF NOT EXISTS message_id TEXT;

-- Add read_at to read receipts
ALTER TABLE chat_read_receipts 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for message-level read receipts
CREATE INDEX IF NOT EXISTS idx_read_receipts_message ON chat_read_receipts(message_id) WHERE message_id IS NOT NULL;

-- Update unique constraint to allow per-message receipts
-- First drop the old constraint if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chat_read_receipts_unique'
    ) THEN
        ALTER TABLE chat_read_receipts DROP CONSTRAINT chat_read_receipts_unique;
    END IF;
END $$;

-- Create new unique constraint that includes message_id
CREATE UNIQUE INDEX IF NOT EXISTS chat_read_receipts_msg_unique 
ON chat_read_receipts(message_id, user_id) WHERE message_id IS NOT NULL;

-- Verification
SELECT 'chat_conversation_participants table created' as status
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'chat_conversation_participants'
);
