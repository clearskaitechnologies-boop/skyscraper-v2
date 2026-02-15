# Demo Checklist - Pre-Launch Verification

Use this checklist before any live demo, investor presentation, or production deployment.

## 🎯 Quick Pre-Demo Test (5 minutes)

### Prerequisites

- [ ] Demo seed data loaded (auto-runs on first login)
- [ ] Browser cleared/incognito mode ready
- [ ] Test credentials ready

---

## 👨‍💼 PRO USER LOGIN TEST

**Email:** buildwithdamienray@gmail.com  
**Expected:** Full pro dashboard with populated data

### Dashboard (`/dashboard`)

- [ ] SkaiScraper branding visible
- [ ] Dashboard loads without "Please sign in" message
- [ ] Shows populated metrics (3 leads, 3 claims, etc.)
- [ ] Weather summary card displays
- [ ] Stats cards show numbers (not loading forever)
- [ ] Charts render (even if simple)
- [ ] Recent activity shows entries
- [ ] Network activity displays

### Claims List (`/claims`)

- [ ] Shows 3 demo claims
- [ ] Claim cards display properly
- [ ] Status badges visible (active, filed, approved)
- [ ] Can click into a claim detail

### Claim Detail (`/claims/[claimId]`)

- [ ] Header shows claim number
- [ ] Trade partners section loads
- [ ] **AI Reports & Analysis section displays**
- [ ] Shows 2 AI reports (Weather + Rebuttal)
- [ ] Can expand/collapse report details
- [ ] Timeline section shows events
- [ ] Generated Reports section works
- [ ] No "loading..." placeholders stuck

### Weather Report (`/weather-report`)

- [ ] **Generate Weather Report button is VISIBLE**
- [ ] Button works in light mode ✅
- [ ] Button works in dark mode ✅
- [ ] Address input field present
- [ ] Can enter address
- [ ] Generate button not hidden/transparent

### Map View (`/maps/map-view`)

- [ ] Map loads (no infinite spinner)
- [ ] Shows default Phoenix/Prescott area
- [ ] **Does NOT spin forever**
- [ ] Navigation controls visible
- [ ] Graceful error message if token issues

### Messages (`/messages`)

- [ ] **Does NOT show infinite "Loading conversations..."**
- [ ] Shows conversation list OR empty state
- [ ] If empty: Clear message about starting conversations
- [ ] If populated: Shows demo thread
- [ ] No skeleton loaders stuck

### Route Optimizer (`/route-optimizer`)

- [ ] **Add Stop button is VISIBLE and styled**
- [ ] **Optimize Route button is VISIBLE and styled**
- [ ] Both buttons have proper pill shape
- [ ] Buttons work in light/dark mode
- [ ] Address input field present

### Leads (`/leads`)

- [ ] Shows 3 demo leads
- [ ] Lead cards display contact info
- [ ] Status/temperature badges visible
- [ ] Can create new lead

### Trade Partners (`/trade-partners`)

- [ ] Shows 2 demo trade partners OR empty state
- [ ] No errors/crashes
- [ ] Clean UI, not broken

---

## 🏠 CLIENT PORTAL TEST (Optional)

**Test:** Homeowner/client view of platform

### Portal Home (`/portal`)

- [ ] Portal navigation visible
- [ ] Different from pro navigation
- [ ] Clear branding/title

### Portal Profile (`/portal/profile`)

- [ ] Clerk profile card shows
- [ ] **Homeowner Profile section present** (if implemented)
- [ ] Can edit phone/address (if implemented)
- [ ] Saves without errors

### Portal Claims (`/portal/claims`)

- [ ] Shows linked claim OR clear "not connected" message
- [ ] If linked: Claim details visible
- [ ] If not linked: Instructions on how to get invited
- [ ] No 500 errors or crashes

---

## 🔧 TECHNICAL CHECKS

### Build & Deploy

- [ ] `pnpm build` succeeds with no errors
- [ ] All pages compile (382+ pages)
- [ ] No TypeScript errors
- [ ] Latest commit pushed to GitHub
- [ ] Vercel deployment completed

### Database

- [ ] Prisma schema up to date
- [ ] Demo seed ran successfully
- [ ] At least 3 claims, 3 leads exist
- [ ] AI reports table populated (4-6 records)

### Environment

- [ ] NEXT_PUBLIC_MAPBOX_TOKEN set
- [ ] CLERK keys configured
- [ ] DATABASE_URL working
- [ ] OPENAI_API_KEY present (for AI features)

---

## 🚨 KNOWN ISSUES TO MONITOR

### Emergency Patch #2 Fixed These:

- ✅ Weather button now visible in light mode
- ✅ Dashboard no longer shows false "sign in" message
- ✅ Map view has timeout, won't spin forever
- ✅ Messages has 3s timeout, won't spin forever
- ✅ Route Optimizer buttons properly styled

### Still in Progress:

- ⚠️ Phase 4 data model cleanup (dormant, no destructive changes yet)
- ⚠️ Full portal invitation system (demo auto-link available)
- ⚠️ Advanced AI features beyond weather/rebuttal

---

## 🎬 DEMO SCRIPT SUGGESTIONS

### 1. Opening (Dashboard)

> "This is SkaiScraper, an AI-powered claims management platform for roofing contractors. Let me show you the dashboard..."

**Action:** Log in, show populated dashboard

### 2. Claims Management

> "Here are active claims. Let's look at this one..."

**Action:** Click claim, show timeline, trades, AI reports

### 3. AI Features (★ KEY DEMO POINT)

> "This is where AI shines. We've already generated a weather report and a rebuttal letter..."

**Action:** Expand AI report, show confidence score, weather events

### 4. Weather Tool

> "We can generate new reports instantly..."

**Action:** Go to Weather Report page, enter address, hit Generate

### 5. Client Portal (if ready)

> "Homeowners see a simplified view..."

**Action:** Switch to portal view, show claim status

---

## 📝 POST-DEMO NOTES

After the demo, document:

- [ ] What worked well
- [ ] What confused the audience
- [ ] Feature requests mentioned
- [ ] Bugs discovered (add to backlog)
- [ ] Demo environment still clean

---

## 🆘 EMERGENCY CONTACTS

**If something breaks during demo:**

1. Refresh the page (solves 80% of issues)
2. Check browser console for errors
3. Fall back to explaining the feature
4. Note the issue for immediate fix

**Fallback URLs:**

- Dashboard: `/dashboard`
- Claims: `/claims`
- Weather: `/weather-report`

**Quick Recovery:**

```bash
# If demo environment breaks
pnpm build
vercel --prod

# If database issues
pnpm tsx scripts/demo-seed.ts
```

---

## ✅ SIGN-OFF

**Verified By:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***  
**Demo Date:** **\*\*\*\***\_**\*\*\*\***  
**Audience:** **\*\*\*\***\_**\*\*\*\***

**Overall Status:**

- [ ] Green Light - Ready to Demo
- [ ] Yellow - Minor issues, can proceed with caution
- [ ] Red - Critical issues, reschedule

**Notes:**

---

---

---
