# 🔒 RELEASE BASELINE — v1.0.0

**Date**: December 20, 2025  
**Commit**: `4132bce7`  
**Tag**: `v1.0.0`  
**Purpose**: Reference baseline for production release

---

## 📊 BUILD METRICS

### Route Count

- **Total Routes**: ~1,100 compiled successfully
- **App Routes**: 874 dynamic routes
- **Pages Routes**: 1 route
- **Middleware**: 68.1 kB

### Critical Routes Verified

- ✅ `/dashboard`
- ✅ `/claims`
- ✅ `/reports`
- ✅ `/weather-report`
- ✅ `/settings/production-verification`
- ✅ `/client-portal`
- ✅ `/network`

---

## 🔍 LINT STATUS

### Lint Command

```bash
pnpm lint
```

### Lint Result

**0 actionable issues**

### Known Ignored Items

1. **DB_SCHEMA_SNAPSHOT.prisma**
   - Type: Generated file (Prisma schema snapshot)
   - Location: `prisma/DB_SCHEMA_SNAPSHOT.prisma`
   - Reason: Auto-generated, excluded via `.vscode/settings.json`
   - Action: None required

2. **Inline Styles (2 instances)**
   - Type: Dynamic progress bar width calculations
   - Locations:
     - `src/components/onboarding/GettingStartedCard.tsx` (progress bar)
     - Any other dynamically calculated widths
   - Reason: Required for runtime percentage calculations
   - Action: Marked with `eslint-disable-next-line react/no-inline-styles`

---

## 🏗️ BUILD STATUS

### Build Command (pnpm build)

```bash
pnpm build
```

### Build Result (pnpm build)

✅ **Compiled successfully**

### Build Output

```
Route (app): 874 routes
Route (pages): 1 route
Total: ~1,100 routes
Middleware: 68.1 kB
```

### Known Build Warnings

**Dynamic Server Usage** (expected for authenticated routes):

- `/api/ai/skills` - uses `headers()` for auth
- `/api/analytics/batch` - uses `headers()` for auth
- `/api/batch-proposals` - uses `headers()` for auth
- `/api/client-messages/thread` - uses `headers()` for auth
- `/api/client-notifications` - uses `headers()` for auth
- `/api/client/claims` - uses `headers()` for auth
- `/api/profile/me` - uses `headers()` for auth
- `/api/properties` - uses `headers()` for auth
- `/api/rbac/me` - uses `headers()` for auth
- `/api/system/demo-ids` - uses `headers()` for auth
- `/api/system/sample-ids` - uses `headers()` for auth
- `/api/templates/company` - uses `headers()` for auth
- `/api/templates/list` - uses `headers()` for auth

**Note**: These warnings are **expected and correct**. All API routes using Clerk authentication must be dynamic (cannot be statically rendered). This is by design and does not indicate a problem.

---

## 🔐 PRISMA STATUS

### Prisma Validate Command (npx prisma validate)

```bash
npx prisma validate
```

### Prisma Validate Result (npx prisma validate)

✅ **Schema validated successfully**

### Active Migrations

All migrations applied:

- Organization branding
- Branding uploads
- Tokens ledger
- Homeowner email
- Bad faith detection
- Report history
- Message tables
- Claim intake fields

---

## 📦 DEPENDENCIES

### Package Manager

**pnpm** (v8.x+)

### Critical Dependencies

- Next.js 14
- React 18
- Clerk (auth)
- Prisma (ORM)
- Upstash Redis (rate limiting)
- OpenAI SDK (AI features)
- Vercel Blob (file storage)

### Environment Variables Required

See `.env.example` for full list. Critical vars:

- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `BLOB_READ_WRITE_TOKEN`

---

## 🎯 QUALITY GATES (ALL MUST PASS)

- [x] Build completes without errors
- [x] Lint passes with 0 actionable issues
- [x] Prisma schema validates
- [x] All critical routes present in build output
- [x] No unexpected errors in build logs
- [x] Production verification page loads
- [x] Health checks accessible

---

## 🚨 REGRESSION INDICATORS

**If any of these change unexpectedly, investigate immediately:**

1. **Route count drops** (<1,090 routes)
   - Likely cause: Missing dynamic route generation
   - Action: Check build logs for errors

2. **New ESLint errors** (not related to new code)
   - Likely cause: Dependency update changed rules
   - Action: Review rule changes, decide if fixing or ignoring

3. **Build errors** (any)
   - Likely cause: Breaking change in dependency or environment
   - Action: Check build logs, verify env vars, check dependencies

4. **Prisma validation fails**
   - Likely cause: Schema drift or migration conflict
   - Action: Run `npx prisma migrate status`, check for manual DB changes

5. **New dynamic server usage warnings** (on routes that were previously static)
   - Likely cause: Added `headers()`, `cookies()`, or auth to previously static route
   - Action: Verify this was intentional, ensure route should be dynamic

---

## 📝 BASELINE COMMANDS (REPRODUCIBLE)

To verify platform matches baseline:

```bash
# 1. Clean install
pnpm install

# 2. Generate Prisma client
npx prisma generate

# 3. Lint
pnpm lint

# 4. Build
pnpm build

# 5. Verify route count
pnpm build 2>&1 | grep -E "Route \(app\)|Route \(pages\)" | head -5
# Expected: ~874 app routes, 1 page route

# 6. Check for errors
pnpm build 2>&1 | grep -i "error" | grep -v "Dynamic server usage"
# Expected: No output (no errors)
```

---

## 🔄 ROLLBACK PROCEDURE

If production breaks after this release:

```bash
# 1. Rollback to v1.0.0
git checkout v1.0.0

# 2. Reinstall dependencies
pnpm install

# 3. Regenerate Prisma client
npx prisma generate

# 4. Rebuild
pnpm build

# 5. Redeploy
vercel --prod
# OR push to main and let auto-deploy handle it
```

---

## 📊 COMPARISON REFERENCE

Use this baseline when:

- Debugging production issues
- Verifying rollback success
- Auditing changes between releases
- Onboarding new developers
- Answering "what changed?" questions

**Next Baseline**: Create after significant feature releases or quarterly

---

**Established**: December 20, 2025  
**Author**: Release Owner  
**Status**: ✅ Locked as v1.0.0 reference
