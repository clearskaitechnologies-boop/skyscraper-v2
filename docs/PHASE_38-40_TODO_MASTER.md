# 🔥 PHASE 38-40 TODO MASTER LIST

**Created**: November 17, 2025  
**Status**: READY TO BUILD  
**Parallel Work**: Phase 34-37 finishing by other AI

---

## 🎯 QUICK REFERENCE

**Total Tasks**: 30  
**Estimated Time**: 10 days  
**Token Impact**: 40 tokens per complete claim flow  
**Dependencies**: Phase 34 cache system, Clerk auth, Token system, Supabase Storage

---

## 📊 PROGRESS TRACKER

- **Phase 38 (Claim Writer)**: 0/8 tasks complete
- **Phase 39 (Estimator Engine)**: 0/8 tasks complete
- **Phase 40 (Pricing Engine)**: 0/8 tasks complete
- **Integration & QA**: 0/6 tasks complete

---

## ✅ PHASE 38: CLAIM WRITER ENGINE (8 TASKS)

### Task 1: Database Schema - ClaimWriter Model

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: None

**Actions**:

1. Open `prisma/schema.prisma`
2. Add ClaimWriter model (see spec below)
3. Run `npx prisma db push`
4. Verify in database

**Schema**:

```prisma
model ClaimWriter {
  id            String   @id @default(cuid())
  orgId         String
  leadId        String
  claimId       String?
  scopeJson     Json?
  narrative     String?
  estimateJson  Json?
  carrierNotes  String?
  summary       String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

---

### Task 2: Core Engine - claimWriter.ts

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 1 (schema)

**Actions**:

1. Create `lib/ai/claimWriter.ts`
2. Implement 5 functions (see spec)
3. Add OpenAI integration
4. Add error handling
5. Export all functions

**Functions to Implement**:

- `generateScope(lead, slopes, detections)` - Xactimate structure
- `generateNarrative(lead, aiSummary, slopeScores)` - 4 paragraphs
- `generateEstimateJson(scope)` - Estimator format
- `generateCarrierRebuttals(lead, slopes, detections, flags)` - Denial rebuttals
- `generateFinalSummary(scope, narrative, rebuttals)` - Packet overview

**Testing**:

- Unit test each function
- Mock lead data
- Verify JSON structure

---

### Task 3: API Route - /api/ai/claim-writer

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 2 (claimWriter.ts)

**Actions**:

1. Create `src/app/api/ai/claim-writer/route.ts`
2. Add Clerk auth
3. Implement `consumeTokens(15)`
4. Load lead, slopes, detections, videos
5. Call claimWriter functions
6. Save ClaimWriter record
7. Return JSON response
8. Add error handling

**Endpoint Spec**:

- Method: `POST`
- Auth: Clerk required
- Body: `{ leadId: string }`
- Token Cost: 15
- Response: `{ success, claimId, scopeJson, narrative, rebuttals, summary }`

---

### Task 4: Frontend - ClaimWriterPanel Component

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 3 (API route)

**Actions**:

1. Create `src/components/ClaimWriterPanel.tsx`
2. Add "Generate Claim Draft" button
3. Implement 3-stage progress UI
4. Display results (Scope Table, Narratives, Rebuttals)
5. Add export buttons (Markdown, PDF)
6. Add "Send to Adjuster" button
7. Style with existing design system

**UI Requirements**:

- Loading states for each stage
- Error handling display
- Clean table layout for scope
- Collapsible sections
- Copy-to-clipboard functionality

---

### Task 5: Integration - Add Claim Writer Tab

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 4 (ClaimWriterPanel)

**Actions**:

1. Find DominusPanel component (or equivalent)
2. Add "Claim Writer" tab
3. Import ClaimWriterPanel
4. Add tab navigation logic
5. Test tab switching

**Files to Modify**:

- `DominusPanel.tsx` or similar
- `DominusTabs.tsx` or similar

---

### Task 6: Packet Page - Claim Draft Section

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 3 (API route)

**Actions**:

1. Open `pages/packet/[publicId]/page.tsx`
2. Add "Claim Draft Summary" section
3. Fetch ClaimWriter data
4. Display narrative, scope summary, rebuttal summary
5. Style consistently with packet design
6. Add print-friendly CSS

**Display Requirements**:

- Professional formatting
- Clear section headers
- Proper spacing
- Mobile responsive

---

### Task 7: Export System - Add Claim Files to ZIP

**Status**: Not Started  
**Priority**: LOW  
**Depends On**: Task 3 (API route)

**Actions**:

1. Find existing ZIP export utility
2. Add claim files:
   - `claim_scope.json`
   - `claim_narrative.md`
   - `claim_rebuttals.md`
   - `claim_summary.txt`
3. Test ZIP generation
4. Verify file structure

---

### Task 8: Testing - Claim Writer Validation

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: All Phase 38 tasks

**Test Cases**:

1. **Hail-only lead** - Verify impact detection logic
2. **Wind-only lead** - Verify uplift/shingle loss logic
3. **Leak/moisture lead** - Verify interior damage narrative
4. **Wear-and-tear flagged** - Verify rebuttal arguments
5. **Complex multi-slope roof** - Verify scope grouping

**Validation Checklist**:

- [ ] Narrative reads professionally
- [ ] Scope quantities match slopes
- [ ] Rebuttals address common carrier positions
- [ ] Packet page renders cleanly
- [ ] Export ZIP contains all claim files
- [ ] Token consumption accurate (15 tokens)

---

## ✅ PHASE 39: ESTIMATOR ENGINE (8 TASKS)

### Task 9: Database Schema - EstimateExport Model

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: None (can parallelize with Phase 38)

**Actions**:

1. Open `prisma/schema.prisma`
2. Add EstimateExport model
3. Run `npx prisma db push`
4. Verify in database

**Schema**:

```prisma
model EstimateExport {
  id          String   @id @default(cuid())
  orgId       String
  leadId      String
  claimId     String?
  xml         String?     // Xactimate export
  symbility   Json?       // Symbility export
  summary     String?
  createdAt   DateTime @default(now())
}
```

---

### Task 10: Core Engine - estimatorEngine.ts

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 9 (schema)

**Actions**:

1. Create `lib/ai/estimatorEngine.ts`
2. Implement 4 functions
3. Study Xactimate XML structure
4. Study Symbility JSON structure
5. Add validation logic
6. Export all functions

**Functions to Implement**:

- `parseScope(scopeJson)` - Normalize line items
- `buildXactimateXml(scope, lead)` - ESX-compatible XML
- `buildSymbilityJson(scope, lead)` - D22-style JSON
- `buildEstimateSummary(scope)` - Human-readable paragraph

**Critical Requirements**:

- XML MUST be valid Xactimate ESX format
- JSON MUST follow Symbility D22 structure
- All line items need codes, descriptions, quantities, units

---

### Task 11: API Route - /api/estimate/export

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 10 (estimatorEngine.ts)

**Actions**:

1. Create `src/app/api/estimate/export/route.ts`
2. Add Clerk auth
3. Implement `consumeTokens(10)`
4. Load lead + ClaimWriter + scopeJson
5. Call estimatorEngine functions
6. Save EstimateExport record
7. Return download URLs
8. Add error handling

**Endpoint Spec**:

- Method: `POST`
- Auth: Clerk required
- Body: `{ leadId: string }`
- Token Cost: 10
- Response: `{ success, xml, symbility, summary, downloadZipUrl }`

---

### Task 12: ZIP Builder - zipBuilder.ts

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 11 (API route)

**Actions**:

1. Create `lib/export/zipBuilder.ts`
2. Implement `buildEstimateZip(xml, symbilityJson, summary)`
3. Generate ZIP with:
   - `estimate.xml`
   - `symbility.json`
   - `summary.txt`
4. Upload to Supabase Storage
5. Return signed URL
6. Add cleanup logic (delete after 7 days)

**Requirements**:

- Proper ZIP compression
- Correct file naming
- Secure signed URLs
- Error handling

---

### Task 13: Frontend - EstimateExportPanel Component

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 11 (API route)

**Actions**:

1. Create `src/components/EstimateExportPanel.tsx`
2. Add "Generate Estimate Export" button
3. Display Xactimate XML download
4. Display Symbility JSON download
5. Show summary preview
6. Add "Download Estimate ZIP" button
7. Style with icons for Xactimate & Symbility

**UI Requirements**:

- Loading states
- Error handling
- File size display
- Download progress indicator
- Format badges (XML, JSON)

---

### Task 14: Integration - Add Estimate Export Tab

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 13 (EstimateExportPanel)

**Actions**:

1. Modify `DominusTabs.tsx`
2. Modify `DominusPanel.tsx`
3. Add "Estimate Export" tab
4. Import EstimateExportPanel
5. Test tab navigation

---

### Task 15: Packet Page - Estimate Export Section

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 11 (API route)

**Actions**:

1. Open `pages/packet/[publicId]/page.tsx`
2. Add "Estimate Export" section
3. Display download ZIP button
4. Show estimate summary snippet
5. Add Xactimate & Symbility icons
6. Style consistently

---

### Task 16: Testing - Estimator Export Validation

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: All Phase 39 tasks

**Test Cases**:

1. **Basic 25 SQ roof** - Verify XML imports into Xactimate X1
2. **Multi-slope roof** - Verify item grouping by slope
3. **Missing scope** - Verify error handling (400 response)
4. **Complex claim** - Verify auto-justification notes

**Validation Checklist**:

- [ ] Xactimate XML is valid and importable
- [ ] Symbility JSON follows D22 structure
- [ ] Multi-slope roofs group correctly
- [ ] All line items have codes + justifications
- [ ] ZIP bundle downloads properly
- [ ] Token consumption accurate (10 tokens)

---

## ✅ PHASE 40: PRICING ENGINE (8 TASKS)

### Task 17: Database Schema - PricingProfile Model

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: None (can parallelize)

**Actions**:

1. Open `prisma/schema.prisma`
2. Add PricingProfile model
3. Run `npx prisma db push`
4. Verify in database

**Schema**:

```prisma
model PricingProfile {
  id          String   @id @default(cuid())
  orgId       String   @unique
  taxRate     Float    @default(0.089)  // 8.9% AZ default
  opPercent   Float    @default(0.20)   // 20% O&P
  wasteFactor Float    @default(0.15)   // 15% waste
  laborFactor Float    @default(1.00)   // labor multiplier
  regionFactor Float   @default(1.00)   // region multiplier
  createdAt   DateTime @default(now())
}
```

---

### Task 18: Pricing Table - pricingTable.ts

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: None

**Actions**:

1. Create `lib/ai/pricingTable.ts`
2. Build BASE_PRICING object
3. Add roofing codes (RFG, DRP, PJK, VNT, etc.)
4. Structure: `{ code: { unitPrice, unit } }`
5. Export constant

**Initial Pricing Table**:

```typescript
export const BASE_PRICING = {
  RFG220: { unitPrice: 325.0, unit: "SQ" }, // Remove & Replace Shingles
  RFG300: { unitPrice: 4.5, unit: "LF" }, // Ridge Cap
  DRP100: { unitPrice: 4.0, unit: "LF" }, // Drip Edge
  PJK100: { unitPrice: 65.0, unit: "EA" }, // Pipe Jack
  VNT200: { unitPrice: 95.0, unit: "EA" }, // Vent
  // Add more codes as needed
};
```

---

### Task 19: Core Engine - pricingEngine.ts

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 18 (pricingTable.ts)

**Actions**:

1. Create `lib/ai/pricingEngine.ts`
2. Implement 7 functions
3. Add calculation logic
4. Import BASE_PRICING
5. Add validation
6. Export all functions

**Functions to Implement**:

- `applyWaste(quantity, wasteFactor)` - Material waste calculation
- `applyRegion(price, regionFactor)` - Region cost adjustment
- `applyLabor(price, laborFactor)` - Labor burden
- `applyTax(price, taxRate)` - Sales tax
- `applyOP(price, opPercent)` - Overhead & Profit
- `calculateLineItemTotal(item, profile)` - Full pricing for one item
- `calculateEstimateTotals(pricedItems)` - Sum all items

**Calculation Order**:

1. Base price × quantity (with waste)
2. Apply region multiplier
3. Apply labor factor
4. Calculate subtotal
5. Add tax
6. Add O&P
7. Return total

---

### Task 20: Modify estimatorEngine.ts - Add Pricing

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 19 (pricingEngine.ts)

**Actions**:

1. Open `lib/ai/estimatorEngine.ts`
2. Modify `buildXactimateXml()`:
   - Add `<unitPrice>` tag
   - Add `<tax>` tag
   - Add `<oandp>` tag
   - Add `<total>` tag
3. Modify `buildSymbilityJson()`:
   - Add `Pricing` object
   - Include `UnitPrice`, `Tax`, `OandP`, `Total` fields
4. Update type definitions

**Example XML Addition**:

```xml
<item>
  <code>RFG220</code>
  <description>Remove & Replace Shingles</description>
  <quantity>25.00</quantity>
  <unit>SQ</unit>
  <unitPrice>325.00</unitPrice>
  <tax>724.75</tax>
  <oandp>1625.00</oandp>
  <total>10474.75</total>
</item>
```

---

### Task 21: API Route - /api/estimate/priced

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: Task 20 (modified estimatorEngine)

**Actions**:

1. Create `src/app/api/estimate/priced/route.ts`
2. Add Clerk auth
3. Implement `consumeTokens(15)`
4. Load or create PricingProfile for org
5. Load lead + scopeJson
6. Run pricing engine
7. Build priced XML + JSON
8. Update EstimateExport record
9. Return totals object

**Endpoint Spec**:

- Method: `POST`
- Auth: Clerk required
- Body: `{ leadId: string }`
- Token Cost: 15
- Response: `{ success, xml, symbility, totals: { subtotal, tax, op, total } }`

---

### Task 22: UI Update - Add Pricing to EstimateExportPanel

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 21 (API route)

**Actions**:

1. Open `src/components/EstimateExportPanel.tsx`
2. Add "Generate Priced Estimate" button
3. Display pricing breakdown:
   - Total RCV
   - Total ACV (placeholder for future)
   - Taxes
   - O&P
4. Add download priced XML button
5. Add download priced JSON button
6. Style pricing summary

**UI Requirements**:

- Financial formatting ($X,XXX.XX)
- Clear labels
- Breakdown table
- Total highlighted

---

### Task 23: Packet Page - Pricing Breakdown Section

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Task 21 (API route)

**Actions**:

1. Open `pages/packet/[publicId]/page.tsx`
2. Add "Estimated Cost Breakdown (AI-Priced)" card
3. Display line items:
   - Roof Replacement: $X,XXX
   - Drip Edge: $XXX
   - Vents: $XXX
   - Taxes: $XXX
   - Overhead & Profit: $XXX
   - **Total: $XX,XXX**
4. Style as professional estimate
5. Add print-friendly CSS

---

### Task 24: Testing - Pricing Engine Validation

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: All Phase 40 tasks

**Test Cases**:

1. **Standard roof replacement** - Verify all calculations
2. **High tax region (Prescott Valley 9.18%)** - Verify tax accuracy
3. **Low tax region (Chino Valley 8.35%)** - Verify tax accuracy
4. **Waste factor variations** - Verify material calculations
5. **O&P toggle ON/OFF** - Verify pricing with/without O&P

**Validation Checklist**:

- [ ] All calculations mathematically accurate
- [ ] City-level tax rates correct
- [ ] Priced XML maintains structure
- [ ] Priced JSON maintains structure
- [ ] Packet displays pricing breakdown
- [ ] O&P toggle works correctly
- [ ] Token consumption accurate (15 tokens)

---

## ✅ INTEGRATION & QA (6 TASKS)

### Task 25: Documentation - Create Master Status Doc

**Status**: ✅ COMPLETE  
**Priority**: MEDIUM

**Completed**:

- [x] Created `docs/PHASE_38-40_CLAIM_ESTIMATOR_ENGINE.md`
- [x] Documented implementation approach
- [x] Listed API endpoints
- [x] Defined database models
- [x] Outlined component structure

---

### Task 26: Security Review - Token Cost Validation

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: All API routes complete

**Actions**:

1. Review `/api/ai/claim-writer` - 15 tokens
2. Review `/api/estimate/export` - 10 tokens
3. Review `/api/estimate/priced` - 15 tokens
4. Verify Clerk authentication on all routes
5. Verify orgId validation
6. Consider rate limiting for high-volume orgs
7. Test token deduction accuracy

**Security Checklist**:

- [ ] All endpoints require Clerk auth
- [ ] All operations validate orgId ownership
- [ ] Token consumption logged properly
- [ ] Error messages don't leak sensitive data
- [ ] File uploads sanitized
- [ ] No SQL injection vulnerabilities

---

### Task 27: Integration Testing - End-to-End Flow

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: All previous tasks

**Test Flow**:

1. Create new lead with property data
2. Run Dominus AI analysis
3. Generate claim draft (Phase 38)
4. Export estimate XML/JSON (Phase 39)
5. Apply pricing (Phase 40)
6. Download complete packet ZIP
7. Verify all data flows correctly

**Validation Points**:

- Lead data → Claim narrative
- Slopes → Scope quantities
- Detections → Rebuttal arguments
- Scope → XML structure
- Scope → JSON structure
- Pricing → Financial calculations
- All files in ZIP bundle

---

### Task 28: Performance Optimization - Caching Strategy

**Status**: Not Started  
**Priority**: MEDIUM  
**Depends On**: Phase 34 cache system complete

**Actions**:

1. Integrate Phase 34 cache (`lib/ai/cache.ts`)
2. Cache generated scopes (hash by lead data)
3. Cache narratives (hash by damage pattern)
4. Cache pricing calculations (hash by scope)
5. Cache XML exports (hash by scope)
6. Cache JSON exports (hash by scope)
7. Set TTL = 7 days for all
8. Test cache hit/miss rates

**Expected Performance Gains**:

- 80% faster for repeat lead analysis
- 95% cost reduction for cached results
- Near-instant regeneration for packet updates

---

### Task 29: Analytics - Track Feature Usage

**Status**: Not Started  
**Priority**: LOW  
**Depends On**: All features complete

**Actions**:

1. Add analytics events:
   - `claim_writer_generated`
   - `estimate_exported` (format: XML/JSON)
   - `pricing_applied`
   - `packet_downloaded`
2. Track metrics:
   - Success rates
   - Generation times
   - Token consumption patterns
   - Average RCV values
   - Most common claim types
3. Create dashboard views

---

### Task 30: Final Validation & Deploy

**Status**: Not Started  
**Priority**: HIGH  
**Depends On**: All previous tasks

**Pre-Deploy Checklist**:

- [ ] All tests passing
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Documentation complete
- [ ] Git committed with proper messages
- [ ] Vercel deployment successful
- [ ] Production smoke test completed

**Smoke Test Steps**:

1. Generate claim for test lead
2. Export estimate (XML + JSON)
3. Apply pricing
4. Download complete ZIP
5. Verify all files present and correct
6. Check token consumption
7. Test packet page rendering
8. Verify public link works

**Deployment**:

```bash
# Commit all changes
git add .
git commit -m "PHASE 38-40 COMPLETE: Claim Writer + Estimator + Pricing Engine"
git push origin main

# Verify Vercel deployment
# Run production smoke test
# Monitor for errors
```

---

## 🚦 IMPLEMENTATION STRATEGY

### Week 1 (Days 1-5): Core Engines

**Focus**: Build all backend logic first

**Day 1-2**: Phase 38 Database & Core Engine

- Tasks 1-2: Schema + claimWriter.ts

**Day 3**: Phase 38 API & Testing

- Tasks 3, 8: API route + basic validation

**Day 4-5**: Phase 39 Database & Core Engine

- Tasks 9-10: Schema + estimatorEngine.ts

---

### Week 2 (Days 6-10): APIs, Frontend & Integration

**Focus**: Connect everything and polish

**Day 6**: Phase 39 API & ZIP Builder

- Tasks 11-12: Export API + zipBuilder.ts

**Day 7**: Phase 40 Database & Pricing Logic

- Tasks 17-19: Schema + pricingTable + pricingEngine

**Day 8**: Phase 40 Integration & API

- Tasks 20-21: Modify estimatorEngine + priced API

**Day 9**: Frontend Components & Packet Updates

- Tasks 4-7, 13-16, 22-23: All UI work

**Day 10**: Final Testing & Deploy

- Tasks 26-30: Security, integration, analytics, deploy

---

## 📞 COORDINATION WITH OTHER AI

**Current State**: Another AI is finishing Phases 34-37

**No Conflicts**: These phases are completely independent:

- Phase 34: Performance caching (we can integrate later)
- Phase 35: Monitoring
- Phase 36-37: Unknown scope

**Safe to Start**: Can begin Phase 38 immediately after database setup

**Integration Point**: Task 28 (caching) waits for Phase 34 completion

---

## 🎯 SUCCESS METRICS

**Phase 38 Success**:

- Professional claim narratives generated
- Scope quantities accurate
- Rebuttals address carrier objections
- 100% token tracking accuracy

**Phase 39 Success**:

- Xactimate XML imports successfully
- Symbility JSON validates
- ZIP exports work reliably

**Phase 40 Success**:

- Pricing calculations accurate
- Tax rates correct by city
- O&P logic works
- Financial summaries clear

**Overall Success**:

- Complete claim flow in < 60 seconds
- Token consumption predictable
- User feedback positive
- Zero production errors

---

## 📝 NOTES

**Development Environment**:

- Use `pnpm dev` for local testing
- Database: PostgreSQL via Railway/Supabase
- Storage: Supabase for ZIP files
- Auth: Clerk

**Code Standards**:

- TypeScript strict mode
- Proper error handling
- Input validation
- JSDoc comments
- Unit tests for core logic

**Git Workflow**:

- Feature branches for each phase
- Descriptive commit messages
- Squash merge to main
- Tag releases (v38.0.0, v39.0.0, v40.0.0)

---

**Last Updated**: November 17, 2025  
**Next Review**: After Phase 38 completion  
**Questions**: Reach out to Damien

---

🔥 **LET'S BUILD THE FUTURE OF INSURANCE CLAIMS** 🔥
