-- Create audit table for role changes
CREATE TABLE IF NOT EXISTS public.role_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  old_role public.app_role,
  new_role public.app_role NOT NULL,
  reason TEXT,
  changed_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on role_changes
ALTER TABLE public.role_changes ENABLE ROW LEVEL SECURITY;

-- Admins and owners can view all role changes
CREATE POLICY "Admins can view all role changes"
ON public.role_changes FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'owner'::app_role)
);

-- Users can view their own role changes
CREATE POLICY "Users can view their own role changes"
ON public.role_changes FOR SELECT
TO authenticated
USING (target_user = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_role_changes_target_user ON public.role_changes(target_user);
CREATE INDEX idx_role_changes_changed_at ON public.role_changes(changed_at DESC);

-- Update the handle_new_user_role trigger to make the first user an owner
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;