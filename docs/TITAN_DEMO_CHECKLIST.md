# SkaiScraper Pro — Titan Demo Checklist

> Read through this live during the demo. Each step should take < 60 seconds.
> Run `scripts/titan-demo-smoke.sh` before the demo to confirm infrastructure.

---

## Pre-Demo (5 min before)

- [ ] Dev server running (`pnpm dev`) or production URL confirmed
- [ ] Smoke script green: `./scripts/titan-demo-smoke.sh`
- [ ] Browser logged in as **Pro Admin** (buildwithdamienray@gmail.com)
- [ ] Second browser/incognito ready for **Client Portal** demo
- [ ] Screen recording started (optional)

---

## Act 1 — Dashboard & Navigation (2 min)

1. [ ] **Dashboard loads** — leaderboard shows real data only (no "Demo Admin" or "test")
2. [ ] **Storm Center** — map renders with real weather data (not hardcoded zeros)
3. [ ] **Sidebar** — confirm "Community & Batch" link is gone
4. [ ] **Trade profile widget** — shows your profile (not "Set Up Your Profile")

## Act 2 — Claims Workspace (3 min)

5. [ ] **Open a claim** → header shows:
   - Claim title / number
   - Lifecycle stage badge (e.g. FILED)
   - Damage type badge
   - **💰 Job Value pill** (emerald, top-right)
6. [ ] **2/3 + 1/3 layout** — main content left, **ClaimsSidebar** right
7. [ ] **ClaimsSidebar** shows: Claim Value, Key Dates, Adjuster Contact, Quick Actions, Property
8. [ ] **Quick Actions** — click one, verify it goes to correct sub-page for same claim
9. [ ] **Move claim through pipeline** — drag or use API, no lifecycle_stage crash

## Act 3 — Teams & Manager Hierarchy (3 min)

10. [ ] **Open Teams page** → company loads (no "no company" error)
11. [ ] **Promote a member to Manager** → badge appears immediately
12. [ ] **Assign 2 direct reports** to that manager → org chart updates
13. [ ] **Try self-assign** → blocked with clear error message
14. [ ] **Unassign manager** → member returns to unassigned pool
15. [ ] **Org chart toggle** → hierarchy view renders correctly

## Act 4 — Billing & Access Control (2 min)

16. [ ] **Weather Analytics** → loads without HTTP 402 (beta mode active)
17. [ ] **Any analytics route** → no billing wall during beta
18. [ ] **Reports Hub** → no batch/community cards visible

## Act 5 — Client Portal (2 min)

19. [ ] **Switch to incognito browser**
20. [ ] **Login as client** → lands on `/portal` (not `/dashboard`)
21. [ ] **Hard refresh `/portal`** → stays on portal (no redirect loop)
22. [ ] **Try `/dashboard` as client** → redirected/blocked
23. [ ] **Claim view** → client sees their claim data

## Act 6 — Company Page (1 min)

24. [ ] **Open Company page** → "ClearSkai Technologies, LLC" loads
25. [ ] **Members list** → shows real team members
26. [ ] **Company settings** → editable by admin/owner

---

## Post-Demo Verification

- [ ] **Sentry check:** Visit `/api/dev/sentry-test` → confirm event appears in Sentry dashboard
- [ ] **No console errors** in browser DevTools during entire demo
- [ ] **Connection Integrity Audit:** Run `./scripts/cross-tenant-demo.sh` if demo data exists

---

## Known Limitations (transparent with enterprise buyers)

| Item                | Status                                                  | Workaround                     |
| ------------------- | ------------------------------------------------------- | ------------------------------ |
| ClaimsSidebar data  | Shows available fields, some may be null for new claims | Enter data via claim edit form |
| Retail jobs         | 501 stub                                                | Not in MVP scope — on roadmap  |
| Claims import       | 501 stub                                                | Manual entry for now           |
| Proposals/new       | May show validation banners                             | Clear form and retry           |
| Final payout packet | Returns zeros for new claims                            | Populate line items first      |

---

## Rollback Plan

If hierarchy UI causes issues during demo:

1. Feature is data-only — remove `isManager` / `managerId` UI elements from `CompanySeatsClient.tsx`
2. Data remains intact — no destructive changes
3. Or toggle via env: `NEXT_PUBLIC_ENABLE_HIERARCHY=false` (requires adding flag check — 5 min)
