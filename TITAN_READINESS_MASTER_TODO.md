# 🎯 TITAN READINESS — MASTER TODO

> Last updated: February 17, 2026 | Build: ✅ PASSING | Deployed: ✅ skaiscrape.com

---

## WHERE YOU ACTUALLY STAND RIGHT NOW (HONEST AUDIT)

| Criterion                               | Status                   | Evidence                                                                                                                   |
| --------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Handles 720 concurrent users**        | 🟡 BUILT, NOT RUN        | k6 suite exists (smoke/soak/spike/stress). Soak targets 200 VU. **Tests have never been executed against prod.**           |
| **Sub-300ms latency**                   | 🟡 CLAIMED, NOT MEASURED | SLO doc says p95 < 400ms. No real baseline measurement exists. Uptime shown as hardcoded "99.9%".                          |
| **Zero cross-tenant leakage**           | 🟢 TESTED                | `cross-org-isolation.test.ts` (605 lines) + `auth-hardening.test.ts` (396 lines). org-scoped queries enforced server-side. |
| **Survives 30 days of live AZ roofers** | 🔴 NOT STARTED           | No external beta users. No field test. No chaos conditions validated.                                                      |
| **Passes a pen test**                   | 🔴 NOT DONE              | Security docs exist. Internal audit done. External pen test = 0/10 in own readiness score.                                 |

**Composite: ~62% truly ready. The code is strong. The proof is missing.**

---

## 🔴 CRITICAL — BLOCKERS (Do these first, in order)

### C-1: Run the k6 load tests for real — TODAY

> You have a full k6 suite. It has never been run against production. This is the most important missing data point.

- [ ] `brew install k6` (if not installed)
- [ ] `k6 run load-tests/smoke.js` → confirm it runs clean (5 VUs, 2 min)
- [ ] `k6 run load-tests/soak.js` → 200 VU sustained (30 min) — this is Titan + Pro West peak
- [ ] `k6 run load-tests/spike.js` → Monday morning rush (0→400 VU in 30s)
- [ ] `k6 run load-tests/stress.js` → find the actual breaking point
- [ ] Save output → paste p95, error rate, breaking point VU count into this doc
- [ ] **Target to claim:** p95 < 300ms at 200 VU, < 1% errors at 400 VU

**If stress.js breaks before 720 VU → document the number, fix the bottleneck, re-run.**

---

### C-2: Get a real latency baseline from production

> Right now "99.9% uptime" is a hardcoded string in the UI. That's a lie you'll get caught on.

- [ ] Wire BetterStack (free tier) to `/api/health/live` → real uptime percentage
- [ ] Enable Sentry profiling: change `profilesSampleRate: 0.0` → `0.1` in `sentry.server.config.ts`
- [ ] Run 24hrs of monitoring → document real p50/p95/p99 from Sentry or Vercel Analytics
- [ ] Replace hardcoded "99.9%" string in ops dashboard with live API call
- [ ] **Target to claim:** Real measured uptime over 30 days, not a guess

---

### C-3: Migrate top write routes to `withAuth` — INCOMPLETE

> TITAN_10DAY_WARPLAN.md says 338 routes use raw `auth()`. Only 56/659 are canonical. This is the real breach risk.

- [ ] Audit: `grep -r "auth()" src/app/api --include="*.ts" | grep -v withAuth | wc -l` → get actual count
- [ ] Migrate these write routes first (highest breach risk):
  - [ ] `POST /api/claims`
  - [ ] `PATCH /api/claims/[id]`
  - [ ] `DELETE /api/claims/[id]`
  - [ ] `POST /api/team/invite`
  - [ ] `POST /api/invoices`
  - [ ] `PATCH /api/billing`
  - [ ] `POST /api/proposals`
- [ ] Re-run `cross-org-isolation.test.ts` — all pass
- [ ] Re-run `auth-hardening.test.ts` — all pass

---

### C-4: Verify DATABASE_URL has pgbouncer params in Vercel prod

> Without this, you'll hit Prisma pool exhaustion at ~50 concurrent users.

- [ ] Log in to Vercel dashboard → Settings → Environment Variables
- [ ] Confirm `DATABASE_URL` contains: `?pgbouncer=true&connection_limit=10&pool_timeout=20`
- [ ] If missing → add it, redeploy, re-run soak test
- [ ] Verify in health deep endpoint: DB latency < 100ms at rest

---

### C-5: Fix health endpoint HTTP status codes

> `TITAN_10DAY_WARPLAN.md` documents this: `/api/health/live` returns 200 even when degraded.
> External monitors need real 503 on degraded.

- [ ] Open `src/app/api/health/live/route.ts` — verify it returns 503 on failure, not always 200
- [ ] Open `src/app/api/health/deep/route.ts` — verify same
- [ ] Test manually: kill DB connection, confirm deep health returns 503
- [ ] Wire BetterStack alert: 503 → Slack notification within 60 seconds

---

## 🟡 HIGH PRIORITY — Run These Within 7 Days

### H-1: Field chaos test (most important for roofing)

> No amount of load testing replaces a roofer on a rooftop with bad signal.

- [ ] Give 3 field reps the app on iPhone + Android
- [ ] Run: rural Prescott, Show Low, or Flagstaff signal conditions
- [ ] Tasks: upload photos from roof, generate estimate, submit claim
- [ ] Document: what broke, what was slow, what confused them
- [ ] Fix top 3 issues before Titan call

---

### H-2: Multi-tenant proof test (two orgs simultaneously)

> The tests cover this in code. You need a live demo you can show.

- [ ] Create 2 separate orgs in production (Org A: "Titan Test", Org B: "ClearSkai Internal")
- [ ] Log in as Org A user → create a claim
- [ ] Log in as Org B user → attempt to access Org A's claim via direct URL `/claims/[id]`
- [ ] Confirm: 403 or 404, zero data returned
- [ ] Record a 60-second screen capture of this test → keep it ready for Titan IT questions
- [ ] Test API directly: `curl -H "Authorization: Bearer [ORG_B_TOKEN]" /api/claims/[ORG_A_CLAIM_ID]` → must return 401/403

---

### H-3: Bulk team CSV import — test it end-to-end

> `scripts/enterprise-data-import.ts` exists (746 lines). Has it been run?

- [ ] Run dry-run with a test CSV of 20 users: `npx tsx scripts/enterprise-data-import.ts --org [testOrgId] --dry-run`
- [ ] Confirm it validates emails, deduplicates, outputs correct summary
- [ ] Run for real with 20 test users against dev/staging org
- [ ] Document the exact command Titan's IT admin will run
- [ ] Build the UI wrapper or confirm CLI-only is acceptable for Titan

---

### H-4: Role permission boundary verification

> TITAN_10DAY_WARPLAN.md lists this as non-negotiable. Status: unclear.

- [ ] Log in as `sales_rep` role → confirm cannot access `/analytics`, `/billing`, `/finance`
- [ ] Log in as `field_tech` role → confirm cannot delete or edit claims they didn't create
- [ ] Log in as `viewer` role → confirm all write actions blocked (buttons hidden AND API returns 403)
- [ ] Log in as `manager` → confirm cannot promote others to `owner`
- [ ] Document: screenshot evidence for each boundary test

---

### H-5: 30-day Arizona beta program — START RECRUITING NOW

> This takes 30 days. Every day you wait is a day you won't have the data before Titan.

- [ ] Identify 3–5 Phoenix/Scottsdale/Mesa mid-size roofing companies
- [ ] Offer: 60 days free in exchange for usage feedback
- [ ] Target: companies with 20–50 employees (stress without overwhelming)
- [ ] Get them live within 7 days
- [ ] Set up weekly check-in call
- [ ] Track: session length, feature usage, friction points, NPS

---

## 🟠 MEDIUM PRIORITY — Within 14 Days

### M-1: External penetration test — get it scheduled NOW

> "Internal security audit completed" is not a pen test. Titan IT will ask for the report.

- [ ] Option A (fast, affordable): Cobalt.io or Synack on-demand pen test → $3–8K, 2-week turnaround
- [ ] Option B (free): Submit to HackerOne or Bugcrowd responsible disclosure program
- [ ] Option C (manual): Hire a local Phoenix security firm for a scoped API + multi-tenant test
- [ ] **Minimum scope:** API endpoint abuse, cross-tenant data access, auth bypass attempts, rate limit bypass
- [ ] Get a signed report PDF → this is what Titan IT wants
- [ ] If pen test finds issues → fix them, document remediation, include in report

---

### M-2: SOC 2 — Start the process, set an honest timeline

> Current score: 0/10. You cannot get SOC 2 in 2 weeks. But you can start.

- [ ] Sign up for Vanta or Drata (automated SOC 2 readiness platform, ~$800/mo)
- [ ] Run their gap assessment → you'll get a score and roadmap
- [ ] Target: SOC 2 Type I by Q3 2026 (realistic)
- [ ] For Titan meeting: "SOC 2 audit in progress via Vanta. Estimated Type I by Q3 2026. All infrastructure vendors are SOC 2 Type II certified today."
- [ ] Do NOT claim you have SOC 2 or that it's "coming soon in 90 days" unless you've started

---

### M-3: Financial model stress test — worst-case scenarios

> Your margin claims need to survive real math under pressure.

- [ ] Model: 60 of 180 Titan users churn at day 90 → revenue impact
- [ ] Model: AI report usage doubles unexpectedly → OpenAI bill impact vs. token system revenue
- [ ] Model: Titan needs 40 hours of onboarding support → labor cost vs. contract value
- [ ] Model: Database costs at 720 concurrent users sustained → Supabase/Neon tier check
- [ ] Document: at what usage level does 95% margin claim break? What's the actual floor?

---

### M-4: SSO (SAML/OIDC) — Verify Clerk enterprise config works

> Titan IT will ask about SSO on day 1. Clerk supports it but it needs to be configured and tested.

- [ ] Verify Clerk organization has Enterprise plan or SSO add-on enabled
- [ ] Test SAML flow end-to-end with a test IdP (Okta free tier or Auth0)
- [ ] Document: what Titan IT needs to provide (metadata URL, entity ID, etc.)
- [ ] Build: a one-page SSO setup guide for their IT team
- [ ] Confirm: SSO users still get correct `orgId` assignment via Clerk webhooks

---

### M-5: AccuLynx vs SkaiScraper parallel comparison

> If a Titan rep can run both tools and yours wins — you're done. This is the close.

- [ ] Find 1–2 willing Titan contacts willing to run parallel for 30 days
- [ ] Define the comparison matrix: estimate speed, accuracy, crew adoption, admin friction
- [ ] Set a 30-day checkpoint: compare data output side-by-side
- [ ] Document the result, quote the user — use it in sales deck

---

## 🟢 PHASED ROLLOUT — NON-NEGOTIABLE STRUCTURE

Do NOT onboard 180 people on day 1. This is the plan:

| Phase       | Users                          | Duration | Success Gate Before Next Phase               |
| ----------- | ------------------------------ | -------- | -------------------------------------------- |
| **Phase 0** | 3–5 field reps (internal/beta) | 2 weeks  | 0 crashes, p95 < 500ms, field tasks complete |
| **Phase 1** | 10 Titan power users           | 2 weeks  | NPS > 40, < 1% error rate, 0 data issues     |
| **Phase 2** | 25 Titan users (1 department)  | 2 weeks  | p95 < 300ms at load, 0 cross-tenant issues   |
| **Phase 3** | 60 Titan users (half org)      | 4 weeks  | SLA maintained, support load manageable      |
| **Phase 4** | 180 full Titan org             | Ongoing  | Full monitoring, dedicated support channel   |

Each phase needs a signed-off checkpoint before proceeding. Do not skip.

---

## 📊 WHAT TO SAY AT THE TITAN MEETING (ONLY SAY WHAT'S TRUE)

| Claim                                       | Say It If                      | Don't Say It If                    |
| ------------------------------------------- | ------------------------------ | ---------------------------------- |
| "We've load-tested at 200 concurrent users" | k6 soak test passed            | Tests haven't been run yet         |
| "p95 under 300ms"                           | Sentry/Vercel data confirms it | It's just the SLO target           |
| "Zero cross-tenant data leakage"            | ✅ Say it — tests prove it     | —                                  |
| "SOC 2 certified"                           | ❌ Never — you don't have it   | —                                  |
| "SOC 2 in progress, Q3 2026"                | Vanta is running               | You haven't started                |
| "Pen tested"                                | You have a signed report       | "Internal audit" is not a pen test |
| "99.9% uptime"                              | BetterStack shows it           | It's hardcoded in the UI           |
| "Handles 720 concurrent users"              | Stress test confirmed it       | It's just a math projection        |

---

## ✅ DONE (Already Built — Real Evidence in Codebase)

- [x] **k6 load test suite** — smoke, soak (200 VU), spike (400 VU), stress (500 VU) — `load-tests/`
- [x] **Cross-org isolation tests** — 605-line test suite covering all critical models — `__tests__/cross-org-isolation.test.ts`
- [x] **Auth hardening tests** — 396-line test suite — `__tests__/auth-hardening.test.ts`
- [x] **6-tier health check system** — live, ready, deep, drift, system truth — `src/app/api/health/`
- [x] **Rate limiting** — Upstash distributed, 9 presets, fallback chain
- [x] **AES-256-GCM encryption at rest** — PBKDF2 key derivation
- [x] **Security headers** — CSP, HSTS (2yr), X-Frame, Permissions-Policy
- [x] **Legal suite** — TOS, Privacy, DPA, SLA (99.5%), AUP, HIPAA disclaimer — `legal/`
- [x] **Enterprise data import CLI** — 746 lines, supports AccuLynx/JobNimbus/Xactimate/generic CSV — `scripts/enterprise-data-import.ts`
- [x] **Security policy** — `SECURITY.md`
- [x] **Multi-tenancy audit doc** — `docs/multi-tenancy-audit.md`
- [x] **Runbooks** — outage, PDF failures, weather degraded — `runbooks/`
- [x] **SLO definitions** — `observability/SLOs.md`
- [x] **Titan demo seed data** — `db/seed-titan-demo.sql`
- [x] **Sentry** — server + edge + client + PII scrubbing
- [x] **PgBouncer + Prisma singleton** — connection_limit=10, pool_timeout=20s
- [x] **Clerk MFA + SSO infrastructure** — TOTP, SMS, backup codes

---

## 🔢 THE FIVE NUMBERS YOU NEED BEFORE THE TITAN CALL

Run these, fill in the blanks, then you can walk in with confidence:

1. **k6 soak result:** p95 = `___ms` at 200 VU sustained over 30 minutes
2. **k6 stress result:** System breaks at `___` VU (above 720 = you're good)
3. **Real uptime (BetterStack):** `___`% over last 30 days
4. **Cross-tenant test result:** Org B accessing Org A claim = HTTP `___`
5. **Field test result:** `___` out of 3 field reps completed full workflow on mobile

When all 5 have real numbers → you're ready for Titan.

---

_Built from honest codebase audit — February 17, 2026_
_Next checkpoint: Run k6 suite, fill in the 5 numbers above_
