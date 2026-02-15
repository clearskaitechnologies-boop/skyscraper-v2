# 📊 VERCEL LOGS PLAYBOOK

**Purpose**: Quick reference for finding and analyzing production errors  
**Last Updated**: December 20, 2025

---

## 🔍 ACCESSING VERCEL LOGS

### Method 1: Vercel Dashboard (Recommended)

1. Navigate to https://vercel.com/dashboard
2. Select your project (SkaiScraper)
3. Click **"Logs"** in the sidebar
4. Set time range (Last hour / 24 hours / 7 days)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# View real-time logs (production)
vercel logs --follow

# View logs for specific deployment
vercel logs <deployment-url>
```

---

## 🎯 CRITICAL LOG FILTERS

### Filter 1: All Errors (Last Hour)

**Dashboard Filter**:

```
level:error
```

**Use Case**: Quick scan for all failures  
**Expected**: Should be near-zero in healthy production

### Filter 2: AI Endpoint Errors

**Dashboard Filter**:

```
/api/ai AND (level:error OR status:500)
```

**Use Case**: Debug AI tool failures  
**Look For**:

- OpenAI API errors
- Rate limit exceeded
- Token limit exceeded
- Timeout errors

### Filter 3: Upload Failures

**Dashboard Filter**:

```
(/api/claims/files/upload OR /api/claims/document/upload) AND level:error
```

**Use Case**: Debug file upload issues  
**Look For**:

- File size exceeded
- MIME type validation errors
- Storage upload failures
- CORS errors

### Filter 4: Auth Failures

**Dashboard Filter**:

```
(clerk OR auth OR /api/auth) AND level:error
```

**Use Case**: Debug authentication issues  
**Look For**:

- Invalid session tokens
- Missing auth headers
- Clerk API errors
- Org context errors

### Filter 5: Database Errors

**Dashboard Filter**:

```
(prisma OR database OR db) AND level:error
```

**Use Case**: Debug database connectivity/query issues  
**Look For**:

- Connection pool exhausted
- Query timeouts
- Schema validation errors
- Constraint violations

### Filter 6: API Route Timeouts

**Dashboard Filter**:

```
status:504 OR timeout
```

**Use Case**: Find slow/hanging endpoints  
**Look For**:

- AI generation timeouts
- Large file processing
- Complex database queries

---

## 📋 STRUCTURED LOG PATTERNS

Our logging utilities (`src/lib/log.ts`) output JSON with these fields:

```json
{
  "timestamp": "2025-12-20T10:30:45.123Z",
  "level": "error",
  "event": "ai_estimate_failed",
  "context": {
    "orgId": "org_abc123",
    "userId": "user_xyz789",
    "claimId": "claim_123",
    "route": "/api/claims/[claimId]/ai"
  },
  "error": {
    "name": "OpenAIError",
    "message": "Rate limit exceeded",
    "stack": "..."
  },
  "env": "production",
  "commitSha": "5d7d4b07"
}
```

### Search by Event Name

**Dashboard Filter**:

```
event:"ai_estimate_failed"
```

### Search by Org

**Dashboard Filter**:

```
orgId:"org_abc123"
```

### Search by User

**Dashboard Filter**:

```
userId:"user_xyz789"
```

### Search by Claim

**Dashboard Filter**:

```
claimId:"claim_123"
```

---

## 🚨 INCIDENT RESPONSE PLAYBOOK

### Scenario 1: AI Tools Not Working

**Symptoms**: Users report AI estimate/supplement buttons don't work

**Investigation Steps**:

1. **Check Logs**:
   ```
   /api/ai AND level:error
   ```
2. **Look For**:
   - OpenAI API errors
   - Missing API keys
   - Rate limit exceeded
3. **Verify**:
   - `OPENAI_API_KEY` is set in Vercel env vars
   - OpenAI account has credits
   - OpenAI API status: https://status.openai.com

**Fix**:

- If rate limited: Wait 1 minute or upgrade OpenAI plan
- If no credits: Add credits to OpenAI account
- If key missing: Set env var and redeploy

### Scenario 2: Upload Failures

**Symptoms**: Users can't upload photos/documents

**Investigation Steps**:

1. **Check Logs**:
   ```
   /api/claims/files/upload AND level:error
   ```
2. **Look For**:
   - File size exceeded errors
   - CORS errors
   - Storage upload failures
3. **Verify**:
   - Vercel Blob storage is configured
   - CORS settings allow production domain
   - File size limits are reasonable (check max in route)

**Fix**:

- If CORS: Update Vercel Blob CORS settings
- If size limit: Adjust `MAX_FILE_SIZE` in upload routes
- If storage quota: Upgrade Vercel plan or clean old files

### Scenario 3: Auth Loops

**Symptoms**: Users stuck in redirect loop between sign-in and dashboard

**Investigation Steps**:

1. **Check Logs**:
   ```
   clerk AND (redirect OR middleware)
   ```
2. **Look For**:
   - Missing auth session
   - Middleware blocking authenticated routes
   - Clerk callback errors
3. **Verify**:
   - Clerk allowed redirect URLs include production domain
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard` is set
   - Middleware.ts is not blocking `/dashboard`

**Fix**:

- Update Clerk dashboard allowed URLs
- Verify env vars in Vercel
- Check middleware.ts matcher patterns

### Scenario 4: Database Timeouts

**Symptoms**: Pages load slowly or timeout

**Investigation Steps**:

1. **Check Logs**:
   ```
   (prisma OR database) AND (timeout OR slow)
   ```
2. **Look For**:
   - Connection pool exhausted
   - N+1 query patterns
   - Missing database indexes
3. **Verify**:
   - Database connection limit not reached
   - Prisma connection pool settings
   - Recent schema changes

**Fix**:

- Add database indexes for slow queries
- Optimize Prisma queries (use `include` carefully)
- Upgrade database plan if connection limit hit

---

## 🔎 ADVANCED SEARCH PATTERNS

### Find All 500 Errors in Last 24 Hours

```
status:500
```

### Find Errors for Specific User

```
userId:"user_xyz789" AND level:error
```

### Find Slow Requests (>5s)

```
duration:>5000
```

### Find Errors After Specific Deployment

```
commitSha:"5d7d4b07" AND level:error
```

### Find CORS Errors

```
CORS OR "Cross-Origin"
```

---

## 📈 MONITORING BEST PRACTICES

### Daily Health Check

1. Open Vercel Dashboard → Logs
2. Filter: `level:error` (last 24 hours)
3. Expected: <10 errors per day
4. Investigate any spikes

### Weekly Review

1. Filter: `level:error` (last 7 days)
2. Group by `event` field
3. Identify recurring patterns
4. Create tickets for top 3 error types

### Post-Deployment Verification

1. Deploy new version
2. Wait 10 minutes
3. Filter: `commitSha:"<new-sha>" AND level:error`
4. Expected: Zero new error types
5. If errors found: rollback or hotfix

---

## 🛠️ TROUBLESHOOTING TIPS

### Can't Find Logs?

- **Issue**: No logs appearing in dashboard
- **Fix**: Ensure deployment is production (not preview)
- **Verify**: Check that deployment URL matches production domain

### Logs Missing Context?

- **Issue**: Logs don't show orgId/userId
- **Fix**: Ensure routes use `src/lib/log.ts` utilities
- **Add**: `logError("event_name", { orgId, userId, claimId }, error)`

### Too Many Logs?

- **Issue**: Dashboard overwhelming with info logs
- **Fix**: Use filters to hide noise
- **Pattern**: `level:error OR level:warn` (hide info)

---

## 📞 ESCALATION PATHS

### Critical Production Issue (Site Down)

1. Enable maintenance mode:
   ```bash
   # Vercel Dashboard → Environment Variables
   NEXT_PUBLIC_MAINTENANCE_MODE=true
   ```
2. Redeploy to activate
3. Check logs for root cause
4. Fix and redeploy
5. Disable maintenance mode

### Data Integrity Issue

1. Pause new user sign-ups (if needed)
2. Export recent logs:
   ```bash
   vercel logs > incident-logs.txt
   ```
3. Review database state
4. Create database backup
5. Fix data + deploy fix
6. Re-enable sign-ups

### Performance Degradation

1. Check Vercel Analytics for slow routes
2. Filter logs: `duration:>3000`
3. Identify bottleneck (DB query / API call / AI generation)
4. Add caching or optimize query
5. Deploy fix
6. Monitor for 24 hours

---

## 🔗 RELATED RESOURCES

- **Vercel Logs Docs**: https://vercel.com/docs/observability/runtime-logs
- **Logging Utilities**: [src/lib/log.ts](../src/lib/log.ts)
- **Production Verification**: https://skaiscrape.com/settings/production-verification
- **Domain Checklist**: [DOMAIN_CANONICAL_CHECKLIST.md](./DOMAIN_CANONICAL_CHECKLIST.md)

---

## 📝 QUICK REFERENCE

| Event Name             | Route                        | Severity | Fix                            |
| ---------------------- | ---------------------------- | -------- | ------------------------------ |
| `ai_estimate_failed`   | `/api/claims/[claimId]/ai`   | High     | Check OpenAI API key + credits |
| `file_upload_failed`   | `/api/claims/files/upload`   | Medium   | Check storage config + CORS    |
| `auth_session_invalid` | Middleware                   | High     | Verify Clerk config + env vars |
| `database_timeout`     | Various                      | Critical | Add indexes or upgrade DB plan |
| `pdf_export_failed`    | `/api/claims/.../export-pdf` | Medium   | Check PDF generation utils     |

**Legend**:

- **High**: Impacts users, fix within 1 hour
- **Medium**: Degraded UX, fix within 4 hours
- **Critical**: Site down or data loss, fix immediately
