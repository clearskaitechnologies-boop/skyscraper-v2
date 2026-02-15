# Clean Slate Launch Guide

## 🎯 Overview

This guide ensures all new users start with zeroed data, proper defaults, and a clean onboarding experience.

---

## 📋 Pre-Launch Checklist

### 1. Database Schema Defaults ✅

```bash
# Run schema audit
psql "$DATABASE_URL" -f db/templates/audit-schema-defaults.sql

# Apply defaults migration
psql "$DATABASE_URL" -f db/migrations/20241103_add_schema_defaults.sql
```

**What this does:**

- Sets `leads_count = 0`, `jobs_count = 0`, `revenue_total = 0` defaults
- Ensures `branding_complete = false`, `assistant_enabled = true`
- Adds NOT NULL constraints where appropriate
- Creates performance indexes

### 2. Production Data Reset (⚠️ Pre-Launch Only)

```bash
# Reset all existing data to clean slate
psql "$DATABASE_URL" -f db/templates/reset-production-data.sql
```

**What this does:**

- Zeros all user/org counters
- Deletes test/demo data
- Removes orphaned records
- Vacuums and optimizes tables

### 3. Bootstrap Integration 🔗

```typescript
// Option A: Manual bootstrap (development)
import { bootstrapNewOrg } from "@/scripts/bootstrap-new-org";

await bootstrapNewOrg(userId, orgId, {
  includeWelcomeData: true,
  initialTokens: 100,
});

// Option B: Automatic via Clerk webhook (production)
// Already integrated in /api/webhooks/clerk
```

**Clerk Webhook Setup:**

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to: `user.created`, `organization.created`
4. Add `CLERK_WEBHOOK_SECRET` to environment variables
5. Test with sample event

---

## 🧪 Testing Clean Slate

### Test New User Signup

```bash
# 1. Create new test account
# Sign up at: https://your-domain.com/sign-up

# 2. Verify clean state
psql "$DATABASE_URL" -c "
  SELECT
    id,
    email,
    leads_count,
    jobs_count,
    revenue_total,
    assistant_enabled
  FROM users
  WHERE email = 'test@example.com';
"

# Expected output:
# leads_count: 0
# jobs_count: 0
# revenue_total: 0
# assistant_enabled: true

# 3. Verify token balance
psql "$DATABASE_URL" -c "
  SELECT SUM(amount) as balance
  FROM tokens_ledger
  WHERE user_id = 'user-id-here';
"

# Expected: 100 (or configured initial amount)
```

### Verify Dashboard Display

1. Navigate to `/dashboard`
2. Check all counters show `0` (not blank/null)
3. Verify revenue shows `$0` (not undefined)
4. Confirm token balance shows `100 tokens`
5. Check no errors in browser console

---

## 🛠️ Client-Side Null Protection

### Example Dashboard Component

```typescript
import { safeNumber } from '@/lib/null-fallbacks';

export function Dashboard({ user }: { user: any }) {
  return (
    <>
      <h2>Total Leads: {safeNumber(user.leads_count)}</h2>
      <h2>Active Jobs: {safeNumber(user.jobs_count)}</h2>
      <h2>Revenue: ${safeNumber(user.revenue_total).toLocaleString()}</h2>
      <h2>Tokens: {safeNumber(user.token_balance)} 🪙</h2>
    </>
  );
}
```

### Apply to All Pages

- ✅ `/dashboard` - Main metrics
- ✅ `/leads` - Lead counts, pipeline stats
- ✅ `/claims` - Claim counts, status totals
- ✅ `/reports` - Revenue charts
- ✅ `/billing` - Token balance
- ✅ `/settings` - Organization stats

---

## 📊 Monitoring & Alerts

### Daily Health Checks

```sql
-- Check for null counters (should be 0)
SELECT COUNT(*) as users_with_nulls
FROM users
WHERE leads_count IS NULL
   OR jobs_count IS NULL
   OR revenue_total IS NULL;

-- Check for missing token balances
SELECT u.id, u.email, COALESCE(SUM(t.amount), 0) as balance
FROM users u
LEFT JOIN tokens_ledger t ON t.user_id = u.id
GROUP BY u.id, u.email
HAVING COALESCE(SUM(t.amount), 0) = 0;
```

### Automated Alerts

```typescript
// scripts/check-data-integrity.ts
export async function checkDataIntegrity() {
  const usersWithNulls = await prisma.$queryRaw`
    SELECT COUNT(*) as count
    FROM users
    WHERE leads_count IS NULL OR jobs_count IS NULL
  `;

  if (usersWithNulls[0].count > 0) {
    // Send alert to Slack/email
    console.error(`⚠️ Found ${usersWithNulls[0].count} users with null counters!`);
  }
}
```

---

## 🚀 Deployment Steps

### 1. Pre-Production

```bash
# Backup database
pg_dump "$DATABASE_URL" > backup_$(date +%Y%m%d).sql

# Run audit
psql "$DATABASE_URL" -f db/templates/audit-schema-defaults.sql

# Apply migrations
psql "$DATABASE_URL" -f db/migrations/20241103_add_schema_defaults.sql

# Reset data (⚠️ last chance!)
psql "$DATABASE_URL" -f db/templates/reset-production-data.sql
```

### 2. Deploy Code

```bash
git add -A
git commit -m "feat: Clean slate launch - zero defaults, bootstrap automation"
git push origin main
vercel --prod
```

### 3. Configure Webhooks

```bash
# Add to Vercel environment
vercel env add CLERK_WEBHOOK_SECRET production

# Test webhook endpoint
curl https://your-domain.com/api/webhooks/clerk
# Should return: {"status":"Clerk webhook endpoint active"}
```

### 4. Test First Signup

1. Create new test account
2. Verify bootstrap ran (check logs)
3. Confirm all counters at 0
4. Verify token balance shows 100
5. Check welcome data (if enabled)

---

## 📝 Feature Flags

### Enable/Disable Features Per Org

```sql
-- Enable premium features for specific org
INSERT INTO feature_flags (org_id, feature_name, enabled)
VALUES ('org-id', 'team_collaboration', true);

-- Check org features
SELECT feature_name, enabled
FROM feature_flags
WHERE org_id = 'org-id';
```

---

## 🎓 Onboarding Flow

### Recommended User Journey

1. **Signup** → Auto-bootstrap (via webhook)
2. **Welcome Dashboard** → Show clean slate with guidance
3. **Branding Setup** → Prompt to complete (notification created)
4. **First Lead** → Import or create manually
5. **First Report** → Generate with AI
6. **Invite Team** → Add members (if applicable)

### Onboarding Checklist Component

```typescript
export function OnboardingChecklist({ user }: { user: any }) {
  const steps = [
    { name: "Complete Branding", done: user.branding_complete },
    { name: "Create First Lead", done: user.leads_count > 0 },
    { name: "Generate Report", done: user.reports_count > 0 },
    { name: "Add Team Member", done: user.team_size > 1 },
  ];

  return (
    <div className="space-y-2">
      {steps.map(step => (
        <div key={step.name} className="flex items-center gap-2">
          {step.done ? "✅" : "⭕"}
          <span className={step.done ? "line-through" : ""}>{step.name}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 Security Considerations

- ✅ All bootstrap operations logged to `audit_log`
- ✅ Webhook signatures verified (Svix)
- ✅ Rate limiting on signup (Clerk handles)
- ✅ Token transactions immutable (append-only ledger)
- ✅ RLS policies enforce org/user isolation

---

## 📞 Support

If users report unexpected data:

1. Check `audit_log` for bootstrap events
2. Verify webhook logs in Clerk Dashboard
3. Run integrity check: `scripts/check-data-integrity.ts`
4. Manual fix: Re-run `bootstrapNewOrg(userId, orgId)`

---

## ✅ Success Criteria

- [ ] All new users start with 0 leads, 0 jobs, $0 revenue
- [ ] Token balance initializes to 100 (or configured amount)
- [ ] No null/undefined errors in UI
- [ ] Branding prompt appears for new users
- [ ] Welcome data created (if enabled)
- [ ] Audit logs capture bootstrap events
- [ ] Webhook integration working (0 failures)

---

**Last Updated:** 2024-11-03  
**Version:** 1.0  
**Status:** Production Ready ✅
