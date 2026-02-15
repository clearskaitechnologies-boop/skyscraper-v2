-- ============================================
-- PHASE 21 — NATIONAL CONTRACTOR NETWORK
-- Migration: 20251115_phase21_contractor_network.sql
-- ============================================

-- Contractor public profiles
CREATE TABLE IF NOT EXISTS contractor_profiles (
  id TEXT PRIMARY KEY,
  org_id TEXT UNIQUE NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT,
  slug TEXT UNIQUE NOT NULL,
  
  -- Business identity
  business_name TEXT NOT NULL,
  logo_url TEXT,
  cover_photo_url TEXT,
  tagline TEXT,
  about TEXT,
  
  -- Contact
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Service details
  services JSONB NOT NULL DEFAULT '[]',
  service_areas JSONB NOT NULL DEFAULT '[]',
  
  -- Operating info
  hours_of_operation JSONB,
  emergency_available BOOLEAN NOT NULL DEFAULT false,
  
  -- Credentials
  license_number TEXT,
  insurance_proof TEXT,
  certifications JSONB,
  
  -- Media
  gallery JSONB,
  
  -- SEO & Discovery
  verified BOOLEAN NOT NULL DEFAULT false,
  featured BOOLEAN NOT NULL DEFAULT false,
  search_keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Stats
  total_leads INTEGER NOT NULL DEFAULT 0,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  
  -- Settings
  is_public BOOLEAN NOT NULL DEFAULT true,
  accepting_leads BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractor_profiles_slug ON contractor_profiles(slug);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_org_id ON contractor_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_contractor_profiles_verified_featured ON contractor_profiles(verified, featured);

-- Custom lead capture forms
CREATE TABLE IF NOT EXISTS contractor_forms (
  id TEXT PRIMARY KEY,
  contractor_id TEXT NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Form configuration
  fields JSONB NOT NULL,
  success_message TEXT,
  
  -- Settings
  is_public BOOLEAN NOT NULL DEFAULT true,
  require_photos BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractor_forms_contractor ON contractor_forms(contractor_id, is_public);

-- Public lead submissions
CREATE TABLE IF NOT EXISTS public_leads (
  id TEXT PRIMARY KEY,
  contractor_id TEXT NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  form_id TEXT REFERENCES contractor_forms(id) ON DELETE SET NULL,
  
  -- Contact info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Job details
  service_type TEXT,
  emergency_type TEXT,
  has_insurance BOOLEAN NOT NULL DEFAULT false,
  date_of_loss TIMESTAMP,
  preferred_date TIMESTAMP,
  
  -- Form responses
  details JSONB NOT NULL,
  
  -- Media
  photos JSONB,
  videos JSONB,
  
  -- Lead management
  status TEXT NOT NULL DEFAULT 'NEW',
  priority TEXT NOT NULL DEFAULT 'normal',
  
  -- Analytics
  source TEXT NOT NULL DEFAULT 'trades-network',
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  
  -- Conversion tracking
  converted_to_claim BOOLEAN NOT NULL DEFAULT false,
  claim_id TEXT,
  
  -- AI enrichment
  ai_summary TEXT,
  ai_category TEXT,
  ai_urgency TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_leads_contractor_status ON public_leads(contractor_id, status);
CREATE INDEX IF NOT EXISTS idx_public_leads_zip_service ON public_leads(zip_code, service_type);
CREATE INDEX IF NOT EXISTS idx_public_leads_created ON public_leads(created_at);

-- Contractor verification system
CREATE TABLE IF NOT EXISTS contractor_verifications (
  id TEXT PRIMARY KEY,
  contractor_id TEXT NOT NULL REFERENCES contractor_profiles(id) ON DELETE CASCADE,
  
  step TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  
  -- Submission data
  document_url TEXT,
  notes TEXT,
  metadata JSONB,
  
  -- Review
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  denial_reason TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contractor_verifications_contractor_step ON contractor_verifications(contractor_id, step);
CREATE INDEX IF NOT EXISTS idx_contractor_verifications_status ON contractor_verifications(status);

-- Anonymous public users (analytics)
CREATE TABLE IF NOT EXISTS public_users (
  id TEXT PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  
  -- Analytics
  ip_address TEXT,
  location TEXT,
  device TEXT,
  browser TEXT,
  
  -- Behavior tracking
  searches JSONB,
  viewed JSONB,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_public_users_session ON public_users(session_id);

-- Network activity feed
CREATE TABLE IF NOT EXISTS network_posts (
  id TEXT PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id),
  contractor_id TEXT,
  
  -- Content
  content TEXT NOT NULL,
  photos JSONB,
  
  -- Type
  post_type TEXT NOT NULL DEFAULT 'update',
  
  -- Engagement
  likes INTEGER NOT NULL DEFAULT 0,
  comments INTEGER NOT NULL DEFAULT 0,
  shares INTEGER NOT NULL DEFAULT 0,
  
  -- Visibility
  is_public BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_network_posts_org_created ON network_posts(org_id, created_at);
CREATE INDEX IF NOT EXISTS idx_network_posts_type_public ON network_posts(post_type, is_public);

-- Network comments
CREATE TABLE IF NOT EXISTS network_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  
  content TEXT NOT NULL,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_network_comments_post_created ON network_comments(post_id, created_at);

-- ============================================
-- PHASE 21 MIGRATION COMPLETE ✅
-- ============================================
