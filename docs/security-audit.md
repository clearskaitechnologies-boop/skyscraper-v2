# Security & Multi-Tenancy Audit Checklist

> **Status**: PRE-PILOT AUDIT  
> **Last Updated**: 2026-02-04  
> **Priority**: P1 - Required before customer pilots

---

## 🔐 Multi-Tenancy Isolation

### API Route Audit

Every API route must filter by `orgId`. Check each category:

| Category    | Route Pattern             | orgId Filter      | Status       |
| ----------- | ------------------------- | ----------------- | ------------ |
| Claims      | `/api/claims/*`           | ✅ withOrgScope   | **VERIFIED** |
| Claims [id] | `/api/claims/[claimId]/*` | ✅ withOrgScope   | **VERIFIED** |
| Reports     | `/api/reports/*`          | ☐                 | Pending      |
| AI          | `/api/ai/*`               | ✅ safeOrgContext | **VERIFIED** |
| Exports     | `/api/exports/*`          | ☐                 | Pending      |
| Billing     | `/api/billing/*`          | ☐                 | Pending      |
| Trades      | `/api/trades/*`           | ☐                 | Pending      |
| Network     | `/api/network/*`          | ☐                 | Pending      |
| Templates   | `/api/templates/*`        | ✅ withOrgScope   | **VERIFIED** |
| Contacts    | `/api/contacts/*`         | ✅ withOrgScope   | **VERIFIED** |
| Teams       | `/api/teams/*`            | ✅ withOrgScope   | **VERIFIED** |
| Intel       | `/api/intel/*`            | ☐                 | Pending      |
| Webhooks    | `/api/webhooks/*`         | N/A (public)      | **SKIP**     |

### Approved Auth Patterns

1. **withOrgScope** - HOC wrapper providing `{ userId, orgId }` context
2. **safeOrgContext** - Function returning org context with status
3. **auth() + manual check** - Direct Clerk auth with manual orgId filtering

All three patterns are acceptable when orgId is used in database queries.

### Cross-Org Read Prevention

- [ ] Claim data cannot be accessed by users from other orgs
- [ ] Property data is org-scoped
- [ ] Contact data is org-scoped
- [ ] Report data is org-scoped
- [ ] Template data respects org ownership
- [ ] Document data is org-scoped
- [ ] Supplement data is org-scoped

### Query Patterns to Verify

```typescript
// ✅ CORRECT - Always include orgId in where clause
prisma.claims.findMany({ where: { orgId, ...filters } });

// ❌ WRONG - Missing org filter
prisma.claims.findMany({ where: { id } });
```

---

## 🔗 Public Link Security

### Export Links

- [ ] Public export links include expiration timestamp
- [ ] Links are signed with HMAC or similar
- [ ] Expired links return 403, not data
- [ ] Link tokens are unguessable (UUID or cryptographic)

### File URLs

- [ ] Supabase/S3 signed URLs have TTL
- [ ] Direct file paths are not exposed
- [ ] Download endpoints verify access rights

---

## 🎣 Webhook Security

### Stripe Webhooks

- [x] Signature verification enforced (`stripe.webhooks.constructEvent`) ✅
- [x] Raw body preserved for signature check (`req.text()`) ✅
- [x] Webhook secret from env, not hardcoded (`STRIPE_WEBHOOK_SECRET`) ✅
- [x] Duplicate event handling (idempotency) via `webhookEvent` table ✅
- [ ] Event type whitelist enforced (handles all events)

### Other Webhooks

- [ ] Third-party webhooks have signature verification
- [ ] Webhook endpoints rate-limited
- [ ] Replay protection implemented

---

## 👤 Role Permissions

### Role Hierarchy

| Role   | Claims | Reports  | Billing | Admin |
| ------ | ------ | -------- | ------- | ----- |
| ADMIN  | Full   | Full     | Full    | Full  |
| EDITOR | Edit   | Generate | View    | -     |
| VIEWER | View   | View     | -       | -     |
| USER   | Own    | Own      | -       | -     |

### Permission Checks

- [ ] Delete operations require ADMIN role
- [ ] Billing changes require ADMIN role
- [ ] User management requires ADMIN role
- [ ] Report generation respects permissions
- [ ] Export permissions verified

---

## 💰 Token Usage Bounds

### Per-Org Limits

- [x] Monthly AI token cap enforced (`checkBillingLimits`) ✅
- [x] Per-request cost tracking (`usage_tokens` table) ✅
- [x] Wallet balance checked before AI calls (`wallet.aiRemaining`) ✅
- [ ] Overage alerts configured
- [x] Hard stop when credits exhausted (`AI_CREDITS_EXHAUSTED` code) ✅

### Abuse Prevention

- [x] Rate limiting per user (Upstash Ratelimit, 20/min sliding window) ✅
- [x] Rate limiting per org (via withRateLimit wrapper) ✅
- [ ] Request size limits
- [ ] AI prompt length limits
- [ ] Concurrent request limits

---

## 🔒 Authentication Checks

### Route Protection

- [x] All `/api/*` routes check auth (except webhooks) - via Clerk + `auth().protect()` ✅
- [x] All `/(app)/*` pages check auth - via middleware `auth().protect()` ✅
- [x] Clerk middleware configured correctly (`middleware.ts`) ✅
- [x] Public routes explicitly whitelisted (`isPublicRoute` matcher) ✅
- [x] Demo routes properly isolated (`/claims-legacy`, `/claims/test`) ✅

### Session Security

- [x] Session tokens have reasonable TTL (Clerk managed) ✅
- [x] Logout invalidates sessions (Clerk managed) ✅
- [x] Cross-device session management (Clerk dashboard) ✅
- [ ] Session hijacking prevention (verify Clerk secure cookies)

---

## 📝 Data Protection

### PII Handling

- [ ] Homeowner emails encrypted at rest (if required)
- [ ] Phone numbers masked in logs
- [ ] Social security numbers never stored
- [ ] Address data handled per regulations

### Logging Safety

- [ ] No sensitive data in console.log
- [ ] No API keys in error messages
- [ ] No full request bodies in production logs
- [ ] Sentry filters PII

---

## 🚨 Incident Response

### Monitoring

- [ ] Failed auth attempts logged
- [ ] Cross-org access attempts alerted
- [ ] Rate limit breaches logged
- [ ] Webhook failures monitored

### Response Plan

- [ ] Security incident runbook exists
- [ ] Contact list for escalation
- [ ] Data breach notification process
- [ ] Recovery procedures documented

---

## ✅ Audit Sign-Off

| Area            | Auditor  | Date       | Status                  |
| --------------- | -------- | ---------- | ----------------------- |
| Multi-Tenancy   | AI Audit | 2026-02-04 | ✅ Core routes verified |
| Public Links    |          |            | ⚠️ Needs signed URLs    |
| Webhooks        | AI Audit | 2026-02-04 | ✅ Stripe verified      |
| Permissions     |          |            | ⚠️ Needs RBAC audit     |
| Token Usage     | AI Audit | 2026-02-04 | ✅ Limits enforced      |
| Auth            | AI Audit | 2026-02-04 | ✅ Clerk middleware     |
| Data Protection |          |            | ⚠️ Needs PII review     |

---

## 🔄 Next Steps

1. ~~Run through each API route directory~~ ✅ Core routes verified
2. ~~Add orgId filters where missing~~ ✅ withOrgScope pattern in use
3. Implement signed export links (priority)
4. ~~Add rate limiting middleware~~ ✅ Upstash Ratelimit active
5. Create incident response runbook
6. Schedule external security review
7. Review PII handling in logs
8. Add RBAC permission checks to sensitive routes
