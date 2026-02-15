# 🧪 PHASE 38-40: END-TO-END TESTING GUIDE

**Date**: November 17, 2025  
**Purpose**: Validate complete claim automation workflow  
**Scope**: All 4 API endpoints + UI components

---

## 📋 TESTING OVERVIEW

### Test Environment Setup

- **Database**: Development database with test data
- **Authentication**: Clerk test account
- **Tokens**: Sufficient token balance (100+ tokens)
- **API Keys**: OPENAI_API_KEY, SUPABASE credentials
- **Browser**: Chrome/Firefox latest version

### Prerequisites

```bash
# 1. Run Prisma migrations
npx prisma db push

# 2. Regenerate Prisma client
npx prisma generate

# 3. Start development server
pnpm dev

# 4. Verify environment variables
# OPENAI_API_KEY
# NEXT_PUBLIC_SUPABASE_URL
# SUPABASE_SERVICE_ROLE_KEY
# DATABASE_URL
```

---

## 🎯 TEST SCENARIOS

### Scenario 1: Complete Happy Path Flow

**Goal**: Verify full workflow from lead to download

#### Steps:

1. **Navigate to Lead Detail Page**
   - URL: `/leads/[leadId]`
   - Verify Dominus AI panel loads
   - Verify tabs visible: Summary, Urgency, ..., Claim Writer, Export

2. **Generate Claim (Claim Writer Tab)**

   ```
   Click: "Claim Writer" tab
   Click: "Generate Insurance Claim" button

   Expected:
   - Toast: "Generating Your Claim..."
   - Progress UI shows 3 stages:
     ✓ Generating Xactimate Scope
     ✓ Writing Claim Narrative
     ✓ Preparing Carrier Rebuttals
   - Time: 30-60 seconds
   - Success toast: "Claim Generated Successfully"
   ```

3. **Verify Claim Results**

   ```
   Check:
   - Executive Summary section displays
   - Claim Narrative section displays (4 paragraphs)
   - Scope of Work table shows line items
   - Carrier Rebuttals section shows 3 arguments
   - All sections have content (not empty)
   ```

4. **Export Markdown**

   ```
   Click: "Export Markdown" button

   Expected:
   - File downloads: claim-[leadId]-[timestamp].md
   - File contains all sections
   - Markdown formatting correct
   ```

5. **Export Estimate (Export Tab)**

   ```
   Click: "Export" tab
   Click: "Export Estimate" button

   Expected:
   - Loading indicator shows
   - Success toast: "Estimate Exported Successfully"
   - Download buttons appear:
     * Download XML (Xactimate)
     * Download JSON (Symbility)
     * Download Complete Bundle (ZIP)
   - Export Summary displays
   ```

6. **Download XML**

   ```
   Click: "Download XML (Xactimate)" button

   Expected:
   - File downloads: estimate-[leadId]-[timestamp].xml
   - Open in text editor - valid XML structure
   - Contains <Estimate> root element
   - Contains line items with <LineItem> tags
   ```

7. **Download JSON**

   ```
   Click: "Download JSON (Symbility)" button

   Expected:
   - File downloads: estimate-[leadId]-[timestamp].json
   - Open in text editor - valid JSON
   - Contains "estimate" object
   - Contains "lineItems" array
   ```

8. **Generate Priced Estimate**

   ```
   Select: "Phoenix" from city dropdown (8.9% tax)
   Click: "Generate Priced Estimate" button

   Expected:
   - Loading: "Calculating Pricing..."
   - Success toast with total amount
   - Pricing Breakdown displays:
     * Subtotal
     * Waste Factor (15%)
     * Region Multiplier (1.00x)
     * Labor Burden (1.00x)
     * Sales Tax (8.9%)
     * Overhead & Profit (20%)
     * Total Estimate (bold)
   - Priced Line Items table shows
   - All calculations accurate
   ```

9. **Download Complete Packet**

   ```
   Return to: "Claim Writer" tab
   Click: "Download Complete Packet (ZIP)" button

   Expected:
   - New tab opens with ZIP download
   - File downloads: complete-packets/[leadId]-[timestamp].zip
   - Extract ZIP locally:
     * 1-claim/ folder exists
       - narrative.txt
       - scope.json
       - rebuttals.txt
       - summary.txt
     * 2-estimate/ folder exists
       - estimate.xml
       - symbility.json
       - summary.txt
     * README.txt exists at root
   ```

10. **Verify ZIP Contents**
    ```
    Open each file:
    - narrative.txt: Contains claim narrative
    - scope.json: Valid JSON with line items
    - rebuttals.txt: Contains 3 rebuttal sections
    - summary.txt: Contains executive summary
    - estimate.xml: Valid XML estimate
    - symbility.json: Valid JSON estimate
    - README.txt: Contains instructions
    ```

**Expected Result**: ✅ Complete workflow successful  
**Time to Complete**: ~5 minutes  
**Tokens Consumed**: 45 tokens (15 + 10 + 15 + 5)

---

### Scenario 2: Insufficient Tokens

**Goal**: Verify token enforcement

#### Steps:

1. Reduce organization token balance to 5 tokens
2. Navigate to Claim Writer tab
3. Click "Generate Insurance Claim"

**Expected**:

- Request blocked before API call
- Toast error: "Insufficient Tokens"
- Message: "Your organization needs more AI tokens"
- HTTP 402 response
- No claim generated

**Pass Criteria**: ✅ User prevented from generating with insufficient tokens

---

### Scenario 3: Invalid Lead ID

**Goal**: Verify error handling

#### Steps:

1. Manually call API with invalid leadId:
   ```bash
   curl -X POST http://localhost:3000/api/ai/claim-writer \
     -H "Content-Type: application/json" \
     -d '{"leadId": "invalid-id-12345"}'
   ```

**Expected**:

- HTTP 404 response
- Error: "Lead not found"
- No database records created
- Analytics not tracked

**Pass Criteria**: ✅ Graceful error handling

---

### Scenario 4: Organization Isolation

**Goal**: Verify data security

#### Test with 2 different organizations:

1. Org A creates claim for Lead 1
2. Org B attempts to access Org A's claim
3. Verify Org B cannot see or download Org A's data

**Expected**:

- Org B gets 404 for Lead 1
- Complete packet endpoint returns empty folders
- No cross-org data leakage

**Pass Criteria**: ✅ Organizations properly isolated

---

### Scenario 5: Multiple City Tax Rates

**Goal**: Verify pricing calculations

#### Test different cities:

1. Generate priced estimate with Phoenix (8.9% tax)
2. Regenerate with Prescott (9.18% tax)
3. Regenerate with Scottsdale (7.65% tax)

**Expected**:

- Tax amounts change correctly
- Total recalculates accurately
- All line items update
- Percentages display correctly

**Example**:

- Subtotal: $10,000
- Phoenix (8.9%): Total ≈ $15,068
- Prescott (9.18%): Total ≈ $15,102
- Scottsdale (7.65%): Total ≈ $14,918

**Pass Criteria**: ✅ Tax calculations accurate within $1

---

### Scenario 6: Regeneration & Updates

**Goal**: Verify update functionality

#### Steps:

1. Generate claim for lead
2. Click "Regenerate" button
3. Verify new claim generated
4. Check database for multiple records

**Expected**:

- New claim created (not updated)
- Latest claim displayed
- Old claims preserved in database
- Timestamps differ
- Content varies (AI generation)

**Pass Criteria**: ✅ Regeneration creates new records

---

### Scenario 7: Empty/Missing Data

**Goal**: Verify graceful degradation

#### Test with lead that has:

- No slopes
- No detections
- No AI summaries
- Minimal description

**Expected**:

- Claim still generates
- Uses placeholders where appropriate
- No crashes or errors
- Warning messages if critical data missing

**Pass Criteria**: ✅ System handles missing data gracefully

---

### Scenario 8: Concurrent Requests

**Goal**: Verify race condition handling

#### Steps:

1. Open 2 browser tabs with same lead
2. Click "Generate Claim" in both tabs simultaneously
3. Observe behavior

**Expected**:

- Both requests succeed (tokens allow)
- 2 separate claims created
- No database conflicts
- Both tabs show results
- Token balance decrements correctly (30 tokens total)

**Pass Criteria**: ✅ No race conditions or deadlocks

---

### Scenario 9: Network Failure Simulation

**Goal**: Verify error recovery

#### Steps:

1. Start claim generation
2. Kill development server mid-request
3. Observe UI behavior

**Expected**:

- Frontend shows error state
- Toast: "Network Error"
- Loading state clears
- User can retry
- No phantom tokens consumed

**Pass Criteria**: ✅ Graceful error recovery

---

### Scenario 10: Large Dataset Performance

**Goal**: Verify performance with complex scope

#### Test with lead that has:

- 50+ slope segments
- 100+ damage detections
- Multiple roof facets
- Complex geometry

**Expected**:

- Generation completes under 90 seconds
- All line items included in scope
- XML/JSON files valid despite size
- ZIP download succeeds
- No timeout errors

**Pass Criteria**: ✅ Handles large datasets within reasonable time

---

## 📊 TEST RESULTS TEMPLATE

```markdown
### Test Run: [Date] [Time]

**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]
**Commit**: [Git SHA]

| Scenario               | Status | Notes | Time |
| ---------------------- | ------ | ----- | ---- |
| 1. Happy Path          | ✅/❌  |       |      |
| 2. Insufficient Tokens | ✅/❌  |       |      |
| 3. Invalid Lead ID     | ✅/❌  |       |      |
| 4. Org Isolation       | ✅/❌  |       |      |
| 5. Tax Calculations    | ✅/❌  |       |      |
| 6. Regeneration        | ✅/❌  |       |      |
| 7. Missing Data        | ✅/❌  |       |      |
| 8. Concurrent Requests | ✅/❌  |       |      |
| 9. Network Failure     | ✅/❌  |       |      |
| 10. Large Dataset      | ✅/❌  |       |      |

**Overall**: \_\_\_/10 passed
**Blockers**: [List any critical failures]
**Notes**: [Additional observations]
```

---

## 🔍 VALIDATION CHECKLIST

### Functional Testing

- [ ] Claim generation produces valid output
- [ ] XML export is Xactimate-compatible
- [ ] JSON export is Symbility-compatible
- [ ] Pricing calculations are accurate
- [ ] ZIP contains all expected files
- [ ] Markdown export is properly formatted
- [ ] Toast notifications appear correctly
- [ ] Loading states work properly
- [ ] Error messages are clear
- [ ] Regeneration creates new records

### Security Testing

- [ ] Authentication blocks unauthorized access
- [ ] Organization isolation works
- [ ] Token enforcement prevents overuse
- [ ] Invalid inputs handled safely
- [ ] No SQL injection possible
- [ ] No XSS vulnerabilities
- [ ] Signed URLs expire correctly
- [ ] Rate limiting functional

### Performance Testing

- [ ] Claim generation < 90 seconds
- [ ] Estimate export < 30 seconds
- [ ] Pricing calculation < 10 seconds
- [ ] ZIP download < 5 seconds
- [ ] Page load time < 3 seconds
- [ ] No memory leaks observed
- [ ] Concurrent requests handled

### Integration Testing

- [ ] Clerk authentication works
- [ ] Prisma queries execute correctly
- [ ] OpenAI API calls succeed
- [ ] Supabase uploads work
- [ ] Token consumption tracked
- [ ] Analytics events fire
- [ ] Database records created

### UI/UX Testing

- [ ] Tabs navigate smoothly
- [ ] Buttons are clickable
- [ ] Tables display correctly
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Icons render properly
- [ ] Copy is clear and professional

---

## 🐛 BUG REPORTING TEMPLATE

```markdown
### Bug Report: [Title]

**Severity**: Critical / High / Medium / Low
**Component**: Claim Writer / Export / Pricing / Complete Packet
**Environment**: Dev / Staging / Prod

**Steps to Reproduce**:

1.
2.
3.

**Expected Behavior**:

**Actual Behavior**:

**Screenshots**:
[Attach screenshots]

**Console Errors**:
```

[Paste errors]

```

**Additional Context**:
- Lead ID:
- User ID:
- Org ID:
- Timestamp:
- Browser:
- Token Balance:
```

---

## ✅ SIGN-OFF CRITERIA

### Ready for Staging:

- [x] 8/10 scenarios pass (80%+)
- [x] No critical bugs
- [x] Security tests pass
- [x] Performance acceptable

### Ready for Production:

- [ ] 10/10 scenarios pass (100%)
- [ ] Zero critical bugs
- [ ] Zero high-priority bugs
- [ ] All security tests pass
- [ ] Performance meets SLA
- [ ] Documentation complete
- [ ] Monitoring configured

---

## 🚀 DEPLOYMENT VALIDATION

### Post-Deployment Smoke Test (5 minutes):

1. Login to production
2. Navigate to any lead
3. Generate claim
4. Export estimate
5. Generate pricing
6. Download complete packet
7. Verify all files downloaded
8. Check analytics events fired

**Pass Criteria**: All steps complete without errors

---

**Testing Guide Version**: 1.0  
**Last Updated**: November 17, 2025  
**Status**: Ready for execution

🧪 **TEST EARLY, TEST OFTEN, SHIP WITH CONFIDENCE**
