# 🎯 PHASE 3 SPRINT 1+2 — QUICK START COMMANDS

**Use this file for fast execution of all deployment steps.**

---

## 🚀 DEPLOYMENT SEQUENCE

### 1. Verify Build (Local)

```bash
# Install dependencies (if needed)
pnpm install

# Generate Prisma client
pnpm prisma generate

# Build for production
pnpm build

# Expected: ✓ Compiled successfully
# If errors: Fix TypeScript/ESLint issues before proceeding
```

### 2. Database Migration (Production)

```bash
# Apply Phase 3 schema
psql "$DATABASE_URL" -f db/migrations/20251031_phase3_teams_api_keys_white_label.sql

# Verify new tables
psql "$DATABASE_URL" -c "\dt" | grep -E "org_members|api_keys|vendors|exports"

# Expected output:
#  public | api_keys    | table | ...
#  public | exports     | table | ...
#  public | org_members | table | ...
#  public | vendors     | table | ...
```

### 3. Environment Variables (Vercel Dashboard)

```bash
# Add via Vercel CLI or Dashboard
vercel env add NEXT_PUBLIC_TOKEN_PACK_STARTER_PRICE_ID production
vercel env add NEXT_PUBLIC_TOKEN_PACK_PRO_PRICE_ID production
vercel env add NEXT_PUBLIC_TOKEN_PACK_ENTERPRISE_PRICE_ID production
vercel env add NEXT_PUBLIC_DEMO_URL production  # Optional

# Verify existing
vercel env ls
```

### 4. Stripe Webhook Configuration

```bash
# Update endpoint in Stripe Dashboard → Developers → Webhooks
# Endpoint URL: https://skaiscrape.com/api/stripe/webhook
# Events:
#   - checkout.session.completed
#   - invoice.payment_succeeded
#   - customer.subscription.trial_will_end
#   - customer.subscription.updated
#   - customer.subscription.deleted

# Test locally (Stripe CLI)
stripe listen --forward-to localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed --override checkout_session:metadata.userId=test-user-123

# Expected: TokensLedger row created, wallet balance incremented
```

### 5. Run QA Tests

```bash
# Automated smoke tests
./scripts/qa-phase3-sprint1-2.sh https://skaiscrape.com

# Manual tests (see output for checklist)
```

---

## 📋 MANUAL QA CHECKLIST (Copy/Paste into PR)

```markdown
### Marketing Pages

- [ ] Visit `/` → LaunchBanner visible at top
- [ ] Click "Start Free Trial" → redirects to `/sign-up`
- [ ] Click "Book Demo" → redirects to demo URL or `/contact`
- [ ] Dismiss banner → reload page → banner hidden
- [ ] Clear localStorage → reload → banner reappears
- [ ] Sign in → visit `/` → banner hidden

### Dashboard (Authenticated)

- [ ] Visit `/dashboard` → ToolbarActions at top
- [ ] 5 buttons visible with icons
- [ ] Hover "AI Mockup" → tooltip shows "1 token"
- [ ] Click "New Report" → navigates to `/report/new`
- [ ] AICardsGrid shows 4 cards
- [ ] Cards responsive: 1 col mobile, 2 col tablet, 4 col desktop
- [ ] Click "Run now" on any card → navigates correctly
- [ ] Click "View history" → navigates to history page

### Navigation

- [ ] Sidebar visible on left
- [ ] "AI Tools" dropdown present
- [ ] Hover "AI Tools" → shows 4 items
- [ ] Click "AI Mockups" → navigates to `/ai/mockups`
- [ ] Click "Quick DOL Pulls" → navigates to `/ai/dol`
- [ ] Click "Weather Reports" → navigates to `/ai/weather`
- [ ] Click "Carrier Export Builder" → navigates to `/ai/exports`
- [ ] Active tab highlighted correctly

### Assistant

- [ ] Floating button visible bottom-right
- [ ] Click button → panel slides in from bottom-right
- [ ] Panel shows "No suggestions" initially
- [ ] Visit `/settings` → AssistantSettings visible
- [ ] Toggle "Enable Skai Assistant" → launcher appears/disappears
- [ ] Select "Passive" mode → no auto-open
- [ ] Select "Smart Reactive" → launcher auto-opens on triggers
- [ ] Close panel → button changes back to MessageCircle icon

### Analytics (Browser Console)

- [ ] Open DevTools → Console tab
- [ ] Click LaunchBanner "Start Free Trial" → see `[Analytics] { event: "banner_clicked", cta: "trial" }`
- [ ] Dismiss banner → see `[Analytics] { event: "banner_dismissed" }`
- [ ] Open assistant → see `[Analytics] { event: "assistant_opened", mode: "..." }`
- [ ] Change assistant mode → see `[Analytics] { event: "assistant_mode_changed" }`

### Accessibility

- [ ] Tab through LaunchBanner → CTAs focusable with visible ring
- [ ] Tab through ToolbarActions → all buttons focusable
- [ ] Tab through AICardsGrid → "Run now" and "View history" focusable
- [ ] Tab through Navigation → dropdown items accessible
- [ ] Esc key closes assistant panel
- [ ] Screen reader announces ARIA labels correctly

### Responsive Design

- [ ] Mobile (375px): Banner shows as bottom pill
- [ ] Mobile (375px): Toolbar buttons show icons only
- [ ] Mobile (375px): AICardsGrid shows 1 column
- [ ] Tablet (768px): AICardsGrid shows 2 columns
- [ ] Desktop (1280px): Banner shows as top bar
- [ ] Desktop (1280px): Toolbar shows icons + labels
- [ ] Desktop (1280px): AICardsGrid shows 4 columns
```

---

## 🔍 TROUBLESHOOTING

### Build Fails

```bash
# Check TypeScript errors
pnpm typecheck  # (if script exists)
# OR
npx tsc --noEmit

# Check ESLint errors
pnpm lint

# Common issues:
# - Missing import for new components
# - Type errors in stores/analytics
# - ARIA attribute warnings (should be fixed)
```

### Database Migration Fails

```bash
# Check if tables already exist
psql "$DATABASE_URL" -c "\dt" | grep org_members

# If exists, migration may have run already
# To force re-run (DANGER: drops data):
# psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS org_members, api_keys, vendors, exports CASCADE;"
# psql "$DATABASE_URL" -f db/migrations/20251031_phase3_teams_api_keys_white_label.sql
```

### Webhook Not Crediting Tokens

```bash
# Check Stripe webhook logs
# Stripe Dashboard → Developers → Webhooks → [your endpoint] → Events

# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal:
stripe trigger checkout.session.completed

# Check Vercel logs for webhook processing
vercel logs --follow

# Expected log:
# "📨 Webhook received: checkout.session.completed"
# "✅ Added X tokens to user Y (stripe_purchase)"
```

### LaunchBanner Not Showing

```bash
# Check localStorage
# Browser Console:
localStorage.getItem('skaiscraper_banner_dismissed')

# If dismissed, clear to reset:
localStorage.removeItem('skaiscraper_banner_dismissed')

# Reload page → banner should appear
```

### AssistantLauncher Not Showing

```bash
# Check assistantStore
# Browser Console:
localStorage.getItem('skai-assistant-storage')

# Expected: { "state": { "mode": "...", "isEnabled": true }, ... }

# If isEnabled = false, toggle in settings or:
localStorage.setItem('skai-assistant-storage', '{"state":{"mode":"smart_reactive","isEnabled":true},"version":0}')

# Reload page → launcher should appear
```

### Analytics Not Tracking

```bash
# Check browser console for errors
# Common issues:
# - PostHog not loaded (expected if no POSTHOG_KEY)
# - window.analytics undefined (OK, uses console fallback)
# - Events not firing (check component onClick handlers)

# Verify events fire:
# 1. Open Console → Filter by "[Analytics]"
# 2. Perform action (click banner, open assistant)
# 3. See log with event details
```

---

## 🎬 POST-DEPLOYMENT VERIFICATION

### 1. Production Smoke Test (5 min)

```bash
# Homepage
curl -sS https://skaiscrape.com/ | grep "SkaiScraper is live"

# Pricing
curl -sS https://skaiscrape.com/pricing | grep -o "SOLO\|BUSINESS\|ENTERPRISE" | head -3

# Signup
curl -sS -I https://skaiscrape.com/sign-up | grep "HTTP/2 200"

# API (expect 401)
curl -sS -o /dev/null -w "%{http_code}" https://skaiscrape.com/api/tokens/balance
```

### 2. Database Verification

```bash
# Count rows in new tables
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM org_members;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM api_keys;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM vendors;"
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM exports;"

# All should return 0 (empty tables initially)
```

### 3. Stripe Webhook Test

```bash
# Use Stripe CLI
stripe trigger checkout.session.completed

# Check Vercel logs
vercel logs --follow | grep "Webhook"

# Expected:
# "📨 Webhook received: checkout.session.completed (evt_...)"
# "✅ Added 10 tokens to user ... (stripe_purchase)"
```

### 4. Lighthouse Audit

```bash
npx lighthouse https://skaiscrape.com/ \
  --only-categories=accessibility,performance \
  --output=html \
  --output-path=./lighthouse-report.html

# Open report
open ./lighthouse-report.html

# Target: Accessibility ≥95, Performance ≥90
```

---

## 🎉 SUCCESS CRITERIA

**All systems GO when:**

- [x] Build passes (`pnpm build` succeeds)
- [x] Database migration applied (4 tables exist)
- [x] ENV variables present in Vercel
- [x] Stripe webhook endpoint updated
- [x] Homepage shows LaunchBanner
- [x] Dashboard shows ToolbarActions + AICardsGrid
- [x] Navigation has AI Tools dropdown
- [x] AssistantLauncher floating button visible
- [x] Analytics events log to console
- [x] Webhook credits tokens on test purchase
- [x] Lighthouse accessibility ≥95

**Then**: Phase 3 Sprint 1+2 is **LIVE** ✅

---

## 📞 SUPPORT

**Vercel Deploy Issues**:

```bash
vercel logs --follow
vercel env ls
vercel inspect [deployment-url]
```

**Database Issues**:

```bash
psql "$DATABASE_URL" -c "SELECT version();"
psql "$DATABASE_URL" -c "\dt"
psql "$DATABASE_URL" -c "SELECT * FROM webhookevent ORDER BY createdat DESC LIMIT 5;"
```

**Stripe Issues**:

```bash
stripe logs tail
stripe webhooks list
stripe events list --limit 10
```

**Next Steps**: See `PHASE_3_SPRINT_1_2_DEPLOYMENT.md` for full guide.

---

**Ready to ship!** 🚀
