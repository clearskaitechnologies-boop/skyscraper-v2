# Database Schema & Model Usage Guide

**Last Updated:** January 9, 2026  
**Status:** Comprehensive Reference for Preloss-Vision Platform

---

## Overview

This guide documents the canonical Prisma models, their purpose, and correct usage patterns. Use this to ensure consistency across the codebase.

---

## Core Organization Models

### `Org`

**Purpose:** Organization/company entity  
**Key Fields:** `id`, `name`, `slug`, `ownerId`, `planId`  
**Relations:** All org-scoped data (users, claims, leads, etc.)  
**Usage Pattern:**

```typescript
const org = await prisma.org.findUnique({
  where: { id: orgId },
  include: { users: true },
});
```

### `users`

**Purpose:** User accounts within organizations  
**Key Fields:** `id`, `clerkId`, `orgId`, `email`, `role`  
**Relations:** `Org`, assigned activities  
**Usage Pattern:**

```typescript
const user = await prisma.users.findUnique({
  where: { clerkId: currentClerkId },
});
```

---

## Trades Network Models

### `tradesCompany`

**Purpose:** Trades/contractor company profiles  
**Key Fields:** `id`, `orgId`, `name`, `tradeType`, `isPublic`  
**Relations:** `tradesCompanyMember`, `tradesPost`, `tradesReview`  
**Usage:** Public-facing company profile for trades network  
**Status:** PRIMARY model for trade companies

### `tradesCompanyMember`

**Purpose:** Individual professional profiles within trade companies  
**Key Fields:**

- Identity: `userId`, `companyId`, `orgId`
- Profile: `firstName`, `lastName`, `email`, `phone`, `bio`, `avatar`
- Professional: `jobTitle`, `tradeType`, `yearsExperience`
- Skills: `skills[]`, `certifications[]`, `specialties[]`  
  **Usage:** Member profiles for trades professionals  
  **Status:** PRIMARY model for individual profiles (consolidated)

**Important:** This is the ONLY profile model. Do NOT create separate `ContractorProfile` or similar models.

---

## Client Models

### `Client`

**Purpose:** Homeowners/property owners in the platform  
**Key Fields:**

- Identity: `id`, `orgId`, `email`, `firstName`, `lastName`
- Contact: `phone`, `address`, `city`, `state`, `postal`
- Profile: `bio`, `avatarUrl`, `isPublic`
- Preferences: `contactPreference`, `category`  
  **Relations:** `ClientProConnection`, `ClientSavedPro`, `ClientWorkRequest`  
  **Usage:** Client directory and client portal access  
  **Note:** `isPublic` enables client discovery in trades network

### `ClientProConnection`

**Purpose:** Direct connections between clients and pros  
**Key Fields:** `clientId`, `proOrgId`, `claimId`, `status`  
**Usage:** Track client-pro relationships

---

## Claims & Job Management

### `claims`

**Purpose:** Insurance claims tracking  
**Key Fields:**

- Identity: `id`, `orgId`, `claimNumber`
- Details: `title`, `description`, `damageType`, `dateOfLoss`
- Insurance: `carrier`, `adjusterName`, `adjusterEmail`, `deductible`
- Status: `status`, `priority`, `assignedTo`  
  **Relations:** `properties`, `projects`, `claim_documents`, `claim_events`  
  **Usage:** Primary claims management

### `leads`

**Purpose:** Sales leads and opportunities  
**Key Fields:**

- Identity: `id`, `orgId`, `contactId`
- Classification: `jobCategory` (claim, financed, out_of_pocket, repair, lead)
- Pipeline: `stage`, `temperature`, `urgency`
- Value: `value`, `probability`, `budget`  
  **Relations:** `contacts`, `projects`, `claims`  
  **Usage:** Lead tracking and pipeline management  
  **Important:** `jobCategory` determines workflow type

### `projects`

**Purpose:** Job/project tracking  
**Key Fields:**

- Identity: `id`, `orgId`, `jobNumber`
- Classification: `status` (PipelineStage enum)
- Timeline: `startDate`, `targetEndDate`, `actualEndDate`  
  **Relations:** `leads`, `claims`, `estimates`, `inspections`  
  **Usage:** Main project/job entity

---

## Document Management

### `claim_documents`

**Purpose:** Documents attached to claims  
**Key Fields:** `id`, `claimId`, `orgId`, `fileName`, `fileSize`, `storageKey`  
**Usage:** Claim document storage  
**API:** `/api/claims/[claimId]/documents`

### `documents`

**Purpose:** General project documents  
**Key Fields:** `id`, `projectId`, `orgId`, `fileName`, `storageUrl`  
**Usage:** Project-level documents

---

## Template & PDF System

### `template`

**Purpose:** PDF report templates  
**Key Fields:**

- Identity: `id`, `slug`, `name`
- Classification: `category`, `type`
- Content: `previewHtml`, `thumbnailUrl`
- Ownership: `isMarketplace`, `createdBy`  
  **Relations:** `org_templates` (many-to-many)  
  **Usage:** Template library and PDF generation

### `org_templates`

**Purpose:** Templates available to an organization  
**Key Fields:** `orgId`, `templateId`  
**Usage:** Junction table for org-template relationship

---

## Branding & Settings

### `org_branding`

**Purpose:** Organization branding for PDFs/reports  
**Key Fields:**

- Company: `companyName`, `license`, `phone`, `email`, `website`
- Colors: `colorPrimary`, `colorAccent`
- Media: `logoUrl`, `teamPhotoUrl`, `coverPhotoUrl`
- Tax: `taxRate`, `taxEnabled`, `businessState`  
  **Usage:** Branding applied to all generated documents

---

## Billing Models

### `Subscription`

**Purpose:** Stripe subscription tracking  
**Key Fields:** `orgId`, `stripeCustomerId`, `stripeSubId`, `status`  
**Usage:** Billing status for org

### `TokenWallet`

**Purpose:** Token balance tracking  
**Key Fields:** `orgId`, `aiRemaining`, `dolCheckRemain`, `dolFullRemain`  
**Usage:** Usage-based billing tokens

---

## Network & Invitations

### `network_invitation`

**Purpose:** Email invitations to join network  
**Key Fields:**

- Identity: `id`, `token`, `email`
- Context: `inviter_org_id`, `invitee_org_id`, `role`
- Status: `status`, `accepted_at`, `expires_at`  
  **Usage:** Invite trades/clients to platform

---

## Validation Patterns

### Required Field Validation

```typescript
import { z } from "zod";

const ClaimCreateSchema = z.object({
  claimNumber: z.string().min(1),
  dateOfLoss: z.string().datetime(),
  damageType: z.enum(["wind", "hail", "water", "fire"]),
});
```

### Enum Values

```typescript
// Pipeline stages
enum PipelineStage {
  LEAD = "LEAD",
  QUALIFIED = "QUALIFIED",
  PROPOSAL = "PROPOSAL",
  NEGOTIATION = "NEGOTIATION",
  CLOSED_WON = "CLOSED_WON",
  CLOSED_LOST = "CLOSED_LOST",
}

// Lead job categories
type JobCategory = "claim" | "repair" | "out_of_pocket" | "financed" | "lead";
```

---

## Common Queries

### Get Organization with Members

```typescript
const org = await prisma.org.findUnique({
  where: { id: orgId },
  include: {
    users: { where: { status: "active" } },
    branding: true,
    subscription: true,
  },
});
```

### Get Claim with Full Context

```typescript
const claim = await prisma.claims.findUnique({
  where: { id: claimId },
  include: {
    properties: true,
    claim_documents: true,
    claim_events: { orderBy: { eventDate: "desc" } },
    tradePartners: { include: { company: true } },
  },
});
```

### Get Client Profile

```typescript
const client = await prisma.client.findUnique({
  where: { id: clientId },
  include: {
    proConnections: { include: { org: true } },
    savedPros: true,
    workRequests: true,
  },
});
```

### Get Trades Company with Members

```typescript
const company = await prisma.tradesCompany.findUnique({
  where: { id: companyId },
  include: {
    members: { where: { status: "active" } },
    reviews: { orderBy: { createdAt: "desc" }, take: 10 },
  },
});
```

---

## Anti-Patterns (AVOID)

### ❌ Direct Clerk orgId Usage

```typescript
// BAD - orgId from Clerk is often null
const { orgId } = auth();
const claims = await prisma.claims.findMany({ where: { orgId } });
```

### ✅ Use DB Membership Lookup

```typescript
// GOOD - Get org from database membership
import { safeOrgContext } from "@/lib/safeOrgContext";
const ctx = await safeOrgContext();
if (ctx.status !== "ok") return redirect("/onboarding");
const claims = await prisma.claims.findMany({ where: { orgId: ctx.orgId } });
```

### ❌ Mixing Profile Models

```typescript
// BAD - Using non-existent model
const profile = await prisma.contractorProfile.findUnique(...);
```

### ✅ Use Canonical Model

```typescript
// GOOD - Use tradesCompanyMember
const member = await prisma.tradesCompanyMember.findUnique({
  where: { userId },
});
```

### ❌ Inconsistent Status Values

```typescript
// BAD - Mixed case
await prisma.claims.update({
  where: { id },
  data: { status: "PENDING" }, // or 'pending'?
});
```

### ✅ Use Lowercase Consistently

```typescript
// GOOD - Lowercase status
await prisma.claims.update({
  where: { id },
  data: { status: "pending" },
});
```

---

## Migration Best Practices

### Adding New Fields

```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_field_name

# 3. Update relevant Zod schemas
# 4. Update API routes
# 5. Update UI components
```

### Renaming Models

```prisma
// Use @@map to preserve DB table name
model tradesCompany {
  @@map("trades_companies")
}
```

---

## Status Field Standards

### Claim Status Values

- `new` - Newly created
- `pending` - Awaiting action
- `in_progress` - Active work
- `review` - Under review
- `approved` - Approved by carrier
- `completed` - Work finished
- `closed` - Fully closed

### Lead Stage Values

- `new` - Initial contact
- `contacted` - Reached out
- `qualified` - Qualified lead
- `proposal` - Proposal sent
- `negotiation` - In negotiation
- `won` - Deal closed
- `lost` - Lost opportunity

---

## Performance Tips

### Use Selective Includes

```typescript
// Only include what you need
const claim = await prisma.claims.findUnique({
  where: { id },
  select: {
    id: true,
    claimNumber: true,
    status: true,
    properties: { select: { street: true, city: true } },
  },
});
```

### Index Usage

```typescript
// Leverage existing indexes
@@index([orgId, status]) // Compound index
@@index([claimNumber]) // Unique lookup
```

---

## Reference Links

- Schema File: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Auth Helpers: `src/lib/safeOrgContext.ts`
- API Patterns: `src/app/api/`

---

**Questions?** Check existing API routes for usage examples or consult the team.
