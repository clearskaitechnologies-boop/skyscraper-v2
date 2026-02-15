-- =====================================
-- PHASE 69: Trades Network Complete Schema
-- =====================================
-- This migration creates the full trades network messaging system
-- with token-gated messaging, job opportunities, and Full Access support.
--
-- FEATURES:
-- - Token-based first contact (1 token)
-- - Free replies in existing threads
-- - Job posting (Full Access only)
-- - Apply to jobs (1 token unless Full Access)
-- - Full Access subscription ($9.99/mo) - unlimited messaging only
-- - AI tools still cost tokens even for Full Access users
--
-- DEPLOY: Run this in Supabase SQL Editor or via migration tool
-- =====================================

-- =====================================
-- 1) TRADES NETWORK POSTS (Opportunities Board)
-- =====================================
CREATE TABLE IF NOT EXISTS public.tn_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  trade TEXT NOT NULL, -- dropdown: 20 trade types
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast filtering
CREATE INDEX IF NOT EXISTS idx_tn_posts_trade ON public.tn_posts(trade);
CREATE INDEX IF NOT EXISTS idx_tn_posts_active ON public.tn_posts(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_tn_posts_created_at ON public.tn_posts(created_at DESC);

-- RLS Policies
ALTER TABLE public.tn_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_active_posts" ON public.tn_posts
  FOR SELECT USING (is_active = true);

CREATE POLICY "owner_manage_posts" ON public.tn_posts
  FOR ALL USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- =====================================
-- 2) TRADES NETWORK MEMBERSHIPS (Full Access)
-- =====================================
CREATE TABLE IF NOT EXISTS public.tn_memberships (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_access BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.tn_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "self_read_membership" ON public.tn_memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "self_upsert_membership" ON public.tn_memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "self_update_membership" ON public.tn_memberships
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================
-- 3) TRADES NETWORK THREADS
-- =====================================
CREATE TABLE IF NOT EXISTS public.tn_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL DEFAULT auth.uid(),
  post_id UUID REFERENCES public.tn_posts(id) ON DELETE SET NULL,
  visibility TEXT DEFAULT 'private', -- private | post_applicants
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tn_threads_post ON public.tn_threads(post_id);
CREATE INDEX IF NOT EXISTS idx_tn_threads_created_at ON public.tn_threads(created_at DESC);

ALTER TABLE public.tn_threads ENABLE ROW LEVEL SECURITY;

-- =====================================
-- 4) TRADES NETWORK PARTICIPANTS
-- =====================================
CREATE TABLE IF NOT EXISTS public.tn_participants (
  thread_id UUID REFERENCES public.tn_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member | applicant | poster
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_tn_participants_user ON public.tn_participants(user_id);

ALTER TABLE public.tn_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "participants_read_own" ON public.tn_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.tn_participants p 
      WHERE p.thread_id = tn_participants.thread_id 
      AND p.user_id = auth.uid()
    )
  );

-- =====================================
-- 5) TRADES NETWORK MESSAGES
-- =====================================
CREATE TABLE IF NOT EXISTS public.tn_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.tn_threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL DEFAULT auth.uid(),
  body TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tn_messages_thread ON public.tn_messages(thread_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tn_messages_sender ON public.tn_messages(sender_id);

ALTER TABLE public.tn_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_read_participants" ON public.tn_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tn_participants p 
      WHERE p.thread_id = tn_messages.thread_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_participants" ON public.tn_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tn_participants p 
      WHERE p.thread_id = tn_messages.thread_id 
      AND p.user_id = auth.uid()
    )
  );

-- RLS for threads (participants can view their threads)
CREATE POLICY "thread_visible_to_participants" ON public.tn_threads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tn_participants p 
      WHERE p.thread_id = id 
      AND p.user_id = auth.uid()
    )
  );

-- =====================================
-- 6) HELPER FUNCTIONS
-- =====================================

-- Function: Check if user has active Full Access
CREATE OR REPLACE FUNCTION public.has_full_access(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_access BOOLEAN;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT full_access, expires_at 
  INTO v_full_access, v_expires_at
  FROM public.tn_memberships
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Check if full access is active and not expired
  IF v_full_access AND (v_expires_at IS NULL OR v_expires_at > NOW()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Function: Get user's current token balance
CREATE OR REPLACE FUNCTION public.get_token_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT balance INTO v_balance
  FROM public.token_wallets
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- Create wallet if doesn't exist
    INSERT INTO public.token_wallets (user_id, balance)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN 0;
  END IF;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

-- =====================================
-- 7) INBOX VIEW (Quick thread list with last message)
-- =====================================
CREATE OR REPLACE VIEW public.v_tn_inbox AS
SELECT 
  t.id AS thread_id,
  t.post_id,
  t.visibility,
  t.created_at AS thread_created_at,
  MAX(m.created_at) AS last_message_at,
  COUNT(m.id) AS message_count,
  (
    SELECT body 
    FROM public.tn_messages 
    WHERE thread_id = t.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) AS last_message_body,
  (
    SELECT sender_id 
    FROM public.tn_messages 
    WHERE thread_id = t.id 
    ORDER BY created_at DESC 
    LIMIT 1
  ) AS last_sender_id,
  -- Get the other participant's ID (for 1-on-1 chats)
  (
    SELECT user_id 
    FROM public.tn_participants 
    WHERE thread_id = t.id 
    AND user_id != auth.uid()
    LIMIT 1
  ) AS other_user_id
FROM public.tn_threads t
JOIN public.tn_participants p ON p.thread_id = t.id AND p.user_id = auth.uid()
LEFT JOIN public.tn_messages m ON m.thread_id = t.id
GROUP BY t.id, t.post_id, t.visibility, t.created_at;

-- =====================================
-- 8) TRIGGER: Auto-ensure wallet on user creation
-- =====================================
CREATE OR REPLACE FUNCTION public.ensure_wallet()
RETURNS TRIGGER 
LANGUAGE plpgsql 
AS $$
BEGIN
  INSERT INTO public.token_wallets(user_id, balance)
  VALUES (NEW.id, 0) 
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auth_user_wallet ON auth.users;
CREATE TRIGGER auth_user_wallet 
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.ensure_wallet();

-- =====================================
-- 9) SEED DATA: Trade Types (reference only)
-- =====================================
COMMENT ON COLUMN public.tn_posts.trade IS 'Valid trades: Roofing, General Contracting, Plumbing, Electrical, HVAC, Painting, Drywall & Texture, Flooring, Concrete & Foundations, Framing & Carpentry, Solar Install, Landscaping & Irrigation, Fire & Water Restoration, Mold Remediation, Asphalt & Paving, Gutters & Sheet Metal, Fencing, Welding / Metal Fabrication, Windows & Glazing, Handyman / Punch-Out';

-- =====================================
-- 10) GRANT PERMISSIONS
-- =====================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.tn_posts TO anon, authenticated;
GRANT ALL ON public.tn_posts TO authenticated;
GRANT ALL ON public.tn_memberships TO authenticated;
GRANT ALL ON public.tn_threads TO authenticated;
GRANT ALL ON public.tn_participants TO authenticated;
GRANT ALL ON public.tn_messages TO authenticated;
GRANT SELECT ON public.v_tn_inbox TO authenticated;

-- =====================================
-- MIGRATION COMPLETE
-- =====================================
-- Next steps:
-- 1. Deploy Edge Functions (tn-send-message, tn-apply-post)
-- 2. Build UI routes (/network/*)
-- 3. Integrate Stripe Full Access product
-- 4. Test token deduction flows
-- =====================================
