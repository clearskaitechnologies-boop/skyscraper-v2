# Run generate-mockup locally

This file explains how to run the `generate-mockup` function locally for development.

1. Install dependencies

```bash
cd functions/generate-mockup
pnpm install
```

2. Create a `.env` file from the template and edit values (do NOT commit .env):

```bash
cp .env.template .env
# edit .env and set DATABASE_URL, STORAGE_BUCKET, etc.
```

3. Start the function (example inline env):

```bash
APP_URL="http://localhost:3000" STORAGE_BUCKET="reports" DATABASE_URL="postgresql://postgres:postgres@localhost:5432/skaiscraper" MOCKUP_COST_CENTS=25 PORT=8081 pnpm run dev
```

4. Test with curl:

```bash
curl -X POST "http://localhost:8081/generate" \
  -H "Content-Type: application/json" \
  -d '{"template":"CoverA","tokens":{"title":"Test Report","subtitle":"Demo"},"size":{"w":1200,"h":1600},"org_id":"00000000-0000-0000-0000-000000000000"}'
```

Notes:

- If `sharp` requires build tools on your OS, install them (on macOS sharp ships prebuilt binaries usually).
- For PDF pixel diff tests you'll later need Playwright and a PDF->PNG tool like `pdftoppm` (poppler). Install with `brew install poppler` on macOS.
