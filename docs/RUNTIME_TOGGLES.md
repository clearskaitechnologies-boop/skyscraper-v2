# 🎛️ RUNTIME TOGGLES — KILL SWITCHES

**Purpose**: Emergency controls to disable features without code deployment  
**Location**: Vercel Dashboard → Environment Variables → Production

---

## 🚨 EMERGENCY TOGGLES

### 1. Maintenance Mode

**Environment Variable**:

```bash
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

**What It Does**:

- Shows sticky orange banner at top of all pages
- Displays custom maintenance message
- **Intent**: Block write operations (must be implemented in routes)
- Users can still view data (read-only)

**When to Use**:

- Database maintenance required
- System under heavy load
- Need to pause all writes while investigating issue
- Preparing for major migration

**UI Behavior**:

- Banner appears: "Maintenance Mode: [custom message]"
- Sub-text: "Write operations are temporarily disabled. You can still view data."

**Custom Message** (optional):

```bash
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Database maintenance in progress. Back at 3pm EST."
```

**To Re-enable**:

```bash
# Remove variable OR set to false
NEXT_PUBLIC_MAINTENANCE_MODE=false
```

**Redeploy**: Required (or wait for auto-deploy)

---

### 2. AI Tools Disabled

**Environment Variable**:

```bash
NEXT_PUBLIC_AI_TOOLS_ENABLED=false
```

**What It Does**:

- Disables AI estimate generation
- Shows purple dismissible banner
- All AI endpoints return friendly error

**When to Use**:

- OpenAI API costs spiking unexpectedly
- OpenAI service outage (avoid error noise)
- Rate limit exceeded on OpenAI account
- Need to conserve API credits
- Debugging AI-related issues

**UI Behavior**:

- Purple banner appears: "AI Tools Temporarily Disabled"
- Message: "AI-powered features are temporarily unavailable. We're working to restore them."
- Dismiss button (user can hide banner)

**Default State**: Enabled (`true`)

**To Re-enable**:

```bash
# Remove variable OR set to true
NEXT_PUBLIC_AI_TOOLS_ENABLED=true
```

**Redeploy**: Required

---

### 3. Uploads Disabled

**Environment Variable**:

```bash
NEXT_PUBLIC_UPLOADS_ENABLED=false
```

**What It Does**:

- Disables file uploads (photos, documents)
- Upload buttons hidden or disabled
- All upload endpoints return 503 error

**When to Use**:

- Vercel Blob storage quota exceeded
- Upload-related bugs causing issues
- Need to prevent storage costs from growing
- CORS issues with Blob storage

**UI Behavior**:

- Upload buttons disabled or hidden
- Message: "File uploads temporarily disabled"

**Default State**: Enabled (`true`)

**To Re-enable**:

```bash
# Remove variable OR set to true
NEXT_PUBLIC_UPLOADS_ENABLED=true
```

**Redeploy**: Required

---

### 4. Sign-ups Disabled

**Environment Variable**:

```bash
NEXT_PUBLIC_SIGNUPS_ENABLED=false
```

**What It Does**:

- Disables new user registration
- Existing users can still sign in
- Sign-up page shows "Closed Beta" or custom message

**When to Use**:

- Closed beta phase
- Controlling growth rate
- Sign-up flow has critical bug
- Want to limit new users during incident

**UI Behavior**:

- Sign-up page: "Sign-ups currently disabled"
- Sign-in page: Works normally for existing users

**Default State**: Enabled (`true`)

**To Re-enable**:

```bash
# Remove variable OR set to true
NEXT_PUBLIC_SIGNUPS_ENABLED=true
```

**Redeploy**: Required

---

## 📋 IMPLEMENTATION STATUS

| Toggle           | Variable                       | UI Component                 | API Implementation           | Status  |
| ---------------- | ------------------------------ | ---------------------------- | ---------------------------- | ------- |
| Maintenance Mode | `NEXT_PUBLIC_MAINTENANCE_MODE` | ✅ MaintenanceBanner.tsx     | ⚠️ Manual (add to routes)    | Partial |
| AI Tools         | `NEXT_PUBLIC_AI_TOOLS_ENABLED` | ✅ AIToolsDisabledBanner.tsx | ⚠️ Manual (add to AI routes) | Partial |
| Uploads          | `NEXT_PUBLIC_UPLOADS_ENABLED`  | ⚠️ TODO                      | ⚠️ TODO                      | TODO    |
| Sign-ups         | `NEXT_PUBLIC_SIGNUPS_ENABLED`  | ⚠️ TODO                      | ⚠️ TODO                      | TODO    |

**Note**: Kill switches have UI components but need server-side enforcement in API routes.

---

## 🔧 HOW TO SET ENVIRONMENT VARIABLES

### Vercel Dashboard (Recommended)

1. Navigate to: https://vercel.com/dashboard
2. Select project: **Skaiscraper**
3. Settings → Environment Variables
4. Click "Add New Variable"
5. Enter variable name (e.g., `NEXT_PUBLIC_MAINTENANCE_MODE`)
6. Enter value (e.g., `true`)
7. Select environment: **Production**
8. Click "Save"
9. Redeploy (or wait for auto-deploy on next push)

---

### Vercel CLI

```bash
# Set variable
vercel env add NEXT_PUBLIC_MAINTENANCE_MODE production
# Enter value when prompted: true

# List all variables
vercel env ls

# Remove variable
vercel env rm NEXT_PUBLIC_MAINTENANCE_MODE production
```

---

## 🚀 QUICK REFERENCE COMMANDS

### Enable Maintenance Mode

```bash
# Vercel Dashboard → Environment Variables → Add:
NEXT_PUBLIC_MAINTENANCE_MODE=true
NEXT_PUBLIC_MAINTENANCE_MESSAGE="Scheduled maintenance. Back at 3pm EST."
# Redeploy
```

### Disable AI Tools

```bash
# Vercel Dashboard → Environment Variables → Add:
NEXT_PUBLIC_AI_TOOLS_ENABLED=false
# Redeploy
```

### Disable Uploads

```bash
# Vercel Dashboard → Environment Variables → Add:
NEXT_PUBLIC_UPLOADS_ENABLED=false
# Redeploy
```

### Disable Sign-ups

```bash
# Vercel Dashboard → Environment Variables → Add:
NEXT_PUBLIC_SIGNUPS_ENABLED=false
# Redeploy
```

### Re-enable All Features

```bash
# Vercel Dashboard → Environment Variables → Remove all toggles
# OR set all to true/empty
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_AI_TOOLS_ENABLED=true
NEXT_PUBLIC_UPLOADS_ENABLED=true
NEXT_PUBLIC_SIGNUPS_ENABLED=true
# Redeploy
```

---

## 🎯 FEATURE FLAGS (CODE REFERENCE)

All kill switches are defined in:

```
src/lib/feature-flags.ts
```

**Functions Available**:

```typescript
// Kill Switches
isMaintenanceModeEnabled(): boolean
areAIToolsEnabled(): boolean
areUploadsEnabled(): boolean
areSignUpsEnabled(): boolean
getMaintenanceMessage(): string
assertFeatureEnabled(featureName, enabled, message?): void

// Other Feature Flags (non-emergency)
isFeatureEnabled(featureName): boolean
```

**Usage in Components**:

```tsx
import { isMaintenanceModeEnabled, areAIToolsEnabled } from "@/lib/feature-flags";

export default function MyComponent() {
  const maintenanceMode = isMaintenanceModeEnabled();
  const aiEnabled = areAIToolsEnabled();

  if (maintenanceMode) {
    return <MaintenanceBanner />;
  }

  if (!aiEnabled) {
    return <AIToolsDisabledBanner />;
  }

  // Normal rendering
}
```

**Usage in API Routes**:

```typescript
import { areAIToolsEnabled, assertFeatureEnabled } from "@/lib/feature-flags";

export async function POST(req: Request) {
  // Option 1: Check and return error
  if (!areAIToolsEnabled()) {
    return NextResponse.json({ error: "AI tools are temporarily disabled" }, { status: 503 });
  }

  // Option 2: Assert (throws error if disabled)
  assertFeatureEnabled("AI Tools", areAIToolsEnabled());

  // Proceed with AI generation
}
```

---

## ⚠️ IMPORTANT NOTES

### 1. Redeploy Required

All `NEXT_PUBLIC_*` environment variables require a **redeploy** to take effect.

**Auto-deploy**: If you push to main, Vercel auto-deploys (takes 1-2 minutes)

**Manual deploy**: Use Vercel dashboard "Redeploy" button

### 2. Client-Side vs Server-Side

`NEXT_PUBLIC_*` variables are exposed to the browser (client-side).

**Do NOT use for**:

- API keys
- Secrets
- Database credentials

**Safe for**:

- Feature toggles
- Public configuration
- UI behavior flags

### 3. Kill Switches Are Not Access Control

These toggles disable features globally (all users).

**For user-specific or org-specific controls**, use:

- Database flags (e.g., `organization.features`)
- RBAC system (role-based access)
- Clerk user metadata

### 4. Test in Preview First

Before setting in production:

1. Set variable in **Preview** environment
2. Deploy preview branch
3. Verify toggle works as expected
4. Then apply to **Production**

---

## 📊 TOGGLE USAGE LOG (TRACK ACTIVATIONS)

**Format**: Date | Toggle | Reason | Duration | Outcome

Example:

```
2025-12-20 | MAINTENANCE_MODE | Database migration | 30 min | Success
2025-12-21 | AI_TOOLS_ENABLED=false | OpenAI outage | 2 hours | Success
2025-12-22 | UPLOADS_ENABLED=false | Blob quota exceeded | 1 hour | Success
```

**Purpose**: Post-mortem analysis, pattern detection

---

## 🔗 RELATED DOCUMENTATION

- [OPERATOR_PLAYBOOK.md](OPERATOR_PLAYBOOK.md) - Daily operations guide
- [VERCEL_LOGS_PLAYBOOK.md](VERCEL_LOGS_PLAYBOOK.md) - Incident debugging
- [src/lib/feature-flags.ts](../src/lib/feature-flags.ts) - Implementation
- [src/components/MaintenanceBanner.tsx](../src/components/MaintenanceBanner.tsx) - UI
- [src/components/AIToolsDisabledBanner.tsx](../src/components/AIToolsDisabledBanner.tsx) - UI

---

**Last Updated**: December 20, 2025  
**Owner**: Platform Owner  
**Status**: ✅ Active for v1.0.0
