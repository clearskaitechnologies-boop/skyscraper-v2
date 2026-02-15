
-- Material detection and compliance tables
alter table public.leads add column if not exists roof_material text
  check (roof_material in ('asphalt','tile','metal','flat','unknown')) default 'unknown';

create table if not exists public.photo_materials (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  photo_id uuid not null references public.photos(id) on delete cascade,
  material text not null check (material in ('asphalt','tile','metal','flat','unknown')),
  confidence numeric not null check (confidence>=0 and confidence<=1),
  model text,
  created_at timestamptz default now()
);

alter table public.photo_materials enable row level security;

create policy photo_materials_rw on public.photo_materials
for all to authenticated
using (exists (select 1 from public.user_profiles up
               join public.photos p on p.id=photo_materials.photo_id
               where up.user_id=auth.uid() and up.org_id=photo_materials.org_id))
with check (exists (select 1 from public.user_profiles up
               join public.photos p on p.id=photo_materials.photo_id
               where up.user_id=auth.uid() and up.org_id=photo_materials.org_id));

create table if not exists public.code_findings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  jurisdiction text,
  material text,
  code_ref text,
  title text,
  summary text,
  severity text check (severity in ('info','warning','required')) default 'required',
  citations jsonb,
  created_at timestamptz default now()
);

alter table public.code_findings enable row level security;

create policy code_findings_rw on public.code_findings
for all to authenticated
using (exists (select 1 from public.user_profiles up
               join public.reports r on r.id=code_findings.report_id
               where up.user_id=auth.uid() and up.org_id=code_findings.org_id))
with check (exists (select 1 from public.user_profiles up
               join public.reports r on r.id=code_findings.report_id
               where up.user_id=auth.uid() and up.org_id=code_findings.org_id));

create table if not exists public.approval_docs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  storage_path text not null,
  mime text,
  parsed jsonb,
  created_at timestamptz default now()
);

alter table public.approval_docs enable row level security;

create policy approval_docs_rw on public.approval_docs
for all to authenticated
using (exists (select 1 from public.user_profiles up
               join public.reports r on r.id=approval_docs.report_id
               where up.user_id=auth.uid() and up.org_id=approval_docs.org_id))
with check (exists (select 1 from public.user_profiles up
               join public.reports r on r.id=approval_docs.report_id
               where up.user_id=auth.uid() and up.org_id=approval_docs.org_id));

create table if not exists public.supplements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  items jsonb not null,
  source jsonb,
  created_at timestamptz default now()
);

alter table public.supplements enable row level security;

create policy supplements_rw on public.supplements
for all to authenticated
using (exists (select 1 from public.user_profiles up
               join public.reports r on r.id=supplements.report_id
               where up.user_id=auth.uid() and up.org_id=supplements.org_id))
with check (exists (select 1 from public.user_profiles up
               join public.reports r on r.id=supplements.report_id
               where up.user_id=auth.uid() and up.org_id=supplements.org_id));

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  report_id uuid references public.reports(id) on delete set null,
  lead_id uuid references public.leads(id) on delete set null,
  amount_cents integer not null check (amount_cents >= 0),
  status text not null check (status in ('draft','sent','paid','void')) default 'draft',
  created_at timestamptz default now()
);

alter table public.invoices enable row level security;

create policy invoices_rw on public.invoices
for all to authenticated
using (exists (select 1 from public.user_profiles up where up.user_id=auth.uid() and up.org_id=invoices.org_id))
with check (exists (select 1 from public.user_profiles up where up.user_id=auth.uid() and up.org_id=invoices.org_id));

-- CRM metrics RPC
create or replace function public.crm_metrics()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
  v_out json;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  select up.org_id into v_org from public.user_profiles up where up.user_id = v_uid limit 1;
  if v_org is null then
    return json_build_object(
      'activeRetail', 0, 'activeClaims', 0, 'leads', 0,
      'propertiesMapped', 0, 'revenueCents', 0
    );
  end if;

  with
  retail as (
    select count(*)::int c
    from public.reports r
    where r.org_id = v_org
      and (r.report_data->>'mode' = 'retail' or (select default_mode from org_defaults where org_id=v_org limit 1) = 'retail')
      and coalesce(r.status,'draft') not in ('closed','archived')
  ),
  claims as (
    select count(*)::int c
    from public.reports r
    where r.org_id = v_org
      and (r.report_data->>'mode' = 'insurance' or (select default_mode from org_defaults where org_id=v_org limit 1) = 'insurance')
      and coalesce(r.status,'draft') in ('draft','submitted','in_review','approved_pending')
  ),
  lead_count as (
    select count(*)::int c
    from public.leads l
    where l.org_id = v_org
  ),
  mapped as (
    select greatest(
      (select count(*) from public.leads l where l.org_id=v_org and l.latitude is not null and l.longitude is not null),
      (select count(distinct ja.lead_id) from public.je_assets ja where ja.org_id=v_org)
    )::int c
  ),
  rev as (
    select coalesce(sum(amount_cents),0)::bigint c
    from public.invoices i
    where i.org_id = v_org and i.status = 'paid'
  )
  select json_build_object(
    'activeRetail', (select c from retail),
    'activeClaims', (select c from claims),
    'leads', (select c from lead_count),
    'propertiesMapped', (select c from mapped),
    'revenueCents', (select c from rev)
  ) into v_out;

  return v_out;
end
$$;

revoke all on function public.crm_metrics() from public;
grant execute on function public.crm_metrics() to authenticated;

-- CRM properties map RPC
create or replace function public.crm_properties()
returns table(id uuid, address text, lat numeric, lon numeric)
language sql
security definer
set search_path = public
as $$
  select l.id, coalesce(l.property_address, l.client_name), l.latitude, l.longitude
  from public.leads l
  where l.org_id = (
    select up.org_id from public.user_profiles up where up.user_id = auth.uid() limit 1
  )
  and l.latitude is not null and l.longitude is not null
  order by l.created_at desc
  limit 500;
$$;

revoke all on function public.crm_properties() from public;
grant execute on function public.crm_properties() to authenticated;
