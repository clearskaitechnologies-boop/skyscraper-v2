# Runbook: PDF Render Failures

## Purpose

Handle failures in server-side PDF rendering or renderEngine queue.

## Detection

- Alerts:
  - Render job failure rate > 1% over 10m
  - Queue backlog > 100 jobs for 10m

## Immediate Steps

1. Identify failing jobs
   - Query the render queue table for recent failures and extract job payloads.

2. Inspect logs
   - Worker logs (render worker host) for stack traces.
   - Sharp/imagick errors, OOM, or file permission issues.
   - S3/Supabase upload errors (403/404).

3. Mitigation
   - Requeue failed jobs with exponential backoff; cap retries at 3.
   - Serve cached preview or last-successful PDF (mark confidence=low).
   - Pause new heavy jobs from UI if backlog is rising.

4. Recovery
   - Fix upstream (increase memory, update libvips/sharp, correct perm).
   - Re-run failed jobs after fix.

5. Postmortem
   - Add monitoring for job success rate and increase test coverage for edge cases.
