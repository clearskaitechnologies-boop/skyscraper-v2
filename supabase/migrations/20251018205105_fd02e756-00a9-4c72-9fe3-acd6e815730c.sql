-- ==================================================================================
-- ClearSKai Security Fix: Roles System
-- Creates app_role enum, user_roles table, has_role() function
-- This is CRITICAL - RLS policies depend on has_role() existing
-- ==================================================================================

-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('owner', 'admin', 'viewer');
  END IF;
END $$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can view their own roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Owners can manage all roles
DROP POLICY IF EXISTS "Owners can manage all roles" ON public.user_roles;
CREATE POLICY "Owners can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role = 'owner'
    )
  );

-- CRITICAL: has_role() security definer function
-- This is used by 63+ RLS policies throughout the application
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Helper function to grant roles (use in admin console)
CREATE OR REPLACE FUNCTION public.grant_role(_email text, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = _email;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', _email;
  END IF;
  
  INSERT INTO public.user_roles(user_id, role)
  VALUES (_uid, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Helper function to revoke roles
CREATE OR REPLACE FUNCTION public.revoke_role(_email text, _role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid;
BEGIN
  SELECT id INTO _uid FROM auth.users WHERE email = _email;
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'No user found with email: %', _email;
  END IF;
  
  DELETE FROM public.user_roles
  WHERE user_id = _uid AND role = _role;
END;
$$;

-- Update handle_new_user_role trigger function to use user_roles table
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if this is the first user
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  -- First user becomes owner, all others start as viewer
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the automatic owner assignment
    INSERT INTO public.role_changes (changed_by, target_user, old_role, new_role, reason)
    VALUES (NEW.id, NEW.id, NULL, 'owner', 'Automatic assignment - first user');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'viewer')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Log the automatic viewer assignment
    INSERT INTO public.role_changes (changed_by, target_user, old_role, new_role, reason)
    VALUES (NEW.id, NEW.id, NULL, 'viewer', 'Automatic assignment - default role');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role TO service_role;