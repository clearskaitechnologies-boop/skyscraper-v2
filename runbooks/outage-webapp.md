# Runbook: Outage — Web App (Next.js + API)

## Purpose

Guide responders through diagnosing and mitigating a live web/API outage (5xx spike or app down).

## Detection

- Pager / monitoring alert: 5xx rate > threshold or synthetic test failing
- Users report site unreachable or API returning 5xx

## Immediate Steps

1. Triage & communicate
   - Announce on Slack #incident and create/update Status Page.
   - Record incident start time and impacts.

2. Check health panels
   - Verify recent deploys/releases (Git SHA) and rollouts.
   - Check host/Pod counts, CPU, memory, and error logs.

3. Quick mitigations
   - If a recent deploy caused the issue, roll back to previous release.
   - If DB is saturated, scale read replicas or reduce app pool size.
   - If S3/Supabase is failing, verify provider status and fallback cached previews.

4. Inspect logs
   - Pull structured logs from log store (DataDog/ELK) and search for stack traces.
   - Look for OOM, DB errors, auth errors, or external API timeouts.

5. If worker queue backlog present
   - Check job queue metrics (Redis/Postgres) and worker health.
   - Scale workers or pause non-critical jobs.

6. Postmortem actions
   - Root cause analysis, remediation, and distribute postmortem.
   - Add synthetic tests or alerts to catch this earlier.

## Escalation

- If not resolved within 30 minutes, escalate to on-call SRE/Engineer and incident commander.
