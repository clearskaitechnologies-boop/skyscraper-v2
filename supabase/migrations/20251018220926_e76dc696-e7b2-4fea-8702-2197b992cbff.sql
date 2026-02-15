-- Add revocation and view limit columns to public_tokens
ALTER TABLE public.public_tokens
  ADD COLUMN IF NOT EXISTS revoked boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS view_count integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_views integer;

-- Add index for faster revoked token lookups
CREATE INDEX IF NOT EXISTS idx_public_tokens_revoked ON public.public_tokens(token, revoked) WHERE revoked = false;

-- Helper function to safely increment view count
CREATE OR REPLACE FUNCTION public.increment_public_view(_token text)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  UPDATE public.public_tokens 
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE token = _token 
    AND revoked = false
    AND (max_views IS NULL OR view_count < max_views)
    AND (expires_at IS NULL OR expires_at > NOW());
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN public.public_tokens.revoked IS 'Set to true to immediately revoke access';
COMMENT ON COLUMN public.public_tokens.view_count IS 'Tracks number of times this token has been accessed';
COMMENT ON COLUMN public.public_tokens.max_views IS 'Optional limit on number of views before token becomes invalid';

-- Audit log retention cleanup (keeps 90 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$
BEGIN
  -- Clean up old audit_public_views
  DELETE FROM public.audit_public_views 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up old report_audit_events (keeps 180 days for reports)
  DELETE FROM public.report_audit_events 
  WHERE created_at < NOW() - INTERVAL '180 days';
  
  -- Clean up old app_logs (keeps 30 days)
  DELETE FROM public.app_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Audit logs cleaned up successfully';
END;
$$;

COMMENT ON FUNCTION public.cleanup_old_audit_logs() IS 'Removes audit logs older than retention period (90 days for public views, 180 days for report events, 30 days for app logs)';