-- Add client visibility fields to claim_timeline and claim_notes
-- This enables sharing timeline/notes with homeowners in the client portal

-- Add visibleToClient to claim_timeline
ALTER TABLE claim_timeline 
ADD COLUMN IF NOT EXISTS visible_to_client BOOLEAN DEFAULT false;

-- Add visibleToClient to claim_notes
ALTER TABLE claim_notes 
ADD COLUMN IF NOT EXISTS visible_to_client BOOLEAN DEFAULT false;

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_claim_timeline_visible_to_client ON claim_timeline(visible_to_client);
CREATE INDEX IF NOT EXISTS idx_claim_notes_visible_to_client ON claim_notes(visible_to_client);

-- Comment the columns
COMMENT ON COLUMN claim_timeline.visible_to_client IS 'Whether this timeline event is visible to the homeowner in the client portal';
COMMENT ON COLUMN claim_notes.visible_to_client IS 'Whether this note is visible to the homeowner in the client portal';
