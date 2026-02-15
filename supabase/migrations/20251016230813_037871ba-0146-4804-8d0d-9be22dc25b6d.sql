-- Demo requests table
create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text,
  phone text,
  message text,
  utm jsonb,
  created_at timestamptz default now()
);

alter table public.demo_requests enable row level security;

do $$ begin
  create policy "Admins can read demo requests" 
  on public.demo_requests 
  for select 
  using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'owner'::app_role));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Anyone can insert demo" 
  on public.demo_requests 
  for insert 
  with check (true);
exception when duplicate_object then null;
end $$;

-- Client profiles table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  name text,
  email text unique,
  created_at timestamptz default now()
);

alter table public.clients enable row level security;

do $$ begin
  create policy "Client can read own profile" 
  on public.clients 
  for select
  using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can read all clients" 
  on public.clients 
  for select 
  using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'owner'::app_role));
exception when duplicate_object then null;
end $$;

-- Client report assignments
create table if not exists public.client_report_assignments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  created_at timestamptz default now(),
  unique (client_id, report_id)
);

alter table public.client_report_assignments enable row level security;

do $$ begin
  create policy "Client can read own assignments" 
  on public.client_report_assignments 
  for select
  using (exists (
    select 1 from public.clients c 
    where c.id = client_report_assignments.client_id 
    and c.user_id = auth.uid()
  ));
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "Admins can read all assignments" 
  on public.client_report_assignments 
  for select 
  using (has_role(auth.uid(), 'admin'::app_role) or has_role(auth.uid(), 'owner'::app_role));
exception when duplicate_object then null;
end $$;

-- View for client portal
create or replace view public.v_client_reports as
  select 
    r.id, 
    r.report_name as title,
    (r.report_data->>'address') as address,
    (r.report_data->'signed'->>'path') as signed_pdf_path,
    (r.report_data->'approvals') as approvals,
    (r.report_data->>'status') as status,
    cra.client_id
  from public.reports r
  join public.client_report_assignments cra on cra.report_id = r.id;