-- Create org_billing table to store Stripe customer IDs
-- This allows us to link organizations to their Stripe customers for billing portal access

CREATE TABLE IF NOT EXISTS public.org_billing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id),
  UNIQUE(stripe_customer_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_org_billing_org_id ON public.org_billing(org_id);
CREATE INDEX IF NOT EXISTS idx_org_billing_stripe_customer ON public.org_billing(stripe_customer_id);

-- Helper function to get or create billing record
CREATE OR REPLACE FUNCTION public.org_billing_get_or_create(
  p_org_id UUID,
  p_stripe_customer_id TEXT,
  p_stripe_subscription_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  org_id UUID,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT
) AS $$
BEGIN
  -- Try to insert, on conflict update
  INSERT INTO public.org_billing (org_id, stripe_customer_id, stripe_subscription_id)
  VALUES (p_org_id, p_stripe_customer_id, p_stripe_subscription_id)
  ON CONFLICT (org_id) DO UPDATE
  SET 
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = COALESCE(EXCLUDED.stripe_subscription_id, org_billing.stripe_subscription_id),
    updated_at = now();

  -- Return the record
  RETURN QUERY
  SELECT 
    ob.id,
    ob.org_id,
    ob.stripe_customer_id,
    ob.stripe_subscription_id
  FROM public.org_billing ob
  WHERE ob.org_id = p_org_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.org_billing IS 'Stores Stripe customer and subscription IDs for organization billing';
COMMENT ON FUNCTION public.org_billing_get_or_create IS 'Get or create billing record for an organization';
