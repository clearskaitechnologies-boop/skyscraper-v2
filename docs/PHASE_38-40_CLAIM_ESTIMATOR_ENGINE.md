# 🔥 PHASE 38-40: THE CLAIM WRITER & ESTIMATOR ENGINE SUITE

**Date Started**: November 17, 2025  
**Status**: PLANNED - READY TO BUILD  
**Scope**: Full AI-powered insurance claim drafting, Xactimate/Symbility export, and pricing engine

---

## 🎯 MISSION

Transform Dominus from an AI analysis tool into a **complete end-to-end insurance claim automation system** that:

1. **Writes full insurance claims** (narrative, scope, rebuttals)
2. **Exports carrier-ready estimates** (Xactimate XML, Symbility JSON)
3. **Applies real pricing** (line-item, tax, O&P, waste, labor burden)

This is the first system in the world to offer:

> **AI → Scope → Pricing → Video → Packet → Share Link**  
> All in one unified workflow.

---

## 📋 PHASE BREAKDOWN

### **PHASE 38: CLAIM WRITER ENGINE (CWE v1.0)**

**Purpose**: AI generates complete insurance claim documents

#### Deliverables:

- ✅ Full claim narrative (4 paragraphs)
- ✅ Detailed scope of loss
- ✅ Line-item justification with quantities
- ✅ IRC & manufacturer code references
- ✅ Carrier rebuttal arguments (wear-and-tear, prior damage, etc.)
- ✅ Photo callouts and slope summaries
- ✅ Packet-ready export formats

#### Token Cost: **15 tokens per claim generation**

---

### **PHASE 39: ESTIMATOR ENGINE (XACTIMATE + SYMBILITY EXPORT)**

**Purpose**: Convert AI scope into carrier-importable estimate formats

#### Deliverables:

- ✅ Xactimate ESX-compatible XML
- ✅ Symbility D22-style JSON
- ✅ Line-item quantification with codes
- ✅ Pricing logic stubs (Phase 40 adds actual pricing)
- ✅ Import-ready files for adjusters
- ✅ ZIP bundle with all estimate files

#### Token Cost: **10 tokens per export**

---

### **PHASE 40: PRICING ENGINE v1.0**

**Purpose**: Apply real-world pricing to estimates

#### Deliverables:

- ✅ Base pricing table (internal)
- ✅ Region-based multipliers
- ✅ Arizona city-level sales tax (Chino, Prescott, Phoenix, etc.)
- ✅ Overhead & Profit (O&P) - org configurable
- ✅ Waste factor calculation
- ✅ Labor burden multiplier
- ✅ Priced Xactimate XML
- ✅ Priced Symbility JSON
- ✅ Pricing summary for packets

#### Token Cost: **15 tokens per priced estimate**

---

## 🗂️ DATABASE SCHEMA CHANGES

### Phase 38: ClaimWriter Model

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

### Phase 39: EstimateExport Model

```prisma
model EstimateExport {
  id          String   @id @default(cuid())
  orgId       String
  leadId      String
  claimId     String?
  xml         String?     // Xactimate export
  symbility   Json?       // Symbility export
  summary     String?     // human-readable summary
  createdAt   DateTime @default(now())
}
```

### Phase 40: PricingProfile Model

```prisma
model PricingProfile {
  id          String   @id @default(cuid())
  orgId       String   @unique
  taxRate     Float    @default(0.089)  // default 8.9% AZ
  opPercent   Float    @default(0.20)   // 20% O&P
  wasteFactor Float    @default(0.15)   // 15% waste
  laborFactor Float    @default(1.00)   // labor multiplier
  regionFactor Float   @default(1.00)   // region multiplier
  createdAt   DateTime @default(now())
}
```

---

## 🧠 CORE ENGINES

### Phase 38: `lib/ai/claimWriter.ts`

**Functions**:

- `generateScope(lead, slopes, detections)` - Xactimate-structured scope with line items
- `generateNarrative(lead, aiSummary, slopeScores)` - 4-paragraph professional narrative
- `generateEstimateJson(scope)` - Convert scope to estimator format
- `generateCarrierRebuttals(lead, slopes, detections, flags)` - Address common denials
- `generateFinalSummary(scope, narrative, rebuttals)` - Packet-ready overview

### Phase 39: `lib/ai/estimatorEngine.ts`

**Functions**:

- `parseScope(scopeJson)` - Normalize line items (code, description, qty, units, slope)
- `buildXactimateXml(scope, lead)` - Generate ESX-compatible XML structure
- `buildSymbilityJson(scope, lead)` - Generate D22-style JSON structure
- `buildEstimateSummary(scope)` - Human-readable paragraph summary

### Phase 40: `lib/ai/pricingEngine.ts`

**Functions**:

- `applyWaste(quantity, wasteFactor)` - Calculate material waste
- `applyRegion(price, regionFactor)` - Region cost adjustment
- `applyLabor(price, laborFactor)` - Labor burden multiplier
- `applyTax(price, taxRate)` - Sales tax calculation
- `applyOP(price, opPercent)` - Overhead & Profit
- `calculateLineItemTotal(item, profile)` - Full pricing for one item
- `calculateEstimateTotals(pricedItems)` - Sum all line items

---

## 🔌 API ENDPOINTS

### Phase 38

- `POST /api/ai/claim-writer` - Generate full claim draft

### Phase 39

- `POST /api/estimate/export` - Export Xactimate XML + Symbility JSON

### Phase 40

- `POST /api/estimate/priced` - Generate priced estimate with all calculations

---

## 🎨 FRONTEND COMPONENTS

### Phase 38

- `src/components/ClaimWriterPanel.tsx`
  - Generate Claim Draft button
  - 3-stage progress indicator
  - Results display: Scope Table, Narratives, Rebuttals
  - Export: Markdown, PDF
  - Send to Adjuster button

### Phase 39

- `src/components/EstimateExportPanel.tsx`
  - Generate Estimate Export button
  - Download Xactimate XML
  - Download Symbility JSON
  - Summary preview
  - Download ZIP bundle

### Phase 40

- **Update** `EstimateExportPanel.tsx`
  - Add "Generate Priced Estimate" button
  - Display: Total RCV, Taxes, O&P breakdown
  - Download priced XML/JSON

---

## 📦 PACKET PAGE ENHANCEMENTS

### Phase 38: Add "Claim Draft Summary"

- Full narrative
- Scope summary
- Rebuttal summary

### Phase 39: Add "Estimate Export"

- Download ZIP button
- Estimate summary snippet
- Xactimate & Symbility icons

### Phase 40: Add "Estimated Cost Breakdown (AI-Priced)"

- Roof Replacement: $X,XXX
- Drip Edge: $XXX
- Vents: $XXX
- Taxes: $XXX
- O&P: $XXX
- **Total: $XX,XXX**

---

## 📤 EXPORT SYSTEM UPGRADES

### Phase 38: ZIP includes

- `claim_scope.json`
- `claim_narrative.md`
- `claim_rebuttals.md`
- `claim_summary.txt`

### Phase 39: ZIP includes

- `estimate.xml` (Xactimate)
- `symbility.json`
- `summary.txt`

### Phase 40: All exports include pricing

- XML with `<unitPrice>`, `<tax>`, `<oandp>`, `<total>`
- JSON with `Pricing: { UnitPrice, Tax, OandP, Total }`

---

## 🧪 TESTING STRATEGY

### Phase 38 Test Cases

1. **Hail-only lead** - Verify impact detection logic
2. **Wind-only lead** - Verify uplift/shingle loss logic
3. **Leak/moisture lead** - Verify interior damage narrative
4. **Wear-and-tear flagged** - Verify rebuttal arguments
5. **Complex multi-slope roof** - Verify scope grouping

### Phase 39 Test Cases

1. **Basic 25 SQ roof** - Verify XML imports into Xactimate
2. **Multi-slope roof** - Verify item grouping by slope
3. **Missing scope** - Verify error handling (400 response)
4. **Complex claim** - Verify auto-justification notes

### Phase 40 Test Cases

1. **Standard roof replacement** - Verify all pricing calculations
2. **High tax region (Prescott Valley 9.18%)** - Verify tax accuracy
3. **Low tax region (Chino Valley 8.35%)** - Verify tax accuracy
4. **Waste factor variations** - Verify material calculations
5. **O&P toggle ON/OFF** - Verify pricing with/without O&P

---

## 🔐 SECURITY & TOKEN CONSUMPTION

| Feature                     | Token Cost    | Notes                              |
| --------------------------- | ------------- | ---------------------------------- |
| Claim Writer                | 15 tokens     | Full narrative + scope + rebuttals |
| Estimate Export             | 10 tokens     | XML + JSON generation              |
| Priced Estimate             | 15 tokens     | All pricing calculations           |
| **Total for Complete Flow** | **40 tokens** | Full claim → export → pricing      |

**Authentication**: All endpoints require Clerk auth  
**Org Validation**: All operations validate orgId ownership  
**Rate Limiting**: Consider implementing for high-volume orgs

---

## 🚀 PERFORMANCE OPTIMIZATION

### Phase 34 Integration (Cache System)

Cache the following for 7 days:

- Generated scopes (by lead hash)
- Narratives (by damage pattern hash)
- Pricing calculations (by scope hash)
- Xactimate XML (by scope hash)
- Symbility JSON (by scope hash)

**Expected Performance Gains**:

- 80% faster for repeat lead analysis
- 95% cost reduction for cached results
- Near-instant regeneration for packet updates

---

## 📊 ANALYTICS & METRICS

Track these events:

- `claim_writer_generated` - Success rate, generation time
- `estimate_exported` - Format (XML/JSON), export time
- `pricing_applied` - Average RCV, O&P rates
- `packet_downloaded` - Complete flow usage
- `token_consumption` - Cost per feature

---

## 🏗️ IMPLEMENTATION ORDER

### Phase 38 (Days 1-3)

1. ✅ Add ClaimWriter model → `npx prisma db push`
2. ✅ Create `lib/ai/claimWriter.ts`
3. ✅ Create API route `/api/ai/claim-writer`
4. ✅ Build `ClaimWriterPanel.tsx`
5. ✅ Add tab to DominusPanel
6. ✅ Update packet page
7. ✅ Update export ZIP
8. ✅ Run test suite

### Phase 39 (Days 4-6)

1. ✅ Add EstimateExport model → `npx prisma db push`
2. ✅ Create `lib/ai/estimatorEngine.ts`
3. ✅ Create API route `/api/estimate/export`
4. ✅ Create `lib/export/zipBuilder.ts`
5. ✅ Build `EstimateExportPanel.tsx`
6. ✅ Add tab to DominusPanel
7. ✅ Update packet page
8. ✅ Run test suite

### Phase 40 (Days 7-9)

1. ✅ Add PricingProfile model → `npx prisma db push`
2. ✅ Create `lib/ai/pricingTable.ts`
3. ✅ Create `lib/ai/pricingEngine.ts`
4. ✅ Update `estimatorEngine.ts` with pricing
5. ✅ Create API route `/api/estimate/priced`
6. ✅ Update `EstimateExportPanel.tsx` UI
7. ✅ Update packet page with pricing
8. ✅ Run test suite

### Integration & Deploy (Day 10)

1. ✅ End-to-end flow testing
2. ✅ Cache integration (Phase 34)
3. ✅ Analytics implementation
4. ✅ Security review
5. ✅ Documentation finalization
6. ✅ Git commit & push
7. ✅ Vercel deployment
8. ✅ Production smoke test

---

## 🎯 SUCCESS CRITERIA

### Phase 38: Claim Writer

- [ ] Generates professional 4-paragraph narrative
- [ ] Scope quantities match slope analysis
- [ ] Rebuttals address common carrier positions
- [ ] Packet page renders cleanly
- [ ] Export ZIP contains all claim files

### Phase 39: Estimator Engine

- [ ] Xactimate XML imports successfully into X1
- [ ] Symbility JSON follows D22 structure
- [ ] Multi-slope roofs group correctly
- [ ] All line items have codes + justifications
- [ ] ZIP bundle downloads properly

### Phase 40: Pricing Engine

- [ ] All calculations accurate (waste, tax, O&P)
- [ ] City-level tax rates correct
- [ ] Priced XML/JSON maintain structure
- [ ] Packet displays pricing breakdown
- [ ] O&P toggle works correctly

---

## 🏆 COMPETITIVE ADVANTAGE

After Phases 38-40, Dominus will be the **ONLY PLATFORM IN THE WORLD** with:

1. ✅ AI-written insurance claims
2. ✅ Xactimate-compatible exports
3. ✅ Symbility-compatible exports
4. ✅ Automated pricing with regional adjustments
5. ✅ Video + AI + Slope + Claim + Estimate in one packet
6. ✅ One-button claim generation

**Market Position**: No CRM, no AI tool, no storm restoration platform has this complete stack.

**Target Users**:

- Roofing contractors
- Public adjusters
- Insurance restoration companies
- Multi-state restoration firms
- Claims management companies

---

## 📝 NOTES FOR DEVELOPERS

### Key Design Principles

1. **Modularity**: Each engine (claimWriter, estimatorEngine, pricingEngine) is independent
2. **Caching**: Leverage Phase 34 cache system for all AI operations
3. **Token Efficiency**: Cache results aggressively to minimize repeat costs
4. **Error Handling**: Graceful degradation if scope/data missing
5. **Extensibility**: Easy to add new export formats (CoreLogic, Simsol, etc.)

### Future Enhancements (Post-Phase 40)

- ACV (Actual Cash Value) calculations with depreciation
- Multi-state tax tables (expand beyond Arizona)
- Custom pricing profiles per org
- Verisk/CoreLogic API integration
- Real-time Xactimate price list sync
- Multi-language claim narratives
- Voice dictation for claim details

---

## 🔗 RELATED DOCUMENTATION

- [Phase 33-35 Master Status](./PHASE_33-35_MASTER_STATUS.md) - Performance & caching foundation
- [Complete Module Roadmap](../COMPLETE_MODULE_ROADMAP.md) - Overall system architecture
- [Deployment Guide](../DEPLOYMENT_GUIDE.md) - Production deployment steps

---

## 🚨 CRITICAL DEPENDENCIES

**Must Be Complete Before Starting**:

- ✅ Phase 34: AI Cache system (for performance)
- ✅ Token system functional (`consumeTokens()`)
- ✅ Clerk authentication working
- ✅ Supabase Storage configured (for ZIP uploads)
- ✅ Dominus AI analysis operational (provides input data)

**Parallel Work (No Conflicts)**:

- Phase 34-37 completion by other AI agent
- Can build Phases 38-40 simultaneously after database schemas added

---

**Status**: Ready to implement  
**Estimated Completion**: 10 days  
**Total Token Cost**: 40 tokens per complete claim flow  
**Impact**: **REVOLUTIONARY** - First end-to-end AI claims platform

---

_Last Updated: November 17, 2025_  
_Next Review: Upon Phase 38 completion_
