-- Organizations table
CREATE TABLE IF NOT EXISTS public.orgs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Org branding (logo, colors)
CREATE TABLE IF NOT EXISTS public.org_branding (
  org_id UUID PRIMARY KEY REFERENCES public.orgs(id) ON DELETE CASCADE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#0ea5a4',
  secondary_color TEXT DEFAULT '#0f172a'
);

-- User profiles (links users to orgs)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.orgs(id) ON DELETE SET NULL,
  full_name TEXT
);

-- Enable RLS
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "org_owner_all" ON public.orgs;
DROP POLICY IF EXISTS "org_branding_owner_all" ON public.org_branding;
DROP POLICY IF EXISTS "user_profiles_self" ON public.user_profiles;

-- Orgs: only owner can manage their org
CREATE POLICY "org_owner_all" 
ON public.orgs 
FOR ALL 
TO authenticated
USING (owner_id = auth.uid()) 
WITH CHECK (owner_id = auth.uid());

-- Org branding: only org owner can manage
CREATE POLICY "org_branding_owner_all" 
ON public.org_branding 
FOR ALL 
TO authenticated
USING (EXISTS (SELECT 1 FROM public.orgs o WHERE o.id = org_id AND o.owner_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.orgs o WHERE o.id = org_id AND o.owner_id = auth.uid()));

-- User profiles: users can manage their own profile
CREATE POLICY "user_profiles_self" 
ON public.user_profiles 
FOR ALL 
TO authenticated
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());