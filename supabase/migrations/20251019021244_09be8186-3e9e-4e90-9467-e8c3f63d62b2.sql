-- Fix user_organizations compatibility + ensure all helpers exist

-- 1) Add created_at to user_profiles if missing
alter table public.user_profiles add column if not exists created_at timestamptz default now();

-- 2) Compatibility view for user_organizations
drop view if exists public.user_organizations;
create view public.user_organizations as
select
  up.user_id,
  up.org_id,
  coalesce(up.created_at, now()) as created_at
from public.user_profiles up;

grant select on public.user_organizations to authenticated;

-- 3) Create ensure_current_org helper
create or replace function public.ensure_current_org()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select up.org_id into v_org
  from public.user_profiles up
  where up.user_id = v_uid
  limit 1;

  if v_org is null then
    insert into public.orgs (name) values ('My Company')
      returning id into v_org;

    insert into public.user_profiles (user_id, org_id)
    values (v_uid, v_org)
    on conflict (user_id) do update set org_id = excluded.org_id;
  end if;

  return v_org;
end
$$;

revoke all on function public.ensure_current_org() from public;
grant execute on function public.ensure_current_org() to authenticated;

-- 4) Recreate crm_metrics to use ensure_current_org
drop function if exists public.crm_metrics();
create or replace function public.crm_metrics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org uuid := public.ensure_current_org();
  v_active_projects int := 0;
  v_properties_mapped int := 0;
  v_claims_filed int := 0;
  v_total_revenue numeric := 0;
begin
  select count(*) into v_active_projects
  from public.reports r
  where r.org_id = v_org
    and coalesce(r.status,'draft') <> 'archived';

  select count(distinct r.id) into v_properties_mapped
  from public.reports r
  where r.org_id = v_org;

  select count(*) into v_claims_filed
  from public.reports r
  where r.org_id = v_org
    and (r.report_data->>'mode') = 'insurance'
    and coalesce(r.status,'draft') <> 'draft';

  select coalesce(sum(i.amount_cents::numeric / 100), 0) into v_total_revenue
  from public.invoices i
  where i.org_id = v_org
    and i.status = 'paid';

  return json_build_object(
    'activeProjects', v_active_projects,
    'propertiesMapped', v_properties_mapped,
    'claimsFiled', v_claims_filed,
    'totalRevenue', v_total_revenue
  );
end
$$;

revoke all on function public.crm_metrics() from public;
grant execute on function public.crm_metrics() to authenticated;