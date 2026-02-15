-- Fix infinite recursion in user_roles RLS policies
-- Drop recursive policies
DROP POLICY IF EXISTS "Owners can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Allow all authenticated users to read roles (breaks recursion)
CREATE POLICY "user_roles_select" ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Block all client-side writes (use functions instead)
CREATE POLICY "user_roles_no_writes" ON public.user_roles
  FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);