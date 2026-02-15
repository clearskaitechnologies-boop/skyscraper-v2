-- =============================================================================
-- SKAISCRAPER NOTIFICATIONS, CHAT & EMAIL SUBSCRIBERS
-- Migration: 20260128_notifications_chat_email.sql
-- =============================================================================

-- 1. EMAIL SUBSCRIBERS TABLE
-- Stores email addresses for marketing/newsletter opt-ins
-- =============================================================================
CREATE TABLE IF NOT EXISTS email_subscribers (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email           TEXT NOT NULL,
    user_id         TEXT,                     -- Link to Clerk user if registered
    source          TEXT DEFAULT 'signup',    -- signup, newsletter, portal, etc.
    status          TEXT DEFAULT 'active',    -- active, unsubscribed, bounced
    marketing_opt_in BOOLEAN DEFAULT false,
    product_updates  BOOLEAN DEFAULT true,
    weekly_digest    BOOLEAN DEFAULT false,
    partner_offers   BOOLEAN DEFAULT false,
    ip_address       TEXT,
    user_agent       TEXT,
    subscribed_at    TIMESTAMPTZ DEFAULT NOW(),
    unsubscribed_at  TIMESTAMPTZ,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT email_subscribers_email_unique UNIQUE (email)
);

-- Indexes for email_subscribers
CREATE INDEX IF NOT EXISTS idx_email_subscribers_user ON email_subscribers(user_id);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_email_subscribers_marketing ON email_subscribers(marketing_opt_in) WHERE marketing_opt_in = true;

-- Comments
COMMENT ON TABLE email_subscribers IS 'Email subscriber list for marketing and newsletters';
COMMENT ON COLUMN email_subscribers.source IS 'Where the subscription came from: signup, newsletter, portal';
COMMENT ON COLUMN email_subscribers.status IS 'Subscription status: active, unsubscribed, bounced';


-- 2. PUSH NOTIFICATION SUBSCRIPTIONS
-- Stores web push notification subscriptions
-- =============================================================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         TEXT NOT NULL,
    endpoint        TEXT NOT NULL,
    p256dh          TEXT NOT NULL,            -- Public key
    auth            TEXT NOT NULL,            -- Auth secret
    user_agent      TEXT,
    device_type     TEXT,                     -- desktop, mobile, tablet
    active          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_used_at    TIMESTAMPTZ,
    
    CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subs_user ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON push_subscriptions(active) WHERE active = true;

COMMENT ON TABLE push_subscriptions IS 'Web Push notification subscriptions';


-- 3. USER NOTIFICATIONS
-- Central notification storage for all user notifications
-- =============================================================================
CREATE TABLE IF NOT EXISTS user_notifications (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         TEXT NOT NULL,
    type            TEXT NOT NULL,            -- message, review, connection, system, claim, etc.
    title           TEXT NOT NULL,
    body            TEXT,
    link            TEXT,                     -- Deep link to related content
    icon            TEXT,                     -- Icon name or URL
    image_url       TEXT,                     -- Optional image
    metadata        JSONB DEFAULT '{}',       -- Additional data
    read            BOOLEAN DEFAULT false,
    read_at         TIMESTAMPTZ,
    push_sent       BOOLEAN DEFAULT false,
    push_sent_at    TIMESTAMPTZ,
    email_sent      BOOLEAN DEFAULT false,
    email_sent_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ               -- Optional expiration
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON user_notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON user_notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON user_notifications(created_at DESC);

COMMENT ON TABLE user_notifications IS 'Central notification storage for all users';


-- 4. CHAT CONVERSATIONS
-- Master table for chat conversations between users
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    type            TEXT DEFAULT 'direct',    -- direct, group, support
    title           TEXT,                     -- For group chats
    participant_ids TEXT[] NOT NULL,          -- Array of user IDs
    last_message_id TEXT,
    last_message_at TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    archived        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON chat_conversations USING GIN(participant_ids);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON chat_conversations(type);

COMMENT ON TABLE chat_conversations IS 'Chat conversations between users';


-- 5. CHAT MESSAGES
-- Individual messages within conversations
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id       TEXT NOT NULL,
    sender_type     TEXT DEFAULT 'user',      -- user, system, bot
    content         TEXT NOT NULL,
    content_type    TEXT DEFAULT 'text',      -- text, image, file, system
    file_url        TEXT,
    file_name       TEXT,
    file_size       INTEGER,
    metadata        JSONB DEFAULT '{}',
    edited          BOOLEAN DEFAULT false,
    edited_at       TIMESTAMPTZ,
    deleted         BOOLEAN DEFAULT false,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(conversation_id, created_at DESC);

COMMENT ON TABLE chat_messages IS 'Individual chat messages';


-- 6. CHAT READ RECEIPTS
-- Track which messages users have read
-- =============================================================================
CREATE TABLE IF NOT EXISTS chat_read_receipts (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversation_id TEXT NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id         TEXT NOT NULL,
    last_read_at    TIMESTAMPTZ DEFAULT NOW(),
    last_read_message_id TEXT,
    
    CONSTRAINT chat_read_receipts_unique UNIQUE (conversation_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_read_receipts_user ON chat_read_receipts(user_id);

COMMENT ON TABLE chat_read_receipts IS 'Track message read status per user';


-- 7. CLIENT PROFILE SOCIAL DATA
-- Additional social profile data for clients
-- =============================================================================
CREATE TABLE IF NOT EXISTS client_profiles (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         TEXT NOT NULL UNIQUE,
    first_name      TEXT,
    last_name       TEXT,
    display_name    TEXT,
    bio             TEXT,
    avatar_url      TEXT,
    cover_photo_url TEXT,
    category        TEXT DEFAULT 'Homeowner', -- Homeowner, Renter, Business Owner, etc.
    phone           TEXT,
    address         TEXT,
    city            TEXT,
    state           TEXT,
    zip             TEXT,
    property_photos TEXT[] DEFAULT '{}',
    social_links    JSONB DEFAULT '{}',
    privacy_level   TEXT DEFAULT 'network',   -- public, network, private
    verified        BOOLEAN DEFAULT false,
    verified_at     TIMESTAMPTZ,
    onboarding_complete BOOLEAN DEFAULT false,
    last_active_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_profiles_user ON client_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_client_profiles_city_state ON client_profiles(city, state);
CREATE INDEX IF NOT EXISTS idx_client_profiles_verified ON client_profiles(verified) WHERE verified = true;

COMMENT ON TABLE client_profiles IS 'Extended social profile data for client users';


-- 8. CLIENT CONNECTIONS
-- Client-to-client and client-to-pro connections
-- =============================================================================
CREATE TABLE IF NOT EXISTS client_connections (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    follower_id     TEXT NOT NULL,            -- The user doing the following
    following_id    TEXT NOT NULL,            -- The user being followed
    following_type  TEXT DEFAULT 'client',    -- client or pro
    status          TEXT DEFAULT 'active',    -- active, pending, blocked
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT client_connections_unique UNIQUE (follower_id, following_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_conn_follower ON client_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_client_conn_following ON client_connections(following_id);

COMMENT ON TABLE client_connections IS 'Social connections between clients and pros';


-- 9. CLIENT POSTS
-- Social posts from clients (reviews feed into this)
-- =============================================================================
CREATE TABLE IF NOT EXISTS client_posts (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id         TEXT NOT NULL,
    type            TEXT DEFAULT 'update',    -- update, review, question, project
    title           TEXT,
    content         TEXT NOT NULL,
    images          TEXT[] DEFAULT '{}',
    contractor_id   TEXT,                     -- If reviewing a contractor
    rating          INTEGER,                  -- If it's a review (1-5)
    project_type    TEXT,
    location        TEXT,
    tags            TEXT[] DEFAULT '{}',
    like_count      INTEGER DEFAULT 0,
    comment_count   INTEGER DEFAULT 0,
    share_count     INTEGER DEFAULT 0,
    visibility      TEXT DEFAULT 'public',    -- public, network, private
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_client_posts_user ON client_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_client_posts_type ON client_posts(type);
CREATE INDEX IF NOT EXISTS idx_client_posts_created ON client_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_posts_contractor ON client_posts(contractor_id) WHERE contractor_id IS NOT NULL;

COMMENT ON TABLE client_posts IS 'Social posts from client users';


-- 10. POST LIKES
-- Track likes on posts
-- =============================================================================
CREATE TABLE IF NOT EXISTS post_likes (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id         TEXT NOT NULL,
    post_type       TEXT DEFAULT 'client',    -- client or trades
    user_id         TEXT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT post_likes_unique UNIQUE (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_post_likes_post ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user ON post_likes(user_id);


-- 11. POST COMMENTS
-- Comments on posts
-- =============================================================================
CREATE TABLE IF NOT EXISTS post_comments (
    id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    post_id         TEXT NOT NULL,
    post_type       TEXT DEFAULT 'client',
    user_id         TEXT NOT NULL,
    content         TEXT NOT NULL,
    parent_id       TEXT,                     -- For nested replies
    like_count      INTEGER DEFAULT 0,
    deleted         BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_post ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_parent ON post_comments(parent_id) WHERE parent_id IS NOT NULL;


-- =============================================================================
-- VERIFICATION
-- =============================================================================
SELECT 'Tables created successfully' as status;

SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'email_subscribers') as email_subscribers_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'push_subscriptions') as push_subscriptions_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'user_notifications') as user_notifications_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'chat_conversations') as chat_conversations_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'chat_messages') as chat_messages_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'client_profiles') as client_profiles_exists,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'client_posts') as client_posts_exists;
