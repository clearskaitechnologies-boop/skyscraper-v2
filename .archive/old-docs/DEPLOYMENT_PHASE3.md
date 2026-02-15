# Phase 3 AI Proposals - Deployment Guide

## ✅ Completed Steps

1. **Routing Fixed** - Dashboard now accessible after sign-in
   - Added Clerk redirect URLs to `.env.local`
   - Changed branding gate to dismissible banner
   - Users can access dashboard without completing branding

2. **Database Migration Applied** - ProposalDraft and ProposalFile tables created

   ```bash
   npx prisma db execute --file ./db/migrations/20251031_add_proposals_system.sql
   npx prisma generate
   ```

3. **All Code Pushed** - 11 commits on `feat/phase3-banner-and-enterprise`
   - Backend infrastructure (Firebase, OpenAI, PDF pipeline)
   - Proposal Builder UI
   - Dashboard integration
   - Routing fixes

## 🔧 Required: Firebase Storage Setup

### Step 1: Create Firebase Storage Bucket

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **preloss-vision**
3. Navigate to **Storage** in the left sidebar
4. Click **Get Started** (if first time) or **Create Bucket**
5. Bucket name: `proposals` (or use default bucket)
6. Location: Choose closest to your users (e.g., `us-central1`)
7. Security rules: Start in **production mode** (we'll add RLS later)

### Step 2: Get Firebase Credentials

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download JSON file (e.g., `firebase-service-account.json`)
5. Extract these values from the JSON:
   - `project_id` → FIREBASE_PROJECT_ID
   - `client_email` → FIREBASE_CLIENT_EMAIL
   - `private_key` → FIREBASE_PRIVATE_KEY (keep the `\n` characters)
   - Bucket name from Step 1 → FIREBASE_STORAGE_BUCKET

### Step 3: Set Environment Variables in Vercel

```bash
# Set these in Vercel Dashboard or via CLI
vercel env add FIREBASE_PROJECT_ID production
# Enter: preloss-vision (or your project ID)

vercel env add FIREBASE_CLIENT_EMAIL production
# Enter: firebase-adminsdk-xxxxx@preloss-vision.iam.gserviceaccount.com

vercel env add FIREBASE_PRIVATE_KEY production
# Enter: -----BEGIN PRIVATE KEY-----\nMIIE...rest of key...\n-----END PRIVATE KEY-----
# IMPORTANT: Keep the \n characters in the key

vercel env add FIREBASE_STORAGE_BUCKET production
# Enter: proposals (or your bucket name)

vercel env add OPENAI_API_KEY production
# Enter: sk-proj-... (your OpenAI API key)

vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://skaiscrape.com

# Also add Clerk redirect URLs
vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL production
# Enter: /after-sign-in

vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL production
# Enter: /after-sign-in
```

### Step 4: Apply Storage Security Rules (Optional but Recommended)

Create `storage.rules` in Firebase Console → Storage → Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Proposal PDFs - org-scoped
    match /proposals/{orgId}/{proposalId}/{fileName} {
      allow read: if request.auth != null && request.auth.token.orgId == orgId;
      allow write: if request.auth != null && request.auth.token.orgId == orgId;
    }

    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚀 Deploy to Production

### Option 1: Via Vercel CLI (Recommended)

```bash
# Make sure you're on the right branch
git checkout feat/phase3-banner-and-enterprise

# Deploy to production
vercel --prod

# Verify deployment
curl -sS https://skaiscrape.com/api/health/live
```

### Option 2: Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **preloss-vision** or **skaiscrape**
3. Go to **Deployments** tab
4. Click **Deploy** next to `feat/phase3-banner-and-enterprise` branch
5. Select **Production** as the target
6. Click **Deploy**

### Option 3: Merge to Main (Standard Flow)

```bash
# Create PR from feat/phase3-banner-and-enterprise to main
gh pr create --base main --head feat/phase3-banner-and-enterprise \
  --title "feat: Phase 3 - AI Proposals & Claims Packets System" \
  --body "$(cat PR_BODY_PHASE3.md)"

# After approval, merge PR
# Vercel will auto-deploy main to production
```

## ✅ Post-Deployment Verification

### 1. Test Sign-In Flow

1. Go to https://skaiscrape.com/sign-in
2. Sign in with your account
3. **Verify**: Redirects to `/dashboard` (not marketing homepage)
4. **Verify**: Dashboard renders with ToolbarActions and AICardsGrid
5. **Verify**: Blue branding banner appears at top (if no branding setup)

### 2. Test Proposal Builder UI

1. Click **"New Proposal"** button in ToolbarActions (indigo button)
2. **Verify**: Routes to `/dashboard/proposals/new`
3. Select a lead from dropdown
4. Select a job (auto-filtered by lead)
5. Choose packet type: **Retail**
6. Click **"Generate Proposal with AI"**
7. **Verify**: Loading state appears
8. **Verify**: 4 editable sections populate with AI content
9. Edit any section (e.g., add custom notes)
10. **Verify**: Live preview updates in iframe
11. Click **"Render PDF & Download"**
12. **Verify**: Download link appears
13. Download PDF and **verify**:
    - Company branding (logo, colors)
    - Sales-focused language
    - Professional formatting
14. Click **"Publish & Lock"**
15. **Verify**: Redirects to `/dashboard?proposalPublished=true`

### 3. Test Claims Packet Flow

Repeat above but choose **Claims** packet type:

- **Verify**: Formal tone (no sales language)
- **Verify**: Evidence matrix included
- **Verify**: Weather and DOL data embedded
- **Verify**: Carrier-ready format

### 4. Test Contractor Mode Flow

Repeat above but choose **Contractor** packet type:

- **Verify**: Neutral tone
- **Verify**: Technical specifications only
- **Verify**: No pricing or sales language

## 🐛 Troubleshooting

### Issue: "Failed to upload to Firebase"

**Solution**: Verify environment variables are set correctly in Vercel:

```bash
vercel env ls production
# Should show FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, etc.
```

### Issue: "OpenAI API key not found"

**Solution**: Add OPENAI_API_KEY to Vercel production environment:

```bash
vercel env add OPENAI_API_KEY production
# Enter: sk-proj-...
```

### Issue: Dashboard still shows branding gate

**Solution**: Clear cache and hard refresh:

1. Open DevTools (Cmd+Option+I)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Issue: Proposal Builder doesn't fetch leads/jobs

**Solution**: Check API routes are working:

```bash
curl -H "Cookie: __session=..." https://skaiscrape.com/api/leads
curl -H "Cookie: __session=..." https://skaiscrape.com/api/jobs
```

## 📊 Monitoring

### Analytics Events

Phase 3 fires these PostHog events:

- `proposal_draft_created` - AI generation started
- `proposal_draft_edited` - User edited AI content
- `proposal_pdf_rendered` - PDF generated
- `proposal_published` - Locked and finalized

Check PostHog dashboard for event counts after deployment.

### Error Monitoring

Check Sentry for any runtime errors:

1. Go to [Sentry Dashboard](https://sentry.io)
2. Select **preloss-vision** project
3. Filter by environment: **production**
4. Look for errors in:
   - `/api/proposals/build`
   - `/api/proposals/render`
   - `/api/proposals/[id]/publish`

## 🎉 Success Criteria

- ✅ Sign-in redirects to dashboard (not marketing homepage)
- ✅ Dashboard renders with "New Proposal" button
- ✅ Proposal Builder UI loads and fetches leads/jobs
- ✅ AI generates content for all 3 packet types
- ✅ PDF renders with org branding
- ✅ Download works
- ✅ Publish locks draft and redirects
- ✅ No console errors
- ✅ Analytics events firing

## 📝 Next Steps (Optional)

1. **Proposal Editor** - Edit published proposals at `/dashboard/proposals/[draftId]`
2. **Proposal History** - List view at `/dashboard/proposals` with filters
3. **Assistant Triggers** - Balance checks, data suggestions
4. **Token Consumption** - Enable ledger tracking (currently commented out)

---

**Deployment Date**: November 2024  
**Branch**: feat/phase3-banner-and-enterprise  
**Commits**: 11 total  
**Files Changed**: ~18 new files, ~3,400 LOC
