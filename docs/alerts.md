# Alerts & Monitoring Setup

This guide covers setting up production alerts and external monitoring for SkaiScraper.

## Vercel Alerts

Enable alerts in the [Vercel Dashboard](https://vercel.com/dashboard) → Project Settings → Alerts.

### 1. 5xx Error Alert

**When to alert:** Server errors indicate backend failures that need immediate attention.

**Configuration:**

- **Metric:** Error count
- **Threshold:** 5 errors in 1 minute
- **Notification channels:** Email, Slack, PagerDuty
- **Why:** Catches critical backend failures before they affect many users

**Setup:**

1. Go to Project → Settings → Alerts
2. Click "Add Alert"
3. Select "Error Rate"
4. Set threshold: 5 errors / 1 minute
5. Add notification channels

### 2. High Latency Alert

**When to alert:** Slow response times degrade user experience.

**Configuration:**

- **Metric:** p95 response time
- **Threshold:** > 2000ms
- **Notification channels:** Email
- **Why:** Detects performance degradation before it becomes critical

**Setup:**

1. Project → Settings → Alerts
2. "Add Alert" → "Response Time"
3. Set p95 threshold: 2000ms
4. Add email notification

### 3. Build Failure Alert

**Always enabled by default** - notifies when deployments fail.

## External Uptime Monitoring

Use a third-party service to monitor availability from outside Vercel's infrastructure.

### Recommended Services

| Service                                 | Free Tier         | Interval     | Best For              |
| --------------------------------------- | ----------------- | ------------ | --------------------- |
| [UptimeRobot](https://uptimerobot.com)  | 50 monitors, 5min | 5 minutes    | Simple uptime checks  |
| [Better Stack](https://betterstack.com) | 10 monitors, 1min | 1-60 seconds | Advanced alerting     |
| [Pingdom](https://www.pingdom.com)      | 14-day trial      | Varies       | Enterprise monitoring |

### Setup Guide (UptimeRobot Example)

1. **Create Account:** [https://uptimerobot.com/register](https://uptimerobot.com/register)

2. **Add Monitor:**
   - Type: HTTP(s)
   - Friendly Name: "SkaiScraper Health Check"
   - URL: `https://skaiscrape.com/api/health/live`
   - Monitoring Interval: 5 minutes

3. **Expected Response:**

   ```json
   {
     "status": "ok",
     "service": "skaiscraper",
     "version": "3.0.0",
     "env": {
       "hasDatabase": true,
       "hasClerk": true
     }
   }
   ```

4. **Alert Conditions:**
   - HTTP status ≠ 200
   - Response time > 5000ms
   - Response body missing `"status":"ok"`
   - 3 consecutive failures

5. **Notification Channels:**
   - Email
   - SMS (paid plans)
   - Slack webhook
   - PagerDuty

## Health Endpoint Details

### `/api/health/live` (Liveness Probe)

**Purpose:** Always returns 200 OK if the application is running.

**Checks:**

- Environment variables present (`DATABASE_URL`, Clerk keys)
- Server process responding

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-31T15:07:09.503Z",
  "service": "skaiscraper",
  "version": "3.0.0",
  "env": {
    "hasDatabase": true,
    "hasClerk": true
  }
}
```

**When to use:** External uptime monitors, Kubernetes liveness probes

---

### `/api/health/ready` (Readiness Probe)

**Purpose:** Returns 200 OK only when the application can serve traffic.

**Checks:**

- Database connectivity (actual query to PostgreSQL)
- Prisma client operational

**Response (healthy):**

```json
{
  "status": "ready",
  "timestamp": "2025-10-31T15:07:09.554Z",
  "checks": {
    "database": "ok",
    "prisma": "ok"
  },
  "service": "skaiscraper",
  "version": "3.0.0"
}
```

**Response (unhealthy):**

```json
{
  "status": "degraded",
  "checks": {
    "database": "error",
    "prisma": "stub"
  }
}
```

HTTP Status: 503 Service Unavailable

**When to use:** Load balancer health checks, Kubernetes readiness probes

---

## Alert Response Playbook

### 5xx Errors Spike

1. **Check Sentry:** Review error details and stack traces
2. **Check Vercel Logs:** Filter by 500-599 status codes
3. **Common causes:**
   - Database connection failures → Check Supabase/Neon status
   - Clerk auth issues → Verify API keys in Vercel env
   - External API timeouts → Check third-party service status
4. **Immediate fix:** Rollback to last known good deployment if issue widespread

### High Latency

1. **Check Vercel Analytics:** Identify slow routes
2. **Common causes:**
   - Unoptimized database queries → Review Prisma queries, add indexes
   - Large bundle size → Run `ANALYZE=true pnpm build` to check bundle
   - Cold starts → Consider warming endpoints or upgrading plan
3. **Investigate:** Look for N+1 queries, missing database indexes, oversized images

### Uptime Monitor Down

1. **Verify:** Check `/api/health/live` manually in browser
2. **If actually down:**
   - Check Vercel deployment status
   - Review recent deployments for breaking changes
   - Check Vercel status page: [status.vercel.com](https://status.vercel.com)
3. **If false alarm:** Adjust uptime monitor sensitivity/timeout

---

## Environment Variables Checklist

Ensure these are set in **Vercel → Project Settings → Environment Variables → Production**:

### Sentry (Error Tracking)

```bash
SENTRY_DSN=https://...@....ingest.sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.sentry.io/...  # Optional
SENTRY_AUTH_TOKEN=sntrys_...  # For source map upload
SENTRY_ORG=skaiscraper
SENTRY_PROJECT=preloss-vision
```

### Monitoring & Testing

```bash
# For authenticated E2E tests
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=secure_test_password

# For rate limiting (optional)
UPSTASH_REDIS_REST_URL=https://...upstash.io
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Monitoring Dashboard

Consider setting up a unified dashboard with:

- Vercel Analytics (built-in)
- Sentry Performance Monitoring
- External uptime status page (Better Stack, StatusCake)

**Next steps:**

1. Enable Vercel Alerts (5xx + latency)
2. Set up UptimeRobot monitor
3. Configure Sentry DSN and auth token
4. Test `/api/dev/throw` in staging to verify error ingestion
5. Review alerts monthly and adjust thresholds
