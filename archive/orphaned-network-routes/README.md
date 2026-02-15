# ARCHIVED: Orphaned `/network` Routes

**Date Archived:** December 4, 2025 (v1.3.1)  
**Reason:** Public marketing routes with broken links; superseded by authenticated `/app/(app)/network/*` routes

---

## What Was Archived

This directory contains the original **public-facing** `/network` routes that were created before the full CRM network feature was implemented. These routes are now **orphaned** because:

1. **Broken Links:** The landing page (`/network/page.tsx`) links to `/network/vendors` and `/network/trades`, but those routes don't exist (only `/app/(app)/network/vendors` exists for authenticated users).

2. **Superseded by CRM Routes:** Full network functionality now lives in `/src/app/(app)/network/*` with proper authentication, multi-tenant isolation, and database integration.

3. **No Active Usage:** No production traffic to these routes, and they're not linked from any active navigation.

---

## Archived Routes

| Route                      | File                       | Purpose                       | Status                          |
| -------------------------- | -------------------------- | ----------------------------- | ------------------------------- |
| `/network`                 | `page.tsx`                 | Public marketing landing page | ❌ Links to non-existent routes |
| `/network/inbox`           | `inbox/page.tsx`           | Demo inbox UI                 | ⚠️ No API integration           |
| `/network/join-client`     | `join-client/page.tsx`     | Client signup form            | ⚠️ Stubbed                      |
| `/network/opportunities`   | `opportunities/page.tsx`   | Opportunity listings          | ⚠️ Demo data                    |
| `/network/opportunity/new` | `opportunity/new/page.tsx` | Create opportunity            | ⚠️ No API                       |
| `/network/thread/[id]`     | `thread/[id]/page.tsx`     | Message thread                | ⚠️ No messages table            |

---

## Active Network Routes (Still in Use)

**Location:** `/src/app/(app)/network/*`

These routes are **live and operational** in production:

### CRM Network Features (Authenticated)

| Route                                 | Purpose                   | Status     |
| ------------------------------------- | ------------------------- | ---------- |
| `/app/(app)/network/clients`          | Client network management | ✅ Working |
| `/app/(app)/network/clients/[id]`     | Client detail page        | ✅ Working |
| `/app/(app)/network/trades`           | Trades directory          | ✅ Working |
| `/app/(app)/network/contractors`      | Contractor profiles       | ✅ Working |
| `/app/(app)/network/contractors/[id]` | Contractor detail         | ✅ Working |
| `/app/(app)/network/vendors/[id]`     | Vendor detail             | ✅ Working |
| `/app/(app)/network/create`           | Create client network     | ✅ Working |
| `/app/(app)/network/invite`           | Invite to network         | ✅ Working |
| `/app/(app)/network/metrics`          | Network analytics         | ✅ Working |
| `/app/(app)/network/my-profile`       | User profile              | ✅ Working |
| `/app/(app)/network/feed`             | Activity feed             | ✅ Working |

**Database Integration:**

- `client_networks` table (PostgreSQL)
- `trade_partners` table
- `contractor_profiles` table
- `claim_trade_partners` junction table
- Full CRUD APIs in `/src/app/api/network/*`

---

## Why Archive Instead of Delete?

1. **Historical Reference:** These routes show the original vision for public network pages.
2. **Code Reuse:** Some UI patterns may be useful for future public-facing features.
3. **Documentation:** Helps future developers understand the architecture evolution.
4. **Safety:** Easy to restore if needed during rollback scenarios.

---

## Restoration Instructions

**If you need to restore these routes:**

```bash
# Move back to original location
mv archive/orphaned-network-routes/network src/app/

# Note: You'll need to fix broken links in page.tsx
# The routes link to non-existent pages:
#   /network/vendors → should be /(app)/network/vendors (requires auth)
#   /network/trades → should be /(app)/network/trades (requires auth)
```

**Better Approach:** Create new public marketing pages at `/about/network` or similar, linking to authenticated routes with proper CTAs (e.g., "Sign in to view your network").

---

## Related Documentation

- **Active Network Features:** See `PHASE_10_NETWORK_COMPLETE.md`
- **Trades Network:** See `TRADES_NETWORK_FRONTEND_COMPLETE.md`
- **Client Portal:** See `CLIENT_PORTAL_IMPLEMENTATION.md`
- **API Routes:** See `src/app/api/network/README.md` (if exists)

---

## Decision Log

**Date:** December 4, 2025  
**Decision:** Archive orphaned `/network` routes  
**Rationale:**

- Broken links causing 404 errors
- No production usage
- Confusing to have duplicate `/network` and `/(app)/network` routes
- Audit identified as P2 cleanup item

**Impact:**

- ✅ No user-facing impact (routes were not linked from anywhere)
- ✅ Cleaner route structure
- ✅ Reduced confusion for developers
- ✅ Easier to maintain single source of truth for network features

**Approved By:** Development Team (via First Principles Integrity Audit)

---

**Questions?** See `FIRST_PRINCIPLES_AUDIT_REPORT.md` (P2 Item #5) or contact the engineering team.
