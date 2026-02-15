# Demo Seed Data Guide

## Overview

The demo seed system automatically populates new organizations with realistic sample data to make the platform immediately usable for demos and testing.

## What Gets Created

When you run the demo seed for an organization, it creates:

### 📊 Core Data

- **3 Leads** with full contact information
  - John Granville (Prescott, AZ) - Hail damage, referral source
  - Sarah StoneRidge (Prescott Valley, AZ) - Wind damage, Google source
  - Michael Torreon (Show Low, AZ) - Storm damage, Facebook source

- **3 Claims** linked to the leads
  - Active claim (Inspection stage) - Granville Residence, $25k exposure
  - Filed claim (Filed stage) - StoneRidge Property, $18k exposure
  - Approved claim (Approved stage) - Torreon Residence, $32k exposure

- **2 Trade Partners**
  - Elite Roofing Supply
  - Pro Gutter Services

- **2 Message Threads**
  - Claim communication for the first claim

- **4-6 AI Reports** (NEW!)
  - Weather reports for first 2 claims
  - Rebuttal reports for first 2 claims
  - Visible on claim detail pages under "AI Reports & Analysis"

### 🎯 Key Features

- **Idempotent**: Safe to run multiple times - only seeds if org is empty
- **Org-Scoped**: All data properly tagged with orgId
- **Realistic**: Addresses in Prescott/AZ area, proper date sequences
- **Demo-Ready**: Immediately shows populated dashboard, claims list, AI features

## How to Run

### Option 1: Automatic (Recommended)

The demo seed runs **automatically** when:

- A new user signs up
- Dashboard is accessed for the first time
- Org has zero leads AND zero claims

No manual action needed!

### Option 2: Manual Seed (All Orgs)

To seed ALL organizations in the database:

```bash
cd /Users/admin/Downloads/preloss-vision-main
pnpm tsx scripts/demo-seed.ts
```

This will:

1. Find all organizations
2. Check if each is empty (no leads/claims)
3. Seed only the empty ones
4. Skip orgs that already have data

### Option 3: Programmatic (Single Org)

```typescript
import { ensureDemoDataForOrg } from "@/lib/demoSeed";

const result = await ensureDemoDataForOrg({
  orgId: "org_abc123",
  userId: "user_xyz789",
  role: "ADMIN",
  isNew: true,
  branding: null,
});

console.log(result);
// { seeded: true, reason: "New org - demo data created", counts: {...} }
```

## When to Use

### ✅ Safe to Run:

- New demo environments
- Testing new features
- Before investor/client demos
- After database resets
- Development/staging environments

### ⚠️ Be Careful:

- Production environments with real customer data
- Orgs that already have claims (will be skipped automatically)

### ❌ Don't Run:

- Never needed! System auto-seeds on first login

## Verification

After seeding, verify by:

1. **Dashboard** - Should show:
   - 3 leads in various stages
   - 3 claims with different statuses
   - Activity timeline populated

2. **Claims Page** - Should show:
   - 3 claim cards with proper details
   - Different lifecycle stages (Inspection, Filed, Approved)

3. **Claim Detail** - Open any claim and verify:
   - AI Reports & Analysis section shows 2 reports
   - Weather report with confidence score
   - Rebuttal report with evidence

4. **Messages** - Should show:
   - 1 thread for first claim
   - 2 messages in the thread

5. **Trade Partners** - Should show:
   - 2 trade partners listed

## Troubleshooting

### "No data seeded"

- Check if org already has leads/claims (system skips non-empty orgs)
- Verify DATABASE_URL is correct
- Check Prisma connection

### "Demo seed failed"

- Check database connection
- Verify Prisma schema is up to date: `pnpm prisma generate`
- Check logs for specific error messages

### "AI reports not showing"

- Verify ai_reports table exists in schema
- Check API route `/api/claims/[claimId]/ai-reports` is working
- Open browser console for errors

## Technical Details

### Database Tables Affected

- `contacts` - 3 records
- `leads` - 3 records
- `claims` - 3 records
- `TradePartner` - 2 records
- `MessageThread` - 1 record
- `Message` - 2 records
- `ai_reports` - 4-6 records

### Files Involved

- `src/lib/demoSeed.ts` - Core seeding logic
- `scripts/demo-seed.ts` - CLI script
- `src/lib/org/ensureOrgForUser.ts` - Auto-triggers seed
- `src/app/(app)/dashboard/page.tsx` - Calls ensureDemoDataForOrg

### Performance

- Typical seed time: 2-5 seconds
- Database writes: ~15-20 records
- No external API calls

## Next Steps

After seeding:

1. Test Weather Report generation on a claim
2. Test Rebuttal generation on a claim
3. Verify Portal access (if testing homeowner flow)
4. Check that new AI reports appear in the AI Reports panel

For production deployment, consider:

- Disabling auto-seed in production environments
- Using real customer data instead
- Keeping seed scripts for staging/dev only
