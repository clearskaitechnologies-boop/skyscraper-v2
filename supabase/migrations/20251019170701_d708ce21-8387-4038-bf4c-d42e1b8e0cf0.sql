-- Auto-inject org branding into new reports
create or replace function public.add_branding_to_report()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  b record;
  v_org_id uuid;
begin
  -- Get org_id from new report
  v_org_id := new.org_id;
  
  -- Fetch branding for this org
  select company_name, logo_url, primary_color, secondary_color, accent_color
  into b
  from public.org_branding
  where org_id = v_org_id;

  if found then
    new.report_data := jsonb_set(
      coalesce(new.report_data, '{}'::jsonb),
      '{theme}',
      jsonb_build_object(
        'company_name', b.company_name,
        'logo_url', b.logo_url,
        'colors', jsonb_build_object(
          'primary', b.primary_color,
          'secondary', b.secondary_color,
          'accent', b.accent_color
        )
      ),
      true
    );
  end if;

  return new;
end;
$$;

-- Create trigger
drop trigger if exists trg_add_branding_to_report on public.reports;
create trigger trg_add_branding_to_report
before insert on public.reports
for each row
execute function public.add_branding_to_report();

-- Enhanced metrics function with explicit columns
create or replace function public.crm_metrics_v2()
returns table(
  total_reports bigint,
  insurance_reports bigint,
  total_photos bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.reports where org_id = current_org_id()) as total_reports,
    (select count(*) from public.reports r
       where r.org_id = current_org_id() 
       and r.report_data->>'mode' = 'insurance') as insurance_reports,
    (select count(*) from public.report_photos rp
       join public.reports r on r.id = rp.report_id
       where r.org_id = current_org_id()) as total_photos;
$$;

grant execute on function public.crm_metrics_v2() to authenticated;