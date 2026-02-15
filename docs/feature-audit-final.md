# Platform Feature Audit - Final Polish

> **Date**: 2026-02-04  
> **Purpose**: Identify gaps before pilot launch

---

## 🔴 CRITICAL GAPS FOUND

### 1. Portal Claim API Missing Contractor Data

**File**: `src/app/api/portal/claims/[claimId]/route.ts`
**Issue**: API doesn't return contractor profile to client portal
**Impact**: "My Contractor" section shows demo data only
**Fix**: Include org + trades profile in claim response

### 2. Cross-Surface Profile Visibility

**Issue**: Client can't view Pro's trades profile from portal
**Need**: Add `/api/portal/contractor/[profileId]` endpoint
**Need**: Link "My Contractor" card to full profile page

### 3. Messaging Thread Creation

**Files**:

- `src/app/api/messages/create/route.ts`
- `src/app/api/messages/client/create/route.ts`
  **Need**: Verify both Pro→Client and Client→Pro flows work

### 4. Job Forwarding Flow

**Issue**: Need to verify job assignment from client to pro
**Files**: `src/app/portal/post-job/page.tsx`
**Need**: Ensure job creates connection to pro

---

## 🟡 PARTIAL IMPLEMENTATIONS

### Network Unification

| Feature                 | Pro Side             | Client Side           | Status      |
| ----------------------- | -------------------- | --------------------- | ----------- |
| View connections        | ✅ `/network/trades` | ✅ `/portal/my-pros`  | ✅          |
| Send connection request | ✅                   | ✅                    | ✅          |
| Accept/decline          | ✅                   | ⚠️ Need verify        | Check       |
| View profile            | ✅                   | ⚠️ Routes exist       | Check links |
| Message                 | ✅ `/messages`       | ✅ `/portal/messages` | Verify flow |

### Claim/Job Creation

| Feature              | Pro Side       | Client Side         | Status        |
| -------------------- | -------------- | ------------------- | ------------- |
| Create claim         | ✅ Full wizard | ⚠️ Basic form       | Check linking |
| Assign contractor    | N/A            | ⚠️ Need verify      | Check         |
| View assigned claims | ✅ `/claims`   | ✅ `/portal/claims` | ✅            |
| Job forwarding       | ✅             | ⚠️                  | Check         |

---

## 🟢 VERIFIED WORKING

- ✅ Auth (Clerk middleware)
- ✅ Multi-tenancy (withOrgScope)
- ✅ Billing limits (checkBillingLimits)
- ✅ Rate limiting (Upstash)
- ✅ Stripe webhooks (signature verified)
- ✅ Build passes (32 guards)

---

## 📋 FIX LIST

1. [x] Add contractor data to portal claim API ✅ DONE
2. [x] Create contractor profile view for clients ✅ DONE
   - API: `/api/portal/contractor/[profileId]`
   - Page: `/portal/contractors/[id]`
   - Link added to "Your Contractor" card in ClientWorkspace
3. [x] Verify messaging flows (both directions) ✅ DONE
   - Pro→Client: `/api/messages/create` → creates thread with contact
   - Client→Pro: `/api/messages/client/create` → creates thread with pro
   - Added `?contractor=` param support to auto-open message modal
   - Portal messages page now handles deep-links from contractor profile
4. [x] Test job creation → contractor assignment ✅ VERIFIED
   - API: `/api/portal/job-requests` supports `targetProId` for direct assignments
   - Jobs stored in `clientWorkRequest` table with pro linking
   - Visibility options: public, private (direct to pro)
5. [x] Add client profile view for pros (in leads) ✅ DONE
   - API: `/api/network/clients/[slug]/profile`
   - Page: `/contacts/[contactId]` (already existed)
6. [x] Unify Network sidebar navigation ✅ VERIFIED
   - Pro sidebar: "Trades Network" + "Network" sections with full nav
   - Client portal: ClientPortalNav with Find Pro, My Pros, Network tabs
   - Both sides have unified routing patterns
7. [ ] Polish UI consistency (remaining)

---

## 🔑 API KEYS STATUS

### Required for Production

| Service  | Env Var                     | Status      |
| -------- | --------------------------- | ----------- |
| Clerk    | `CLERK_SECRET_KEY`          | ✅ Required |
| Stripe   | `STRIPE_SECRET_KEY`         | ✅ Required |
| OpenAI   | `OPENAI_API_KEY`            | ✅ Required |
| Database | `DATABASE_URL`              | ✅ Required |
| Supabase | `SUPABASE_SERVICE_ROLE_KEY` | ✅ Required |
| Resend   | `RESEND_API_KEY`            | ✅ Required |
| Upstash  | `UPSTASH_REDIS_REST_URL`    | ✅ Required |

### Optional Enhancement

| Service | Env Var                   | Feature              |
| ------- | ------------------------- | -------------------- |
| Mapbox  | `MAPBOX_ACCESS_TOKEN`     | Maps                 |
| NOAA    | `NOAA_API_TOKEN`          | Weather verification |
| Sentry  | `SENTRY_DSN`              | Error tracking       |
| PostHog | `NEXT_PUBLIC_POSTHOG_KEY` | Analytics            |
| Twilio  | `TWILIO_AUTH_TOKEN`       | SMS                  |
