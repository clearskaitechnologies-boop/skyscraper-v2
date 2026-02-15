# ✅ TODO: 100% OPERATIONAL READINESS

**Target:** Bring all 6 domains from 52% → 100% operational  
**Estimated Time:** 4 weeks  
**Priority:** Execute in order (dependencies respected)

---

## 🔴 WEEK 1 — CRITICAL (Must Do First)

### Day 1-2: Security Fixes (6 items, ~1 hour)

- [ ] **1. SQL Injection Fix** — `scripts/process-uploads-worker.js`

  ```javascript
  // Line ~45: Change this:
  await prisma.$executeRawUnsafe(`UPDATE branding_uploads SET status='done' WHERE id='${rec.id}'`);
  // To this:
  await prisma.$executeRaw`UPDATE branding_uploads SET status='done' WHERE id = ${rec.id}::uuid`;
  ```

- [ ] **2. Add auth** — `src/app/api/ai/vision/selftest/route.ts`

  ```typescript
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ```

- [ ] **3. Add auth** — `src/app/api/ai/product-context/route.ts`

  ```typescript
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  ```

- [ ] **4. Add CRON_SECRET** — `src/app/api/weather/cron-daily/route.ts`

  ```typescript
  const authHeader = request.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  ```

- [ ] **5. Add CRON_SECRET** — `src/app/api/cron/user-columns/route.ts`

- [ ] **6. Add auth** — `src/app/api/jobs/[jobId]/route.ts`

### Day 3-4: Schema Migration (10 items, ~3 hours)

- [ ] **7. Add ClaimAccess model** — `prisma/schema.prisma`
- [ ] **8. Add PortalLink model** — `prisma/schema.prisma`
- [ ] **9. Add ClientNotification model** — `prisma/schema.prisma`
- [ ] **10. Add TradePartner model** — `prisma/schema.prisma`
- [ ] **11. Add ClaimTradePartner model** — `prisma/schema.prisma`
- [ ] **12. Add ClaimSupplement model** — `prisma/schema.prisma`
- [ ] **13. Fix tradesCompany.orgId** — Change `@db.Uuid` to plain `String`
- [ ] **14. Add FKs to ClientPortalAccess** — clientId→Client, claimId→claims
- [ ] **15. Add FKs to ClaimClientLink** — claimId→claims
- [ ] **16. Run migration** — `npx prisma migrate dev --name add_missing_models`

### Day 5-7: Fix Broken Routes (5 items, ~4 hours)

- [ ] **17. Update portal/claims route** — Use new ClaimAccess model
- [ ] **18. Update portal invite flow** — Use new ClaimAccess model
- [ ] **19. Update trades API** — Use new TradePartner model
- [ ] **20. Update claim contractors** — Use ClaimTradePartner model
- [ ] **21. Fix ai-insights cron** — Create endpoint or remove from vercel.json

---

## 🟠 WEEK 2 — AI & RELIABILITY

### AI Protection (5 items, ~10 hours)

- [ ] **22. Create AI middleware** — `src/lib/ai/middleware.ts`
- [ ] **23. Add rate limits to 10 AI endpoints** — Priority: generate, analyze, build
- [ ] **24. Enable billing/usage** — Remove no-ops from `src/lib/usage/index.ts`
- [ ] **25. Add trackAiUsage()** — To all OpenAI-calling endpoints
- [ ] **26. Add plan gating** — Beyond just chat endpoint

### Background Jobs (5 items, ~7 hours)

- [ ] **27. Add retry logic** — `scripts/process-uploads-worker.js`
- [ ] **28. Add idempotency keys** — All workers
- [ ] **29. Add graceful shutdown** — `scripts/process-uploads-worker.js`
- [ ] **30. Add job_runs logging** — All 8 cron routes
- [ ] **31. Add DLQ to pg-boss** — `src/lib/jobs/pg-boss.ts`

---

## 🟡 WEEK 3 — UPLOADS & PORTAL

### File Upload Validation (6 items, ~8 hours)

- [ ] **32. Add MIME validation** — 4 routes (ai/detect, mockup, ocr/image, ocr/pdf)
- [ ] **33. Add size limits** — 5 routes
- [ ] **34. Add quota checks** — 13 routes using `checkStorageCapacity()`
- [ ] **35. Add audit logging** — 13 routes using `logStorageEvent()`
- [ ] **36. Create cleanup cron** — `/api/cron/cleanup-orphaned-files`
- [ ] **37. Add path traversal check** — `src/lib/storage.ts`

### Client Portal (5 items, ~5 hours)

- [ ] **38. Wire ClientNotification API** — After model added
- [ ] **39. Fix NotificationBell** — Component uses missing API
- [ ] **40. Update timeline route** — Use PortalLink model
- [ ] **41. Update accept route** — Use PortalLink model
- [ ] **42. Fix generate-access** — Function signature mismatch

---

## 🟢 WEEK 4+ — TECH DEBT

- [ ] **43. Migrate client_networks** — To Client model
- [ ] **44. Consolidate trades-service schema** — With main schema
- [ ] **45. Add virus scanning** — ClamAV or cloud service
- [ ] **46. Add pg_advisory_lock** — To crons for race protection
- [ ] **47. Remove mock AI code** — From predictor endpoint
- [ ] **48. Add OpenAI retry logic** — Transient failure handling
- [ ] **49. Create E2E tests** — Critical flows
- [ ] **50. Org scope claims routes** — Remaining gaps

---

## 📊 PROGRESS TRACKER

| Week | Domain            | Before | After | Items |
| ---- | ----------------- | ------ | ----- | ----- |
| 1    | Security + Schema | 52%    | 70%   | 21    |
| 2    | AI + Jobs         | 70%    | 85%   | 10    |
| 3    | Uploads + Portal  | 85%    | 95%   | 11    |
| 4+   | Tech Debt         | 95%    | 100%  | 8     |

---

## 🔍 VERIFICATION COMMANDS

```bash
# After Week 1 - Schema validation
npx prisma validate
npx prisma migrate dev --name add_missing_models

# After Week 2 - AI audit
grep -r "rateLimit" src/app/api/ai/ | wc -l  # Should be 15+

# After Week 3 - Upload audit
grep -r "validateFile\|checkStorageCapacity" src/app/api/upload/ | wc -l  # Should be 15+

# Full audit
node scripts/audit-api-auth.js
```

---

**Last Updated:** January 16, 2026  
**Owner:** Engineering Team
