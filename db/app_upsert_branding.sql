-- Create upsert_org_branding function in app schema
create or replace function app.upsert_org_branding(
  p_org_id text,
  p_owner_id text,
  p_company_name text,
  p_license text,
  p_phone text,
  p_email text,
  p_website text,
  p_color_primary text default '#117CFF',
  p_color_accent  text default '#FFC838',
  p_logo_url text default null,
  p_team_photo_url text default null
) returns void language plpgsql as $$
begin
  insert into app.org_branding(
    id, "orgId", "ownerId", "companyName", license, phone, email, website,
    "colorPrimary", "colorAccent", "logoUrl", "teamPhotoUrl",
    "createdAt", "updatedAt"
  ) values (
    p_org_id, 
    p_org_id, 
    p_owner_id, 
    coalesce(nullif(p_company_name,''), 'Your Roofing Company LLC'),
    p_license, 
    p_phone, 
    p_email, 
    p_website,
    coalesce(nullif(p_color_primary,''),'#117CFF'),
    coalesce(nullif(p_color_accent,''), '#FFC838'),
    p_logo_url, 
    p_team_photo_url,
    now(),
    now()
  )
  on conflict ("orgId") do update set
    "companyName"  = coalesce(nullif(excluded."companyName",''), org_branding."companyName"),
    license        = coalesce(excluded.license, org_branding.license),
    phone          = coalesce(excluded.phone, org_branding.phone),
    email          = coalesce(excluded.email, org_branding.email),
    website        = coalesce(excluded.website, org_branding.website),
    "colorPrimary" = coalesce(nullif(excluded."colorPrimary",''), org_branding."colorPrimary"),
    "colorAccent"  = coalesce(nullif(excluded."colorAccent",''), org_branding."colorAccent"),
    "logoUrl"      = coalesce(excluded."logoUrl", org_branding."logoUrl"),
    "teamPhotoUrl" = coalesce(excluded."teamPhotoUrl", org_branding."teamPhotoUrl"),
    "updatedAt"    = now();
end $$;
