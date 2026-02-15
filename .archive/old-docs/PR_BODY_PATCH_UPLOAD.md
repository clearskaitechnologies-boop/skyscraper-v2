Title: feat(branding+pdf): add org branding upload, auth, and inject branding into pdf-export

Summary

- Adds server-side logo upload endpoint (pages/api/org/[orgId]/upload) — server-side Supabase Storage upload using service role key.
- Protects branding POST with `requireOrgAdmin` middleware (service role or header for local testing).
- Loads organization branding/template_defaults in `pdf-export` and injects them into templates prior to PDF rendering.
- Ensures `usage_events` inserts are schema-aware (kind='pdf_generation' and `unit_cost_cents`).

Files included in this PR (review before pushing)

- `db/migrations/20251026_add_organization_branding.sql` — migration to create `organizations` table
- `src/pages/api/org/[orgId]/branding.ts` — GET/POST branding API
- `src/pages/api/org/[orgId]/upload.ts` — (optional) server-side upload endpoint — recreate if missing
- `src/lib/auth.ts` — `requireOrgAdmin` helper (local testing; replace with production auth)
- `src/lib/branding.ts` — server-side helper to load branding
- `src/context/BrandingContext.tsx` — client branding provider
- `supabase/functions/pdf-export/index.ts` — example function updated to merge branding into templates and insert usage_event
- `README_BRANDING.md` & `scripts/verify-branding-flow.js` — runbook & verification scripts

How to test locally

1. Set env vars (local only):
   - DATABASE_URL
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY (or SERVICE_KEY)
   - BRANDING_BUCKET (optional)
   - TEST_ORG (optional)

2. Apply migration:
   psql "$DATABASE_URL" -f ./db/migrations/20251026_add_organization_branding.sql

3. Start dev server and run verification:
   pnpm install
   pnpm dev
   SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY" BASE_URL="http://localhost:3000" TEST_ORG="$TEST_ORG" node ./scripts/verify-branding-flow.js

4. (Optional) Upload a logo via curl (requires `src/pages/api/org/[orgId]/upload.ts` present):
   curl -v -X POST -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" -F "file=@./assets/test-logo.svg" http://localhost:3000/api/org/$TEST_ORG/upload

Notes

- If `src/pages/api/org/[orgId]/upload.ts` was removed from the repo, the upload endpoint will not be present — recreate or re-add that file before testing uploads.
- `requireOrgAdmin` is a minimal helper intended for local testing. Replace it with JWT/session checks in production.

If you want, run the combined local workflow script `scripts/LOCAL_COMMANDS_ALL.sh` (if present) to apply patches, run migrations, start the dev server, run verifications, and create draft PRs.
