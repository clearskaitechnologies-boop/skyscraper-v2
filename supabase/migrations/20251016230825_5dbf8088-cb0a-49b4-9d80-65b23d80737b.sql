-- Fix the view to use security invoker instead of security definer
drop view if exists public.v_client_reports;

create view public.v_client_reports 
with (security_invoker = true)
as
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