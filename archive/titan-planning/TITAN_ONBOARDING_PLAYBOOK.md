# Titan Restoration — 48-Hour Onboarding Playbook

> **Version:** 1.0 | **Target:** Enterprise client (180+ employees) | **Platform:** SkaiScrape

---

## Pre-Onboarding Checklist (Before Day 1)

- [ ] Org created in Clerk with `enterprise` plan
- [ ] Admin user provisioned with Owner role
- [ ] Branding assets uploaded (logo, colors)
- [ ] Run Titan seed script: `psql "$DATABASE_URL" -f ./db/seed-titan-demo.sql`
- [ ] Verify health checks: `curl https://skaiscrape.com/api/health/live`
- [ ] Share login credentials with Titan IT team

---

## Hour 0–4: Admin Setup

### 1. Org Configuration

1. **Login** → Navigate to **Settings → Organization**
2. **Upload company logo** and set brand colors
3. **Verify billing** → Ensure Enterprise plan shows 200-seat limit
4. **Set timezone** to `America/Phoenix` (MST, no DST)

### 2. Role Configuration

The platform ships with 9 pre-built roles. Map Titan's organizational structure:

| Titan Title         | SkaiScrape Role | Access Level |
| ------------------- | --------------- | ------------ |
| CEO / VP            | `owner`         | Full admin   |
| Operations Director | `admin`         | All features |
| Branch Manager      | `manager`       | Branch scope |
| Sales Rep           | `sales_rep`     | Leads + CRM  |
| Project Manager     | `project_mgr`   | Jobs + docs  |
| Estimator           | `estimator`     | Estimates    |
| Bookkeeper          | `finance`       | Financial    |
| Crew Lead           | `field_tech`    | Mobile ops   |
| Office Staff        | `viewer`        | Read-only    |

### 3. Team Import (Bulk)

Use the CSV import endpoint for all 180 employees:

```
POST /api/team/import-csv
Content-Type: application/json

{
  "members": [
    { "email": "user@titan.com", "role": "manager", "name": "John Doe" },
    ...
  ]
}
```

Or upload via **Settings → Team → Import CSV** in the UI.

---

## Hour 4–8: Integration Connections

### QuickBooks Online

1. Navigate to **Settings → Integrations → QuickBooks**
2. Click **Connect QuickBooks**
3. Authorize with Titan's QB admin credentials
4. Select company file
5. Test sync: Create a test invoice, verify it appears in QB

**Receipt Tracking:**

- Material receipts auto-sync to QB as Purchase records
- Navigate to **Claim → Financials → Receipts → Sync to QB**
- Bulk sync: **Claim → Financials → Sync All Receipts**

### GAF QuickMeasure

1. Navigate to **Settings → Integrations → GAF**
2. Enter GAF partner API key
3. Test: **Claims → [Any Claim] → Order Measurement**
4. Select property address, choose measurement type (roof/full)
5. Order flows to GAF → webhook returns report within 30 min

### ABC Supply

1. Navigate to **Settings → Integrations → ABC Supply**
2. Enter ABC Supply account ID + API credentials
3. Test connection → should show account balance
4. Browse catalog: **Materials → Search Products**
5. Place test order: **Claim → Materials → Order from ABC**

### AccuLynx Migration (if migrating from AccuLynx)

1. Navigate to **Settings → Migrations → AccuLynx**
2. Enter AccuLynx API key
3. Run **Preflight Check** — shows counts (contacts, jobs, documents)
4. Start migration in 5 phases:
   - Phase 1: Contacts → SkaiScrape Leads
   - Phase 2: Jobs → SkaiScrape Claims
   - Phase 3: Documents → File attachments
   - Phase 4: Notes → Activity timeline
   - Phase 5: Verification + reconciliation

### JobNimbus Migration (if migrating from JobNimbus)

Same 5-phase process as AccuLynx. Navigate to **Settings → Migrations → JobNimbus**.

---

## Hour 8–16: Data Migration & Verification

### Import Existing Claims

1. Export claims from legacy system (AccuLynx / JobNimbus / spreadsheet)
2. Use migration wizard: **Settings → Migrations → [Source]**
3. Monitor progress in real-time dashboard
4. Verify counts match source system

### Document Upload

- Bulk upload claim documents via drag-and-drop
- Supported formats: PDF, JPG, PNG, DOCX, XLSX
- Max file size: 25 MB per file
- AI auto-categorizes documents (insurance, photos, estimates, contracts)

### Financial Data Import

- Commission plans: **Settings → Finance → Commission Plans**
- Set up plans per role (sales: 10%, PM: 5%, etc.)
- Import existing invoices via QuickBooks sync

---

## Hour 16–24: Team Training

### Training Sessions (Recommended Schedule)

| Session | Audience         | Duration  | Topics                                          |
| ------- | ---------------- | --------- | ----------------------------------------------- |
| 1       | Admins (5)       | 2 hours   | Settings, roles, integrations, billing          |
| 2       | Sales Reps (10)  | 1.5 hours | Lead capture, CRM, proposals, e-sign            |
| 3       | PMs (15)         | 2 hours   | Claims pipeline, scheduling, docs, measurements |
| 4       | Finance (5)      | 1 hour    | Invoicing, receipts, QB sync, commissions       |
| 5       | Technicians (10) | 1 hour    | Mobile app, photo upload, status updates        |
| 6       | All (50)         | 30 min    | Dashboard overview, report issues button        |

### Key Features to Demo

- ✅ **AI Damage Detection** — Upload roof photos → instant severity assessment
- ✅ **One-Click Measurement Orders** — GAF QuickMeasure from any claim
- ✅ **Material Ordering** — ABC Supply catalog + inventory check
- ✅ **Receipt → QuickBooks Sync** — Auto-expense tracking
- ✅ **E-Sign Contracts** — Send + track customer signatures
- ✅ **Commission Tracking** — Auto-calculated per role
- ✅ **Report Issue** — Floating button on every page (bottom-right)

---

## Hour 24–48: Go-Live & Monitoring

### Go-Live Checklist

- [ ] All 180 users can sign in
- [ ] Roles correctly assigned (verify 3 random users per role)
- [ ] QuickBooks connection active and syncing
- [ ] GAF measurements flowing (test order + webhook)
- [ ] ABC Supply catalog loads, test order works
- [ ] Mobile access works on iOS/Android browsers
- [ ] Email notifications delivering (check spam filters)

### Monitoring

- **Health Dashboard:** `https://skaiscrape.com/api/health/live`
- **Error Tracking:** Sentry → search by `org:org_titan_demo_001`
- **User Reports:** Check `/api/feedback` for submitted issues
- **Performance:** p95 latency target < 500ms (verified via k6 load test)

### Escalation Path

| Priority            | Response Time | Channel             |
| ------------------- | ------------- | ------------------- |
| P0 (down)           | 15 min        | Phone + SMS         |
| P1 (broken feature) | 1 hour        | Email + Slack       |
| P2 (bug)            | 4 hours       | In-app Report Issue |
| P3 (enhancement)    | 48 hours      | In-app Report Issue |

---

## Post-Launch (Week 1)

- [ ] Daily check-in with Titan ops director (first 5 days)
- [ ] Review Sentry errors daily
- [ ] Monitor QB sync success rate (target: > 99%)
- [ ] Collect feedback from all role tiers
- [ ] Adjust commission plans based on Titan's structure
- [ ] Schedule 2-week retrospective meeting

---

## Environment Variables Required

```env
# QuickBooks
QUICKBOOKS_CLIENT_ID=xxx
QUICKBOOKS_CLIENT_SECRET=xxx
QUICKBOOKS_REDIRECT_URI=https://skaiscrape.com/api/integrations/quickbooks/callback
QUICKBOOKS_ENVIRONMENT=production
TOKEN_ENCRYPTION_KEY=xxx  # 32-byte hex

# GAF QuickMeasure
GAF_API_KEY=xxx
GAF_API_SECRET=xxx
GAF_ENVIRONMENT=production

# ABC Supply
ABC_SUPPLY_API_KEY=xxx
ABC_SUPPLY_API_SECRET=xxx
ABC_SUPPLY_ENVIRONMENT=production

# AccuLynx (migration only)
ACCULYNX_API_KEY=xxx

# JobNimbus (migration only)
JOBNIMBUS_API_KEY=xxx

# QuickBooks Webhooks
QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN=xxx
```

---

_Generated for Titan Restoration onboarding. Update with actual credentials before go-live._
