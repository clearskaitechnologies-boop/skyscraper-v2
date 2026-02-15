-- Pricing versions and approvals tables
create table if not exists public.report_price_versions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  version_no int not null,
  payload jsonb not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  unique(report_id, version_no)
);

create table if not exists public.report_price_approvals (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  version_no int not null,
  approver_type text not null check (approver_type in ('client','manager')),
  approver_name text not null,
  approver_email text,
  initials_path text,
  signature_path text,
  meta jsonb,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.report_price_versions enable row level security;
alter table public.report_price_approvals enable row level security;

-- RLS Policies for versions
create policy "Report owner can manage price versions" 
on public.report_price_versions for all 
using (
  exists(
    select 1 from reports r 
    where r.id = report_price_versions.report_id 
    and r.created_by = auth.uid()
  )
) 
with check (
  exists(
    select 1 from reports r 
    where r.id = report_price_versions.report_id 
    and r.created_by = auth.uid()
  )
);

-- RLS Policies for approvals
create policy "Report owner can manage price approvals" 
on public.report_price_approvals for all 
using (
  exists(
    select 1 from reports r 
    where r.id = report_price_approvals.report_id 
    and r.created_by = auth.uid()
  )
) 
with check (
  exists(
    select 1 from reports r 
    where r.id = report_price_approvals.report_id 
    and r.created_by = auth.uid()
  )
);

-- Index for performance
create index idx_price_versions_report on public.report_price_versions(report_id, version_no desc);
create index idx_price_approvals_report on public.report_price_approvals(report_id, version_no);