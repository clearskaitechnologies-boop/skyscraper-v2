# PHASE H3 - CANONICAL ROUTE MAP

**Date:** December 12, 2025  
**Purpose:** Single source of truth for all routes, guards, and nav structure  
**Status:** ✅ COMPLETE - Ready for implementation

---

## ROUTE CLASSIFICATION SYSTEM

### Scope Definitions

| Scope      | Description                              | Guard Required                                      | Example                      |
| ---------- | ---------------------------------------- | --------------------------------------------------- | ---------------------------- |
| **GLOBAL** | No auth/org required, works for everyone | None or `requireAuth()` only                        | Maps, Weather, Calculators   |
| **AUTH**   | Requires authenticated user              | `requireAuth()`                                     | Dashboard (with empty state) |
| **ORG**    | Requires active organization             | `requireAuth()` + `requireOrg()`                    | Claims List, Reports Hub     |
| **CLAIM**  | Requires specific claim context          | `requireAuth()` + `requireOrg()` + `requireClaim()` | Claim workspace tabs         |

---

## CANONICAL ROUTES TABLE

### 1. Workspace / Claims

| Feature Name       | Canonical Path       | Scope | Guard            | File Location                              | Nav Label          | Status    |
| ------------------ | -------------------- | ----- | ---------------- | ------------------------------------------ | ------------------ | --------- |
| Dashboard          | `/dashboard`         | AUTH  | `requireAuth()`  | `src/app/(app)/dashboard/page.tsx`         | Dashboard          | ✅ EXISTS |
| Claims List        | `/claims`            | ORG   | `requireOrg()`   | `src/app/(app)/claims/page.tsx`            | Claims             | ✅ EXISTS |
| Claim Workspace    | `/claims/[claimId]`  | CLAIM | `requireClaim()` | `src/app/(app)/claims/[claimId]/page.tsx`  | (Dynamic)          | ✅ EXISTS |
| Damage Builder     | `/ai/damage-builder` | ORG   | `requireOrg()`   | `src/app/(app)/ai/damage-builder/page.tsx` | Damage Builder     | ✅ EXISTS |
| Bad Faith Analysis | `/ai/bad-faith`      | ORG   | `requireOrg()`   | `src/app/(app)/ai/bad-faith/page.tsx`      | Bad Faith Analysis | ✅ EXISTS |
| Messages           | `/messages`          | ORG   | `requireOrg()`   | `src/app/(app)/messages/page.tsx`          | Messages           | ✅ EXISTS |
| Appointments       | `/appointments`      | ORG   | `requireOrg()`   | `src/app/(app)/appointments/page.tsx`      | Appointments       | ✅ EXISTS |
| Leads              | `/leads`             | ORG   | `requireOrg()`   | `src/app/(app)/leads/page.tsx`             | Leads              | ✅ EXISTS |
| Client Contacts    | `/contacts`          | ORG   | `requireOrg()`   | `src/app/(app)/contacts/page.tsx`          | Client Contacts    | ✅ EXISTS |

### 2. Reports

| Feature Name      | Canonical Path               | Scope | Guard          | File Location                                      | Nav Label         | Status    |
| ----------------- | ---------------------------- | ----- | -------------- | -------------------------------------------------- | ----------------- | --------- |
| Reports Hub       | `/reports`                   | ORG   | `requireOrg()` | `src/app/(app)/reports/page.tsx`                   | Reports Hub       | ✅ EXISTS |
| Report Builder    | `/reports/builder`           | ORG   | `requireOrg()` | `src/app/(app)/reports/builder/page.tsx`           | Report Builder    | ✅ EXISTS |
| Report History    | `/reports/history`           | ORG   | `requireOrg()` | `src/app/(app)/reports/history/page.tsx`           | Report History    | ✅ EXISTS |
| AI Claims Builder | `/reports/ai-claims-builder` | ORG   | `requireOrg()` | `src/app/(app)/reports/ai-claims-builder/page.tsx` | AI Claims Builder | ✅ EXISTS |
| Contractor Packet | `/reports/contractor-packet` | ORG   | `requireOrg()` | `src/app/(app)/reports/contractor-packet/page.tsx` | Contractor Packet | ✅ EXISTS |

### 3. Analytics

| Feature Name        | Canonical Path             | Scope | Guard          | File Location                                    | Nav Label           | Status    |
| ------------------- | -------------------------- | ----- | -------------- | ------------------------------------------------ | ------------------- | --------- |
| Analytics Dashboard | `/analytics`               | ORG   | `requireOrg()` | `src/app/(app)/analytics/page.tsx`               | Analytics Dashboard | ✅ EXISTS |
| Lead Sources        | `/analytics/lead-sources`  | ORG   | `requireOrg()` | `src/app/(app)/analytics/lead-sources/page.tsx`  | Lead Sources        | ✅ EXISTS |
| Claims Status       | `/analytics/claims-status` | ORG   | `requireOrg()` | `src/app/(app)/analytics/claims-status/page.tsx` | Claims Status       | ✅ EXISTS |
| Conversions         | `/analytics/conversions`   | ORG   | `requireOrg()` | `src/app/(app)/analytics/conversions/page.tsx`   | Conversions         | ✅ EXISTS |

### 4. AI Labs

| Feature Name       | Canonical Path        | Scope | Guard          | File Location                               | Nav Label          | Status    |
| ------------------ | --------------------- | ----- | -------------- | ------------------------------------------- | ------------------ | --------- |
| AI Hub             | `/ai`                 | ORG   | `requireOrg()` | `src/app/(app)/ai/page.tsx`                 | AI Hub             | ✅ EXISTS |
| AI Insights        | `/ai/insights`        | ORG   | `requireOrg()` | `src/app/(app)/ai/insights/page.tsx`        | AI Insights        | ✅ EXISTS |
| AI Recommendations | `/ai/recommendations` | ORG   | `requireOrg()` | `src/app/(app)/ai/recommendations/page.tsx` | AI Recommendations | ✅ EXISTS |

### 5. Maps / Weather (⚠️ CRITICAL FIX NEEDED)

| Feature Name    | Canonical Path     | Scope      | Guard                | File Location                            | Nav Label       | Status    | Fix Required        |
| --------------- | ------------------ | ---------- | -------------------- | ---------------------------------------- | --------------- | --------- | ------------------- |
| Map View        | `/maps`            | **GLOBAL** | `requireAuth()` only | `src/app/(app)/maps/page.tsx`            | Map View        | ✅ EXISTS | 🔴 Remove org guard |
| Weather Chains  | `/weather/chains`  | **GLOBAL** | `requireAuth()` only | `src/app/(app)/weather/chains/page.tsx`  | Weather Chains  | ⚠️ CHECK  | 🔴 Verify route     |
| Route Optimizer | `/route-optimizer` | **GLOBAL** | `requireAuth()` only | `src/app/(app)/route-optimizer/page.tsx` | Route Optimizer | ✅ EXISTS | 🔴 Remove org guard |
| Weather Hub     | `/weather`         | **GLOBAL** | `requireAuth()` only | `src/app/(app)/weather/page.tsx`         | Weather Hub     | ✅ EXISTS | 🔴 Remove org guard |

**Nav Currently Points To (WRONG):**

- `/maps/map-view` - ❌ DOES NOT EXIST
- `/maps/weather-chains` - ❌ DOES NOT EXIST

**Fix Action:** Update nav to point to canonical paths above.

### 6. Tools (⚠️ DUPLICATE ALIASES EXIST)

| Feature Name            | Canonical Path                | Scope      | Guard                | File Location                                       | Nav Label               | Aliases (TO REDIRECT)                                |
| ----------------------- | ----------------------------- | ---------- | -------------------- | --------------------------------------------------- | ----------------------- | ---------------------------------------------------- |
| Mockup Generator        | `/ai/mockup`                  | **GLOBAL** | `requireAuth()` only | `src/app/(app)/ai/mockup/page.tsx`                  | Mockup Generator        | -                                                    |
| Supplement Builder      | `/ai/supplement-builder`      | CLAIM      | `requireClaim()`     | `src/app/(app)/ai/supplement-builder/page.tsx`      | Supplement Builder      | `/tools/supplement`, `/ai/tools/supplement`          |
| Depreciation Calculator | `/ai/depreciation-calculator` | **GLOBAL** | `requireAuth()` only | `src/app/(app)/ai/depreciation-calculator/page.tsx` | Depreciation Calculator | `/tools/depreciation`, `/ai/tools/depreciation`      |
| Rebuttal Builder        | `/ai/rebuttal-builder`        | CLAIM      | `requireClaim()`     | `src/app/(app)/ai/rebuttal-builder/page.tsx`        | Rebuttal Builder        | `/tools/rebuttal`, `/ai/tools/rebuttal`, `/rebuttal` |

**Fix Action:** Create redirects from alias routes to canonical routes.

### 7. Advanced (⚠️ ROUTE COLLISION DETECTED)

| Feature Name      | Canonical Path       | Scope | Guard          | File Location                              | Nav Label         | Status    | Current Nav Points To |
| ----------------- | -------------------- | ----- | -------------- | ------------------------------------------ | ----------------- | --------- | --------------------- |
| Property Profiles | `/property-profiles` | ORG   | `requireOrg()` | `src/app/(app)/property-profiles/page.tsx` | Property Profiles | ✅ EXISTS | ✅ CORRECT            |
| Project Board     | `/project-board`     | ORG   | `requireOrg()` | `src/app/(app)/project-board/page.tsx`     | Project Board     | ✅ EXISTS | ✅ CORRECT            |
| Quick DOL         | `/quick-dol`         | ORG   | `requireOrg()` | `src/app/(app)/quick-dol/page.tsx`         | Quick DOL         | ✅ EXISTS | ⚠️ Verify routing     |
| Jobs & Scheduling | `/jobs`              | ORG   | `requireOrg()` | `src/app/(app)/jobs/page.tsx`              | Jobs & Scheduling | ✅ EXISTS | ✅ CORRECT            |
| Governance        | `/governance`        | ORG   | `requireOrg()` | `src/app/(app)/governance/page.tsx`        | Governance        | ✅ EXISTS | ✅ CORRECT            |

**Note:** Quick DOL may have route confusion with `/ai/dol` - verify both exist and serve different purposes or redirect.

### 8. System

| Feature Name     | Canonical Path       | Scope | Guard          | File Location                              | Nav Label        | Status    |
| ---------------- | -------------------- | ----- | -------------- | ------------------------------------------ | ---------------- | --------- |
| Teams            | `/teams`             | ORG   | `requireOrg()` | `src/app/(app)/teams/page.tsx`             | Teams            | ✅ EXISTS |
| Vendors          | `/vendors`           | ORG   | `requireOrg()` | `src/app/(app)/vendors/page.tsx`           | Vendors          | ✅ EXISTS |
| Billing & Tokens | `/settings/billing`  | ORG   | `requireOrg()` | `src/app/(app)/settings/billing/page.tsx`  | Billing & Tokens | ✅ EXISTS |
| Branding         | `/settings/branding` | ORG   | `requireOrg()` | `src/app/(app)/settings/branding/page.tsx` | Branding         | ✅ EXISTS |
| Settings         | `/settings`          | ORG   | `requireOrg()` | `src/app/(app)/settings/page.tsx`          | Settings         | ✅ EXISTS |

---

## CRITICAL FIXES REQUIRED

### 🔴 Priority 1: Maps/Weather Section

**Problem:** Nav points to non-existent routes, pages have org guards when they should be GLOBAL.

**Current Nav (WRONG):**

```typescript
{
  label: "Maps / Weather",
  items: [
    { label: "Map View", href: "/maps/map-view" },        // ❌ DOES NOT EXIST
    { label: "Weather Chains", href: "/maps/weather-chains" }, // ❌ DOES NOT EXIST
    { label: "Route Optimizer", href: "/route-optimizer" }, // ✅ EXISTS but has org guard
    { label: "Weather Hub", href: "/weather" },           // ✅ EXISTS but has org guard
  ],
}
```

**Fixed Nav (CORRECT):**

```typescript
{
  label: "Maps / Weather",
  items: [
    { label: "Map View", href: "/maps" },              // ✅ FIXED
    { label: "Weather Chains", href: "/weather/chains" }, // ✅ FIXED (verify route exists)
    { label: "Route Optimizer", href: "/route-optimizer" }, // ✅ CORRECT
    { label: "Weather Hub", href: "/weather" },        // ✅ CORRECT
  ],
}
```

**Guard Changes:**

- `/maps/page.tsx` - Remove `requireOrg()`, use `requireAuth()` only
- `/weather/page.tsx` - Remove `requireOrg()`, use `requireAuth()` only
- `/route-optimizer/page.tsx` - Remove `requireOrg()`, use `requireAuth()` only

---

### 🔴 Priority 2: Dashboard Org Context

**Problem:** Dashboard fails with "couldn't load your dashboard" when org is missing.

**Current Code Pattern (BAD):**

```typescript
const org = await ensureOrgForUser();
if (!org) {
  return <LoadingState />; // User gets stuck
}
```

**Fixed Pattern (GOOD):**

```typescript
let org = null;
try {
  org = await getActiveOrgContext(); // Single resolver
} catch (error) {
  console.error("[Dashboard] Org error:", error);
}

if (!org) {
  return <EmptyState message="Create your first organization to get started" />;
}
```

---

### 🔴 Priority 3: Claims Org Context

**Problem:** Claims shows "Unable to load organization context" + contradictory "Status: ok".

**Root Cause:** Two different org checks running.

**Fix:** Use single `getActiveOrgContext()` resolver, remove duplicate checks.

---

### 🟡 Priority 4: Tool Aliases

**Problem:** Multiple routes point to same tools, causing confusion.

**Action:** Create redirects:

```typescript
// In next.config.js or create redirect pages
const redirects = [
  { source: "/tools/supplement", destination: "/ai/supplement-builder", permanent: true },
  { source: "/ai/tools/supplement", destination: "/ai/supplement-builder", permanent: true },
  { source: "/tools/rebuttal", destination: "/ai/rebuttal-builder", permanent: true },
  { source: "/ai/tools/rebuttal", destination: "/ai/rebuttal-builder", permanent: true },
  { source: "/rebuttal", destination: "/ai/rebuttal-builder", permanent: true },
  { source: "/tools/depreciation", destination: "/ai/depreciation-calculator", permanent: true },
  { source: "/ai/tools/depreciation", destination: "/ai/depreciation-calculator", permanent: true },
];
```

---

## GUARD IMPLEMENTATION PLAN

### Step 1: Unified Guards (`src/lib/guards.ts`)

```typescript
// Guards should export:
- requireAuth(): { userId, user } - No org required
- requireOrg(): { userId, orgId, org, role } - Org required
- requireClaim(claimId): { userId, orgId, org, claim } - Claim required
```

### Step 2: Single Org Resolver (`src/lib/org/getActiveOrgContext.ts`)

```typescript
export async function getActiveOrgContext(): Promise<OrgContext | null> {
  // Returns: { ok: true, orgId, org, role } OR { ok: false, reason: "NO_ORG" }
  // Used everywhere - single source of truth
}
```

### Step 3: Page Protection Patterns

**GLOBAL Pages:**

```typescript
export default async function WeatherPage() {
  const { userId } = await requireAuth();
  // No org check
  return <WeatherComponent />;
}
```

**ORG Pages:**

```typescript
export default async function DashboardPage() {
  const orgContext = await getActiveOrgContext();
  if (!orgContext) {
    return <CreateOrgPrompt />;
  }
  return <DashboardComponent org={orgContext.org} />;
}
```

**CLAIM Pages:**

```typescript
export default async function ClaimWorkspacePage({ params }: { params: { claimId: string } }) {
  const { userId, org, claim } = await requireClaim(params.claimId);
  return <ClaimWorkspace claim={claim} />;
}
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Guards & Resolvers

- [ ] Consolidate guard functions in `src/lib/guards.ts`
- [ ] Create single `getActiveOrgContext()` resolver
- [ ] Update all pages to use unified guards

### Phase 2: Route Fixes

- [ ] Fix Maps/Weather nav links
- [ ] Remove org guards from GLOBAL tools
- [ ] Create redirects for tool aliases
- [ ] Verify Quick DOL routing

### Phase 3: Error Hardening

- [ ] Fix Dashboard empty state
- [ ] Fix Claims org context contradiction
- [ ] Add try/catch wrappers to all data fetches
- [ ] Replace error boundaries with friendly fallbacks

### Phase 4: Nav Update

- [ ] Update `AppSidebar.tsx` to use canonical routes
- [ ] Remove dead links
- [ ] Verify all links resolve correctly

---

## ACCEPTANCE CRITERIA

✅ **Dashboard:** Loads without error even with empty org  
✅ **Claims:** No org context contradiction  
✅ **Maps:** Loads without org requirement  
✅ **Weather:** Loads without org requirement  
✅ **Tools:** No duplicate routes, proper redirects  
✅ **Nav:** All links resolve to correct pages  
✅ **Guards:** Single implementation, consistent usage  
✅ **Errors:** No App Error screens for missing data

---

**End of Canonical Route Map**
