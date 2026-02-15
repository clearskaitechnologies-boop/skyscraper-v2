# TypeScript Error Cleanup Roadmap

> **Current Status**: 3,182 errors (with skipTypeCheck enabled)  
> **Target**: 0 errors → Remove skipTypeCheck  
> **Last Updated**: 2026-02-04

---

## Error Distribution

| Error Code | Count | Description                        | Strategy                       |
| ---------- | ----- | ---------------------------------- | ------------------------------ |
| TS2339     | 1365  | Property does not exist            | Use adapters at API boundaries |
| TS2551     | 459   | Property typo (did you mean?)      | Search-replace naming          |
| TS2353     | 452   | Unknown property in object literal | Update Prisma includes/selects |
| TS2322     | 237   | Type not assignable                | Add proper type annotations    |
| TS2561     | 185   | Unknown property (variant)         | Same as TS2353                 |
| TS2345     | 141   | Argument type mismatch             | Update function signatures     |
| TS2304     | 122   | Cannot find name                   | Add imports/type definitions   |
| Other      | 221   | Various                            | Case-by-case                   |

---

## High-Error Files (Priority Fix)

1. **src/lib/claims-folder/pdfBundler.ts** (39 errors)
   - Likely Prisma field mismatches
   - Apply claim adapter

2. **src/app/api/dashboard/activities/route.ts** (26 errors)
   - Activity model field names
   - Review schema alignment

3. **src/app/api/ai/rebuttal/export-pdf/route.ts** (26 errors)
   - Report/claim field names
   - Apply adapters

4. **src/app/api/trades/profile-new/route.ts** (25 errors)
   - TradesCompany fields
   - Use trade adapter

5. **src/lib/claims-folder/folderAssembler.ts** (24 errors)
   - Same as pdfBundler

---

## Strategy

### Phase 1: Critical Path (Week 1)

Focus on files blocking production functionality:

1. Apply adapters at all API route boundaries
2. Fix claim-related files (most common model)
3. Fix billing/token files (payment critical)

### Phase 2: Systematic Sweep (Week 2)

Work through directories:

1. `/src/app/api/` - All API routes
2. `/src/lib/` - Core utilities
3. `/src/components/` - UI components
4. `/src/modules/` - Feature modules

### Phase 3: Strict Mode (Week 3)

1. Enable `skipTypeCheck: false` in next.config
2. Fix any remaining errors
3. Add strict null checks progressively

---

## Common Fixes

### Snake_case → camelCase Properties

```typescript
// Before (raw Prisma)
claim.insured_name;
claim.date_of_loss;
claim.exposure_cents;

// After (via adapter)
const claim = adaptClaim(rawClaim);
claim.insuredName;
claim.dateOfLoss;
claim.exposureCents;
```

### Property Doesn't Exist on Type

```typescript
// Before - accessing raw Prisma
const carrier = claim.carrier; // TS2339

// After - use Prisma with proper include
const claim = await prisma.claims.findUnique({
  where: { id },
  include: { properties: true, contacts: true },
});
```

### Object Literal Unknown Property

```typescript
// Before - wrong field name in where clause
prisma.claims.findMany({ where: { orgid: id } }); // TS2353

// After - correct field name
prisma.claims.findMany({ where: { orgId: id } });
```

---

## Adapters Created

| Adapter | File                                    | Status   |
| ------- | --------------------------------------- | -------- |
| Claims  | `src/lib/db/adapters/claimAdapter.ts`   | ✅ Ready |
| Billing | `src/lib/db/adapters/billingAdapter.ts` | ✅ Ready |
| Trades  | `src/lib/db/adapters/tradeAdapter.ts`   | ✅ Ready |
| Reports | `src/lib/db/adapters/reportAdapter.ts`  | ✅ Ready |
| Users   | `src/lib/db/adapters/userAdapter.ts`    | ✅ Ready |

---

## Metrics Tracking

| Date       | Total Errors | Delta | Notes                       |
| ---------- | ------------ | ----- | --------------------------- |
| 2026-02-04 | 3,182        | -     | Baseline after schema fixes |
|            |              |       |                             |

---

## Removal Criteria

Before removing `skipTypeCheck`:

- [ ] < 50 errors remaining
- [ ] All API routes use adapters
- [ ] All critical paths type-clean
- [ ] CI passes without skipTypeCheck
- [ ] No runtime type errors in production logs
