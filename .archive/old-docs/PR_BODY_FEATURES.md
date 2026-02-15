Title: feat(ui): Add login, branding upload, report dashboard, customer form + smoke-tests & CI

Summary:
This PR scaffolds frontend pages and server endpoints for core features:

- Login (Supabase Auth)
- Branding upload UI + server upload endpoint
- Report Dashboard UI + /api/reports
- Customer form + /api/customers

What to review:

- Frontend pages under `src/pages/` and components under `src/components/`.
- API endpoints under `src/pages/api/`.

How to test locally:

1. Copy `.env.template` to `.env` and fill values.
2. Start Postgres and run migrations.
3. Start local functions or dev server and run `./scripts/smoke-tests.sh`.

Notes & follow-ups:

- These API endpoints are scaffolded for a Node/Express-runner and may require minor adaptation to Next.js API runtime.
- Add authentication & validation before production use.
