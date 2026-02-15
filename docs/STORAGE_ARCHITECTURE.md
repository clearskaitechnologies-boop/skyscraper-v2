# STORAGE ARCHITECTURE

**Generated:** November 30, 2025  
**Purpose:** Document the current file storage system architecture and patterns

---

## STORAGE PROVIDER

**Primary Provider:** Supabase Storage  
**Location:** `src/lib/storage.ts`

### Key Functions:

- `uploadSupabase()` - Main upload function
- `makeSafeFileName()` - UUID-based filename generation
- Supports buckets: `photos`, `brochures`, `documents`
- User-scoped paths: `{userId}/{folder}/{uuid}.{ext}`

### Configuration:

- Uses `NEXT_PUBLIC_SUPABASE_URL`
- Uses `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Validation endpoint: `/functions/v1/validate-brochure-upload`

---

## CANONICAL FILE MODEL

### `claim_documents` (Primary)

**Location:** `prisma/schema.prisma` (line ~540)

```prisma
model claim_documents {
  id              String   @id @default(cuid())
  claimId         String
  orgId           String
  type            String   // DEPRECIATION | SUPPLEMENT | CERTIFICATE | INVOICE | PHOTO | CONTRACT | OTHER
  title           String
  description     String?
  storageKey      String   // Supabase storage path
  publicUrl       String   // Supabase public URL
  mimeType        String   @default("application/pdf")
  fileSize        Int?
  visibleToClient Boolean  @default(false)
  createdById     String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  claim   claims @relation(fields: [claimId], references: [id], onDelete: Cascade)
  Org     Org    @relation(fields: [orgId], references: [id])
  creator users? @relation("claim_documents_creator", fields: [createdById], references: [id])
}
```

**Key Fields:**

- ✅ `id` - Unique identifier
- ✅ `orgId` - Organization scope
- ✅ `claimId` - Claim association
- ✅ `createdById` - User who created (maps to userId)
- ✅ `type` - File category
- ✅ `title` - Display name
- ✅ `storageKey` - Storage path
- ✅ `publicUrl` - Access URL
- ✅ `mimeType` - File type
- ✅ `fileSize` - Size in bytes
- ✅ `visibleToClient` - Portal visibility flag

**Status:** ✅ Fully ready for use - no migration needed

---

## LEGACY/ALTERNATE FILE MODELS

### `proposal_files`

- Purpose: Proposal-specific attachments
- Status: Domain-specific, keep as-is

### `weather_documents`

- Purpose: Weather report attachments
- Status: Domain-specific, keep as-is

### `ai_reports.attachments` (JSON field)

- Purpose: AI report file references
- Status: To be migrated to `claim_documents`

---

## FILE UPLOAD PATTERNS

### Current Upload Flows:

1. **Manual Photo Uploads**
   - Component: Various claim upload components
   - Storage: Supabase `photos` bucket
   - DB: Should create `claim_documents` record
   - **Status:** ⚠️ Needs standardization

2. **Document Uploads**
   - Storage: Supabase `documents` bucket
   - DB: Uses `claim_documents` ✅
   - **Status:** Ready

3. **AI-Generated PDFs**
   - Current: Often stored as URL in `ai_reports` table
   - Target: Should create `claim_documents` with type `AI_REPORT`
   - **Status:** ⚠️ Needs wiring

---

## FILE TYPE CATEGORIES

| Type           | Use Case                                       | Mime Types                        |
| -------------- | ---------------------------------------------- | --------------------------------- |
| `PHOTO`        | Inspection photos, damage documentation        | image/jpeg, image/png, image/webp |
| `DEPRECIATION` | Depreciation release forms                     | application/pdf                   |
| `SUPPLEMENT`   | Supplement documents                           | application/pdf                   |
| `CERTIFICATE`  | Certificates of completion, insurance          | application/pdf                   |
| `INVOICE`      | Invoices, receipts                             | application/pdf                   |
| `CONTRACT`     | Contracts, agreements                          | application/pdf                   |
| `AI_REPORT`    | AI-generated reports (weather, rebuttal, etc.) | application/pdf                   |
| `OTHER`        | Miscellaneous files                            | various                           |

---

## STORAGE PATH CONVENTION

### Supabase Paths:

```
{userId}/{folder}/{uuid}.{ext}
```

Examples:

```
user_abc123/photos/550e8400-e29b-41d4-a716-446655440000.jpg
user_abc123/claims/claim_xyz/7c9e6679-7425-40de-944b-e07fc1f90ae7.pdf
```

### Public URLs:

Generated via Supabase `getPublicUrl()`:

```
https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
```

---

## AUTHENTICATION & AUTHORIZATION

### Upload Requirements:

- ✅ User must be authenticated (Supabase auth)
- ✅ `orgId` from `safeOrgContext()`
- ✅ `userId` from Clerk/Supabase session
- ✅ `claimId` from request context

### Access Control:

- RLS policies on Supabase storage buckets
- Pro users: See all files for their org
- Portal users: See only `visibleToClient=true` files

---

## INTEGRATION POINTS

### To Wire:

1. ✅ `claim_documents` table (ready)
2. ⚠️ Upload API routes need orgId/userId injection
3. ⚠️ AI PDF generators need to save to storage + create records
4. ⚠️ Claim detail page needs "Files" panel
5. ⚠️ Portal needs file access (filtered by `visibleToClient`)

---

## ACTION ITEMS

### Phase 1 - Standardize Uploads:

- [ ] Audit all upload components
- [ ] Ensure all create `claim_documents` records
- [ ] Add orgId/claimId/userId to all upload handlers

### Phase 2 - AI File Pipeline:

- [ ] Refactor AI PDF generators to use storage adapter
- [ ] Create `claim_documents` records for AI outputs
- [ ] Link PDFs to AI reports via `claim_documents.title` or metadata

### Phase 3 - UI Integration:

- [ ] Add "Files & Documents" panel to claim detail
- [ ] Show files in portal (filtered)
- [ ] Add download/open buttons

---

## REFERENCES

- Storage adapter: `src/lib/storage.ts`
- DB model: `prisma/schema.prisma` (line ~540)
- Upload helpers: `src/lib/storage/` (multiple files)
- Existing checklist: `STORAGE_READINESS_CHECKLIST.md`
