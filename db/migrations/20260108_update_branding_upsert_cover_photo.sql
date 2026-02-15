-- Update upsert_org_branding function to include coverPhotoUrl
-- Run with: psql $DATABASE_URL -f db/migrations/20260108_update_branding_upsert_cover_photo.sql

DROP FUNCTION IF EXISTS upsert_org_branding(text, text, text, text, text, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION upsert_org_branding(
  p_org_id text,
  p_owner_id text,
  p_company_name text,
  p_license text,
  p_phone text,
  p_email text,
  p_website text,
  p_color_primary text DEFAULT '#117CFF',
  p_color_accent text DEFAULT '#FFC838',
  p_logo_url text DEFAULT NULL,
  p_team_photo_url text DEFAULT NULL,
  p_cover_photo_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $function$
begin
  -- Insert into public.org_branding
  insert into public.org_branding(
    id, "orgId", "ownerId", "companyName", license, phone, email, website,
    "colorPrimary", "colorAccent", "logoUrl", "teamPhotoUrl", "coverPhotoUrl",
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
    p_cover_photo_url,
    now(),
    now()
  )
  on conflict ("orgId") do update set
    "companyName"    = coalesce(nullif(excluded."companyName",''), public.org_branding."companyName"),
    license          = coalesce(excluded.license, public.org_branding.license),
    phone            = coalesce(excluded.phone, public.org_branding.phone),
    email            = coalesce(excluded.email, public.org_branding.email),
    website          = coalesce(excluded.website, public.org_branding.website),
    "colorPrimary"   = coalesce(nullif(excluded."colorPrimary",''), public.org_branding."colorPrimary"),
    "colorAccent"    = coalesce(nullif(excluded."colorAccent",''), public.org_branding."colorAccent"),
    "logoUrl"        = coalesce(excluded."logoUrl", public.org_branding."logoUrl"),
    "teamPhotoUrl"   = coalesce(excluded."teamPhotoUrl", public.org_branding."teamPhotoUrl"),
    "coverPhotoUrl"  = coalesce(excluded."coverPhotoUrl", public.org_branding."coverPhotoUrl"),
    "updatedAt"      = now();
end $function$;
