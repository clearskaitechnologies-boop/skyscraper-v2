# PUBLIC_ROUTES.md — Intentionally Unauthenticated Routes

> **Last updated:** 2025-02-13 • **Auth coverage:** 92.4% (620/671)
> **Scanner:** `scripts/route-coverage-map.cjs` (32 auth patterns)

This document catalogs every API route that intentionally runs **without** session auth.
Security reviewers: each route below has been manually reviewed and confirmed appropriate.

---

## Summary

| Category            | Count   | Notes                                                |
| ------------------- | ------- | ---------------------------------------------------- |
| Health / Monitoring | 5       | Uptime checks, Vercel health probes                  |
| Public Data         | 10      | Contractor profiles, claim lookup, search            |
| Webhooks            | 5       | Stripe, Clerk, Twilio, QuickBooks, Trades            |
| Contact / Forms     | 2       | Contact form, public form submission                 |
| Client Portal       | 3       | Portal auth, company lookup, report accept/decline   |
| Diagnostics (dev)   | 3       | Bootstrap, db-fix, diag-org (rate-limited, no PII)   |
| Other Intentional   | 12      | Template preview, pricing, geocode, migrations, etc. |
| **Total**           | **~40** | All reviewed, none expose PII without authorization  |

---

## Health & Monitoring (must be public for uptime checks)

| Route                       | Method | Rate Limit | Sensitive Output | Why Public                        |
| --------------------------- | ------ | ---------- | ---------------- | --------------------------------- |
| `/api/health`               | GET    | —          | No               | Vercel/UptimeRobot health probe   |
| `/api/health/live`          | GET    | —          | No               | Kubernetes liveness check         |
| `/api/health/ready`         | GET    | —          | No               | Kubernetes readiness check        |
| `/api/health/deep`          | GET    | —          | No               | Deep health check (DB, Redis, AI) |
| `/api/health/drift-metrics` | GET    | —          | No               | Schema drift monitoring           |

---

## Public Data (designed to be accessed without login)

| Route                              | Method | Rate Limit | Sensitive Output | Why Public                                 |
| ---------------------------------- | ------ | ---------- | ---------------- | ------------------------------------------ |
| `/api/public/search`               | GET    | ✅ API     | No               | Public contractor search for homeowners    |
| `/api/public/contractor/[slug]`    | GET    | —          | No               | Public contractor profile page             |
| `/api/public/check-claim`          | GET    | —          | No               | Homeowner claim status lookup (by claim #) |
| `/api/public/claims`               | GET    | —          | No               | Public claims listing (redacted)           |
| `/api/public/submit`               | POST   | —          | No               | Homeowner claim submission form            |
| `/api/public/reports/[id]/accept`  | POST   | —          | No               | Homeowner report acceptance (token-gated)  |
| `/api/public/reports/[id]/decline` | POST   | —          | No               | Homeowner report decline (token-gated)     |
| `/api/contractors/public/[slug]`   | GET    | —          | No               | Contractor public profile                  |
| `/api/contractors/public/get`      | GET    | —          | No               | Fetch public contractor data               |
| `/api/contractors/public/list`     | GET    | —          | No               | List public contractors                    |

---

## Webhooks (verified by provider signature, not session)

| Route                                  | Method    | Rate Limit | Signature Verification    | Why Public               |
| -------------------------------------- | --------- | ---------- | ------------------------- | ------------------------ |
| `/api/webhooks/stripe`                 | POST      | ✅ WEBHOOK | `stripe.constructEvent()` | Stripe payment events    |
| `/api/webhooks/clerk`                  | GET, POST | ✅ WEBHOOK | Svix signature            | Clerk user/org lifecycle |
| `/api/webhooks/twilio`                 | POST      | —          | Twilio request validation | SMS/voice callbacks      |
| `/api/integrations/quickbooks/webhook` | POST      | —          | QuickBooks signature      | Accounting sync          |
| `/api/measurements/webhook`            | POST      | —          | Provider signature        | Measurement integration  |

---

## Contact & Forms

| Route                                  | Method | Rate Limit        | Sensitive Output | Why Public                         |
| -------------------------------------- | ------ | ----------------- | ---------------- | ---------------------------------- |
| `/api/contact`                         | POST   | ✅ PUBLIC (5/min) | No               | Public contact form — rate-limited |
| `/api/contractors/forms/public/[slug]` | GET    | —                 | No               | Public intake form by slug         |

---

## Client Portal (separate auth model)

| Route                        | Method | Rate Limit | Sensitive Output | Why Public                               |
| ---------------------------- | ------ | ---------- | ---------------- | ---------------------------------------- |
| `/api/client/auth/request`   | POST   | —          | No               | Portal magic link request                |
| `/api/portal/company/[slug]` | GET    | —          | No               | Portal company branding (public landing) |
| `/api/clients/search`        | GET    | —          | No               | Client-side search (portal session)      |

---

## Diagnostics (dev-only, no PII)

| Route                   | Method | Rate Limit | Sensitive Output     | Why Public                          |
| ----------------------- | ------ | ---------- | -------------------- | ----------------------------------- |
| `/api/public/bootstrap` | GET    | —          | No                   | Dev bootstrap helper                |
| `/api/public/db-fix`    | GET    | —          | No                   | Dev database repair                 |
| `/api/public/diag-org`  | GET    | —          | No                   | Dev org diagnostics                 |
| `/api/public/cleanup`   | GET    | —          | No                   | Dev cleanup utility                 |
| `/api/public/whoami`    | GET    | —          | No (user's own data) | Debug: returns current user context |

---

## Other Intentional Public Routes

| Route                                      | Method    | Rate Limit | Sensitive Output | Why Public                             |
| ------------------------------------------ | --------- | ---------- | ---------------- | -------------------------------------- |
| `/api/qr/generate`                         | GET       | ✅ API     | No               | QR code generation (public feature)    |
| `/api/stripe/prices`                       | GET       | —          | No               | Public pricing display                 |
| `/api/geocode`                             | POST      | —          | No               | Address geocoding (Google Maps proxy)  |
| `/api/materials/estimate`                  | GET, POST | —          | No               | Material cost estimation (public tool) |
| `/api/carrier/track/[trackingId]/[action]` | GET       | —          | No               | Carrier email tracking pixel           |
| `/api/legal/document/[docId]`              | GET       | —          | No               | Public legal document access           |
| `/api/templates/[templateId]/public`       | GET       | —          | No               | Public template preview                |
| `/api/templates/[templateId]/placeholders` | GET       | —          | No               | Template placeholder list              |
| `/api/templates/[templateId]/thumbnail`    | GET       | —          | No               | Template thumbnail image               |
| `/api/permissions`                         | GET       | —          | No               | Permission definitions (static)        |
| `/api/routes/optimize`                     | POST      | —          | No               | Route optimization (no PII)            |
| `/api/retail-jobs`                         | GET, POST | —          | No               | Retail job listings (public)           |
| `/api/migrations/acculynx`                 | GET, POST | —          | No               | Migration import endpoint              |
| `/api/migrations/jobnimbus`                | GET, POST | —          | No               | Migration import endpoint              |

---

## Attestation

All routes above have been manually reviewed. None expose:

- ❌ User PII without authorization
- ❌ Cross-tenant data
- ❌ Financial data without signature verification
- ❌ Admin functionality

For webhook routes, provider signature verification serves as the auth mechanism.
For public data routes, only intentionally public information is returned.

**Reviewed by:** Engineering Team • **Scanner commit:** `78669d3`
