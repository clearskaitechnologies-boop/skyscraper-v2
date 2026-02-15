# Production Confidence Checklist

**Purpose:** Verify all critical flows work before deploying or after major changes.  
**Last Updated:** January 16, 2026

---

## 🔐 Authentication & Authorization

- [ ] Sign in works (Clerk auth flow)
- [ ] Sign out works and clears session
- [ ] Protected routes redirect to sign-in when unauthenticated
- [ ] Organization context loads correctly
- [ ] User permissions are enforced on API routes

---

## 👤 Trades Network Onboarding

> **Critical:** This flow had a silent failure bug. Always verify.

### Happy Path

- [ ] Navigate to `/trades/onboarding`
- [ ] Fill Step 1 (name, email) → Continue button enables
- [ ] Fill Step 2 (trade, title) → Submit button enables
- [ ] Click Submit → **Network request visible in DevTools**
- [ ] API returns 200 → Success toast appears
- [ ] Redirect to `/trades/profile` completes
- [ ] Profile shows submitted data

### Error Handling

- [ ] Missing required fields → Button stays disabled (not silent)
- [ ] API returns 400 → Error toast appears
- [ ] API returns 401 → Error toast with auth message
- [ ] API returns 500 → Error toast, button re-enables
- [ ] Network error → Error toast, button re-enables

### Fallback Paths

- [ ] "Skip for now" link works
- [ ] `/trades/profile/edit` works independently of onboarding
- [ ] `/trades/company/edit` works independently of onboarding

---

## 🏢 Company Management

- [ ] Create company in onboarding works
- [ ] Edit company at `/trades/company/edit` works
- [ ] Logo upload works (shows in preview)
- [ ] Cover photo upload works
- [ ] Company appears on public page `/t/[slug]`

---

## 👥 Employee Management

- [ ] Employees list shows at `/trades/company/employees`
- [ ] Admin can toggle permissions
- [ ] Employee profiles accessible at `/trades/employees/[id]`
- [ ] "Employees" label (not "Contractor 1") on public page

---

## 💼 Job Center & Pipeline

- [ ] Navigate to `/jobs` or Job Center
- [ ] Demo jobs appear (or "No jobs" message)
- [ ] Create new lead works
- [ ] Lead → Claim conversion works
- [ ] Job transfer dropdown works
- [ ] Archive function works

---

## 📝 Claims Workflow

- [ ] Create claim at `/claims/new`
- [ ] Claim workspace loads at `/claims/[id]`
- [ ] Document upload works
- [ ] Report generation works
- [ ] Status updates save correctly

---

## 📋 Template Marketplace

- [ ] Navigate to `/reports/templates/marketplace`
- [ ] Templates load (28 in registry)
- [ ] Category filter works
- [ ] "Use Template" button opens modal
- [ ] Template preview loads

---

## 💬 Messaging

- [ ] Navigate to `/trades/messages` or `/messages`
- [ ] Thread list loads
- [ ] Select thread → messages appear
- [ ] Send message → appears in thread
- [ ] Real-time updates work (if implemented)

---

## 🔗 Connections & Invitations

- [ ] Pro can invite client
- [ ] Client receives invitation
- [ ] Client can accept invitation
- [ ] Connection creates work request
- [ ] Contacts appear in dashboard

---

## 📱 Responsive & Performance

- [ ] Mobile layout works (test at 375px width)
- [ ] No layout shift on page load
- [ ] Images lazy load
- [ ] No console errors on main flows
- [ ] API responses < 3s on reasonable network

---

## 🧪 Automated Tests

Run before any production deploy:

```bash
# Unit tests
pnpm test

# E2E tests (includes onboarding regression tests)
pnpm test:e2e

# Type check
npx tsc --noEmit

# Lint
pnpm lint
```

---

## 🚨 Red Flags (Stop and Investigate)

If you see any of these, **do not deploy**:

1. **Nothing happens on form submit** → Silent failure bug
2. **Button stuck in loading state** → Unhandled promise rejection
3. **Console shows 401/403 errors** → Auth configuration issue
4. **Redirect loops** → Middleware misconfiguration
5. **White screen** → Client-side crash, check console

---

## ✅ Sign-Off

| Check              | Date | Verified By |
| ------------------ | ---- | ----------- |
| Onboarding flow    |      |             |
| Profile editing    |      |             |
| Company management |      |             |
| Job center         |      |             |
| Messaging          |      |             |
| Templates          |      |             |
| E2E tests pass     |      |             |

---

_Run this checklist after every major refactor or before production deploys._
