-- Add/ensure fields we need for branding
ALTER TABLE public.org_branding
  ADD COLUMN IF NOT EXISTS report_cover_style text DEFAULT 'modern',
  ADD COLUMN IF NOT EXISTS photo_layout text DEFAULT '3',
  ADD COLUMN IF NOT EXISTS claims_layout text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS theme_primary text DEFAULT '#0ea5e9',
  ADD COLUMN IF NOT EXISTS theme_secondary text DEFAULT '#111827',
  ADD COLUMN IF NOT EXISTS theme_accent text DEFAULT '#22c55e',
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Helper: returns the caller's org_id (or creates one on first run)
CREATE OR REPLACE FUNCTION public.ensure_current_org()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_org uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  SELECT up.org_id INTO v_org FROM public.user_profiles up WHERE up.user_id=v_uid LIMIT 1;

  IF v_org IS NULL THEN
    INSERT INTO public.orgs (id, name) VALUES (gen_random_uuid(), 'My Company')
      RETURNING id INTO v_org;
    INSERT INTO public.user_profiles (user_id, org_id)
      VALUES (v_uid, v_org)
      ON CONFLICT (user_id) DO UPDATE SET org_id=excluded.org_id;
  END IF;

  RETURN v_org;
END $$;

REVOKE ALL ON FUNCTION public.ensure_current_org() FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_current_org() TO authenticated;

-- Main: safe upsert from wizard
CREATE OR REPLACE FUNCTION public.upsert_org_branding(_b jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid := public.ensure_current_org();
BEGIN
  INSERT INTO public.org_branding(
    org_id, company_name, logo_url, phone, email, website,
    address_line1, address_line2, city, state, postal_code, country,
    report_cover_style, photo_layout, claims_layout,
    theme_primary, theme_secondary, theme_accent, updated_at
  )
  VALUES(
    v_org,
    COALESCE(_b->>'company_name', NULL),
    COALESCE(_b->>'logo_url', NULL),
    COALESCE(_b->>'phone', NULL),
    COALESCE(_b->>'email', NULL),
    COALESCE(_b->>'website', NULL),
    COALESCE(_b->>'address_line1', NULL),
    COALESCE(_b->>'address_line2', NULL),
    COALESCE(_b->>'city', NULL),
    COALESCE(_b->>'state', NULL),
    COALESCE(_b->>'postal_code', NULL),
    COALESCE(_b->>'country', 'US'),
    COALESCE(_b->>'report_cover_style', 'modern'),
    COALESCE(_b->>'photo_layout', '3'),
    COALESCE(_b->>'claims_layout', 'standard'),
    COALESCE(_b->>'theme_primary', '#0ea5e9'),
    COALESCE(_b->>'theme_secondary', '#111827'),
    COALESCE(_b->>'theme_accent', '#22c55e'),
    NOW()
  )
  ON CONFLICT (org_id) DO UPDATE SET
    company_name     = excluded.company_name,
    logo_url         = excluded.logo_url,
    phone            = excluded.phone,
    email            = excluded.email,
    website          = excluded.website,
    address_line1    = excluded.address_line1,
    address_line2    = excluded.address_line2,
    city             = excluded.city,
    state            = excluded.state,
    postal_code      = excluded.postal_code,
    country          = excluded.country,
    report_cover_style = excluded.report_cover_style,
    photo_layout     = excluded.photo_layout,
    claims_layout    = excluded.claims_layout,
    theme_primary    = excluded.theme_primary,
    theme_secondary  = excluded.theme_secondary,
    theme_accent     = excluded.theme_accent,
    updated_at       = NOW();

  RETURN json_build_object('ok', true, 'org_id', v_org);
END $$;

REVOKE ALL ON FUNCTION public.upsert_org_branding(jsonb) FROM public;
GRANT EXECUTE ON FUNCTION public.upsert_org_branding(jsonb) TO authenticated;

-- Real KPIs function
CREATE OR REPLACE FUNCTION public.crm_metrics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org uuid := public.ensure_current_org();
  v_active_projects int;
  v_properties_mapped int;
  v_claims int;
  v_revenue bigint;
BEGIN
  -- Define "active project": reports not archived/closed
  SELECT COUNT(*) INTO v_active_projects
  FROM public.reports r
  WHERE r.org_id = v_org AND COALESCE(r.status,'draft') NOT IN ('archived','closed');

  -- Properties mapped (distinct leads with a geo point OR any report)
  SELECT COUNT(DISTINCT l.id) INTO v_properties_mapped
  FROM public.leads l
  LEFT JOIN public.reports r ON r.lead_id = l.id
  WHERE l.org_id = v_org AND (l.latitude IS NOT NULL OR r.id IS NOT NULL);

  -- Claims filed (insurance reports not draft)
  SELECT COUNT(*) INTO v_claims
  FROM public.reports r
  WHERE r.org_id = v_org AND (r.report_data->>'mode')='insurance' AND COALESCE(r.status,'draft') <> 'draft';

  -- Revenue: sum paid invoices
  SELECT COALESCE(SUM(amount_cents),0) INTO v_revenue
  FROM public.invoices i
  WHERE i.org_id = v_org AND i.status='paid';

  RETURN json_build_object(
    'activeProjects', v_active_projects,
    'propertiesMapped', v_properties_mapped,
    'claimsFiled', v_claims,
    'revenueCents', v_revenue
  );
END $$;

REVOKE ALL ON FUNCTION public.crm_metrics() FROM public;
GRANT EXECUTE ON FUNCTION public.crm_metrics() TO authenticated;