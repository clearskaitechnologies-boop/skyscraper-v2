-- Create upsert_org_branding function in public schema
-- The API uses pool.query which may default to public schema search path
create or replace function public.upsert_org_branding(
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
  -- Insert into app.org_branding (production schema)
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
    "companyName"  = coalesce(nullif(excluded."companyName",''), app.org_branding."companyName"),
    license        = coalesce(excluded.license, app.org_branding.license),
    phone          = coalesce(excluded.phone, app.org_branding.phone),
    email          = coalesce(excluded.email, app.org_branding.email),
    website        = coalesce(excluded.website, app.org_branding.website),
    "colorPrimary" = coalesce(nullif(excluded."colorPrimary",''), app.org_branding."colorPrimary"),
    "colorAccent"  = coalesce(nullif(excluded."colorAccent",''), app.org_branding."colorAccent"),
    "logoUrl"      = coalesce(excluded."logoUrl", app.org_branding."logoUrl"),
    "teamPhotoUrl" = coalesce(excluded."teamPhotoUrl", app.org_branding."teamPhotoUrl"),
    "updatedAt"    = now();
end $$;
