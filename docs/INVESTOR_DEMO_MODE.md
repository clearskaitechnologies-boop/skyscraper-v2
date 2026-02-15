# INVESTOR DEMO MODE - QUICK REFERENCE

## Activation

Set environment variable in Vercel:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

## What It Does

### ✅ Active Features

- 🟡 **Demo Mode Banner** - Shows on all pages
- 🔒 **Feature Restrictions** - Blocks destructive actions
- 📊 **Analytics Tracking** - Logs all demo interactions
- ⚠️ **Visual Indicators** - Amber badges on restricted features

### 🚫 Restricted Actions

- Delete claims
- Delete leads
- Delete contacts
- Change billing/subscription
- Delete organization
- Bulk data operations

### ✅ Allowed Actions

- View all pages
- Open claims
- Use AI Assistant
- Generate AI outputs
- Edit demo claim (John Smith)
- Create new test records
- View analytics

---

## Demo Experience

### User Journey

1. **Login** → See demo mode banner
2. **Dashboard** → AI Assistant works, stats visible
3. **Claims List** → See John Smith claim
4. **Open Claim** → Full detail view
5. **AI Assistant** → Generate outputs
6. **Restricted Actions** → See amber "Demo Mode" overlay

---

## Configuration Options

### Read-Only Mode (Optional)

Prevents ALL edits:

```bash
DEMO_READ_ONLY=true
```

### Allowed Claims (Optional)

Whitelist specific claims:

```bash
DEMO_ALLOWED_CLAIMS=claim-id-1,claim-id-2
```

### Auto-Reset (Optional)

Reset data every 24 hours:

```bash
DEMO_AUTO_RESET=true
DEMO_RESET_INTERVAL=24
```

---

## Visual Components

### Banner

- Full width alert at top of pages
- Amber color scheme
- Clear "Investor Demo Mode Active" message
- Explains read-only restrictions

### Badges

- Small "Demo Mode" badges on restricted buttons
- Appears on hover over disabled features
- Amber outline style

### Overlays

- Blur disabled features
- Show restriction message
- Maintains UI visibility

---

## Technical Implementation

### Files Created

1. `/src/lib/demo/config.ts` - Configuration utilities
2. `/src/components/demo/DemoModeBanner.tsx` - Banner component
3. `.env.demo.example` - Environment variable template

### Files Modified

1. `/src/app/(app)/layout.tsx` - Banner injection

### Usage in Components

```typescript
import { isDemoMode, isFeatureRestricted } from "@/lib/demo/config";

// Check if in demo mode
if (isDemoMode()) {
  // Show demo UI
}

// Check specific feature
if (isFeatureRestricted("delete-claim")) {
  // Disable button
}
```

---

## For Investors

### What You'll See

- ✅ Full application functionality
- ✅ Live AI generation
- ✅ Complete claims workflow
- ✅ Real-time dashboard
- ⚠️ "Demo Mode" indicators
- 🚫 Some actions disabled for safety

### What's Disabled

- Permanent deletions
- Billing changes
- Organization deletion
- Mass data operations

### What's NOT Disabled

- Viewing all data
- AI interactions
- Claim editing (John Smith)
- Feature exploration
- Analytics viewing

---

## Deployment Commands

### Enable Demo Mode

```bash
# Set environment variable
vercel env add NEXT_PUBLIC_DEMO_MODE
# Enter: true

# Redeploy
vercel --prod
```

### Disable Demo Mode

```bash
# Remove or set to false
vercel env rm NEXT_PUBLIC_DEMO_MODE

# Or update to false
vercel env add NEXT_PUBLIC_DEMO_MODE
# Enter: false

# Redeploy
vercel --prod
```

---

## Monitoring

### Check Demo Status

Visit any page - banner appears if active.

### Analytics

Demo mode logs all interactions:

- Page views
- AI generations
- Button clicks
- Restricted action attempts

### Reset Data (Manual)

```bash
# SSH into production
# Run reset script
npm run demo:reset
```

---

## Security

### What's Protected

- ✅ Production data cannot be deleted
- ✅ Billing cannot be modified
- ✅ Org cannot be removed
- ✅ Bulk operations blocked

### What's Logged

- All demo interactions
- Restricted action attempts
- AI usage
- Page navigation

---

## Best Practices

### Before Investor Demo

1. Enable demo mode: `NEXT_PUBLIC_DEMO_MODE=true`
2. Verify banner appears
3. Test AI Assistant with John Smith claim
4. Confirm restricted features show overlays
5. Prepare demo script

### After Demo

1. Review analytics logs
2. Reset demo data (if needed)
3. Decide: keep enabled or disable
4. Export demo metrics for follow-up

### For Production Use (Non-Demo)

- Set `NEXT_PUBLIC_DEMO_MODE=false` or remove variable
- Demo mode disabled by default
- No performance impact when off

---

## Troubleshooting

### Banner Not Showing

- Check environment variable is set
- Verify value is exactly `"true"`
- Redeploy after env change
- Clear browser cache

### Features Still Working When Restricted

- Check feature name matches restriction list
- Verify `isFeatureRestricted()` is called
- Review console logs for demo mode status

### Auto-Reset Not Working

- Confirm `DEMO_AUTO_RESET=true`
- Check cron job is running
- Verify reset script executes
- Review error logs

---

## Status Indicators

### 🟢 Demo Mode OFF (Production)

- No banner
- All features work
- No restrictions
- Normal operation

### 🟡 Demo Mode ON (Investor Demo)

- Banner visible
- Some features restricted
- Analytics tracking
- Safe exploration

---

## Quick Commands

```bash
# Check if demo mode is active
curl https://skaiscrape.com/api/_meta | jq '.demoMode'

# Enable demo mode
vercel env add NEXT_PUBLIC_DEMO_MODE production
# Enter: true
vercel --prod

# Disable demo mode
vercel env rm NEXT_PUBLIC_DEMO_MODE production
vercel --prod

# View demo logs
vercel logs --prod | grep "DEMO_MODE"
```

---

**Current Status**: Implemented and ready
**Toggle Time**: < 2 minutes
**Production Impact**: Zero when disabled
**Recommended Use**: Investor meetings, demos, trade shows
