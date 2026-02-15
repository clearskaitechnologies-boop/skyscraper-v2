# Runbook: Weather Provider Degraded

## Purpose

Runbook to handle degraded results or outages from weather / verification providers (NOAA, HailTrace, etc.).

## Detection

- Increase in low-confidence weather verifications
- Provider status page reports degraded service

## Steps

1. Failover
   - If configured, flip environment flag to fallback provider (OpenWeather/Open-Meteo).

2. Mark results
   - Tag recent verifications as `low_confidence` and show an in-app banner.

3. Queue for reprocessing
   - Re-queue requests for later reprocessing against primary once restored.

4. Notify
   - Notify product, ops, and affected customers via status page.

5. Postmortem
   - Consider multi-provider strategy and SLA negotiation.
