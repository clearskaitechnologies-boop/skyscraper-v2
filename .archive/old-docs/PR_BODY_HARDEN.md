Title: chore(tokens+infra): Harden token handlers, add upload worker test harness

Summary:

- Harden /api/tokens/purchase and /api/tokens/consume with DB transactions and org-row locks (SELECT ... FOR UPDATE).
- Ensure purchase credits and consume debits are atomic and serialized for each org.
- Add scripts/test-upload-worker.js to seed a test upload and run worker once (STOP_AFTER_ONE=1).

How to test locally (copy/paste):

1. Install/generate:
   pnpm install
   pnpm add @prisma/client node-fetch sharp
   pnpm add -D prisma
   npx prisma generate

2. Apply migrations (if not applied):
   psql "$DATABASE_URL" -f ./db/migrations/20251026_add_organization_branding.sql
   psql "$DATABASE_URL" -f ./db/migrations/20251026_create_branding_uploads.sql
   psql "$DATABASE_URL" -f ./db/migrations/20251026_create_tokens_ledger.sql

3. Start dev server (in another terminal): pnpm dev

4. Run the test harness (it will insert a test row and run the worker once):
   node ./scripts/test-upload-worker.js

5. Test tokens:
   Purchase (mock credits):
   curl -X POST -H "Content-Type: application/json" -d '{"org_id":"<TEST_ORG>","pack_id":"<PACK_ID>"}' http://localhost:3000/api/tokens/purchase

   Consume:
   curl -X POST -H "Content-Type: application/json" -d '{"org_id":"<TEST_ORG>","amount":1}' http://localhost:3000/api/tokens/consume

Branch + PR commands (local):
git checkout -b feat/harden-tokens-upload-test
git add src/pages/api/tokens/purchase.ts src/pages/api/tokens/consume.ts scripts/process-uploads-worker.js scripts/test-upload-worker.js PR_BODY_HARDEN.md
git commit -m "chore(tokens+infra): Harden token handlers; add upload worker test harness"

git push -u origin feat/harden-tokens-upload-test
gh pr create --title "chore(tokens+infra): Harden token handlers & worker test harness" --body-file PR_BODY_HARDEN.md --draft --base main
