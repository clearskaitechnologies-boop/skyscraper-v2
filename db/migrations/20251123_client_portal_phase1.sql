-- Phase 2 / 3 additive migration (manual fallback)
-- Safe: creates new tables only if they do not already exist.

CREATE TABLE IF NOT EXISTS public.referral_leads (
  id text PRIMARY KEY,
  clientId text NULL,
  email text NULL,
  address text NULL,
  claimId text NULL,
  createdAt timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_leads_client ON public.referral_leads (clientId);
CREATE INDEX IF NOT EXISTS idx_referral_leads_claim ON public.referral_leads (claimId);

CREATE TABLE IF NOT EXISTS public.client_uploads (
  id text PRIMARY KEY,
  clientId text NULL,
  claimId text NULL,
  orgId text NULL,
  token text NULL,
  title text NULL,
  url text NULL,
  type text NULL,
  createdAt timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_uploads_client ON public.client_uploads (clientId);
CREATE INDEX IF NOT EXISTS idx_client_uploads_claim ON public.client_uploads (claimId);
CREATE INDEX IF NOT EXISTS idx_client_uploads_org ON public.client_uploads (orgId);

-- No destructive statements included.