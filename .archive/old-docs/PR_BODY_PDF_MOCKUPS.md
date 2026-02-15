Title: feat(pdf-mockups): fix pdf-export usage_events + add mockup generation telemetry

Summary

- Fixes: schema-aware insertion into `usage_events` for PDF and mockup generation (kind='pdf_generation' / 'ai_mockup' and `unit_cost_cents`).
- Adds branding injection into the PDF generation flow so templates can use organization logo/colors.
- Adds small verification scripts and CI-friendly checks to validate mockup assets and usage events.

What to test locally

1. Apply DB migrations (branding + tokens as applicable):
   psql "$DATABASE_URL" -f ./db/migrations/20251026_add_organization_branding.sql
2. Start dev server: `pnpm dev`
3. Run mockup smoke script(s) and the verify-branding-flow script
4. Trigger PDF/mockup generation endpoints and verify `usage_events` rows via psql

Notes

- This branch contains UI tweaks (nav + pricing) and backend stubs/samples — review function changes and adjust DB column names if your schema differs.
- If the upload endpoint was intentionally removed, re-add it before running upload tests.
