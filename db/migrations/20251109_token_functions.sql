-- Token management functions for Stripe billing integration
-- These functions handle adding and consuming tokens from the orgs table

-- Function to add tokens to an organization (e.g., from Stripe invoice.paid)
CREATE OR REPLACE FUNCTION public.orgs_add_tokens(
  p_org_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'stripe_invoice_paid'
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance from orgs table
  SELECT COALESCE(token_balance, 0) INTO v_current_balance
  FROM public.orgs
  WHERE id = p_org_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Organization not found: %', p_org_id;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance + p_amount;

  -- Update orgs table
  UPDATE public.orgs
  SET token_balance = v_new_balance,
      updated_at = now()
  WHERE id = p_org_id;

  -- Log to token_ledger
  INSERT INTO public.token_ledger (org_id, change, balance, reason)
  VALUES (p_org_id, p_amount, v_new_balance, p_reason);

  RETURN QUERY SELECT TRUE, v_new_balance;
END;
$$ LANGUAGE plpgsql;

-- Function to consume tokens from an organization (e.g., AI endpoint usage)
CREATE OR REPLACE FUNCTION public.orgs_consume_tokens(
  p_org_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'ai_usage'
)
RETURNS TABLE(
  success BOOLEAN,
  new_balance INTEGER,
  error_code TEXT
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- Get current balance from orgs table
  SELECT COALESCE(token_balance, 0) INTO v_current_balance
  FROM public.orgs
  WHERE id = p_org_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 0, 'org_not_found'::TEXT;
    RETURN;
  END IF;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RETURN QUERY SELECT FALSE, v_current_balance, 'insufficient_tokens'::TEXT;
    RETURN;
  END IF;

  -- Calculate new balance
  v_new_balance := v_current_balance - p_amount;

  -- Update orgs table
  UPDATE public.orgs
  SET token_balance = v_new_balance,
      updated_at = now()
  WHERE id = p_org_id;

  -- Log to token_ledger (negative change for consumption)
  INSERT INTO public.token_ledger (org_id, change, balance, reason)
  VALUES (p_org_id, -p_amount, v_new_balance, p_reason);

  RETURN QUERY SELECT TRUE, v_new_balance, NULL::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Helper function to get organization token balance
CREATE OR REPLACE FUNCTION public.orgs_get_token_balance(
  p_org_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_balance INTEGER;
BEGIN
  SELECT COALESCE(token_balance, 0) INTO v_balance
  FROM public.orgs
  WHERE id = p_org_id;

  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.orgs_add_tokens TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.orgs_consume_tokens TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.orgs_get_token_balance TO authenticated, service_role;
