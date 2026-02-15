-- Create simplified funnel view - demo_requests has no lead_id, so track separately
create or replace view public.v_funnel_leads as
with first_report as (
  select r.lead_id, min(r.created_at) as report_at
  from public.reports r
  where r.lead_id is not null
  group by r.lead_id
), first_approval as (
  select r.lead_id, min(a.created_at) as approval_at
  from public.report_price_approvals a
  join public.reports r on r.id = a.report_id
  where r.lead_id is not null
  group by r.lead_id
)
select l.id as lead_id, l.created_at as lead_at, l.user_id as owner_id,
       null::timestamptz as demo_at,
       rp.report_at, 
       ap.approval_at,
       0 as did_demo,
       case when rp.report_at is not null then 1 else 0 end as did_report,
       case when ap.approval_at is not null then 1 else 0 end as did_approval
from public.leads l
left join first_report rp on rp.lead_id = l.id
left join first_approval ap on ap.lead_id = l.id;

alter view public.v_funnel_leads set (security_invoker = true);

-- Create branding storage bucket for fonts and logos
insert into storage.buckets (id, name, public) 
values ('branding', 'branding', false)
on conflict (id) do nothing;