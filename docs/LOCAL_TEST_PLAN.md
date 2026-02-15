# 🧪 LOCAL TEST PLAN

**PreLoss Vision / SkaiScraper**  
**Generated:** November 17, 2025  
**Environment:** Local Development (macOS)

---

## 📋 PRE-FLIGHT CHECKLIST

### System Requirements

- [x] Node.js 18+ installed
- [x] pnpm installed (`npm install -g pnpm`)
- [x] PostgreSQL client (psql) installed
- [x] Git installed
- [x] VS Code or similar editor

### Environment Variables

- [ ] `.env` file exists in project root
- [ ] All required keys configured (see checklist below)

---

## 🚀 SETUP & INSTALLATION

### Step 1: Install Dependencies

```bash
cd /Users/admin/Downloads/preloss-vision-main

# Install all packages
pnpm install

# Expected output:
# Progress: resolved X, reused X, downloaded X
# Done in Xs
```

**Troubleshooting:**

- If `pnpm: command not found`: Run `npm install -g pnpm`
- If permission errors: Run with `sudo` or fix npm permissions

---

### Step 2: Environment Variables Setup

**Check Current .env:**

```bash
cat .env | grep -v "^#" | grep -v "^$"
```

**Required Variables Checklist:**

```bash
# Database
✅ DATABASE_URL=postgres://postgres:Pinkskiesahead2025@db.nkjgcbkytuftkumdtjat.supabase.co:5432/postgres

# Clerk Auth
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_***
✅ CLERK_SECRET_KEY=sk_***
✅ NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
✅ NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase Storage
✅ NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=eyJ***

# OpenAI
✅ OPENAI_API_KEY=sk-***

# Stripe
✅ STRIPE_SECRET_KEY=sk_***
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_***
✅ STRIPE_WEBHOOK_SECRET=whsec_***

# Email
✅ RESEND_API_KEY=re_***

# Optional: Weather APIs
⚪ VISUAL_CROSSING_API_KEY=***
⚪ WEATHERSTACK_API_KEY=***

# Optional: Video (Phase 31)
✅ VIDEO_REAL_ENABLED=true

# Optional: Maps
⚪ NEXT_PUBLIC_MAPBOX_TOKEN=pk.***

# Optional: Replicate (Real Video)
⚪ REPLICATE_API_TOKEN=r8_***
```

---

### Step 3: Database Connection Test

```bash
# Test connection
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT version();"

# Expected output:
# PostgreSQL 15.x on x86_64-pc-linux-gnu, compiled by gcc...
```

**If connection fails:**

- Check firewall/VPN
- Verify DATABASE_URL in .env
- Ensure Supabase project is running

---

### Step 4: Prisma Setup

```bash
# Generate Prisma Client
npx prisma generate

# Expected output:
# ✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client
```

**Verify Schema:**

```bash
# Check Prisma models are available
npx prisma validate

# Expected output:
# Environment variables loaded from .env
# Prisma schema loaded from prisma/schema.prisma
# The schema is valid ✅
```

---

### Step 5: Run Database Health Check

```bash
# Run health check SQL
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -f db/scripts/health_check.sql

# Expected output:
# 📊 TABLE ROW COUNTS
# ===================
# table_name       | row_count
# -----------------+----------
# Org              | 0 (or more)
# TokenWallet      | 0 (or more)
# claims           | 0 (or more)
# leads            | 0 (or more)
# ...
```

**Troubleshooting:**

- If "relation does not exist": Run migrations
- If "permission denied": Check DATABASE_URL permissions

---

### Step 6: Start Development Server

```bash
# Start Next.js dev server
pnpm dev

# Expected output:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
# ✓ Ready in Xs
```

**Keep this terminal open!**

---

## 🧪 FEATURE TESTING GUIDE

### TEST 1: Authentication & Organization Setup

**Estimated Time:** 5 minutes  
**Prerequisites:** None

**Steps:**

1. Open browser: `http://localhost:3000`
2. Click "Sign In" or "Sign Up"
3. Create new account:
   - Email: `test@example.com` (or real email)
   - Password: Create secure password
4. Complete email verification (check inbox)
5. When prompted, create organization:
   - Name: "Test Roofing Co"
   - Click "Create"
6. You should be redirected to `/dashboard`

**Verification:**

```bash
# Check org was created in database
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT id, name, \"clerkOrgId\", \"videoEnabled\", \"videoPlanTier\" FROM \"Org\" ORDER BY \"createdAt\" DESC LIMIT 1;"

# Expected output:
# id | name              | clerkOrgId    | videoEnabled | videoPlanTier
# ---+-------------------+---------------+--------------+---------------
# 1  | Test Roofing Co   | org_abc123    | f            | (null)
```

**Enable Video Features (Phase 31):**

```bash
# Get your org ID from output above, then run:
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "UPDATE \"Org\" SET \"videoEnabled\" = true, \"videoPlanTier\" = 'beta' WHERE \"clerkOrgId\" = 'org_abc123';"

# Verify:
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT \"videoEnabled\", \"videoPlanTier\" FROM \"Org\" WHERE \"clerkOrgId\" = 'org_abc123';"

# Expected: videoEnabled = t, videoPlanTier = beta
```

**Success Criteria:**

- ✅ User can sign up
- ✅ Organization is created
- ✅ Redirected to dashboard
- ✅ Org appears in database
- ✅ Video features enabled

---

### TEST 2: Leads Management

**Estimated Time:** 10 minutes  
**Prerequisites:** Test 1 complete

**Steps:**

**2.1 Navigate to Leads**

1. Click "Leads" in sidebar
2. URL should be: `http://localhost:3000/leads`
3. You should see: Empty state or list of leads

**2.2 Create New Lead**

1. Click "New Lead" or "+ Create Lead" button
2. Fill in form:
   ```
   First Name: John
   Last Name: Doe
   Email: john.doe@example.com
   Phone: (555) 123-4567
   Address: 123 Main Street
   City: Austin
   State: TX
   Zip: 78701
   Description: Roof damage after recent storm
   Status: NEW
   ```
3. Click "Save" or "Create Lead"
4. Should redirect to lead detail page

**2.3 View Lead Detail**

- URL: `http://localhost:3000/leads/[lead-id]`
- Should see:
  - Lead information card
  - Contact details
  - Property information
  - Activities timeline
  - Notes section
  - **Dominus AI Panel** (Phase 28.1 ✅)
  - **Smart Actions Panel** (Phase 28.1 ✅)
  - **Video Report Panel** (Phase 28.1 ✅)

**Verification:**

```bash
# Check lead was created
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT id, \"firstName\", \"lastName\", status FROM \"leads\" ORDER BY \"createdAt\" DESC LIMIT 1;"

# Expected output:
# id  | firstName | lastName | status
# ----+-----------+----------+-------
# ... | John      | Doe      | NEW
```

**Success Criteria:**

- ✅ Leads list loads without errors
- ✅ Can create new lead
- ✅ Lead detail page displays correctly
- ✅ Lead saved to database
- ✅ All panels visible

---

### TEST 3: Dominus AI Analysis (Phase 28.1 ✅)

**Estimated Time:** 5 minutes  
**Prerequisites:** Test 2 complete, OPENAI_API_KEY configured

**Steps:**

**3.1 Run AI Analysis**

1. From lead detail page (`/leads/[id]`)
2. Locate "Dominus AI" panel
3. Click "Run AI Analysis" button
4. Observe:
   - Button text changes to "Analyzing..."
   - Button is disabled during analysis
   - Spinner appears

**3.2 Success Case**

- AI summary appears in panel
- Shows urgency score (Low/Medium/High/Critical)
- Shows job type (Roof, Siding, etc.)
- Shows key insights

**3.3 Token Error Case (402 Handling)**

- If out of tokens, should see:
  - ❌ "Out of AI tokens" message
  - "Please purchase more to continue" prompt
  - Link to upgrade/purchase
  - **NO cryptic errors or stack traces** ✅

**3.4 Auth Error Case (401 Handling)**

- Should show user-friendly message
- No console errors exposed to user

**Console Check:**

```bash
# Open browser DevTools (F12)
# Go to Console tab
# Should see:
# [Dominus] Starting analysis for lead...
# [Dominus] Analysis complete

# Should NOT see:
# ❌ Unhandled Promise Rejection
# ❌ 401 Unauthorized (exposed to user)
# ❌ Stack traces in UI
```

**Verification:**

```bash
# Check token consumption
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT \"orgId\", balance, \"monthlyAllowance\" FROM \"TokenWallet\" LIMIT 1;"

# Balance should be decremented
```

**Success Criteria:**

- ✅ Analysis runs without errors
- ✅ Loading states work correctly
- ✅ Button is disabled during analysis
- ✅ 402 error shows user-friendly message
- ✅ 401 error handled gracefully
- ✅ No stack traces in UI

---

### TEST 4: Smart Actions Panel (Phase 28.1 ✅)

**Estimated Time:** 5 minutes  
**Prerequisites:** Test 2 complete

**Steps:**

**4.1 Generate Quick Actions**

1. From lead detail page
2. Locate "Smart Actions" panel
3. Click one of:
   - "Generate Call Script"
   - "Generate Email"
   - "Generate Text Message"
4. Observe loading state
5. Action content appears

**4.2 Error Handling**

- Test 402 token error: Should show friendly message
- Test 401 auth error: Should handle gracefully
- Buttons should disable during generation

**Success Criteria:**

- ✅ Actions generate successfully
- ✅ Loading states work
- ✅ 402/401 errors user-friendly
- ✅ Content is contextual to lead

---

### TEST 5: Video Report Generation (Phase 28.1 + 31 ✅)

**Estimated Time:** 10 minutes  
**Prerequisites:** Test 2 complete, VIDEO_REAL_ENABLED=true, org video enabled

**Steps:**

**5.1 Check Video Access Badge**

1. From lead detail page
2. Locate "Dominus Video AI" panel
3. Should see badge:
   - ✅ "REAL VIDEO (BETA)" (if enabled)
   - OR "Mock video mode (set VIDEO_REAL_ENABLED=true...)" (if disabled)

**5.2 Generate Script & Storyboard**

1. Click "Generate Script & Storyboard"
2. Wait for generation (30-60 seconds)
3. Review script content
4. Review storyboard scenes

**5.3 Generate Video Report**

1. Click "Generate Video Report"
2. Observe:
   - Token check happens first
   - If insufficient: 402 error with clear message
   - If successful: Video job created
3. Video generation starts (can take 2-5 minutes)

**5.4 Check Video Access API**

```bash
# Test video access endpoint
curl -s http://localhost:3000/api/video-access \
  -H "Cookie: __session=..." \
  | jq .

# Expected response:
{
  "hasRealVideo": true,
  "message": "Real video generation enabled",
  "videoEnabled": true,
  "videoPlanTier": "beta"
}
```

**5.5 Graceful Fallback**

- If REPLICATE_API_TOKEN not set, should fall back to mock video
- No hard errors, just logs warning

**Success Criteria:**

- ✅ Video access badge shows correct status
- ✅ Script generation works
- ✅ Video job created
- ✅ 402 token handling works
- ✅ Graceful fallback to mock
- ✅ API endpoint returns correct status

---

### TEST 6: Adjuster Packet Sharing (Phase 30 ✅)

**Estimated Time:** 5 minutes  
**Prerequisites:** Test 5 complete (video generated)

**Steps:**

**6.1 Generate Share Link**

1. From video report panel
2. Click "Generate Share Link"
3. Two links should appear:
   - **Video Watch Link:** `/watch/[publicId]`
   - **Adjuster Packet Link:** `/packet/[publicId]`

**6.2 Test Packet Page (Public Access)**

1. Copy packet link
2. Open in **incognito/private window** (to test no-auth access)
3. Navigate to link
4. Should see:
   - Header with contractor info and date
   - Property & Claim Information card
   - AI Analysis Summary with urgency bar
   - Safety Concerns & Flags section
   - Video Report embed
   - Detailed Inspection Findings
   - Professional disclaimer footer
5. **No auth required** - public access ✅

**6.3 Verify Layout**

- Page should be professional and print-friendly
- No navigation or app UI (it's public)
- All data loads correctly

**6.4 Test Revoke**

1. Back in app, click "Revoke Link"
2. Refresh packet page in incognito
3. Should show "not available" or 404

**Verification:**

```bash
# Check VideoReport in database
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT id, \"publicId\", status FROM \"VideoReport\" WHERE \"leadId\" = 'YOUR_LEAD_ID' LIMIT 1;"

# publicId should exist
```

**Success Criteria:**

- ✅ Packet link generates
- ✅ Page loads without auth
- ✅ All sections render correctly
- ✅ Video embed works
- ✅ Revoke functionality works
- ✅ Professional appearance

---

### TEST 7: Claims Management

**Estimated Time:** 10 minutes  
**Prerequisites:** Test 1 complete

**Steps:**

**7.1 Navigate to Claims**

1. Click "Claims" in sidebar
2. URL: `http://localhost:3000/claims`

**7.2 Create New Claim**

1. Click "New Claim" button
2. Fill in form:
   ```
   Claim Number: TEST-2024-001
   Insured Name: Jane Smith
   Date of Loss: [select recent date]
   Policy Number: POL-123456
   Carrier: State Farm
   Adjuster Name: Bob Johnson
   Property Address: [select from properties or create new]
   Description: Hail damage to roof
   ```
3. Click "Save" or "Create Claim"
4. Should redirect to claim detail

**7.3 View Claim Detail**

- URL: `http://localhost:3000/claims/[claimId]`
- Should see tabs:
  - Overview
  - Damage
  - Weather
  - Scopes
  - Estimates
  - Supplements
  - Reports
  - Automation
  - Completion
  - Financials
  - Activity
  - Files
  - Messages

**7.4 Test Claim Features**

- Click through each tab
- Verify no errors in console
- Check all data loads

**Verification:**

```bash
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT id, \"claimNumber\", \"insuredName\", \"dateOfLoss\" FROM \"claims\" ORDER BY \"createdAt\" DESC LIMIT 1;"
```

**Success Criteria:**

- ✅ Claims list loads
- ✅ Can create claim
- ✅ Claim detail loads
- ✅ All tabs accessible
- ✅ No console errors

---

### TEST 8: Weather Verification

**Estimated Time:** 10 minutes  
**Prerequisites:** Test 7 complete, Weather API key configured

**Steps:**

**8.1 Navigate to Weather Hub**

1. URL: `http://localhost:3000/weather`
2. Should see weather tools grid

**8.2 Quick DOL Analysis**

1. Click "Quick DOL Analysis" tool
2. Enter:
   ```
   Address: 123 Main St, Austin, TX 78701
   Date Range: [last 30 days]
   ```
3. Click "Analyze"
4. Should show:
   - Weather events in date range
   - Most likely date of loss
   - Severity indicators

**8.3 Weather Verification API**

1. Go to `/ai/weather`
2. Enter property address and DOL
3. Generate weather report
4. Should include:
   - Temperature data
   - Wind speed
   - Precipitation
   - Storm events
   - Hail reports (if applicable)

**8.4 Claim Weather Tab**

1. Go to claim detail (`/claims/[claimId]`)
2. Click "Weather" tab
3. Add weather report to claim
4. Should link weather data to claim

**API Test:**

```bash
# Test weather API endpoint
curl -X POST http://localhost:3000/api/weather/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "address": "123 Main St, Austin, TX 78701",
    "date": "2024-10-15"
  }' | jq .
```

**Success Criteria:**

- ✅ Weather hub loads
- ✅ DOL analysis works
- ✅ Weather data fetches successfully
- ✅ Weather report generates
- ✅ Can link to claim

---

### TEST 9: Reports & PDF Export

**Estimated Time:** 10 minutes  
**Prerequisites:** Test 7 complete

**Steps:**

**9.1 Navigate to Reports**

1. URL: `http://localhost:3000/reports`
2. Click "New Report"

**9.2 Create Report**

1. Select claim: [choose from dropdown]
2. Choose report type:
   - Damage Assessment
   - Estimate
   - Supplement
   - Final Report
3. Fill in report details
4. Click "Generate Report"

**9.3 View Report**

- Should redirect to `/reports/[reportId]`
- Report preview should load
- All sections should render

**9.4 Export PDF**

1. Click "Export PDF" or "Download"
2. PDF should generate
3. Check PDF contents:
   - Header with branding
   - Report sections
   - Images (if included)
   - Footer with disclaimers

**9.5 Email Report**

1. Click "Email Report"
2. Enter recipient email
3. Send
4. Check email delivery

**API Test:**

```bash
# Test PDF generation
curl -X POST http://localhost:3000/api/pdf/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=..." \
  -d '{
    "reportId": "YOUR_REPORT_ID",
    "format": "pdf"
  }' \
  --output test-report.pdf

# Open PDF
open test-report.pdf
```

**Success Criteria:**

- ✅ Reports list loads
- ✅ Can create report
- ✅ Report renders correctly
- ✅ PDF exports successfully
- ✅ PDF formatting is correct
- ✅ Email delivery works

---

### TEST 10: AI Claims Ready Packet

**Estimated Time:** 5 minutes  
**Prerequisites:** Test 7 complete

**Steps:**

**10.1 Generate Claims Packet**

1. From claim detail page
2. Find "Generate Claims Packet" or similar button
3. Click to generate
4. Wait for AI processing

**10.2 Review Packet**

- Should include:
  - Claim summary
  - AI-generated analysis
  - Photos and documentation
  - Damage assessment
  - Recommended actions

**10.3 Share with Adjuster**

1. Generate share link
2. Test link in incognito
3. Verify adjuster-friendly format

**Success Criteria:**

- ✅ Packet generates successfully
- ✅ AI summary is accurate
- ✅ Photos are included
- ✅ Formatting is professional
- ✅ Shareable link works

---

## 🐛 TROUBLESHOOTING GUIDE

### Issue: "Database connection failed"

**Solution:**

```bash
# 1. Check DATABASE_URL
echo $DATABASE_URL

# 2. Test connection manually
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT 1;"

# 3. Check firewall/VPN
```

---

### Issue: "Prisma Client not generated"

**Solution:**

```bash
npx prisma generate
pnpm dev
```

---

### Issue: "OpenAI API key invalid"

**Solution:**

```bash
# Check key is set
grep OPENAI_API_KEY .env

# Test key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

### Issue: "Port 3000 already in use"

**Solution:**

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 pnpm dev
```

---

### Issue: "Weather API returns 401"

**Solution:**

- Check VISUAL_CROSSING_API_KEY in .env
- Verify API key is active
- Check API quota limits

---

### Issue: "Video generation fails"

**Solution:**

```bash
# Check VIDEO_REAL_ENABLED
grep VIDEO_REAL_ENABLED .env

# Check org video settings
PGPASSWORD=Pinkskiesahead2025 psql -h db.nkjgcbkytuftkumdtjat.supabase.co -U postgres -d postgres -c "SELECT \"videoEnabled\", \"videoPlanTier\" FROM \"Org\" LIMIT 1;"

# Should see: videoEnabled = t, videoPlanTier = beta
```

---

## ✅ TEST COMPLETION CHECKLIST

### Core Functionality

- [ ] Authentication works
- [ ] Organization created
- [ ] Can create leads
- [ ] Can create claims
- [ ] Can create reports

### AI Features (Phase 28.1 ✅)

- [ ] Dominus AI analysis works
- [ ] Smart actions generate
- [ ] 402 token errors user-friendly
- [ ] 401 auth errors handled gracefully
- [ ] No stack traces in UI

### Video Features (Phase 31 ✅)

- [ ] Video access badge shows correct status
- [ ] Script generation works
- [ ] Video job creation works
- [ ] Graceful fallback to mock
- [ ] API endpoint works

### Adjuster Packets (Phase 30 ✅)

- [ ] Packet page loads without auth
- [ ] All sections render
- [ ] Video embed works
- [ ] Professional appearance
- [ ] Revoke functionality works

### Weather Verification

- [ ] Weather hub loads
- [ ] DOL analysis works
- [ ] Weather API fetches data
- [ ] Weather links to claims

### Reports & PDF

- [ ] Reports list loads
- [ ] Can create report
- [ ] PDF exports
- [ ] PDF formatting correct
- [ ] Email delivery works

---

## 📊 TEST RESULTS TEMPLATE

```markdown
## Test Session: [Date]

**Tester:** [Name]
**Environment:** Local Development
**Duration:** [X hours]

### Results Summary

- ✅ Passed: X/10 tests
- ⚠️ Warnings: X issues
- ❌ Failed: X tests

### Issues Found

1. [Issue description]
   - Severity: High/Medium/Low
   - Steps to reproduce: ...
   - Expected: ...
   - Actual: ...

### Notes

- [Any additional observations]
```

---

**Generated:** November 17, 2025  
**Last Updated:** November 17, 2025  
**Next Review:** After critical fixes applied
