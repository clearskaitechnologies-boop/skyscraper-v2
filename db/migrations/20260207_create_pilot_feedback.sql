-- Pilot Feedback System
-- Collects feedback from pilot users

CREATE TABLE IF NOT EXISTS pilot_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         TEXT NOT NULL,
    org_id          TEXT,
    type            TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'praise')),
    category        TEXT,
    rating          INTEGER CHECK (rating >= 1 AND rating <= 5),
    message         TEXT NOT NULL,
    page            TEXT,
    screenshot      TEXT,
    status          TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'closed')),
    response        TEXT,
    responded_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_user ON pilot_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_org ON pilot_feedback(org_id);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_type ON pilot_feedback(type);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_status ON pilot_feedback(status);
CREATE INDEX IF NOT EXISTS idx_pilot_feedback_created ON pilot_feedback(created_at DESC);

-- RLS
ALTER TABLE pilot_feedback ENABLE ROW LEVEL SECURITY;

-- Users can view their own feedback
CREATE POLICY pilot_feedback_user_select ON pilot_feedback
    FOR SELECT USING (user_id = current_setting('app.user_id', true));

-- Users can insert their own feedback
CREATE POLICY pilot_feedback_user_insert ON pilot_feedback
    FOR INSERT WITH CHECK (true);

-- Service role can do everything
CREATE POLICY pilot_feedback_service ON pilot_feedback
    FOR ALL USING (true) WITH CHECK (true);

COMMENT ON TABLE pilot_feedback IS 'Stores feedback from pilot users for product improvement';
