# 👨‍💼 OPERATOR PLAYBOOK — SKAISCRAPER v1.0.0

**Audience**: You (the platform owner)  
**Purpose**: Day-to-day operations, monitoring, and emergency response  
**Context**: This is NOT for users. This is for keeping the lights on.

---

## 📅 DAILY OPERATIONS (5-10 minutes)

### Morning Health Check

**1. Production Verification Dashboard**

```
https://skaiscrape.com/settings/production-verification
```

**Expected**:

- ✅ All 5 checks GREEN
- Environment: `production`
- Commit SHA: Current deployed version

**If any checks FAIL**:

- Note which endpoint failed
- Check Vercel logs (see below)
- Check Vercel deployment status
- Verify environment variables in Vercel dashboard

---

**2. Vercel Logs Review**

Navigate to: **Vercel Dashboard → Logs**

**Filter: Errors in last 24 hours**

```
level:error
```

**Healthy State**:

- <10 errors/day
- No repeated patterns
- Errors are isolated user issues (e.g., invalid input)

**Unhealthy State**:

- > 50 errors/day
- Same error repeated across multiple users
- Database timeout patterns
- AI endpoint failures

**Action if Unhealthy**:

- See [Incident Response](#incident-response) below

---

**3. AI Usage Check**

**Vercel Logs Filter**:

```
event:"ai_estimate_success" OR event:"ai_estimate_failed"
```

**Monitor**:

- Success rate (should be >90%)
- Average duration (should be <5 seconds)
- Failure reasons (rate limit, OpenAI outage, etc.)

**Action if Low Success Rate**:

- Check OpenAI API status: https://status.openai.com
- Check OpenAI usage dashboard (credits remaining)
- Review error messages in logs

---

**4. Upload Health**

**Vercel Logs Filter**:

```
/api/claims/files/upload OR /api/claims/document/upload
```

**Monitor**:

- Upload success rate
- File size trends (approaching limits?)
- CORS errors (should be zero)

**Action if Issues**:

- Check Vercel Blob storage quota
- Verify CORS configuration in Vercel
- Review file validation errors

---

## 📊 WEEKLY OPERATIONS (30-60 minutes)

### Production Smoke Test

**Run automated smoke test**:

```bash
cd /Users/admin/Downloads/preloss-vision-main
./scripts/smoke-prod.sh
```

**Expected**: All endpoints return 200 or 401 (auth required)

**If failures**: Investigate specific endpoints, check recent deployments

---

### Manual Golden Path Verification

**Complete one full claim flow**:

1. Sign in to production
2. Create new client
3. Create new claim for that client
4. Upload 3 photos to claim
5. Navigate to AI tab
6. Click "Generate Estimate"
7. Verify AI artifact appears
8. Navigate to Reports tab
9. Click "Export PDF"
10. Verify PDF downloads with branding

**Total Time**: 5-7 minutes

**If any step fails**: Document the failure, check logs, fix immediately

---

### Review System Metrics

**Vercel Analytics** (if enabled):

- Page load times
- Top pages by traffic
- Error rate trends

**Database**:

- Check connection pool usage
- Review slow query logs (if enabled)
- Monitor database size growth

**Upstash Redis**:

- Check command count
- Monitor rate limit hit rate
- Verify no connection errors

---

### Check for Dependency Updates

**Security updates only** (weekly):

```bash
pnpm audit
```

**If critical vulnerabilities**:

- Review affected packages
- Update if safe (test in preview first)
- Redeploy to production

**Non-security updates**: Monthly or quarterly (not weekly)

---

## 🚨 INCIDENT RESPONSE

### Scenario 1: AI Tools Down

**Symptoms**:

- Users report "AI estimate not generating"
- Logs show: `event:"ai_estimate_failed"`

**Investigation**:

```
# Check Vercel logs
level:error AND /api/ai

# Look for patterns
- Rate limit exceeded?
- OpenAI API key invalid?
- OpenAI service outage?
- Timeout errors?
```

**Quick Fix Options**:

**Option A: Disable AI temporarily**

```bash
# Vercel Dashboard → Environment Variables → Production
NEXT_PUBLIC_AI_TOOLS_ENABLED=false
# Redeploy
```

Users see friendly banner, no error noise

**Option B: Increase rate limits** (if hitting rate limits)

```bash
# Edit src/lib/rate-limit.ts
# Change AI limiter from 10 to 20 requests/min
# Commit, push, deploy
```

**Option C: Switch OpenAI model** (if model down)

```bash
# Update AI endpoint to use different model
# gpt-4o → gpt-4o-mini (fallback)
# Commit, push, deploy
```

**Rollback if needed**:

```bash
git checkout v1.0.0
vercel --prod
```

---

### Scenario 2: Upload Failures

**Symptoms**:

- Users report "photo upload failed"
- Logs show: `/api/claims/files/upload AND level:error`

**Investigation**:

```
# Check error messages
- "File too large"? → Expected, validate client-side
- "CORS error"? → Vercel Blob configuration issue
- "Storage quota exceeded"? → Upgrade Vercel plan
- "Timeout"? → File too large or network issue
```

**Quick Fixes**:

**Option A: Disable uploads temporarily**

```bash
NEXT_PUBLIC_UPLOADS_ENABLED=false
# Redeploy
```

**Option B: Increase file size limits** (if too restrictive)

```typescript
// src/lib/upload-validation.ts
MAX_FILE_SIZE: 100 * 1024 * 1024; // 100MB (from 50MB)
```

**Option C: Upgrade Vercel Blob storage**

- Vercel Dashboard → Storage → Upgrade plan

---

### Scenario 3: Database Timeouts

**Symptoms**:

- Multiple routes timing out
- Logs show: `(prisma OR database) AND (timeout OR level:error)`

**Investigation**:

```
# Check which queries are slow
# Look for patterns:
- Specific routes?
- Specific times of day?
- After recent deployment?
```

**Quick Fixes**:

**Option A: Maintenance mode** (while investigating)

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Database maintenance. Back in 15 minutes."
# Redeploy
```

**Option B: Increase connection pool**

```
# Update DATABASE_URL connection limit
?connection_limit=10 → ?connection_limit=20
```

**Option C: Add database indexes** (if specific query slow)

```sql
-- Identify slow query from logs
-- Add index to speed it up
CREATE INDEX idx_claims_org_id ON claims(organization_id);
```

**Option D: Rollback to last known good**

```bash
git log --oneline | head -10
# Identify commit before issue
git checkout <commit-sha>
vercel --prod
```

---

### Scenario 4: Auth Loops

**Symptoms**:

- Users stuck at sign-in
- Logs show: `(clerk OR auth) AND level:error`

**Investigation**:

```
# Common causes:
- Clerk redirect URLs misconfigured
- Environment variables missing
- Middleware blocking incorrectly
```

**Quick Fixes**:

**Option A: Verify Clerk configuration**

```
Clerk Dashboard → Configure → Paths
- Sign-in URL: https://skaiscrape.com/sign-in
- Sign-up URL: https://skaiscrape.com/sign-up
- After sign-in: https://skaiscrape.com/dashboard
- Allowed origins: https://skaiscrape.com
```

**Option B: Check environment variables**

```
Vercel Dashboard → Environment Variables
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- NEXT_PUBLIC_CLERK_SIGN_IN_URL
- NEXT_PUBLIC_CLERK_SIGN_UP_URL
```

**Option C: Disable sign-ups temporarily**

```bash
NEXT_PUBLIC_SIGNUPS_ENABLED=false
# Existing users can still sign in
# New sign-ups blocked until fixed
```

---

### Scenario 5: Costs Spiking

**Symptoms**:

- Vercel usage alerts
- OpenAI usage alerts
- Unexpected charges

**Investigation**:

```
# Check which service is spiking
- Vercel bandwidth?
- Vercel serverless function executions?
- OpenAI API calls?
- Vercel Blob storage?
```

**Quick Fixes**:

**Option A: Rate limit AI more aggressively**

```typescript
// src/lib/rate-limit.ts
rateLimiters.ai; // Change from 10 to 5 requests/min
```

**Option B: Disable AI tools**

```bash
NEXT_PUBLIC_AI_TOOLS_ENABLED=false
```

**Option C: Disable uploads**

```bash
NEXT_PUBLIC_UPLOADS_ENABLED=false
```

**Option D: Maintenance mode** (nuclear option)

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Scheduled maintenance. Back in 1 hour."
```

**Option E: Contact support**

- Vercel support (if Vercel costs)
- OpenAI support (if API abuse)

---

## 🔄 ROLLBACK PROCEDURES

### Rollback to v1.0.0 (This Release)

```bash
# 1. Checkout tag
git checkout v1.0.0

# 2. Reinstall dependencies
pnpm install

# 3. Regenerate Prisma client
npx prisma generate

# 4. Build
pnpm build

# 5. Deploy to production
vercel --prod

# 6. Verify
./scripts/smoke-prod.sh
```

---

### Rollback to Previous Commit

```bash
# 1. Find commit
git log --oneline | head -20

# 2. Checkout commit
git checkout <commit-sha>

# 3. Reinstall, rebuild, redeploy
pnpm install
npx prisma generate
pnpm build
vercel --prod
```

---

### Emergency Hotfix Workflow

```bash
# 1. Create hotfix branch from production tag
git checkout -b hotfix/critical-fix v1.0.0

# 2. Make minimal fix
# Edit only the affected file(s)

# 3. Test locally
pnpm dev
# Verify fix works

# 4. Commit
git add -A
git commit -m "hotfix: [description]"

# 5. Push and deploy
git push origin hotfix/critical-fix
vercel --prod

# 6. After verification, merge to main
git checkout main
git merge hotfix/critical-fix
git push origin main

# 7. Tag new patch version
git tag -a v1.0.1 -m "Hotfix: [description]"
git push origin v1.0.1
```

---

## 📈 GROWTH INDICATORS (HEALTHY STATE)

### User Activity

- New sign-ups: Steady or growing
- Daily active users: >50% of registered users
- Claims created per day: Growing trend
- AI estimates generated: >70% of claims have AI data
- PDFs exported: >50% of claims exported

### Technical Health

- Error rate: <1% of total requests
- Average response time: <2 seconds
- Uptime: >99.5%
- Database queries: <100ms average
- AI generation: <5 seconds average

### Cost Metrics

- Cost per user: Decreasing (economies of scale)
- AI cost per estimate: <$0.50
- Storage cost per GB: Within Vercel plan
- Total monthly costs: Predictable, no spikes

---

## 🛠️ TOOLS REFERENCE

### Production URLs

**Public**:

- Production site: https://skaiscrape.com
- Sign-in: https://skaiscrape.com/sign-in
- Sign-up: https://skaiscrape.com/sign-up

**Admin/Internal**:

- Production verification: https://skaiscrape.com/settings/production-verification
- Health checks: https://skaiscrape.com/api/health (multiple endpoints)

**External Services**:

- Vercel Dashboard: https://vercel.com/dashboard
- Clerk Dashboard: https://dashboard.clerk.com
- OpenAI Dashboard: https://platform.openai.com
- Upstash Console: https://console.upstash.com
- GitHub Repo: https://github.com/Damienwillingham-star/Skaiscraper

---

### Key Documentation

**Operational**:

- [OPERATOR_PLAYBOOK.md](OPERATOR_PLAYBOOK.md) (this file)
- [RUNTIME_TOGGLES.md](RUNTIME_TOGGLES.md) - Kill switch documentation
- [VERCEL_LOGS_PLAYBOOK.md](VERCEL_LOGS_PLAYBOOK.md) - Log search patterns
- [DOMAIN_CANONICAL_CHECKLIST.md](DOMAIN_CANONICAL_CHECKLIST.md) - Production verification

**Release**:

- [RELEASE_BASELINE.md](RELEASE_BASELINE.md) - v1.0.0 reference
- [GIT_TAG_PROCESS.md](GIT_TAG_PROCESS.md) - Versioning guide
- [LAUNCH_READINESS_COMPLETE.md](../LAUNCH_READINESS_COMPLETE.md) - Launch features

**Testing**:

- [RELEASE_QA_CHECKLIST.md](RELEASE_QA_CHECKLIST.md) - Manual QA
- [POST_LAUNCH_24_HOUR_CHECK.md](POST_LAUNCH_24_HOUR_CHECK.md) - First 24hr checklist
- `scripts/smoke-prod.sh` - Automated smoke test

---

## 🎯 WEEKLY CHECKLIST (COPY THIS)

**Week of: ****\_\_\_******

**Daily** (Mon-Fri):

- [ ] Check production verification page (all green?)
- [ ] Review Vercel logs for errors (<10/day?)
- [ ] Spot-check AI usage (success rate >90%?)

**Weekly**:

- [ ] Run smoke test (`./scripts/smoke-prod.sh`)
- [ ] Complete one manual golden path (claim → upload → AI → PDF)
- [ ] Review system metrics (analytics, database, Redis)
- [ ] Check for security updates (`pnpm audit`)

**As Needed**:

- [ ] Incident response (document in runbook)
- [ ] Rollback procedure (if deployment fails)
- [ ] Hotfix workflow (if critical bug)

---

## 📞 ESCALATION PATHS

### Technical Issues

1. Check logs (Vercel, Clerk, OpenAI, Upstash)
2. Review recent deployments (GitHub, Vercel)
3. Consult documentation (this playbook)
4. Test rollback in preview environment
5. Execute rollback to production (if needed)
6. Contact vendor support (Vercel, Clerk, OpenAI)

### Business Issues

1. Document user complaints
2. Reproduce issue in production
3. Estimate impact (how many users?)
4. Decide: Fix forward or rollback?
5. Communicate ETA to affected users
6. Post-mortem after resolution

---

**Last Updated**: December 20, 2025  
**Owner**: Platform Owner  
**Status**: ✅ Active for v1.0.0
