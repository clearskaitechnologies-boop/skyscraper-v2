# PHASE 3 SPRINT 3: DEPLOYMENT GUIDE

## AI Proposals & Claims-Ready Packets System

### 📊 PROGRESS STATUS

**Overall**: 55% Complete (11/20 tasks) 🟢  
**Backend**: ✅ 100% Complete  
**Frontend**: 🟡 20% Complete (1/5 tasks in progress)  
**Infrastructure**: ⏳ Pending (Supabase + Migration)  
**QA/Testing**: ⏳ Not Started

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Environment Variables

Verify all required ENV vars in Vercel:

```bash
# OpenAI (required for AI content generation)
OPENAI_API_KEY=sk-proj-...

# Supabase (required for PDF storage)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Service role for server-side uploads

# Next.js (required for PDF rendering URL)
NEXT_PUBLIC_APP_URL=https://skaiscrape.com  # Production URL
```

**Verify in Vercel**:

1. Go to [Vercel Dashboard](https://vercel.com) → Your Project
2. Settings → Environment Variables
3. Ensure all 5 variables present for **Production**

---

### 2. Database Migration

Apply Prisma migration to add ProposalDraft + ProposalFile models:

**Option A: Prisma Migrate (Recommended)**

```bash
# Connect to production database
npx prisma migrate deploy
```

**Option B: Manual SQL**

```bash
# Apply migration SQL directly
psql "$DATABASE_URL" -f ./db/migrations/20251031_add_proposals_system.sql
```

**Verification**:

```sql
-- Check tables exist
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('proposal_drafts', 'proposal_files');

-- Should return 2 rows
```

---

### 3. Supabase Storage Setup

Create `proposals` bucket with RLS policies:

**Follow**: `SUPABASE_PROPOSALS_SETUP.md` (5 minutes)

**Quick Steps**:

1. Create bucket named `proposals` (private)
2. Apply 3 RLS policies (insert, select, delete)
3. Set file size limit: 50 MB
4. Restrict MIME type: `application/pdf`

**Verify**:

```bash
# Run test upload script
tsx scripts/test-proposal-upload.ts
# Expected: ✅ Upload succeeded
```

---

### 4. Prisma Client Generation

Ensure Prisma client includes new models:

```bash
npx prisma generate
```

**Verify in Code**:

```typescript
import { prisma } from "@/lib/prisma";

// Should NOT error
const draft = await prisma.proposalDraft.findMany();
const files = await prisma.proposalFile.findMany();
```

---

### 5. Build Test

Verify production build succeeds:

```bash
pnpm run build
```

**Expected Output**:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (XX/XX)
✓ Collecting build traces
✓ Finalizing page optimization
```

**Check for Errors**:

- ❌ Module not found: Check imports
- ❌ Type errors: Run `tsc --noEmit`
- ❌ Prisma errors: Re-generate client

---

## 🚀 DEPLOYMENT SEQUENCE

### Step 1: Merge Feature Branch

```bash
git checkout main
git merge feat/phase3-banner-and-enterprise
git push origin main
```

**Vercel**: Auto-deploys on push to main

---

### Step 2: Apply Database Migration

**IMMEDIATELY after deployment**:

```bash
# Connect to production Supabase Postgres
psql "$DATABASE_URL" -f ./db/migrations/20251031_add_proposals_system.sql
```

**⚠️ CRITICAL**: Migration must run BEFORE users access proposals routes

---

### Step 3: Setup Supabase Bucket

1. Go to Supabase Dashboard → Storage
2. Create `proposals` bucket
3. Apply RLS policies (from `SUPABASE_PROPOSALS_SETUP.md`)
4. Test upload with script

---

### Step 4: Verify Deployment

**Check Production Site**:

```bash
# Health check
curl https://skaiscrape.com/api/health

# Test proposals API (should return 401 Unauthorized)
curl -X POST https://skaiscrape.com/api/proposals/build \
  -H "Content-Type: application/json" \
  -d '{"leadId": "test", "jobId": "test", "packetType": "retail"}'
```

**Expected**: `{"error": "Unauthorized"}` (auth required)

---

### Step 5: Smoke Test (Manual)

1. **Sign in** to production
2. **Navigate** to `/proposals/new` (when UI ready)
3. **Select** a lead + job
4. **Click** "Build with AI"
5. **Verify** 4 sections populated
6. **Click** "Render PDF"
7. **Download** PDF and verify:
   - Logo appears
   - Org colors applied
   - Evidence photos present
8. **Click** "Publish"
9. **Check** TokenLedger: -2 tokens

---

## 🔍 POST-DEPLOYMENT VERIFICATION

### Analytics Check

**PostHog Events** (should see 4 new events):

1. `proposal_build_started`
2. `proposal_build_succeeded`
3. `proposal_rendered`
4. `proposal_published`

**Verify**:

1. Go to [PostHog Dashboard](https://app.posthog.com)
2. Navigate to Events
3. Search for "proposal\_"
4. Should see 4 event types

---

### Database Check

```sql
-- Check proposals created
SELECT
  id,
  packet_type,
  status,
  created_at
FROM proposal_drafts
ORDER BY created_at DESC
LIMIT 10;

-- Check files generated
SELECT
  pf.id,
  pf.kind,
  pf.file_size,
  pd.packet_type
FROM proposal_files pf
JOIN proposal_drafts pd ON pf.proposal_id = pd.id
ORDER BY pf.created_at DESC
LIMIT 10;

-- Check token consumption (when integrated)
SELECT
  org_id,
  change as tokens_consumed,
  reason,
  created_at
FROM tokens_ledger
WHERE reason = 'proposal_build'
ORDER BY created_at DESC
LIMIT 10;
```

---

### Storage Check

**Supabase Dashboard** → Storage → `proposals`:

- Should see folders by orgId
- Each folder contains `{proposalId}.pdf` files
- File sizes: ~5-12 MB per proposal

---

### Error Monitoring

**Sentry** (if configured):

1. Check for new errors related to:
   - `/api/proposals/*`
   - `renderProposalPdf`
   - `buildProposalContext`
   - `draftProposalSections`

**Expected**: No critical errors

---

## ⚠️ ROLLBACK PLAN

### If Deployment Fails

**Option 1: Revert Git Commit**

```bash
git revert HEAD
git push origin main
```

**Option 2: Rollback via Vercel**

1. Vercel Dashboard → Deployments
2. Find previous stable deployment
3. Click "..." → Promote to Production

**Option 3: Remove Migration** (if database broken)

```sql
-- Drop tables (DANGER: loses data)
DROP TABLE IF EXISTS proposal_files CASCADE;
DROP TABLE IF EXISTS proposal_drafts CASCADE;
```

---

## 📈 MONITORING & ALERTS

### Key Metrics to Watch

**Success Metrics**:

- Proposal build success rate: >95%
- PDF render success rate: >95%
- Average PDF file size: 5-12 MB
- Average build time: <10 seconds
- Average render time: <30 seconds

**Error Rates**:

- OpenAI API failures: <2%
- Puppeteer timeouts: <1%
- Supabase upload failures: <1%

**Setup Alerts** (PostHog/Sentry):

1. Alert if `proposal_build_started` > `proposal_build_succeeded` by 10%
2. Alert if PDF file size > 50 MB (storage limit)
3. Alert if Puppeteer launch fails

---

## 🐛 KNOWN ISSUES & WORKAROUNDS

### Issue 1: Puppeteer Timeout on Vercel

**Symptom**: PDF rendering fails after 30 seconds  
**Cause**: Vercel serverless function timeout (10s hobby, 300s pro)  
**Workaround**: Reduce evidence images (maxEvidenceImages=12)  
**Solution**: Upgrade to Vercel Pro for longer timeouts

### Issue 2: OpenAI Rate Limits

**Symptom**: 429 Too Many Requests error  
**Cause**: Free tier rate limits (3 RPM)  
**Workaround**: Retry logic already implemented (2 attempts)  
**Solution**: Upgrade to OpenAI Tier 2+ ($50+ spent)

### Issue 3: Supabase Storage Full

**Symptom**: Upload fails with "quota exceeded"  
**Cause**: Free tier 1 GB limit reached  
**Workaround**: Delete old drafts (status="draft")  
**Solution**: Upgrade to Supabase Pro ($25/month for 8 GB)

---

## 🎯 SUCCESS CRITERIA

### Minimum Viable (MVP)

✅ Database migration applied  
✅ Supabase bucket configured  
✅ ENV variables set  
✅ Build succeeds  
✅ API routes return 401 (auth working)  
⏳ Manual smoke test passes (pending UI)

### Full Launch

⏳ Proposal Builder UI live  
⏳ Dashboard integration  
⏳ 10 proposals generated successfully  
⏳ Both retail + claims packets tested  
⏳ Token consumption verified  
⏳ Analytics events flowing to PostHog

---

## 📞 SUPPORT & ESCALATION

### If Issues Arise

**Level 1**: Check logs

```bash
# Vercel function logs
vercel logs

# Supabase database logs (errors)
SELECT * FROM pg_stat_statements
WHERE query LIKE '%proposal%'
AND calls = 0;  -- Failed queries
```

**Level 2**: Check error tracking

- Sentry dashboard for stack traces
- PostHog for event drop-off

**Level 3**: Review code

- Prisma queries: `src/lib/proposals/context.ts`
- Puppeteer: `src/lib/proposals/render.ts`
- OpenAI: `src/lib/proposals/ai.ts`

---

## 🔄 FUTURE ENHANCEMENTS

### v1.1 (Next Sprint)

- [ ] Email delivery (Resend integration)
- [ ] PDF page count calculation (pdf-lib)
- [ ] Signed URLs for privacy
- [ ] Token consumption integration

### v1.2

- [ ] Template builder (drag-drop)
- [ ] Custom branding per proposal
- [ ] Batch proposal generation
- [ ] Proposal versioning

### v2.0

- [ ] Interactive proposals (forms in PDF)
- [ ] E-signature integration (DocuSign)
- [ ] Proposal analytics (opens, views, time spent)
- [ ] A/B testing templates

---

## 📚 DOCUMENTATION LINKS

- **Backend Summary**: `PHASE_3_SPRINT_3_SUMMARY.md`
- **Supabase Setup**: `SUPABASE_PROPOSALS_SETUP.md`
- **Migration SQL**: `db/migrations/20251031_add_proposals_system.sql`
- **API Docs**: Auto-generated from code comments
- **Type Definitions**: `src/lib/proposals/types.ts`

---

**Deployment Owner**: Backend Team  
**Estimated Deployment Time**: 30 minutes (including smoke test)  
**Risk Level**: 🟡 Medium (new backend, infra dependencies)  
**Rollback Time**: <5 minutes

---

**Generated**: Phase 3 Sprint 3 Deployment Guide  
**Last Updated**: Sprint 3 Backend Complete  
**Next Review**: After Frontend UI Complete
