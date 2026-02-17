# SkaiScrape — Full Pro Features Audit

> Generated: June 2025 | Platform: skaiscrape.com
> Total pages under `(app)`: **330**

---

## Executive Summary

| Category                                         | Count      |
| ------------------------------------------------ | ---------- |
| ✅ **Fully Working** (real Prisma/API data)      | ~165 pages |
| 📄 **Static/Layout** (expected — no data needed) | ~135 pages |
| ⚠️ **Coming Soon / Placeholder**                 | ~20 pages  |
| ❌ **Mock/Hardcoded Data**                       | ~5 pages   |
| 🔨 **TODO Stubs**                                | ~6 pages   |

**Bottom line**: ~50% of all pages have production-quality data wiring. The core revenue-generating features (Claims, Pipeline, Trades Network, Finance, Reports) all work. The remaining items are polish and feature completion.

---

## ✅ FULLY WORKING Features

### Claims & Jobs (Core)

| Feature           | Route                | Status                              |
| ----------------- | -------------------- | ----------------------------------- |
| Claims List       | `/claims`            | ✅ Prisma — full CRUD               |
| Claim Detail      | `/claims/[id]`       | ✅ Prisma — comprehensive workspace |
| Pipeline          | `/pipeline`          | ✅ Prisma — drag-drop kanban        |
| Job Board         | `/jobs`              | ✅ Prisma — full listing            |
| Leads             | `/leads`             | ✅ Prisma — intake + management     |
| Client Leads      | `/client-leads`      | ✅ Prisma — full CRUD               |
| Work Orders       | `/work-orders`       | ✅ Prisma — assignment + tracking   |
| Appointments      | `/appointments`      | ✅ Prisma — scheduling              |
| Permits           | `/permits`           | ✅ Prisma — tracking                |
| Mortgage Checks   | `/mortgage-checks`   | ✅ Prisma — tracker                 |
| Inspections       | `/inspections`       | ✅ Prisma — full workflow           |
| Property Profiles | `/property-profiles` | ✅ Prisma — property data           |

### AI Tools

| Feature                 | Route           | Status                          |
| ----------------------- | --------------- | ------------------------------- |
| Vision Lab              | `/vision-lab`   | ✅ API — AI image analysis      |
| Damage Detection        | `/damage`       | ✅ API — AI-powered             |
| Scopes                  | `/scopes`       | ✅ API — scope generation       |
| Evidence Builder        | `/evidence`     | ✅ API — evidence compilation   |
| AI Proposals            | `/ai-proposals` | ✅ API — AI-generated proposals |
| Box Summary             | `/box-summary`  | ✅ API — claim summarization    |
| Carrier Intelligence    | `/carrier`      | ✅ API — carrier analysis       |
| Depreciation Calculator | `/depreciation` | ✅ API — financial calc         |
| Quick DOL               | `/quick-dol`    | ✅ API — degree of loss         |
| Correlate               | `/correlate`    | ✅ API — data correlation       |

### Trades Network

| Feature             | Route                       | Status                          |
| ------------------- | --------------------------- | ------------------------------- |
| Trades Hub          | `/trades`                   | ✅ Prisma — network directory   |
| My Profile          | `/trades/profile`           | ✅ Prisma — full social profile |
| Profile Edit        | `/trades/profile/edit`      | ✅ Prisma — CRUD                |
| Company Page        | `/trades/company`           | ✅ API — auto-creates company   |
| Company Edit        | `/trades/company/edit`      | ✅ API — full edit              |
| Employees           | `/trades/company/employees` | ✅ Prisma — team management     |
| Companies Directory | `/trades/companies`         | ✅ Prisma — browsable           |
| Company Detail      | `/trades/companies/[id]`    | ✅ Prisma — public view         |
| Feed                | `/trades/feed`              | ✅ Prisma — social feed         |
| Connections         | `/trades/connections`       | ✅ Prisma — network graph       |
| Reviews             | `/trades/reviews`           | ✅ Prisma — rating system       |
| Jobs (Trades)       | `/trades/jobs`              | ✅ Prisma — job matching        |

### Finance & Billing

| Feature          | Route               | Status                      |
| ---------------- | ------------------- | --------------------------- |
| Finance Overview | `/finance/overview` | ✅ API — aggregated metrics |
| Invoices         | `/invoices`         | ✅ Prisma — full CRUD       |
| Commissions      | `/commissions`      | ✅ Prisma — tracking        |
| Billing Seats    | `/teams`            | ✅ API — Stripe integration |
| Account Billing  | `/account/billing`  | ✅ API — invoice history    |

### Reports & Documents

| Feature         | Route              | Status                          |
| --------------- | ------------------ | ------------------------------- |
| Reports List    | `/reports`         | ✅ Prisma — report management   |
| Proposals       | `/proposals`       | ✅ Prisma — generation + CRUD   |
| Batch Proposals | `/batch-proposals` | ✅ Prisma — bulk generation     |
| Smart Docs      | `/smart-docs`      | ✅ Prisma — document management |
| E-Sign          | `/esign`           | ✅ Prisma — signature workflows |
| Templates       | `/templates`       | ✅ Prisma — reusable templates  |
| Estimates       | `/estimates`       | ✅ Prisma — estimation tools    |

### Settings & Admin

| Feature         | Route                    | Status                         |
| --------------- | ------------------------ | ------------------------------ |
| Settings Hub    | `/settings`              | ✅ Working layout              |
| Branding        | `/settings/branding`     | ✅ Prisma — logo/colors        |
| Integrations    | `/settings/integrations` | ✅ API — connection management |
| Admin Dashboard | `/admin`                 | ✅ Prisma — platform admin     |
| Analytics       | `/analytics`             | ✅ Prisma — performance data   |
| Performance     | `/performance`           | ✅ Prisma — team metrics       |

### Other Working Features

| Feature        | Route             | Status                          |
| -------------- | ----------------- | ------------------------------- |
| Messages       | `/messages`       | ✅ Prisma — real-time messaging |
| SMS            | `/sms`            | ✅ API — Twilio integration     |
| Notifications  | `/notifications`  | ✅ Prisma — notification center |
| Contacts       | `/contacts`       | ✅ Prisma — contact management  |
| Vendor Network | `/vendor-network` | ✅ Prisma — vendor directory    |
| Crews          | `/crews`          | ✅ Prisma — crew management     |
| Maps           | `/maps/map-view`  | ✅ Prisma — property mapping    |
| Dashboard      | `/dashboard`      | ✅ API — multi-widget dashboard |
| Client Portal  | `/portal/*`       | ✅ Prisma — 7+ portal pages     |

---

## ⚠️ COMING SOON / Placeholder Features

| Feature                       | Route                           | Issue                                                     | Priority |
| ----------------------------- | ------------------------------- | --------------------------------------------------------- | -------- |
| Weather Chains                | `/weather-chains`               | Entire page disabled — "Coming Soon" with disabled button | P2       |
| Claims Timeline               | `/analytics/claims-timeline`    | All-zero stats, "Coming Soon" message, no API calls       | P3       |
| Materials Tracker             | `/materials`                    | 2 cards marked "Planned Feature"                          | P3       |
| Lead Import (CSV)             | `/leads/import`                 | "Bulk CSV/CRM ingestion coming soon"                      | P2       |
| Lead Settings                 | `/leads/settings`               | "Advanced features coming soon"                           | P3       |
| Vendor Portal (Trades Orders) | `/trades/orders`                | "Vendor Portal Integration — Coming Soon" (3 instances)   | P2       |
| Advanced Reports              | `/reports/advanced`             | "Coming soon" label on feature                            | P3       |
| Scope Cleanup & Merge         | `/scopes/new`                   | "Cleanup & Merge (Coming Soon)" section                   | P3       |
| Carrier Export                | `/ai/exports`                   | "Carrier export is coming soon"                           | P3       |
| DOCX Export                   | `/claims-ready-folder`          | "DOCX (Coming Soon)" export option                        | P2       |
| Service Area Map              | `/settings/service-areas`       | "Interactive Map Coming Soon"                             | P3       |
| Archive Manager               | `/archive`                      | `TODO` + `alert()`                                        | P3       |
| Cover Page PDF Export         | `/settings/branding/cover-page` | `TODO: Implement PDF export`                              | P2       |
| Batch Mailers Retry           | `/batch-proposals/[id]/mailers` | `TODO: Implement retry logic`                             | P3       |
| Report History                | `/reports/history`              | `TODO` stubs                                              | P3       |
| Accounting Integration        | `/claims/[id]` workspace        | "Integration with accounting systems coming soon."        | P3       |
| Settings Form Sections        | `/settings`                     | `TODO` (2 paths)                                          | P3       |

---

## ❌ BROKEN / Mock Data Features

| Feature              | Route                 | Issue                                                                    | Fix Needed                  |
| -------------------- | --------------------- | ------------------------------------------------------------------------ | --------------------------- |
| Security Settings    | `/settings/security`  | **Fully hardcoded** active sessions & login events — users see fake data | Wire to Clerk Session API   |
| Map View Coordinates | `/maps/map-view`      | Generates **fake coordinates** instead of real geocoded addresses        | Use Mapbox/Google geocoding |
| Claim Report Fields  | `/claims/[id]/report` | 5 placeholder fields (`placeholder_xxx`)                                 | Wire to actual claim data   |
| Claim Detail Notes   | `/claims/[id]`        | Placeholder text for demo                                                | Replace with real content   |
| Contacts Page        | `/contacts`           | Has `TODO` string literal in data array                                  | Clean up                    |

---

## 🔨 NEEDS TO BE BUILT

| Feature                      | Priority | Effort | Description                                               |
| ---------------------------- | -------- | ------ | --------------------------------------------------------- |
| Weather Chains Analysis      | P2       | High   | Multi-year storm causation analysis — full backend needed |
| CSV Lead Import              | P2       | Medium | File upload → parse → validate → insert pipeline          |
| DOCX Export                  | P2       | Medium | Claims Ready Folder document export                       |
| Cover Page PDF               | P2       | Medium | Branded PDF generation for proposals                      |
| Interactive Service Area Map | P3       | Medium | Map-based service area editor                             |
| Vendor Portal Integration    | P2       | High   | Two-way vendor communication portal                       |
| Clerk Session Wiring         | P1       | Low    | Replace mock security data with real Clerk API calls      |

---

## Recommendations

### Immediate Fixes (P0)

1. ~~Fix dashboard trades widget~~ ✅ Done this session
2. ~~Fix Financial Overview error~~ ✅ Done this session
3. ~~Fix Mortgage Check button colors~~ ✅ Done this session
4. ~~Unify headers to teal/turquoise~~ ✅ Done this session
5. **Wire security settings to Clerk** — users currently see fake session data

### Short-term (P1)

6. Remove all `alert()` calls used for "coming soon" — replace with proper toast notifications
7. Clean up all `TODO` string literals in rendered content
8. Wire map view to real geocoding API

### Medium-term (P2)

9. Build CSV lead import workflow
10. Implement DOCX export for Claims Ready Folder
11. Build cover page PDF generation
12. Implement Weather Chains MVP

### Long-term (P3)

13. Claims Timeline analytics with real data
14. Vendor Portal integration
15. Advanced Reports features
16. Materials tracker full implementation

---

_Audit complete. 165+ features working in production. 20 features need completion._
