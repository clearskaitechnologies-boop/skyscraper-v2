-- =====================================================
-- TRADES NETWORK - CLERK-COMPATIBLE SCHEMA
-- =====================================================
-- This migration creates the Trades Network with Clerk authentication
-- Run in Supabase SQL Editor

-- =====================================================
-- 1. HELPER FUNCTION: Get Clerk User ID from JWT
-- =====================================================

CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS uuid
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::json->>'sub')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

COMMENT ON FUNCTION auth_user_id() IS 'Returns the authenticated user ID from Clerk JWT claims';

-- =====================================================
-- 2. TRADES MEMBERSHIPS (Full Access Subscriptions)
-- =====================================================

CREATE TABLE IF NOT EXISTS tn_memberships (
  user_id uuid PRIMARY KEY,
  full_access boolean DEFAULT false,
  stripe_subscription_id text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tn_memberships_full_access ON tn_memberships(full_access) WHERE full_access = true;
CREATE INDEX idx_tn_memberships_stripe_sub ON tn_memberships(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;

COMMENT ON TABLE tn_memberships IS 'Tracks Full Access subscriptions ($9.99/mo unlimited messaging)';

-- RLS Policies
ALTER TABLE tn_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_membership"
ON tn_memberships FOR SELECT
USING (user_id = auth_user_id());

CREATE POLICY "system_manage_memberships"
ON tn_memberships FOR ALL
USING (true)
WITH CHECK (true);

-- =====================================================
-- 3. TRADES POSTS (Job Opportunities)
-- =====================================================

CREATE TABLE IF NOT EXISTS tn_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  trade text NOT NULL,
  city text,
  state text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT tn_posts_trade_check CHECK (
    trade IN (
      'Roofing', 'General Contracting', 'Plumbing', 'Electrical', 'HVAC',
      'Painting', 'Drywall & Texture', 'Flooring', 'Concrete & Foundations',
      'Framing & Carpentry', 'Solar Install', 'Landscaping & Irrigation',
      'Fire & Water Restoration', 'Mold Remediation', 'Asphalt & Paving',
      'Gutters & Sheet Metal', 'Fencing', 'Welding / Metal Fabrication',
      'Windows & Glazing', 'Handyman / Punch-Out'
    )
  )
);

CREATE INDEX idx_tn_posts_created_by ON tn_posts(created_by);
CREATE INDEX idx_tn_posts_trade ON tn_posts(trade);
CREATE INDEX idx_tn_posts_location ON tn_posts(city, state) WHERE city IS NOT NULL;
CREATE INDEX idx_tn_posts_active ON tn_posts(is_active, created_at DESC) WHERE is_active = true;

COMMENT ON TABLE tn_posts IS 'Job opportunities board (Full Access required to post)';

-- RLS Policies
ALTER TABLE tn_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone_read_active_posts"
ON tn_posts FOR SELECT
USING (is_active = true);

CREATE POLICY "creators_read_own_posts"
ON tn_posts FOR SELECT
USING (created_by = auth_user_id());

CREATE POLICY "creators_update_own_posts"
ON tn_posts FOR UPDATE
USING (created_by = auth_user_id());

CREATE POLICY "creators_delete_own_posts"
ON tn_posts FOR DELETE
USING (created_by = auth_user_id());

-- Note: INSERT policy will be added after has_full_access() function

-- =====================================================
-- 4. THREADS (Conversation Containers)
-- =====================================================

CREATE TABLE IF NOT EXISTS tn_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES tn_posts(id) ON DELETE CASCADE,
  created_by uuid NOT NULL,
  visibility text DEFAULT 'private' CHECK (visibility IN ('private', 'post_applicants')),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tn_threads_post ON tn_threads(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_tn_threads_created_by ON tn_threads(created_by);

COMMENT ON TABLE tn_threads IS 'Message thread containers (DMs or job application conversations)';

-- Note: RLS policies will be added after all tables are created

-- =====================================================
-- 5. PARTICIPANTS (Thread Membership)
-- =====================================================

CREATE TABLE IF NOT EXISTS tn_participants (
  thread_id uuid REFERENCES tn_threads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('member', 'applicant', 'poster')),
  joined_at timestamptz DEFAULT now(),
  
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX idx_tn_participants_user ON tn_participants(user_id);
CREATE INDEX idx_tn_participants_thread ON tn_participants(thread_id);

COMMENT ON TABLE tn_participants IS 'Users who can access a thread';

-- Note: RLS policies will be added after all tables are created

-- =====================================================
-- 6. MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS tn_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES tn_threads(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  body text NOT NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_tn_messages_thread ON tn_messages(thread_id, created_at DESC);
CREATE INDEX idx_tn_messages_sender ON tn_messages(sender_id);

COMMENT ON TABLE tn_messages IS 'Message content (first message costs 1 token unless Full Access)';

-- Note: RLS policies will be added after all tables and views are created

-- =====================================================
-- 7. HELPER FUNCTIONS
-- =====================================================

-- Check if user has Full Access subscription
CREATE OR REPLACE FUNCTION has_full_access(uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT full_access FROM tn_memberships WHERE user_id = uid),
    false
  );
$$;

COMMENT ON FUNCTION has_full_access(uuid) IS 'Returns true if user has active Full Access subscription';

-- NOTE: Token functions (get_token_balance, tokens_spend) are not included
-- as they require a token_wallets table which may not exist yet.
-- These will be added in a future migration if needed.

-- =====================================================
-- 8. INBOX VIEW (Optimized Thread List)
-- =====================================================

CREATE OR REPLACE VIEW v_tn_inbox AS
SELECT DISTINCT ON (t.id)
  t.id as thread_id,
  t.post_id,
  t.visibility,
  t.created_at as thread_created_at,
  m.created_at as last_message_at,
  (SELECT COUNT(*) FROM tn_messages WHERE thread_id = t.id) as message_count,
  m.body as last_message_body,
  m.sender_id as last_sender_id,
  -- Find the "other" participant (not the current user)
  (
    SELECT user_id 
    FROM tn_participants 
    WHERE thread_id = t.id 
    AND user_id != auth_user_id()
    LIMIT 1
  ) as other_user_id
FROM tn_threads t
LEFT JOIN tn_messages m ON m.thread_id = t.id
WHERE EXISTS (
  SELECT 1 FROM tn_participants 
  WHERE thread_id = t.id 
  AND user_id = auth_user_id()
)
ORDER BY t.id, m.created_at DESC;

COMMENT ON VIEW v_tn_inbox IS 'Optimized inbox view with last message preview';

-- =====================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- =====================================================
-- Now that all tables exist, we can safely create policies that reference them

-- THREADS Policies
ALTER TABLE tn_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_access_threads"
ON tn_threads FOR SELECT
USING (
  auth_user_id() IN (
    SELECT user_id FROM tn_participants WHERE thread_id = tn_threads.id
  )
);

CREATE POLICY "users_create_threads"
ON tn_threads FOR INSERT
WITH CHECK (created_by = auth_user_id());

-- PARTICIPANTS Policies
ALTER TABLE tn_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_view_own"
ON tn_participants FOR SELECT
USING (
  user_id = auth_user_id() OR
  thread_id IN (
    SELECT thread_id FROM tn_participants WHERE user_id = auth_user_id()
  )
);

CREATE POLICY "system_manage_participants"
ON tn_participants FOR ALL
USING (true)
WITH CHECK (true);

-- MESSAGES Policies
ALTER TABLE tn_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_read_messages"
ON tn_messages FOR SELECT
USING (
  auth_user_id() IN (
    SELECT user_id FROM tn_participants WHERE thread_id = tn_messages.thread_id
  )
);

CREATE POLICY "participants_send_messages"
ON tn_messages FOR INSERT
WITH CHECK (
  sender_id = auth_user_id() AND
  auth_user_id() IN (
    SELECT user_id FROM tn_participants WHERE thread_id = tn_messages.thread_id
  )
);

-- =====================================================
-- 10. INSERT POLICY FOR POSTS (Requires Full Access)
-- =====================================================

CREATE POLICY "full_access_users_create_posts"
ON tn_posts FOR INSERT
WITH CHECK (
  created_by = auth_user_id() AND
  has_full_access(auth_user_id()) = true
);

-- =====================================================
-- 11. AUTO-CREATE MEMBERSHIP ROW
-- =====================================================

CREATE OR REPLACE FUNCTION ensure_membership()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO tn_memberships (user_id, full_access)
  VALUES (NEW.id, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Note: This trigger assumes a users table exists
-- If using Clerk-only auth, you may need to create memberships manually
-- via API when user first accesses Trades Network

-- =====================================================
-- 12. GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON tn_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON tn_posts TO authenticated;

GRANT ALL ON tn_threads TO authenticated;
GRANT ALL ON tn_participants TO authenticated;
GRANT ALL ON tn_messages TO authenticated;

GRANT SELECT ON tn_memberships TO authenticated;
GRANT INSERT, UPDATE ON tn_memberships TO authenticated;

GRANT SELECT ON v_tn_inbox TO authenticated;

GRANT EXECUTE ON FUNCTION auth_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_full_access(uuid) TO anon, authenticated;

-- =====================================================
-- 13. SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Trades Network schema created successfully!';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '  1. Configure Clerk JWT template (see docs/CLERK_SUPABASE_JWT_SETUP.md)';
  RAISE NOTICE '  2. Test with: SELECT auth_user_id();';
  RAISE NOTICE '  3. Deploy API routes';
  RAISE NOTICE '  4. Configure Stripe webhook';
END $$;
