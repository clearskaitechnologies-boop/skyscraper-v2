# AI Sentinel Setup Guide

This document explains how to set up the AI Sentinel microservice for monitoring and governance.

## Overview

The AI Sentinel system consists of:

- **App Logging**: Events are logged to `app_logs` table via `logEvent()`
- **Sentinel Service**: FastAPI microservice that analyzes events
- **Policy Engine**: Evaluates incidents and triggers alerts
- **Governance UI**: React dashboards for monitoring

## Database Setup

All required tables are created via the migration:

- `app_logs` - Event logs
- `ai_audit_insights` - AI-detected insights
- `ai_incidents` - Correlated incidents
- `policy_suppression_rules` - Noise suppression
- `policy_escalations` - Alert escalation policies
- `policy_incident_actions` - Audit trail

## Sentinel Microservice

### Deploy the Sentinel Service

Create a new service (e.g., on Railway, Render, or Fly.io) with this `app.py`:

```python
from fastapi import FastAPI, Request, Header
from typing import Optional
import statistics, os, hmac, hashlib, aiohttp

app = FastAPI()

SECRET = os.getenv("SENTINEL_SHARED_SECRET", "")
POLICY_URL = os.getenv("CLEARSKAI_POLICY_URL")
POLICY_SIG = os.getenv("POLICY_SHARED_SECRET", "")

@app.post('/analyze')
async def analyze(request: Request, x_sentinel_signature: Optional[str] = Header(None)):
    body = await request.body()

    # Verify signature if SECRET is set
    if SECRET:
        if not x_sentinel_signature:
            return {"error": "unauthorized"}
        mac = hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
        if not hmac.compare_digest(mac, x_sentinel_signature):
            return {"error": "unauthorized"}

    data = await request.json()
    events = data.get('events', [])

    # Simple heuristic: mean risk and volume spike
    risks = [float(e.get('risk', 0) or 0) for e in events]
    mean = statistics.mean(risks) if risks else 0.0
    volume = len(events)
    incident = (volume >= 50) or any(r > max(0.8, mean * 2.5) for r in risks)
    confidence = min(1.0, max(mean, 0.1 + 0.02*volume))
    message = f"batch={volume}, meanRisk={mean:.2f}"

    # Call back the policy engine
    if POLICY_URL:
        payload = {"incident": incident, "confidence": confidence, "message": message}
        headers = {"Content-Type": "application/json"}
        if POLICY_SIG:
            sig = hmac.new(POLICY_SIG.encode(), str(payload).encode(), hashlib.sha256).hexdigest()
            headers["x-policy-signature"] = sig
        async with aiohttp.ClientSession() as s:
            await s.post(POLICY_URL, json=payload, headers=headers)

    return {"incident": incident, "confidence": confidence, "message": message}
```

### Environment Variables

Set these in your Sentinel deployment:

```bash
SENTINEL_SHARED_SECRET=<long-random-string>
CLEARSKAI_POLICY_URL=https://your-app.com/functions/v1/policy-evaluate
POLICY_SHARED_SECRET=<another-long-random-string>
```

## Application Integration

### 1. Add Event Logging

Use `logEvent()` throughout your app:

```typescript
import { logEvent } from "@/lib/logEvent";

// Example: Log incident creation
await logEvent("status-incident-create", {
  tenant_id,
  risk: 0.4,
  metadata: { severity, title },
});

// Example: Log role change
await logEvent("auth.role-change", {
  risk: 0.7,
  metadata: { target: userId, from: oldRole, to: newRole },
});
```

### 2. Set Up Periodic Batching

Create an edge function to batch events to Sentinel every 5-10 minutes:

```typescript
// supabase/functions/sentinel-flush/index.ts
const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const { data: events } = await supabase.from("app_logs").select("*").gte("created_at", since);

const response = await fetch(SENTINEL_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-sentinel-signature": sign(SECRET, JSON.stringify({ events })),
  },
  body: JSON.stringify({ events }),
});
```

Schedule this via:

- Supabase cron job
- GitHub Actions
- External cron service (e.g., cron-job.org)

### 3. Create Policy Evaluation Endpoint

```typescript
// supabase/functions/policy-evaluate/index.ts
const { incident, confidence, message } = await req.json();

if (incident) {
  await supabase.from("ai_audit_insights").insert({
    category: "Anomaly",
    confidence,
    message,
  });

  // Send Slack alert for high-confidence incidents
  if (confidence > 0.8) {
    await sendSlackAlert(`🚨 HIGH: ${message}`);
  }
}
```

## Slack Integration

Add Slack webhook URL as a Supabase secret:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX/YYY/ZZZ
```

## Accessing the UI

Navigate to these pages (add routes in your app):

- `/ai-insights` - View AI-detected anomalies
- `/governance` - Manage incidents
- `/governance/rules` - Configure suppression rules

## Rate Limiting (Optional)

For high-risk endpoints like incident creation, add rate limiting:

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const limiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});

const { success } = await limiter.limit(`incident:${userId}`);
if (!success) {
  return new Response("Too Many Requests", { status: 429 });
}
```

## Best Practices

1. **Log strategically**: Focus on security-sensitive events (auth, role changes, payments, data access)
2. **Set risk scores**: High-risk events (0.7-1.0) trigger faster alerts
3. **Use suppression rules**: Mute expected spikes (e.g., during backfills)
4. **Review regularly**: Check the governance dashboard weekly
5. **Document incidents**: Add comments when acknowledging/resolving

## Troubleshooting

### No insights appearing

- Check if events are being logged to `app_logs`
- Verify Sentinel service is running
- Check edge function logs for errors

### Too many false positives

- Create suppression rules for noisy events
- Adjust Sentinel thresholds (in `app.py`)
- Increase confidence thresholds in escalation policies

### Slack alerts not working

- Verify `SLACK_WEBHOOK_URL` is set correctly
- Check policy-evaluate function logs
- Test webhook directly with curl
