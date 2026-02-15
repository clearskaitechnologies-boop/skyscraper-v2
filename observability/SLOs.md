# Observability & SLOs — SkaiScraper

Service: Web App + API (Next.js + Node)

## SLA (external)

- 99.9% monthly uptime

## SLOs (internal)

- Availability: 99.95% app endpoints (p75)
- Latency: p95 < 400ms for /reports/\*, p99 < 800ms
- Errors: < 0.5% 5xx per 1h
- LCP: p75 < 2.5s on /reports/preview, p95 < 3.5s
- Job success: renderEngine pdf_success_rate ≥ 99.5%

## Alert thresholds

- 5xx rate > 1% for 5m (HIGH)
- Latency p95 > 800ms for 10m (HIGH)
- LHCI < 90 on main branch (BLOCK PR)
- Queue backlog > 100 jobs for 10m (HIGH)
- S3 upload failures > 3% over 10m (MED)

## Observability stack (recommended)

- Logging: structured JSON (pino) → log store (DataDog / ELK)
- Metrics: OpenTelemetry → Prometheus → Grafana dashboards
- Tracing: OpenTelemetry → Jaeger/Tempo or DataDog
- RUM: Vercel Analytics or Sentry Performance
- Error tracking: Sentry

## Dashboards to build

- API errors by route and 5xx rate
- Render queue health and job success rate
- LCP and other Core Web Vitals for /reports/preview
- Token usage & spikes (token ledger ingestion rate)
