# 🌐 DOMAIN CANONICAL CHECKLIST

**Purpose**: Verify production domain configuration and behavior  
**Last Updated**: December 20, 2025

---

## ✅ CANONICAL DOMAIN CONFIGURATION

### Primary Domain

- **Production URL**: `https://skaiscrape.com`
- **WWW Redirect**: `https://www.skaiscrape.com` → `https://skaiscrape.com`
- **HTTP Redirect**: `http://skaiscrape.com` → `https://skaiscrape.com`

### Vercel Configuration

1. Navigate to Vercel Dashboard → Project → Settings → Domains
2. Verify primary domain is set to `skaiscrape.com`
3. Ensure `www.skaiscrape.com` is configured with redirect to primary
4. Confirm SSL certificate is active and auto-renewing

---

## 🔐 CLERK AUTH CONFIGURATION

### Required Redirect URLs

**Clerk Dashboard → Configure → Paths**:

1. **Sign-in URL**: `https://skaiscrape.com/sign-in`
2. **Sign-up URL**: `https://skaiscrape.com/sign-up`
3. **After sign-in URL**: `https://skaiscrape.com/dashboard`
4. **After sign-up URL**: `https://skaiscrape.com/onboarding`

**Allowed Redirect URLs** (add these):

```
https://skaiscrape.com
https://skaiscrape.com/*
https://www.skaiscrape.com
https://www.skaiscrape.com/*
```

**Allowed Origins**:

```
https://skaiscrape.com
https://www.skaiscrape.com
```

### Environment Variables

Verify in Vercel → Project → Settings → Environment Variables:

```bash
# Production only
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

---

## 📤 UPLOAD ENDPOINTS VERIFICATION

### Manual Tests (Production Domain)

**1. Photo Upload Test**:

```bash
# Create a test claim first, then:
curl -X POST https://skaiscrape.com/api/claims/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg" \
  -F "claimId=YOUR_CLAIM_ID"
```

**Expected**: 200 OK with file URL in response

**2. Document Upload Test**:

```bash
curl -X POST https://skaiscrape.com/api/claims/document/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-doc.pdf" \
  -F "claimId=YOUR_CLAIM_ID"
```

**Expected**: 200 OK with document record created

### Browser Test

1. Sign in to `https://skaiscrape.com`
2. Navigate to any claim
3. Go to Photos tab → Upload photo
4. Go to Documents tab → Upload document
5. **Verify**: Files appear immediately, no CORS errors in console

---

## 🧪 MANUAL VERIFICATION STEPS

### Step 1: WWW Redirect

```bash
curl -I https://www.skaiscrape.com
```

**Expected**: `301 Moved Permanently` → `Location: https://skaiscrape.com`

### Step 2: HTTP→HTTPS Redirect

```bash
curl -I http://skaiscrape.com
```

**Expected**: `301` or `308` → `Location: https://skaiscrape.com`

### Step 3: Sign-In Flow

1. Open incognito window
2. Navigate to `https://skaiscrape.com`
3. Click "Sign In"
4. Complete Clerk authentication
5. **Verify**:
   - Redirected to `/dashboard` after sign-in
   - Session cookie set on `.skaiscrape.com` domain
   - No redirect loops

### Step 4: Sign-Up Flow

1. Open incognito window
2. Navigate to `https://skaiscrape.com/sign-up`
3. Complete new user registration
4. **Verify**:
   - Redirected to `/onboarding` after sign-up
   - New org created
   - User can access dashboard

### Step 5: Upload Permissions

1. Sign in to production
2. Create a test claim
3. Upload 3 photos
4. Upload 1 PDF document
5. **Verify**:
   - Files upload without errors
   - Files visible in claim workspace immediately
   - Download links work
   - No CORS errors in browser console

### Step 6: AI Endpoint Runtime

1. Create a claim with photos/damage details
2. Navigate to AI tab
3. Click "Generate Estimate"
4. **Verify**:
   - AI endpoint responds within 10 seconds
   - Artifact saved to database
   - Artifact visible in Reports tab
   - PDF export works

---

## 🚨 COMMON ISSUES & FIXES

### Issue: WWW not redirecting

**Fix**: Vercel Dashboard → Domains → Add `www.skaiscrape.com` → Select "Redirect to skaiscrape.com"

### Issue: Clerk auth loops

**Symptom**: Redirects between `/sign-in` and `/dashboard` infinitely

**Fix**:

1. Verify Clerk allowed redirect URLs include production domain
2. Check middleware.ts is not blocking auth callbacks
3. Ensure `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard` is set in production env vars

### Issue: Upload CORS errors

**Symptom**: Browser console shows CORS error on file upload

**Fix**:

1. Verify upload endpoints return correct CORS headers
2. Check Vercel storage CORS configuration
3. Ensure cookies are set with `SameSite=None; Secure` for cross-origin

### Issue: AI endpoints timeout

**Symptom**: AI tools hang or return 504

**Fix**:

1. Check Vercel function timeout settings (increase to 60s for AI routes)
2. Verify OpenAI API key is set in production env vars
3. Monitor OpenAI rate limits

---

## ✅ PRODUCTION VERIFICATION CHECKLIST

Run this checklist **before** and **after** every production deployment:

- [ ] WWW redirect works (`curl -I https://www.skaiscrape.com`)
- [ ] HTTP→HTTPS redirect works (`curl -I http://skaiscrape.com`)
- [ ] Sign-in flow completes without loops
- [ ] Sign-up flow creates new org + redirects to onboarding
- [ ] Photo upload works in production
- [ ] Document upload works in production
- [ ] AI estimate generates successfully
- [ ] PDF export downloads correctly
- [ ] No CORS errors in browser console
- [ ] Session cookies set on correct domain
- [ ] All env vars present in Vercel (use `/settings/production-verification`)

---

## 🔗 RELATED RESOURCES

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Clerk Dashboard**: https://dashboard.clerk.com
- **Production Verification Page**: https://skaiscrape.com/settings/production-verification
- **Smoke Test Script**: `./scripts/smoke-prod.sh`

---

## 📞 ESCALATION

If any check fails after following fixes above:

1. Check Vercel deployment logs
2. Check Clerk auth logs
3. Check browser network tab for failed requests
4. Run `/settings/production-verification` page
5. Review `docs/VERCEL_LOGS_PLAYBOOK.md` for log filters

**Critical Issues**: If auth is broken or uploads fail, enable maintenance mode immediately:

```bash
# Vercel Dashboard → Environment Variables
NEXT_PUBLIC_MAINTENANCE_MODE=true
```

Then redeploy to activate maintenance banner.
