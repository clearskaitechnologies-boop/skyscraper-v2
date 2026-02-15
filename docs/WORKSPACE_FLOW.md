# Workspace Flow Documentation

## Overview

This document maps the organization/workspace initialization logic across the codebase.

## Core Functions

### 1. `ensureOrgForUser()`

**Location:** `src/lib/org/ensureOrgForUser.ts`
**Purpose:** Auto-onboarding - ensures every authenticated user has an organization
**Returns:** `{ orgId, role, membership }` or `null`
**Logic:**

1. Gets current Clerk user
2. Checks for existing `user_organizations` membership using **`organizationId`** field
3. Falls back to legacy `users.orgId` if needed
4. Auto-creates org if none exists
5. Returns org context

**Critical:** Uses Prisma field names: `userId`, `organizationId` (NOT `user_id`, `organization_id`, or `orgId`)

### 2. `safeOrgContext()`

**Location:** `src/lib/safeOrgContext.ts`
**Purpose:** Safe org lookup with status codes
**Returns:** `{ status, userId, orgId, role, membership }`
**Status values:**

- `"unauthenticated"` - No Clerk user
- `"ok"` - User has org membership
- `"noMembership"` - User exists but no org (rare, triggers auto-onboarding)
- `"error"` - Database query failed

**BUGS FOUND (to fix):**

- Line 71: Uses `orgId` field but Prisma model has `organizationId`
- Line 79: Returns `membership.orgId` but should be `membership.organizationId`

### 3. `getCurrentOrg()`

**Location:** `src/lib/org.ts`
**Purpose:** Legacy helper (may not be actively used)

## Workspace Initializing Gates

### Pages with "Setting up workspace" screens:

1. **Dashboard** - `src/app/(app)/dashboard/page.tsx` (line 28)
2. **Weather Report** - `src/app/(app)/weather-report/page.tsx` (line 28)
3. **Route Optimizer** - `src/app/(app)/route-optimizer/page.tsx` (line 26)
4. **Appointments** - `src/app/(app)/appointments/page.tsx` (line 38)
5. **Messages** - `src/app/(app)/messages/page.tsx` (line 22)
6. **Map View** - `src/app/(app)/maps/map-view/page.tsx` (line 34)

### Current Logic Pattern (PROBLEM):

```tsx
if (!org || workspaceStatus !== "ready") {
  return <WorkspaceInitializingCard />;
}
```

### Target Logic Pattern (FIX):

```tsx
if (!org) {
  return <WorkspaceInitializingCard />;
}
// Page renders immediately when org exists
```

## Field Names Reference

### Prisma Schema (`user_organizations` model):

```prisma
model user_organizations {
  id             String   @id
  userId         String   @map("user_id")      // TypeScript: userId, DB column: user_id
  organizationId String   @map("organization_id") // TypeScript: organizationId, DB column: organization_id
  role           String
  createdAt      DateTime @default(now()) @map("created_at")
}
```

### Usage Rules:

- ✅ **In Prisma queries:** Use `userId`, `organizationId` (camelCase)
- ❌ **NEVER use:** `user_id`, `organization_id`, `orgId` in Prisma TypeScript code
- ✅ **In raw SQL:** Use `user_id`, `organization_id` (snake_case column names)

## Bootstrap Flow

```
User loads Pro page
  ↓
Page server component runs
  ↓
Calls ensureOrgForUser() or safeOrgContext()
  ↓
1. Check user_organizations for membership (using organizationId field)
  ↓
2. Fallback to users.orgId if no membership
  ↓
3. Auto-create org if neither exists
  ↓
Returns { orgId, role, membership }
  ↓
Page checks: if (!org) show "Setting up workspace"
  ↓
Otherwise: Render full page content
```

## Verification Checklist

### Schema Validation ✅

- [x] Org table has pricing tier columns (tier, claimsUsedThisMonth, etc.)
- [x] user_organizations.organization_id is TEXT type
- [x] Prisma schema uses correct field names (userId, organizationId)
- [x] All orphaned memberships cleaned up

### Code Validation ✅ COMPLETED

- [x] safeOrgContext.ts uses organizationId (not orgId) - **FIXED** line 71
- [x] All pages check `if (!org)` not `if (!workspaceReady)` - **FIXED**
  - Messages, Appointments, MapView, WeatherReport, RouteOptimizer
- [x] No pages block on extra "workspaceStatus" flags - **FIXED**
  - Removed all `isDemoWorkspaceReady` checks
- [x] All Prisma queries use camelCase field names - **FIXED**
  - src/app/api/claims/route.ts
  - src/app/api/onboarding/init/route.ts
- [x] Build validation passed - **pnpm build successful ✅**

### UI Validation (TODO)

- [ ] Dashboard: loads with org
- [ ] Claims: loads
- [ ] Messages: loads
- [ ] Appointments: loads
- [ ] Tools (Damage/Weather/Supplement/...): loads
- [ ] Maps (Map View/Weather Chains/Route Optimizer): loads
- [ ] Settings: loads
- [ ] Teams: loads
- [ ] Client Networks: shows empty state, not error

---

**Last Updated:** December 3, 2025
**Status:** All code fixes complete, build passing ✅

## Summary of Changes

### Files Modified (10 total):

1. **src/lib/safeOrgContext.ts**
   - Fixed field names: `orgId` → `organizationId` (lines 71, 79, 87)
   - Bug: Was selecting/using wrong Prisma field name

2. **src/app/(app)/messages/page.tsx**
   - Simplified workspace gate from `(ctx.status !== "ok" || !ctx.orgId) && !demoReady` to just `!ctx.orgId`
   - Removed unused `isDemoWorkspaceReady` import

3. **src/app/(app)/appointments/page.tsx**
   - Simplified workspace gate to `!ctx.orgId` check only
   - Removed complex status checking logic

4. **src/app/(app)/maps/map-view/page.tsx**
   - Simplified workspace gate to `!ctx.orgId` check only
   - Removed `isDemoWorkspaceReady` dependency

5. **src/app/(app)/weather-report/page.tsx**
   - Simplified workspace gate to `!ctx.orgId` check only
   - Removed `isDemoWorkspaceReady` dependency

6. **src/app/(app)/route-optimizer/page.tsx**
   - Simplified workspace gate to `!ctx.orgId` check only
   - Removed `isDemoWorkspaceReady` dependency

7. **src/app/api/claims/route.ts**
   - Fixed Prisma query: `user_id` → `userId`, `organization_id` → `organizationId`
   - Bug: Was using snake_case in Prisma query (should be camelCase)

8. **src/app/api/onboarding/init/route.ts**
   - Fixed Prisma query: `user_id` → `userId`, `organization_id` → `organizationId`
   - Fixed both findFirst WHERE clause and create data object

9. **docs/WORKSPACE_FLOW.md** (this file)
   - Created comprehensive documentation of org/workspace flow
   - Documented all functions, field names, and bootstrap logic

10. **Build verification**
    - Ran `pnpm build` successfully
    - All TypeScript compilation passed
    - No errors related to org/workspace logic

### Key Fixes:

**Problem 1: Wrong Prisma field names**

- Prisma model uses `userId` and `organizationId` (camelCase)
- Some code was using `user_id`, `organization_id`, or `orgId`
- Fixed in 3 files (safeOrgContext, claims API, onboarding API)

**Problem 2: Over-complicated workspace gates**

- Pages were checking `ctx.status !== "ok" || !ctx.orgId && !demoReady`
- This caused infinite "workspace initializing" loops
- Simplified to just `if (!ctx.orgId)` everywhere
- Since `safeOrgContext()` auto-onboards, users rarely see this state

**Problem 3: Unnecessary demo mode checks**

- `isDemoWorkspaceReady` was blocking normal users
- Removed from 5 pages (Messages, Appointments, Maps, Weather, Routes)

---

**Last Updated:** December 3, 2025 (Post-fixes)
**Status:** All code fixes complete, build passing ✅
