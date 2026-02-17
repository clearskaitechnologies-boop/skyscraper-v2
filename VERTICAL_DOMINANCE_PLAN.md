# VERTICAL DOMINANCE: MASTER STRATEGIC PLAN

## The Operating System for Storm & Insurance Restoration Contractors

> **Last Updated:** 2026-02-16
> **Status:** ACTIVE — This is the living roadmap.
> **Mission:** Become the undisputed platform for roofing & restoration contractors.

---

## 🧭 STRATEGIC POSITIONING

### What We Were

> "CRM for Trades" — generic, horizontal, forgettable.

### What We Are Becoming

> **The AI-powered restoration operating system** connecting claims, crews, materials,
> and accounting in one platform.

### Tagline Candidates

- "From First Inspection to Final Payment — One System."
- "Close More Claims. Move Jobs Faster. Get Paid Sooner."
- "Built for Roofing & Insurance Restoration Contractors."

### Why This Wins

- Vertical SaaS = higher retention, higher ACV, stronger word-of-mouth
- Roofers talk. Storm contractors network. Insurance restoration companies refer each other.
- Every feature reinforces: claims → materials → insurance → cash flow
- Emotional lock-in: "This was made for me."

---

## 📊 WHAT ALREADY EXISTS (Our Unfair Advantage)

Before building anything new, recognize what's already production-ready:

| Capability                                          | Status   | Routes                       |
| --------------------------------------------------- | -------- | ---------------------------- |
| Full claim lifecycle (22 sub-pages per claim)       | ✅ Built | /claims/[id]/\*              |
| Claims-Ready Folder (17 carrier-compliant sections) | ✅ Built | /claims-ready-folder/\*      |
| Weather verification (Iowa Mesonet)                 | ✅ Built | /weather-analytics           |
| Quick Date-of-Loss finder                           | ✅ Built | /tools/quick-dol             |
| AI supplement builder                               | ✅ Built | /tools/supplement-builder    |
| AI rebuttal builder                                 | ✅ Built | /tools/rebuttal-builder      |
| AI depreciation builder                             | ✅ Built | /tools/depreciation-builder  |
| Bad faith detection                                 | ✅ Built | /tools/bad-faith             |
| AI damage report from photos                        | ✅ Built | /tools/damage-report-builder |
| Vision Labs (photo → AI detection)                  | ✅ Built | /vision-lab                  |
| QuickBooks OAuth + sync                             | ✅ Built | /settings/integrations       |
| AccuLynx migration engine                           | ✅ Built | /settings/migrations         |
| JobNimbus migration engine                          | ✅ Built | /settings/migrations         |
| ABC Supply routing + estimation                     | ✅ Built | /api/materials/estimate      |
| Material estimator (pitch, waste, coverage)         | ✅ Built | lib/materials/estimator      |
| Job pipeline Kanban                                 | ✅ Built | /pipeline                    |
| Trades network (30+ pages)                          | ✅ Built | /trades/\*                   |
| Client portal                                       | ✅ Built | /portal/\*                   |
| Invoicing & commissions                             | ✅ Built | /finance/\*                  |
| Observability + tracing                             | ✅ Built | /api/health/deep             |
| 154 unit tests passing                              | ✅       | —                            |
| 327 authenticated pages                             | ✅       | —                            |

**The product is already a restoration operating system. It just doesn't know it yet.**

---

## 🏗️ THE PLAN — FOUR PHASES

```
Phase 1: REPOSITION     (Weeks 1-2)   ← Messaging, UI, homepage
Phase 2: FLAGSHIP       (Weeks 3-4)   ← Storm Command Center dashboard
Phase 3: BETA LAUNCH    (Weeks 5-6)   ← 10 contractors, feedback loop
Phase 4: MARKET ATTACK  (Weeks 7-10)  ← Content, partnerships, sales
```

---

---

## PHASE 1: REPOSITION (Weeks 1-2)

> "Make the product look like what it already is."

---

### 1.1 — Homepage & Marketing Messaging Overhaul

### TODO-1.1.1: Rewrite Hero Section

**File:** `src/components/marketing/MarketingLanding.tsx`
**Priority:** 🔴 CRITICAL

Current:

```
"Your Trades Operation Runs on AI"
"command center for the modern tradesman"
```

Change to:

```
"The Operating System for Storm Restoration"
"From first inspection to final payment — one platform."
```

- [ ] Update hero headline to restoration-specific language
- [ ] Update pill badge: "Built for Roofing & Insurance Restoration"
- [ ] Update sub-headline to emphasize: claims, supplements, materials, accounting
- [ ] Update feature cards to lead with restoration-specific features
- [ ] Replace generic "Trades Professionals" with "Restoration Contractors"
- [ ] Add social proof: "Trusted by roofing & restoration companies nationwide"

### TODO-1.1.2: Restructure Feature Cards (Homepage)

**File:** `src/components/marketing/MarketingLanding.tsx`
**Priority:** 🔴 CRITICAL

Replace the 6 generic feature cards with restoration-focused ones:

| #   | Card                                  | Description                                                                                             |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1   | **Claims Command Center**             | Full claim lifecycle from intake to final payment. Track every carrier, every supplement, every dollar. |
| 2   | **AI Supplement Engine**              | AI-generated supplements, rebuttals, and depreciation recoveries. Win more on every claim.              |
| 3   | **Weather Verification**              | Prove date-of-loss with Iowa Mesonet data. Hail, wind, tornado — court-ready documentation.             |
| 4   | **Material Estimation & Ordering**    | Calculate materials from roof measurements. Route to ABC Supply branches. Order in one click.           |
| 5   | **QuickBooks Integration**            | Sync invoices, payments, and insurance deposits automatically. No double-entry.                         |
| 6   | **Migrate from AccuLynx & JobNimbus** | One-click import. Bring your claims, contacts, and history. Zero downtime.                              |

### TODO-1.1.3: Add Competitor Comparison Section

**File:** New component — `src/components/marketing/ComparisonTable.tsx`
**Priority:** 🟡 HIGH

Create "Why Contractors Switch" section:

| Feature               | SkaiScraper | AccuLynx | JobNimbus | Xactimate |
| --------------------- | ----------- | -------- | --------- | --------- |
| AI Supplement Builder | ✅          | ❌       | ❌        | ❌        |
| Weather Verification  | ✅          | ❌       | ❌        | ❌        |
| Material Routing      | ✅          | ❌       | ❌        | ❌        |
| Claims-Ready Folder   | ✅          | Partial  | ❌        | ❌        |
| QuickBooks Sync       | ✅          | ✅       | ✅        | ❌        |
| Built-in CRM          | ✅          | ✅       | ✅        | ❌        |
| AI Damage Detection   | ✅          | ❌       | ❌        | ❌        |

### TODO-1.1.4: Update Pricing Page Messaging

**File:** Pricing page component
**Priority:** 🟡 HIGH

- [ ] Change "$80/seat/month" framing to "Less than one supplement recovery pays for a year"
- [ ] Add ROI calculator: "Average contractor recovers $X more per claim with AI supplements"
- [ ] Add industry-specific testimonial placeholders
- [ ] Frame as "one flat rate, unlimited claims"

### TODO-1.1.5: Create Dedicated Landing Pages

**Priority:** 🟡 HIGH

- [ ] `/for/roofing` — Roofing-specific landing page
- [ ] `/for/restoration` — Water/fire/mold restoration landing
- [ ] `/for/storm-chasers` — Storm chaser operations landing
- [ ] Each page speaks directly to that contractor's pain points

---

## 1.2 — Navigation & Information Architecture Refinement

### TODO-1.2.1: Reorder Sidebar to Lead with Claims

**File:** `src/app/(app)/_components/AppSidebar.tsx`
**Priority:** 🔴 CRITICAL

Current sidebar order: Command Center → Jobs & Claims → Claims Toolkit → ...

New sidebar order:

```
① Storm Command Center (NEW — flagship)
   - Storm Dashboard
   - Active Claims
   - Supplement Queue
   - Material Orders
   - Weather Radar

② Claims Workspace (existing — promoted)
   - All Claims
   - Claims-Ready Folders
   - Appeal Builder
   - Supplement Builder
   - Rebuttal Builder
   - Depreciation Builder
   - Bad Faith Detector

③ Operations
   - Job Pipeline
   - Lead Routing
   - Crew Manager
   - Scheduling
   - Appointments

④ Materials & Vendors
   - Material Estimator (NEW)
   - ABC Supply Orders
   - Vendor Directory
   - Vendor Intelligence

⑤ Reports & Documents
   - Report Hub
   - Templates
   - Contractor Packets
   - Carrier Exports

⑥ Finance
   - Financial Overview
   - Invoices
   - Commissions
   - Mortgage Checks
   - QuickBooks Sync Status

⑦ Network & Communications
   - Trades Network
   - SMS Center
   - Messages
   - Client Portal

⑧ Settings & Admin
   - Company Settings
   - Integrations
   - Data Migration
   - Team Management
   - Billing
```

### TODO-1.2.2: Update Dashboard Metadata

**File:** `src/app/(app)/dashboard/page.tsx`
**Priority:** 🟢 MEDIUM

- [ ] Change page title from "Dashboard | SkaiScraper" → "Storm Command Center | SkaiScraper"
- [ ] Update description to reference claims, restoration, insurance

### TODO-1.2.3: Add "Restoration Mode" Visual Identity

**Priority:** 🟢 MEDIUM

- [ ] Add storm/roof themed accent colors for claims pages
- [ ] Use shingle/roof iconography in claim-related navigation
- [ ] Subtle visual distinction when user is in claims workflow vs retail

---

## 1.3 — Onboarding Flow Specialization

### TODO-1.3.1: Update Onboarding to Ask Contractor Type

**File:** `src/app/onboarding/*`
**Priority:** 🔴 CRITICAL

Step 1 of onboarding should ask:

```
What type of work does your company do?
☐ Roofing (Storm/Insurance)
☐ Roofing (Retail/Re-roof)
☐ Water/Fire Restoration
☐ General Contracting
☐ Other Trades
```

This selection should:

- [ ] Set default sidebar layout
- [ ] Pre-configure relevant AI tools
- [ ] Show migration prompt (AccuLynx/JobNimbus) for roofing companies
- [ ] Skip irrelevant features
- [ ] Set industry-specific templates as defaults

### TODO-1.3.2: Add "Import Your Data" to Onboarding

**Priority:** 🟡 HIGH

- [ ] After company setup, offer: "Coming from AccuLynx or JobNimbus?"
- [ ] One-click jump to migration wizard
- [ ] Show: "Most companies import in under 30 minutes"

### TODO-1.3.3: First-Run Experience for Storm Contractors

**Priority:** 🟡 HIGH

After onboarding, show guided tour highlighting:

1. How to create a claim
2. How to generate AI supplement
3. How to verify weather (DOL)
4. How to build Claims-Ready Folder
5. How to sync with QuickBooks

---

---

## PHASE 2: FLAGSHIP — Storm Command Center (Weeks 3-4)

> "The one screen that makes contractors say: I need this."

---

### 2.1 — Storm Command Center Dashboard

### TODO-2.1.1: Build Storm Command Center Page

**File:** New — `src/app/(app)/storm-center/page.tsx`
**Priority:** 🔴 CRITICAL

This is the flagship screen — the screenshot that sells the product.

**Layout (single-page command center):**

```
┌─────────────────────────────────────────────────────────┐
│  🌩️ Storm Command Center           [Flagstaff, AZ]     │
├──────────────┬──────────────┬───────────────────────────┤
│  Active      │  Supplements │  Revenue This Month       │
│  Claims: 14  │  Pending: 6  │  $247,380                 │
│  ▲ 3 new     │  Won: $42K   │  ▲ 18% vs last month     │
├──────────────┴──────────────┴───────────────────────────┤
│                                                         │
│  📋 CLAIMS REQUIRING ACTION                   [View All]│
│  ┌─────────────────────────────────────────────────┐    │
│  │ Johnson Residence  │ State Farm │ Supp Due 2/18 │    │
│  │ Smith Roofing Job  │ Allstate   │ Inspection Tm │    │
│  │ Garcia Property    │ USAA       │ Ready to Close│    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  🌤️ WEATHER ALERTS               📦 MATERIAL ORDERS    │
│  ┌────────────────────┐     ┌──────────────────────┐   │
│  │ Hail event 2/14    │     │ ABC Supply - Phoenix │   │
│  │ Flagstaff, AZ      │     │ 3 orders in transit  │   │
│  │ 1.5" diameter      │     │ Est. delivery: 2/19  │   │
│  │ [Prospect Leads →] │     │ [Track Orders →]     │   │
│  └────────────────────┘     └──────────────────────┘   │
│                                                         │
│  💰 CASH FLOW PIPELINE                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Insurance Deposits    $128,400  ████████░░░ 68% │    │
│  │ Supplements Pending    $42,200  ███░░░░░░░░ 22% │    │
│  │ Final Payments Due     $18,780  █░░░░░░░░░░ 10% │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  📊 CLAIM VELOCITY (Last 30 Days)                       │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Avg Days to Approval:  12.4  (▼ 2.1 from avg)  │    │
│  │ Supplement Win Rate:   78%   (▲ 5% from avg)   │    │
│  │ Avg Claim Value:       $18.2K                   │    │
│  │ Claims Closed:         8                        │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

Sub-components to build:

- [ ] `StormHeader` — Location, date, weather icon
- [ ] `ClaimMetricCards` — Active claims, supplements, revenue
- [ ] `ClaimsActionQueue` — Claims needing attention, sorted by urgency
- [ ] `WeatherAlertPanel` — Recent storm events in service area
- [ ] `MaterialOrderTracker` — ABC Supply order status
- [ ] `CashFlowPipeline` — Insurance deposits, supplements, finals
- [ ] `ClaimVelocityMetrics` — Speed metrics, win rates
- [ ] `RecentActivityFeed` — Team actions on claims

### TODO-2.1.2: Storm Center API Endpoint

**File:** New — `src/app/api/storm-center/route.ts`
**Priority:** 🔴 CRITICAL

Single endpoint that aggregates:

- Active claims count + status breakdown
- Pending supplements with amounts
- Revenue pipeline (deposits, supplements, finals)
- Claim velocity metrics (avg days, win rate)
- Recent weather events in service area
- ABC Supply order status
- Team activity feed

### TODO-2.1.3: Claim Velocity Analytics Engine

**File:** New — `src/lib/analytics/claim-velocity.ts`
**Priority:** 🟡 HIGH

Calculate and track:

- [ ] Average days: intake → approval
- [ ] Average days: approval → payment
- [ ] Supplement success rate (won/submitted)
- [ ] Average supplement recovery amount
- [ ] Average claim value by carrier
- [ ] Claims closed per month trend
- [ ] Revenue per crew member

---

## 2.2 — Material Estimator UI

### TODO-2.2.1: Build Material Estimator Page

**File:** New — `src/app/(app)/materials/estimator/page.tsx`
**Priority:** 🟡 HIGH

Interactive page where contractors:

1. Enter roof measurements (area, pitch, ridge/hip/valley/eave/rake)
2. Select shingle type & color
3. See instant material list with quantities
4. Route to nearest ABC Supply branch
5. Check inventory availability
6. Create order or save quote

Uses existing `src/lib/materials/estimator.ts` engine.

### TODO-2.2.2: Integrate Estimator with Claims

**Priority:** 🟡 HIGH

- [ ] Add "Estimate Materials" button to claim scope-of-work page
- [ ] Pre-fill measurements from claim data
- [ ] Link material estimate to claim financials
- [ ] Show material cost vs insurance allowance comparison

---

## 2.3 — Supplement Success Dashboard

### TODO-2.3.1: Build Supplement Tracking Dashboard

**File:** New — `src/app/(app)/supplements/page.tsx`
**Priority:** 🟡 HIGH

Dedicated view for supplement management:

- [ ] All supplements by status: Draft → Submitted → Approved → Denied → Appealed
- [ ] Total dollars recovered via supplements
- [ ] Win rate by carrier
- [ ] Average time to approval
- [ ] One-click AI supplement generation for any claim
- [ ] Batch supplement status update

This is THE feature that sells to storm contractors. Make it prominent.

---

---

## PHASE 3: BETA LAUNCH (Weeks 5-6)

> "Put it in real hands. Collect real data."

---

### 3.1 — Beta Contractor Recruitment

### TODO-3.1.1: Identify & Recruit Beta Contractors

**Priority:** 🔴 CRITICAL

Target:

- [ ] 1 small roofing company (3-5 crews, 20-40 claims/year)
- [ ] 1 mid-size restoration company (10+ crews, 100+ claims/year)
- [ ] 1 storm chaser operation (travels to events, high volume)
- [ ] 1 established roofer currently on AccuLynx
- [ ] 1 established roofer currently on JobNimbus

Offer:

- Free 6-month access
- Direct founder communication channel
- Their feedback shapes the product
- Early adopter pricing locked forever

### TODO-3.1.2: Build Beta Feedback Infrastructure

**Priority:** 🟡 HIGH

- [ ] In-app feedback widget (bottom-right corner)
- [ ] Weekly check-in survey (automated email)
- [ ] Session recording consent (Sentry replay or similar)
- [ ] Feature request board (internal tracking)
- [ ] Bug report shortcut (keyboard shortcut → form)

### TODO-3.1.3: Create Beta Onboarding Kit

**Priority:** 🟡 HIGH

- [ ] 5-minute video walkthrough of Storm Command Center
- [ ] PDF quick-start guide for claims workflow
- [ ] Migration checklist (if coming from AccuLynx/JobNimbus)
- [ ] "Your first claim" step-by-step tutorial
- [ ] Direct support channel (Slack/Discord/SMS)

---

## 3.2 — Data Collection & Instrumentation

### TODO-3.2.1: Add Usage Analytics Events

**Priority:** 🔴 CRITICAL

Track (using existing observability/tracing):

- [ ] Claims created per org per week
- [ ] Supplements generated (AI) vs manual
- [ ] Time spent on claim pages
- [ ] Material estimates created
- [ ] QuickBooks syncs triggered
- [ ] Migration wizard completions
- [ ] Feature discovery rate (which tools do they find?)
- [ ] Drop-off points in claim workflow

### TODO-3.2.2: Build Internal Analytics Dashboard

**File:** New — `src/app/(app)/admin/analytics/page.tsx`
**Priority:** 🟡 HIGH

Internal-only dashboard showing:

- [ ] Active organizations by type
- [ ] Claims volume trends
- [ ] Feature adoption rates
- [ ] Integration usage (QB, ABC Supply)
- [ ] Error rates by feature
- [ ] User engagement metrics

---

## 3.3 — Critical Beta Readiness Fixes

### TODO-3.3.1: Claims Workflow Polish

**Priority:** 🔴 CRITICAL

Before beta, ensure the claim flow is bulletproof:

- [ ] Claim creation → auto-weather-fetch by address + date
- [ ] Photo upload → AI damage detection → auto-scope
- [ ] Supplement builder → PDF export → carrier-ready format
- [ ] Claims-Ready Folder → one-click packet assembly
- [ ] Claim → Invoice → QuickBooks sync chain works end-to-end

### TODO-3.3.2: Mobile Responsiveness Audit

**Priority:** 🔴 CRITICAL

Roofers use phones in the field. Critical pages must be mobile-ready:

- [ ] Claim creation form
- [ ] Photo upload / capture
- [ ] Storm Command Center
- [ ] Material estimator
- [ ] Client portal

### TODO-3.3.3: Carrier-Specific Templates

**Priority:** 🟡 HIGH

Pre-build templates for top carriers:

- [ ] State Farm supplement template
- [ ] Allstate supplement template
- [ ] USAA supplement template
- [ ] Farmers supplement template
- [ ] Liberty Mutual supplement template
- [ ] Generic template (customizable)

---

---

## PHASE 4: MARKET ATTACK (Weeks 7-10)

> "Own the conversation in the restoration vertical."

---

### 4.1 — Content Marketing Strategy

### TODO-4.1.1: Create SEO Content Hub

**Priority:** 🟡 HIGH

Blog/resource pages targeting restoration contractors:

- [ ] "How to Write a Roofing Supplement That Gets Approved"
- [ ] "Date of Loss Verification: The Complete Guide"
- [ ] "AccuLynx vs SkaiScraper: Feature Comparison"
- [ ] "JobNimbus vs SkaiScraper: Why Contractors Switch"
- [ ] "AI in Roofing: How Smart Contractors Close More Claims"
- [ ] "The Insurance Restoration Contractor's Tech Stack"
- [ ] "How to Build a Claims-Ready Folder Carriers Can't Deny"
- [ ] "Material Estimation: Stop Overpaying for Shingles"
- [ ] "QuickBooks for Roofers: Setup Guide + Integration"
- [ ] "Bad Faith Insurance Claims: Detection & Documentation"

### TODO-4.1.2: Video Content Series

**Priority:** 🟡 HIGH

- [ ] "60-second claim creation" screen recording
- [ ] "AI supplement builder in action" demo
- [ ] "Weather verification walkthrough"
- [ ] "From photo to damage report" AI demo
- [ ] "Import from AccuLynx in 5 minutes"
- [ ] "Storm Command Center tour"

### TODO-4.1.3: Social Proof Assets

**Priority:** 🟡 HIGH

- [ ] Screenshot library: Storm Center, Claims, Supplements, Material Orders
- [ ] Integration badge display: QuickBooks, ABC Supply, AccuLynx, JobNimbus
- [ ] "Powered by SkaiScraper" badge for contractor websites
- [ ] Case study template (fill with beta contractor data)

---

## 4.2 — Sales & Distribution Strategy

### TODO-4.2.1: Sales Deck Creation

**Priority:** 🟡 HIGH

Build a 12-slide deck:

1. The Problem (fragmented tools, lost supplements, slow cash flow)
2. The Solution (one platform, claims to payment)
3. Storm Command Center screenshot
4. AI Supplement Builder demo
5. Weather Verification demo
6. Material Estimation & ABC Supply
7. QuickBooks Integration
8. Migration from competitors
9. Claims-Ready Folder
10. Pricing (simple, flat rate)
11. ROI calculation
12. Get Started CTA

### TODO-4.2.2: Channel Strategy

**Priority:** 🟡 HIGH

- [ ] Roofing industry trade shows calendar (IRE, FRSA, etc.)
- [ ] Storm chaser Facebook groups & forums
- [ ] Roofing contractor YouTube channels for sponsorship
- [ ] Local roofing association partnerships
- [ ] Insurance adjuster referral program
- [ ] ABC Supply branch partnerships (co-marketing)

### TODO-4.2.3: Referral Program Build

**Priority:** 🟢 MEDIUM

- [ ] "Refer a contractor, get a month free" program
- [ ] Referral tracking in-app
- [ ] Automated referral emails
- [ ] Referral leaderboard

---

## 4.3 — Competitive Moat Deepening

### TODO-4.3.1: Carrier Intelligence Database

**Priority:** 🟢 MEDIUM (Future differentiator)

Over time, build anonymized intelligence:

- [ ] Which carriers approve supplements fastest
- [ ] Average supplement recovery by carrier
- [ ] Common denial reasons by carrier
- [ ] Regional carrier behavior patterns
- [ ] This data becomes the moat — no competitor has it

### TODO-4.3.2: Storm Event Auto-Prospecting

**Priority:** 🟢 MEDIUM

- [ ] When significant hail/wind event detected in service area
- [ ] Auto-generate lead list from affected zip codes
- [ ] Suggest door-knocking routes
- [ ] Pre-fill weather data for new claims in affected area
- [ ] This is the "storm chaser dream feature"

### TODO-4.3.3: Supplement AI Training Loop

**Priority:** 🟢 MEDIUM

- [ ] Track which AI-generated supplements get approved
- [ ] Feed approval/denial data back into prompts
- [ ] Per-carrier supplement optimization over time
- [ ] This creates compounding competitive advantage

---

---

## EXPANSION ROADMAP (Post-Dominance)

---

### After winning the storm/roofing vertical:

| Phase   | Vertical                                   | Timeline |
| ------- | ------------------------------------------ | -------- |
| Phase 5 | Water & Fire Restoration                   | Q3 2026  |
| Phase 6 | Exterior Trades (siding, gutters, windows) | Q4 2026  |
| Phase 7 | High-Ticket Project Trades                 | Q1 2027  |
| Phase 8 | National Franchise Support                 | Q2 2027  |

**Rule: Only expand after proving dominance in storm/roofing.**

---

---

## IMMEDIATE EXECUTION CHECKLIST

> "What to do THIS WEEK"

---

### Week 1 — Messaging & Identity

- [ ] Rewrite homepage hero (TODO-1.1.1)
- [ ] Restructure feature cards (TODO-1.1.2)
- [ ] Update onboarding to ask contractor type (TODO-1.3.1)
- [ ] Reorder sidebar navigation (TODO-1.2.1)
- [ ] Update page titles & metadata (TODO-1.2.2)

## Week 2 — UX Polish

- [ ] Add competitor comparison section (TODO-1.1.3)
- [ ] Update pricing messaging (TODO-1.1.4)
- [ ] Add migration prompt to onboarding (TODO-1.3.2)
- [ ] Build first-run guided tour (TODO-1.3.3)
- [ ] Mobile responsiveness audit (TODO-3.3.2)

## Week 3-4 — Storm Command Center

- [ ] Build Storm Command Center page (TODO-2.1.1)
- [ ] Build Storm Center API (TODO-2.1.2)
- [ ] Build Material Estimator UI (TODO-2.2.1)
- [ ] Build Supplement Dashboard (TODO-2.3.1)
- [ ] Integrate estimator with claims (TODO-2.2.2)

## Week 5-6 — Beta

- [ ] Recruit 5 beta contractors (TODO-3.1.1)
- [ ] Add usage analytics events (TODO-3.2.1)
- [ ] Polish claims workflow end-to-end (TODO-3.3.1)
- [ ] Build beta feedback widget (TODO-3.1.2)
- [ ] Create onboarding kit (TODO-3.1.3)

## Week 7-10 — Market

- [ ] Create SEO content hub (TODO-4.1.1)
- [ ] Record demo videos (TODO-4.1.2)
- [ ] Build sales deck (TODO-4.2.1)
- [ ] Identify distribution channels (TODO-4.2.2)
- [ ] Launch referral program (TODO-4.2.3)

---

## 📐 SUCCESS METRICS

| Metric                     | 30 Days  | 60 Days | 90 Days |
| -------------------------- | -------- | ------- | ------- |
| Beta contractors active    | 5        | 10      | 15      |
| Claims processed (total)   | 50       | 200     | 500     |
| AI supplements generated   | 20       | 100     | 300     |
| Material estimates created | 15       | 75      | 200     |
| QuickBooks syncs active    | 3        | 8       | 15      |
| NPS score                  | —        | 40+     | 50+     |
| Supplement approval rate   | Baseline | +5%     | +10%    |
| Avg claim cycle time       | Baseline | -10%    | -20%    |

---

## 🛑 ANTI-PATTERNS TO AVOID

1. **Do NOT build more backend abstractions.** The infrastructure layer is complete.
2. **Do NOT optimize performance yet.** Ship features, measure, then optimize.
3. **Do NOT add more trades verticals yet.** Win roofing first.
4. **Do NOT build mobile app yet.** Responsive web first, native later.
5. **Do NOT add social features.** The trades network exists; don't expand it.
6. **Do NOT add more AI tools.** Polish what exists; don't add new ones.
7. **Do NOT refactor the codebase.** It works. Ship value instead.

---

## 🏁 THE BOTTOM LINE

**You have built a 327-page, AI-powered, fully-integrated platform
with weather verification, claims management, material routing,
accounting sync, and migration engines.**

**No competitor in the roofing vertical has this.**

**The only thing missing is:**

1. Telling the market it exists
2. Proving it with real contractors
3. Making the product look as powerful as it actually is

**That's what this plan does.**

---

_This document is the single source of truth for strategic direction.
Every engineering decision should reference a TODO in this plan.
If it's not in here, it's not a priority._
