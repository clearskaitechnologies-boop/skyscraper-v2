# Draft PR: feat/carriers-pricebook-playwright-minio

Title: feat: seed carriers & pricebook + Playwright baselines + MinIO S3 render uploads

Branch: feat/carriers-pricebook-playwright-minio

## Summary

This PR adds:

- Prisma models (Carrier, PricebookItem) and a seed script.
- Playwright visual tests that run against Storybook static build and capture baselines.
- S3/MinIO helper and render engine integration to upload PDFs and return presigned GET URLs.
- docker-compose.minio.yml and .env.example for local MinIO dev.

## Checklist

- [ ] Prisma schema updated and migration applied.
- [ ] Seed script run to populate carriers + pricebook.
- [ ] Storybook build produces deterministic static site (storybook-static).
- [ ] Playwright tests run against storybook-static and baselines stored under playwright/artifacts or snapshots.
- [ ] MinIO running via Docker Compose and 'reports' bucket created.
- [ ] renderEngine uploads PDFs to S3/MinIO and returns presigned URL.
- [ ] CI updated to run storybook build + Playwright tests (visual baselines) and typo guard for "SkaiScrape".

## How to test locally

1. Start MinIO: `docker compose -f docker-compose.minio.yml up -d` and create bucket 'reports' in MinIO console http://localhost:9001 (minioadmin/minioadmin).
2. Install deps: `pnpm install`
3. Generate asset version and check assets: `pnpm run assets:version && pnpm run assets:check`
4. Build storybook: `pnpm run storybook:build`
5. Serve storybook: `pnpm run storybook:serve` (or the test script will do start-and-test)
6. Run Playwright tests: `pnpm run test:pw:sb`

## Git commands

```bash
git checkout -b feat/carriers-pricebook-playwright-minio
git add prisma schema.prisma prisma/seed.ts playwright docker-compose.minio.yml .env.example src/lib/s3.ts src/features/reports/renderEngine.ts package.json PR_DRAFT.md
git commit -m "feat: carriers pricebook seed, Playwright baselines, MinIO render uploads"
git push origin feat/carriers-pricebook-playwright-minio
```

Paste this PR body into a new Draft PR on GitHub and mark as Draft.
