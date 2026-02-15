# 🚀 PHASE 2.1 (3.0) — COMPREHENSIVE IMPLEMENTATION PLAN

**Status**: Schema Updates ✅ | Components & Features 🔄 In Progress  
**Timeline**: 27 major tasks across 9 sections (A-I)  
**Complexity**: Enterprise-grade | Multi-week effort

---

## ✅ COMPLETED (Foundation)

### Database Schema

- [x] Added `OrgMember` model for team management
- [x] Added `ApiKey` model for developer access
- [x] Added `Vendor` model for Vendor Connect
- [x] Added `Export` model for export tracking
- [x] Extended `OrgBranding` with white label fields (subdomain, colors, fonts)
- [x] Extended `User` with assistant preferences (mode, enabled)
- [x] Extended `Subscription` with trial tracking (start, end, tokens granted)
- [x] Extended `Org` with seats tracking (limit, used)
- [x] Created migration: `db/migrations/20251031_phase3_teams_api_keys_white_label.sql`

### Configuration

- [x] Created `src/lib/config/tokens.ts` with costs, quotas, packs
- [x] Created `docs/BILLING_PRICE_MAP.md` with Stripe price mapping

---

## 🔄 IMPLEMENTATION ROADMAP

Given the extensive scope (27 tasks), this should be implemented in **3 sprints**:

### **SPRINT 1 — UI Mode D (Toolbar + Sidebar + Cards)** [Tasks A1-A4]

**Goal**: Perfect pixel-clean dashboard layout  
**Duration**: 3-5 days  
**Dependencies**: None (can start immediately)

#### Tasks:

- [ ] **A1**: Create `ToolbarActions.tsx` component
  - New Report, AI Mockup, Quick DOL, Weather Report, Box Summary buttons
  - Token cost display on hover
  - Balance check before action
  - Open upsell modal if balance=0
- [ ] **A2**: Update `Sidebar.tsx` with AI Tools section
  - Dashboard, Reports, Evidence sections
  - AI Tools sub-menu (Mockups, DOL, Weather, Exports)
  - Team & Billing, Settings links
- [ ] **A3**: Create `AICardsGrid.tsx` dashboard tiles
  - 4 cards: AI Mockup, Quick DOL, Weather Report, Export Builder
  - Show description, token cost, quota snippet
  - "Run now" button + "View history" link
- [ ] **A4**: Pixel polish pass
  - Sticky toolbar on mobile (safe-area)
  - No CLS (reserve heights)
  - Focus traps in modals
  - ARIA labels on all interactive elements
  - 8px Tailwind rhythm

**Acceptance**:

- Toolbar renders above dashboard content
- Sidebar has collapsible AI Tools section
- Cards grid responsive (1 col mobile, 2 col tablet, 4 col desktop)
- All keyboard navigable
- Lighthouse accessibility ≥95

---

### **SPRINT 2 — AI Mode E (Skai Assistant)** [Tasks B1-B3 + C1-C4 + D1-D4]

**Goal**: Smart reactive assistant + AI quick actions + token system  
**Duration**: 5-7 days  
**Dependencies**: Sprint 1 complete (uses toolbar/cards)

#### Part A: Assistant Shell [B1-B3]

- [ ] **B1**: Create assistant components
  - `AssistantLauncher.tsx` (floating button bottom-right)
  - `AssistantPanel.tsx` (sidebar panel for fully_embedded mode)
  - `AssistantSuggestions.tsx` (contextual chips)
  - `AssistantSettings.tsx` (mode toggle dropdown)
  - `assistantStore.ts` Zustand store (mode, isOpen, lastContext)
- [ ] **B2**: Implement smart reactive triggers
  - Autosave error → suggest retry
  - Stripe checkout error → suggest retry + portal link
  - Balance=0 → suggest token purchase
  - User idle on wizard step >60s → suggest help
  - Photo upload detected → suggest Box Summary AI
- [ ] **B3**: Field mode features
  - Voice input button (if mic supported)
  - Photo upload with auto-caption
  - Call Box Summary AI endpoint
  - Optimistic UI updates

#### Part B: AI Quick Actions [C1-C4]

- [ ] **C1**: AI Mockup Modal + API
  - `AIMockupModal.tsx` component
  - Upload → preview → annotate flow
  - `POST /api/ai/mockup` route
  - Token consume (1 per image)
  - Save to Evidence collection
- [ ] **C2**: Quick DOL Pull Modal + API
  - `DOLQuickPullModal.tsx` component
  - Address input → 30s summary
  - `POST /api/ai/dol-pull` route
  - Token consume (1)
  - Save to project notes
- [ ] **C3**: Weather Report Modal + API
  - `WeatherReportModal.tsx` component
  - Address + date range inputs
  - `POST /api/ai/weather-report` route
  - Token consume (1 or 2 based on detail level)
  - Generate claims-ready PDF
  - Return download link
- [ ] **C4**: Carrier Export Builder
  - Create `/ai/exports` page
  - Job selector dropdown
  - Asset picker (photos, captions, DOL, weather)
  - Generate export packet (ZIP or PDF)
  - Store in `exports` table
  - Provide download link

#### Part C: Backend Integration [D1-D4]

- [ ] **D1**: Token ledger tracking
  - Verify `TokenLedger` model exists (already in schema as `tokens_ledger`)
  - Update `lib/tokens.ts` to log all add/consume operations
  - Add `recordLedger(userId, delta, reason, meta)` function
- [ ] **D2**: AI endpoints implementation
  - Create `app/api/ai/mockup/route.ts`
  - Create `app/api/ai/dol-pull/route.ts`
  - Create `app/api/ai/weather-report/route.ts`
  - All routes: validate balance → consume → return result
  - Stub AI processing (return mock data for now)
- [ ] **D3**: Stripe webhook auto-credit
  - Update `app/api/stripe/webhook/route.ts`
  - Handle `checkout.session.completed`
  - Handle `invoice.payment_succeeded` (optional)
  - Map price IDs to token credits using BILLING_PRICE_MAP
  - Call `addTokens(userId, amount, "stripe")`
  - Write ledger entry
  - Verify with `STRIPE_WEBHOOK_SECRET`
- [ ] **D4**: 3-day free trial setup
  - Update checkout to set `trial_period_days=3`
  - On trial start: grant 5 starter tokens
  - On trial end: continue billing (if not canceled)
  - On cancellation: retain data, restrict features
  - Update `Subscription` status accordingly

**Acceptance**:

- Assistant launcher visible on all pages
- Mode toggle works (passive/smart_reactive/fully_embedded/field_mode)
- Triggers fire correctly (test with autosave error, balance=0)
- All 3 AI modals functional with token deduction
- Carrier export generates ZIP/PDF
- Webhook credits tokens on payment
- Trial grants 5 tokens and converts after 3 days

---

### **SPRINT 3 — Enterprise Features (Teams + API Keys + White Label + Vendor Connect)** [Tasks E1-E3 + F1-F2 + G1-G3 + H1-H2]

**Goal**: Multi-tenant, API access, white labeling, vendor integrations  
**Duration**: 7-10 days  
**Dependencies**: Sprint 2 complete (uses token system)

#### Part A: Teams & Org Billing [E1]

- [ ] **E1**: Teams/Seats implementation
  - Create `/settings/team` page
  - List current members (from `OrgMember`)
  - Invite by email (create pending `OrgMember`, send email)
  - Manage roles (owner, admin, member)
  - Remove members (soft delete or hard delete)
  - Enforce seat limits (check `Org.seatsLimit` vs `seatsUsed`)
  - Update `/settings/billing` page
    - Show current plan, seats used/limit
    - Payment method (Stripe portal link)
    - Cancel subscription button

#### Part B: API Keys [E2]

- [ ] **E2**: Developer console
  - Create `/settings/api-keys` page
  - List existing keys (show `keyPrefix`, `createdAt`, `lastUsedAt`)
  - Create new key button
    - Generate random key (e.g., `sk_live_${randomBytes(32)}`)
    - Hash key with bcrypt
    - Store `keyPrefix` (first 8 chars)
    - Show full key ONCE (copy to clipboard)
  - Revoke key button (set `revokedAt`)
  - Rotate key (revoke old, create new)
  - Create `POST /api/keys/create` route
  - Create `POST /api/keys/revoke/:id` route
  - Middleware to validate API key on protected routes

#### Part C: White Label Mode [E3]

- [ ] **E3**: Custom branding & subdomains
  - Create `/settings/branding` page
  - Form fields: `subdomain`, `colorPrimary`, `colorSecondary`, `colorAccent`, `fontFamily`, `logoUrl`, `faviconUrl`, `customCss`
  - Live preview (update CSS variables in real-time)
  - Save to `OrgBranding` table
  - Middleware to detect subdomain
    - If `request.hostname` matches `${subdomain}.skaiscrape.com`
    - Load `OrgBranding` for that subdomain
    - Apply theme via CSS variables
  - Update layout components to respect theme

#### Part D: Vendor Connect [F1]

- [ ] **F1**: Vendor onboarding
  - Create `/vendor/onboarding` page (public)
  - Form: company name, contact email/phone, service categories, API endpoint
  - Submit → create `Vendor` with status="pending"
  - Email notification to admin
  - Create `/admin/vendor-connect` page (admin only)
  - List all vendors with status filter
  - Approve/reject buttons
  - Set `approvedBy`, `approvedAt`
  - Update `status` to "approved" or "rejected"

#### Part E: CRM Exports [F2]

- [ ] **F2**: Export generation
  - On `/ai/exports` page (from Sprint 2, C4)
  - Add "Export Packet (ZIP)" button
    - Bundle: photos, captions, DOL summary, weather PDF, metadata JSON
    - Generate ZIP file
    - Store in S3/Supabase Storage
    - Save record in `exports` table
    - Return download link
  - Add "Carrier Report (PDF)" button
    - Condensed version formatted for carriers
    - Generate PDF (use jsPDF or Puppeteer)
    - Store and return download link
  - Show export history (list from `exports` table)

#### Part F: Reliability [G1-G3]

- [ ] **G1**: Retry logic + error states
  - Update `useAutoSave` hook: exponential backoff (400ms, 800ms, 1600ms, 3200ms)
  - If exhausted, assistant suggests "Retry autosave"
  - Stripe checkout errors: show "Try again" button + portal link
  - Token calls: optimistic update + rollback on failure
  - Assistant pops with one-click "Buy tokens" on exhaustion
- [ ] **G2**: Event tracking
  - Create `lib/analytics.ts`
  - `track(event, data)` function (stub to console if no PostHog/Amplitude key)
  - Instrument events:
    - `wizard_started`, `wizard_step_completed`, `wizard_submitted`
    - `token_purchased`, `token_consumed`, `token_exhausted`
    - `checkout_started`, `checkout_succeeded`, `checkout_failed`
    - `ai_mockup_run`, `dol_pull_run`, `weather_report_run`, `export_built`
  - Add to wizard, token system, checkout flows
- [ ] **G3**: Lighthouse CI
  - Add npm script: `"lighthouse:check": "lhci autorun"`
  - Create `.lighthouserc.json` config
  - Target routes: `/`, `/pricing`, `/sign-up`, `/dashboard`, `/report/new`
  - Assert: Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO ≥90
  - Run in CI/CD (GitHub Actions)

#### Part G: Pricing & Signup Validation [H1-H2]

- [ ] **H1**: Pricing page canonical check
  - Verify plans match: SOLO $29.99, BUSINESS $139.99, ENTERPRISE $399
  - Verify quotas listed correctly
  - Verify overage pricing: +$0.99 mockup/DOL, +$8.99 WVR
  - Verify token packs: $9.99, $39.99, $149.99
  - Verify CTAs: "Start free trial" + "Book a demo"
  - Remove all "Pro" mentions
- [ ] **H2**: Signup page polish
  - Header: "Start your free trial"
  - Bullets: Lightning Fast • AI Accuracy • Instant Export
  - If signed in → redirect `/dashboard` (unless `?to=home`)
  - Mobile responsive
  - No CLS

**Acceptance**:

- Team invites work, roles enforced
- API keys can be created, revoked, validated
- White label theming applies per subdomain
- Vendor onboarding form saves, admin approval works
- Exports generate ZIP and PDF correctly
- Retry logic prevents errors
- Analytics events fire
- Lighthouse passes on all routes
- Pricing and signup match spec

---

## 📋 FINAL DELIVERABLES [I1-I2]

### Documentation & Migration [I1]

- [x] `BILLING_PRICE_MAP.md` created
- [ ] Update `README.md` with Phase 2.1 features
- [ ] Create `docs/ASSISTANT_MODES.md` (Skai Assistant guide)
- [ ] Create `docs/API_KEYS_USAGE.md` (Developer console guide)
- [ ] Create `docs/WHITE_LABEL_SETUP.md` (Custom branding guide)
- [x] Migration file: `db/migrations/20251031_phase3_teams_api_keys_white_label.sql`

### Testing & QA [I2]

- [ ] TypeScript: `pnpm typecheck` passes
- [ ] Lint: `pnpm lint` passes
- [ ] Build: `pnpm build` succeeds
- [ ] No route collisions (verify with `pnpm build` output)
- [ ] Accessibility: ARIA labels, focus management, keyboard nav
- [ ] Lighthouse: ≥95 on `/`, `/pricing`, `/sign-up`, `/dashboard`, `/report/new`
- [ ] Manual smoke tests:
  - [ ] Sign up → trial starts → 5 tokens granted
  - [ ] Dashboard → toolbar buttons work
  - [ ] AI Mockup modal → upload → consume token → save
  - [ ] Quick DOL → address → summary → save
  - [ ] Weather Report → generate PDF → download
  - [ ] Export → select job → generate ZIP → download
  - [ ] Team invite → accept → join org
  - [ ] API key create → copy → use in request → validate
  - [ ] Branding → change colors → see live preview → save → verify
  - [ ] Vendor onboarding → submit → admin approve → status updated
  - [ ] Stripe checkout → complete → webhook → tokens credited
  - [ ] Assistant → trigger on error → one-click fix

---

## 🚨 CRITICAL PATHS

### Before Sprint 1:

1. ✅ Run Prisma migration locally: `npx prisma migrate dev`
2. ✅ Generate Prisma client: `npx prisma generate`
3. [ ] Create ENV vars for token pack price IDs

### Before Sprint 2:

1. [ ] Implement basic token consume/add functions in `lib/tokens.ts`
2. [ ] Test webhook locally with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Before Sprint 3:

1. [ ] Set up subdomain DNS (wildcard: `*.skaiscrape.com → Vercel`)
2. [ ] Configure CORS for API key access
3. [ ] Set up email service (Resend/SendGrid) for team invites

### Before Production Deploy:

1. [ ] Run migration in production: `psql "$DATABASE_URL" -f db/migrations/20251031_phase3_teams_api_keys_white_label.sql`
2. [ ] Add all ENV vars to Vercel Production
3. [ ] Test trial flow end-to-end in test mode
4. [ ] Switch Stripe to live keys
5. [ ] Lighthouse audit on production URLs

---

## 📊 PROGRESS TRACKER

**Schema**: ✅ 100% (8/8 models updated/created)  
**Config**: ✅ 100% (2/2 files created)  
**Components**: ⏳ 0% (0/20 components created)  
**API Routes**: ⏳ 0% (0/8 routes created)  
**Pages**: ⏳ 0% (0/10 pages created)  
**Documentation**: 🔄 25% (2/8 docs complete)  
**Testing**: ⏳ 0% (0/12 tests passing)

**Overall**: 🔄 **15% Complete** (5/33 tasks)

---

## 🎯 RECOMMENDATION

Given the scope, I recommend we proceed in **phases**:

### Option A: Implement Sprint 1 Only (UI Mode D)

- **Timeline**: 3-5 days
- **Scope**: Toolbar, Sidebar, Cards, Pixel Polish
- **Deploy**: PR → Preview → Merge → Production
- **Benefit**: Users see visual improvements immediately

### Option B: Implement Sprints 1+2 (UI + AI)

- **Timeline**: 8-12 days
- **Scope**: Dashboard UI + Skai Assistant + AI Actions + Tokens
- **Deploy**: Feature branch → multiple PRs → staged rollout
- **Benefit**: Full AI workflow functional

### Option C: Full Phase 2.1 (All 3 Sprints)

- **Timeline**: 15-22 days
- **Scope**: Everything (UI + AI + Enterprise)
- **Deploy**: Long-lived feature branch → beta testing → production
- **Benefit**: Enterprise-ready platform

---

**Which path should we take?**

Reply with:

- **"Sprint 1"** — UI Mode D only (toolbar, sidebar, cards)
- **"Sprint 1+2"** — UI + AI Mode E (assistant, modals, webhooks)
- **"Full Phase 2.1"** — All features (teams, API keys, white label, vendor connect)
- **"Custom"** — Pick specific tasks from the list

I'll proceed with systematic implementation based on your choice!

_Last Updated: October 31, 2025_
