Title: feat: add pdf & mockup functions, mocks, tests, and scaffolding

Summary:
This PR adds scaffolding for server-side PDF generation and mockup image composition, database migration for usage_events and org_billing, and test skeletons for pixel-diff E2E and DOL integration.

What to review:

- `functions/generate-pdf` and `functions/generate-mockup` for render flow and usage_event inserts.
- `migrations/20251026_add_usage_events_org_billing.sql` for DB schema changes related to billing.
- Playwright/storybook test skeletons in `playwright/*` and tests/\*. Ensure baselines are generated.

How to test locally:

1. Copy `.env.template` to `.env` and fill values.
2. Start Postgres and run migrations.
3. Start MinIO via `docker-compose -f docker-compose.minio.yml up -d` (optional) and ensure S3 envs are set.
4. Start functions locally (see README_generate_functions.md).

Notes & follow-ups:

- Replace placeholder `uploadToStorage` with real S3 or Supabase Storage logic (I wired S3 helper in `src/lib/s3.ts`).
- Add stricter input validation and auth on the functions.
- Wire billing (org_billing) and invoices in a later PR.
