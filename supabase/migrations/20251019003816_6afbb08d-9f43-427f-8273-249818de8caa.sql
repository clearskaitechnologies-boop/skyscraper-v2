-- Create comprehensive onboarding finalize function that handles everything server-side
create or replace function public.onboarding_finalize_v2(
  _name text,
  _phone text,
  _website text,
  _address text,
  _branding jsonb,   -- {logo_path, primary_color, secondary_color, accent_color}
  _defaults jsonb    -- {default_mode, default_photo_layout, auto_detect, auto_pipeline_on_export, from_name, from_email}
)
returns table(org_id uuid, lead_id uuid, report_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org_id uuid;
  v_lead_id uuid;
  v_report_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Use existing org if present; otherwise create and attach + owner role
  select up.org_id into v_org_id
  from public.user_profiles up
  where up.user_id = v_uid
  limit 1;

  if v_org_id is null then
    insert into public.orgs (name, phone, website, address, created_by, owner_id)
    values (_name, _phone, _website, _address, v_uid, v_uid)
    returning id into v_org_id;

    insert into public.user_profiles (user_id, org_id)
    values (v_uid, v_org_id)
    on conflict (user_id) do update set org_id = excluded.org_id;

    insert into public.user_roles (user_id, role)
    values (v_uid, 'owner'::app_role)
    on conflict do nothing;
  else
    update public.orgs
      set name = coalesce(_name, name),
          phone = coalesce(_phone, phone),
          website = coalesce(_website, website),
          address = coalesce(_address, address)
    where id = v_org_id;
  end if;

  -- Branding
  insert into public.org_branding (org_id, logo_path, primary_color, secondary_color, accent_color)
  values (
    v_org_id,
    _branding->>'logo_path',
    _branding->>'primary_color',
    _branding->>'secondary_color',
    _branding->>'accent_color'
  )
  on conflict (org_id) do update
    set logo_path = excluded.logo_path,
        primary_color = excluded.primary_color,
        secondary_color = excluded.secondary_color,
        accent_color = excluded.accent_color,
        updated_at = now();

  -- Defaults
  insert into public.org_defaults (
    org_id, default_mode, default_photo_layout, auto_detect, auto_pipeline_on_export, from_name, from_email
  )
  values (
    v_org_id,
    coalesce(_defaults->>'default_mode','inspection'),
    coalesce((_defaults->>'default_photo_layout')::int,3),
    coalesce((_defaults->>'auto_detect')::boolean,true),
    coalesce((_defaults->>'auto_pipeline_on_export')::boolean,true),
    _defaults->>'from_name',
    _defaults->>'from_email'
  )
  on conflict (org_id) do update
    set default_mode = excluded.default_mode,
        default_photo_layout = excluded.default_photo_layout,
        auto_detect = excluded.auto_detect,
        auto_pipeline_on_export = excluded.auto_pipeline_on_export,
        from_name = excluded.from_name,
        from_email = excluded.from_email,
        updated_at = now();

  -- Seed demo lead + report so dashboard/workbench have data immediately
  insert into public.leads (org_id, user_id, status, property_address, lead_type)
  values (v_org_id, v_uid, 'new', coalesce(_address,'Property Address'), 'manual')
  returning id into v_lead_id;

  insert into public.reports (org_id, lead_id, created_by, report_name, report_data, template_id)
  values (
    v_org_id, 
    v_lead_id, 
    v_uid,
    'Professional Roof Inspection (Demo)',
    jsonb_build_object('mode', coalesce(_defaults->>'default_mode','inspection')),
    (select id from public.report_templates where is_default = true limit 1)
  )
  returning id into v_report_id;

  return query select v_org_id, v_lead_id, v_report_id;
end
$$;

revoke all on function public.onboarding_finalize_v2(text,text,text,text,jsonb,jsonb) from public;
grant execute on function public.onboarding_finalize_v2(text,text,text,text,jsonb,jsonb) to authenticated;