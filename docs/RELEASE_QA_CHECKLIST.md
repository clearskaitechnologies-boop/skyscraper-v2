# 🚀 Release QA Checklist — SkaiScraper Production

**Version:** 1.0  
**Test Date:** ****\_\_\_\_****  
**Tester:** ****\_\_\_\_****

---

## ✅ Pre-Deployment Verification

- [ ] All environment variables configured (`.env.local` matches production)
- [ ] Database migrations applied (`pnpm prisma migrate deploy`)
- [ ] Build passes without errors (`pnpm build`)
- [ ] Lint passes (`pnpm lint`)
- [ ] Prisma schema validates (`pnpm prisma validate`)
- [ ] All commits pushed to `main` branch
- [ ] Vercel deployment successful
- [ ] Production domain accessible

---

## 🏠 Core Navigation & Landing

### Landing Page (`/`)

- [ ] Page loads without errors
- [ ] Hero section displays correctly
- [ ] CTA buttons work (Sign Up, Dashboard)
- [ ] Footer links functional
- [ ] Mobile responsive (test 375px, 768px)

### Authentication

- [ ] Sign In page loads (`/sign-in`)
- [ ] Sign Up page loads (`/sign-up`)
- [ ] Clerk authentication works
- [ ] After sign-in, redirects to dashboard
- [ ] Sign out works properly

### Dashboard (`/dashboard`)

- [ ] Loads without errors
- [ ] Stats cards display correct data
- [ ] Charts render (if any)
- [ ] Quick actions work
- [ ] No console errors

---

## 📂 Claims Workflow (END-TO-END CRITICAL)

### Claims List (`/claims`)

- [ ] List loads with proper pagination
- [ ] Search works
- [ ] Filters work (status, type, etc.)
- [ ] "New Claim" button visible and functional
- [ ] Empty state displays if no claims
- [ ] Mobile responsive

### Create New Claim

- [ ] Form loads at `/claims/new` (or modal)
- [ ] All required fields validate
- [ ] Submit creates claim successfully
- [ ] Redirects to claim detail page
- [ ] Error handling works (try invalid data)

### Claim Detail Page (`/claims/[claimId]`)

- [ ] Overview tab loads
- [ ] Claim header shows correct info
- [ ] Status badge displays correctly
- [ ] Primary actions visible (Edit, Generate Report, etc.)
- [ ] Breadcrumbs work (← Back to Claims)

### Claim Timeline (`/claims/[claimId]/timeline`)

- [ ] Events load in chronological order
- [ ] "Add Note" button works
- [ ] Event type dropdown **readable** (not white on white)
- [ ] New events save successfully
- [ ] Timestamps display correctly

### Claim Photos (`/claims/[claimId]/photos`)

- [ ] Photo grid loads
- [ ] Upload button works
- [ ] Photos upload successfully
- [ ] Lightbox/modal view works
- [ ] Delete photo works
- [ ] Empty state displays if no photos

### Claim Documents (`/claims/[claimId]/documents`)

- [ ] Document list loads
- [ ] Upload button works
- [ ] Documents upload successfully
- [ ] Download works
- [ ] Category/type displays correctly
- [ ] Empty state helpful

### Claim Reports (`/claims/[claimId]/reports`)

- [ ] **"Reports" tab loads**
- [ ] **"AI Artifacts" tab loads**
- [ ] AI Artifacts display cards with:
  - [ ] Type badge (readable)
  - [ ] Status badge (readable)
  - [ ] View button works → navigates to `/claims/[ID]/artifacts/[ID]/view`
  - [ ] Edit button works → navigates to `/claims/[ID]/artifacts/[ID]/edit`
  - [ ] Export PDF button works → generates PDF + creates document
  - [ ] Delete button works (with confirmation)
- [ ] Empty state shows if no artifacts
- [ ] "Explore AI Tools" link works

### Claim Messages (`/claims/[claimId]/messages`)

- [ ] Message thread loads
- [ ] Send message button works
- [ ] Messages save and display
- [ ] Recipient field functional

---

## 🤖 AI Features

### AI Artifacts View Page (`/claims/[ID]/artifacts/[ID]/view`)

- [ ] Artifact content displays correctly
- [ ] Metadata shows (created date, status, etc.)
- [ ] Edit button navigates to edit page
- [ ] Export PDF button works
- [ ] Back to Reports link works
- [ ] Org branding visible (if applicable)

### AI Artifacts Edit Page (`/claims/[ID]/artifacts/[ID]/edit`)

- [ ] Title field editable
- [ ] Content textarea editable
- [ ] Status dropdown works
- [ ] Save button works → updates artifact
- [ ] Cancel button returns to view page
- [ ] Errors display clearly

### AI Tools (Estimate, Supplement, Rebuttal)

- [ ] Tools accessible via navigation
- [ ] Forms load correctly
- [ ] Submit generates artifact
- [ ] Artifact appears in Reports → AI Artifacts tab
- [ ] Loading state shows during generation

### PDF Export

- [ ] Export PDF creates document record
- [ ] PDF includes org branding (logo, colors)
- [ ] PDF accessible via Documents tab
- [ ] Download link works
- [ ] PDF is well-formatted

---

## 🌐 Network Features

### Network Hub (`/network`)

- [ ] Overview loads with stats
- [ ] Three network sections visible (Trades, Vendors, Clients)
- [ ] Navigation links work

### Trades Network (`/network/trades`)

- [ ] Companies list loads
- [ ] Onboarding flow works (if applicable)
- [ ] Click company → detail page loads (`/network/trades/[companyId]`)

### Trades Company Detail (`/network/trades/[companyId]`)

- [ ] Company info displays
- [ ] Members list shows
- [ ] Projects list shows
- [ ] Back button works

### Vendors Directory (`/network/vendors`)

- [ ] Vendor list loads
- [ ] Locations display correctly
- [ ] Contact info visible
- [ ] Resources downloadable

### Client Directory (`/network/clients`)

- [ ] Client networks list loads
- [ ] Navigation works
- [ ] No broken links

---

## 📄 Templates & Marketplace

### Templates Marketplace (`/templates`)

- [ ] Template cards display
- [ ] Search works
- [ ] Filters work
- [ ] Click template → detail page
- [ ] Thumbnails load (or fallback state shows)

### Template Detail/Preview

- [ ] Preview loads correctly
- [ ] "Apply to Claim" button works
- [ ] Guides user to select claim if needed
- [ ] No dead ends

---

## ⚙️ Settings & Admin

### Settings (`/settings`)

- [ ] Page loads
- [ ] All tabs accessible
- [ ] Forms save correctly

### Organization Settings (`/settings/organization`)

- [ ] Org info editable
- [ ] Branding settings work
- [ ] Logo upload works

### Team Management (`/settings/team`)

- [ ] Team members list loads
- [ ] Invite works
- [ ] Role changes work

### UI Audit Page (`/settings/ui-audit`)

- [ ] Loads correctly
- [ ] All links functional
- [ ] QA checklist visible

---

## 🎨 Raven UI Consistency

### Visual Verification

- [ ] **No white text on white backgrounds anywhere**
- [ ] **No `text-slate-100` on white backgrounds**
- [ ] **All dropdown menus readable** (Select, Menu, Popover)
- [ ] **Timeline event dropdown readable**
- [ ] **Primary CTAs use Raven blue** (#3b82f6)
- [ ] **Buttons consistent** (no ghost buttons that should be primary)
- [ ] **Empty states styled consistently** (helpful + icon + CTA)
- [ ] **Loading states consistent** (skeletons/spinners)
- [ ] **Error states clear** (red bg, helpful message, retry)
- [ ] **Form inputs have visible borders and labels**
- [ ] **Focus rings visible on tab navigation**

### Mobile Responsiveness

- [ ] Test at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1024px (desktop)
- [ ] No horizontal scroll
- [ ] Navigation works on mobile

---

## 🚨 Critical User Flows (E2E)

### Flow 1: New User Onboarding

1. [ ] Sign up with new account
2. [ ] Complete onboarding (if applicable)
3. [ ] Land on dashboard
4. [ ] Create first claim
5. [ ] Upload photo to claim
6. [ ] Generate AI estimate
7. [ ] Export PDF
8. [ ] Verify PDF in Documents tab

### Flow 2: Existing User Daily Work

1. [ ] Sign in
2. [ ] Navigate to claims list
3. [ ] Open existing claim
4. [ ] Add timeline note
5. [ ] Upload document
6. [ ] View AI artifacts
7. [ ] Edit artifact
8. [ ] Export PDF

### Flow 3: Network Integration

1. [ ] Navigate to Network Hub
2. [ ] View Trades companies
3. [ ] Open company detail
4. [ ] Verify members/projects display
5. [ ] Return to Network Hub
6. [ ] View Vendors directory
7. [ ] Confirm contact info visible

---

## 🧪 API Smoke Tests

Run `./scripts/smoke-prod.sh` and verify:

- [ ] All health checks pass
- [ ] API endpoints return expected status codes
- [ ] No 500 errors
- [ ] Auth-required endpoints return 401 (expected)

**Smoke Test Output:**

```
[Paste output here]
```

---

## 🐛 Known Issues (if any)

| Issue | Severity | Workaround | Tracked In |
| ----- | -------- | ---------- | ---------- |
|       |          |            |            |

---

## ✅ Final Checklist

- [ ] All critical flows tested
- [ ] No console errors in browser
- [ ] No 404/500 errors in production
- [ ] No "Coming Soon" or demo links visible
- [ ] Mobile responsive
- [ ] Raven UI consistent
- [ ] PDFs generate with branding
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Monitoring/logging configured

---

## 📝 Sign-Off

**QA Tester:** **********\_\_**********  
**Date:** ****\_\_\_\_****  
**Status:** ☐ PASS ☐ FAIL  
**Notes:**

---

**Production URL:** https://skaiscrape.com  
**Staging URL:** ************\_\_\_************  
**Repository:** https://github.com/Damienwillingham-star/Skaiscraper
