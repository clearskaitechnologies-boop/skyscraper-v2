-- Create org_settings table for brand presets
create table if not exists public.org_settings (
  id uuid primary key default gen_random_uuid(),
  org_slug text unique not null default 'default',
  branding jsonb not null default '{}',
  presets jsonb not null default '{}',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.org_settings enable row level security;

-- Admin policy
create policy "admins manage org_settings" on public.org_settings 
  for all 
  using (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role))
  with check (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'owner'::app_role));

-- Seed default row
insert into public.org_settings (org_slug, branding, presets)
values ('default', '{}', '{
  "retail": {
    "sections": ["cover","overview","mockup","timeline","pricing","materials","warranties","photos","signature"],
    "cover": { "template":"minimal", "subtitle":"Retail Proposal", "gradient": {"from":"#0ea5e9","to":"#2563eb"} },
    "images": { "quality":"medium" },
    "watermark": null
  },
  "insurance": {
    "sections": ["cover","overview","code","weather","photos","supplements","materials","warranties","signature"],
    "cover": { "template":"split", "subtitle":"Insurance Claim Packet", "gradient": {"from":"#111827","to":"#374151"} },
    "images": { "quality":"high" },
    "watermark": { "text":"CONFIDENTIAL", "opacity":0.05, "diagonal":true }
  },
  "comprehensive": {
    "sections": ["cover","overview","code","mockup","timeline","pricing","materials","warranties","photos","weather","supplements","signature"],
    "cover": { "template":"photo", "subtitle":"Comprehensive Report", "gradient": {"from":"#0ea5e9","to":"#2563eb"} },
    "images": { "quality":"high" },
    "watermark": null
  }
}'::jsonb)
on conflict (org_slug) do nothing;