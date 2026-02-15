# MASTER PROMPTS IMPLEMENTATION PLAN

**Status:** Ready for phased execution  
**Goal:** Implement storage + AI files + client portal systematically  
**Approach:** Incremental, testable phases  
**⚠️ IMPORTANT:** This document does NOT execute code. It provides the plan and execution prompts.

---

## 🎯 EXECUTION STRATEGY

Each phase has:

1. **Documentation** of what needs to be done
2. **TODO List** with specific file paths
3. **"Done When" Checklist** for verification
4. **Execution Prompt** to paste into Cursor

**Rules:**

- ✅ NO destructive DB migrations
- ✅ NO breaking changes to existing features
- ✅ Backwards compatible with current architecture
- ✅ Test after each phase
- ✅ Git commit after each phase

---

## PHASE 1 — Storage Core Wiring (Uploads → Database → Claim View)

### 📋 Documentation

**Canonical File Model:** `claim_documents` (already exists in schema.prisma ~line 540)

**Storage Adapter:** `src/lib/storage.ts`

- Function: `uploadSupabase(file, bucket, folder)`
- Buckets: `photos`, `documents`, `brochures`
- Returns: `{ url, path }`

**Upload Components to Wire:**

1. Claim photo uploads (various claim detail components)
2. Document upload forms
3. Any manual file input components

### ✅ TODO List

1. **Find all upload API routes:**
   - Search for: `/api/upload`, `/api/claims/[id]/upload`, `/api/files`
   - List exact paths in repo

2. **Update each upload route to:**
   - Use `safeOrgContext()` to get `orgId` + `userId`
   - Accept `claimId` from request body/query
   - Call `uploadSupabase(file, bucket, folder)`
   - Create `claim_documents` record with:
     - `orgId`, `claimId`, `createdById` (userId)
     - `type` = "PHOTO" | "DOCUMENT" | "OTHER"
     - `storageKey`, `publicUrl` from upload result
     - `title` from original filename
     - `mimeType`, `fileSize`

3. **Add Files panel to claim detail page:**
   - Location: Find claim detail page (likely `/src/app/(app)/claims/[id]/page.tsx`)
   - Query: `await prisma.claim_documents.findMany({ where: { claimId, orgId } })`
   - Render table with columns: Icon, Title, Type, Size, Created, Actions
   - Action buttons: Download (opens `publicUrl`), Delete (optional)
   - Empty state: "No files uploaded yet"

4. **Create reusable component:**
   - `src/components/claim/ClaimFilesPanel.tsx`
   - Props: `claimId`, `orgId`
   - Handles loading, error, empty states

5. **Verify auth & permissions:**
   - Only users in the org can upload/view files
   - Use `safeOrgContext()` on all routes

### 🎯 Done When

- [ ] Upload a photo on any claim
- [ ] See it appear in the Files panel immediately
- [ ] Download button opens the file
- [ ] Files filtered by orgId (no cross-org leaks)
- [ ] `pnpm build` passes

---

### <PHASE_1_EXEC_PROMPT>

```
You are implementing Phase 1: Storage Core Wiring.

GOAL: Wire manual file uploads to the claim_documents table and display them in claim detail.

CONTEXT:
- The claim_documents model already exists in prisma/schema.prisma
- Storage adapter exists at src/lib/storage.ts
- Function: uploadSupabase(file, bucket, folder) returns { url, path }

TASKS:

1. FIND UPLOAD ROUTES:
   Search the codebase for existing upload API routes:
   - Look for: /api/upload, /api/claims/.../upload, /api/files
   - Note their exact paths

2. UPDATE EACH UPLOAD ROUTE:
   For each upload route found:

   import { safeOrgContext } from "@/lib/safeOrgContext";
   import { uploadSupabase } from "@/lib/storage";
   import prisma from "@/lib/db/prisma";

   export async function POST(req: Request) {
     const ctx = await safeOrgContext();
     if (ctx.status !== "ok") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const formData = await req.formData();
     const file = formData.get("file") as File;
     const claimId = formData.get("claimId") as string;

     // Upload to Supabase
     const { url: publicUrl, path: storageKey } = await uploadSupabase(
       file,
       "photos",
       `claims/${claimId}`
     );

     // Create DB record
     const doc = await prisma.claim_documents.create({
       data: {
         claimId,
         orgId: ctx.orgId,
         createdById: ctx.userId,
         type: file.type.startsWith("image/") ? "PHOTO" : "DOCUMENT",
         title: file.name,
         storageKey,
         publicUrl,
         mimeType: file.type,
         fileSize: file.size,
       },
     });

     return NextResponse.json({ success: true, file: doc });
   }

3. CREATE FILES PANEL COMPONENT:
   Create src/components/claim/ClaimFilesPanel.tsx:

   "use client";

   import { FileIcon, Download } from "lucide-react";
   import { formatDistanceToNow } from "date-fns";

   interface ClaimFilesPanelProps {
     claimId: string;
     files: any[]; // claim_documents records
   }

   export function ClaimFilesPanel({ claimId, files }: ClaimFilesPanelProps) {
     if (files.length === 0) {
       return (
         <div className="rounded-xl border border-border bg-muted/40 p-6 text-center">
           <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
           <p className="mt-2 text-sm text-muted-foreground">
             No files uploaded yet
           </p>
         </div>
       );
     }

     return (
       <div className="space-y-2">
         {files.map((file) => (
           <div key={file.id} className="flex items-center justify-between rounded-lg border p-3">
             <div className="flex items-center gap-3">
               <FileIcon className="h-5 w-5 text-blue-600" />
               <div>
                 <p className="text-sm font-medium">{file.title}</p>
                 <p className="text-xs text-muted-foreground">
                   {file.type} • {formatDistanceToNow(new Date(file.createdAt))} ago
                 </p>
               </div>
             </div>
             <a
               href={file.publicUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm hover:bg-muted"
             >
               <Download className="h-4 w-4" />
               Download
             </a>
           </div>
         ))}
       </div>
     );
   }

4. ADD TO CLAIM DETAIL PAGE:
   Find the claim detail page (src/app/(app)/claims/[id]/page.tsx or similar).

   Add server-side data fetch:

   const files = await prisma.claim_documents.findMany({
     where: { claimId: params.id, orgId: ctx.orgId },
     orderBy: { createdAt: "desc" },
   });

   Add to the page layout:

   <section>
     <h2 className="text-lg font-semibold mb-4">Files & Documents</h2>
     <ClaimFilesPanel claimId={claim.id} files={files} />
   </section>

CONSTRAINTS:
- DO NOT modify the claim_documents schema
- DO NOT break existing upload functionality
- Use safeOrgContext() for all auth checks
- Test with pnpm build after changes

DELIVERABLES:
- Updated upload routes with DB record creation
- ClaimFilesPanel component
- Files section in claim detail page
```

## PHASE 2 — AI File Outputs → Storage + Claims

### 📋 Documentation

**AI Flows That Generate Files:**

1. Weather reports → PDF
2. Claim rebuttals → PDF
3. Depreciation releases → PDF
4. Supplements → PDF
5. Mockups → Images (if applicable)

**Target for Phase 2:** Start with **ONE** AI feature (weather report recommended)

**Current Issue:** AI reports save to `ai_reports` table but PDFs aren't stored properly in `claim_documents`

### ✅ TODO List

1. **Identify AI PDF generation route:**
   - Search for weather report generation: `/api/weather`, `/api/ai/weather`
   - Or claim rebuttal: `/api/ai/rebuttal`
   - Find where PDF Buffer/Blob is created

2. **Refactor AI PDF pipeline:**
   - After PDF generation, convert to File object
   - Upload via `uploadSupabase(file, "documents", "ai-reports")`
   - Create `claim_documents` record:
     - `type` = "AI_REPORT"
     - `title` = "AI Weather Report - {date}" or similar
     - Link to `claimId` if available
     - Store `publicUrl` and `storageKey`

3. **Update AI reports UI:**
   - Find where AI reports are listed (claim detail / AI reports section)
   - Add "Download PDF" button next to each report
   - Button opens `claim_documents.publicUrl`

4. **Replicate for other AI features:**
   - Once weather works, apply same pattern to rebuttal, depreciation, etc.

### 🎯 Done When

- [ ] Generate AI weather report
- [ ] PDF is uploaded to Supabase storage
- [ ] `claim_documents` record created with type="AI_REPORT"
- [ ] Download button appears in UI
- [ ] Click download → opens PDF correctly
- [ ] `pnpm build` passes

---

### <PHASE_2_EXEC_PROMPT>

```
You are implementing Phase 2: AI File Outputs to Storage.

GOAL: Make AI-generated PDFs save to Supabase storage and link to claim_documents.

START WITH: Weather Report PDF generation (easiest to test)

CONTEXT:
- AI reports currently save to ai_reports table
- PDFs are often generated in-memory as Buffer/Blob
- Need to upload to storage and create claim_documents record

TASKS:

1. FIND WEATHER REPORT PDF GENERATION:
   Search for:
   - /api/weather/quick-dol or /api/weather/report
   - Look for PDF generation code (likely using jsPDF, PDFKit, or similar)
   - Find where the PDF Buffer/Blob is created

2. REFACTOR PDF SAVE LOGIC:
   After PDF is generated:

   import { uploadSupabase } from "@/lib/storage";
   import prisma from "@/lib/db/prisma";

   // Assume pdfBuffer is the generated PDF
   const pdfFile = new File(
     [pdfBuffer],
     `weather-report-${Date.now()}.pdf`,
     { type: "application/pdf" }
   );

   // Upload to storage
   const { url: publicUrl, path: storageKey } = await uploadSupabase(
     pdfFile,
     "documents",
     `ai-reports/${claimId || "general"}`
   );

   // Create claim_documents record
   const fileDoc = await prisma.claim_documents.create({
     data: {
       claimId: claimId || null, // if available
       orgId,
       createdById: userId,
       type: "AI_REPORT",
       title: `AI Weather Report - ${new Date().toLocaleDateString()}`,
       description: "Generated weather analysis with date of loss recommendation",
       storageKey,
       publicUrl,
       mimeType: "application/pdf",
       fileSize: pdfBuffer.length,
       visibleToClient: false, // or true if appropriate
     },
   });

   // Also save reference in ai_reports if needed
   await prisma.ai_reports.update({
     where: { id: reportId },
     data: {
       attachments: {
         pdfUrl: publicUrl,
         fileId: fileDoc.id,
       },
     },
   });

3. UPDATE UI TO SHOW DOWNLOAD BUTTON:
   Find where weather reports are displayed.

   Add download button:

   {report.attachments?.pdfUrl && (
     <a
       href={report.attachments.pdfUrl}
       target="_blank"
       rel="noopener noreferrer"
       className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
     >
       <Download className="h-4 w-4" />
       Download PDF
     </a>
   )}

   Or query claim_documents directly:

   const reportPdf = await prisma.claim_documents.findFirst({
     where: {
       claimId,
       type: "AI_REPORT",
       title: { contains: "Weather" },
     },
     orderBy: { createdAt: "desc" },
   });

4. TEST END-TO-END:
   - Generate weather report for a claim
   - Verify PDF uploads to Supabase
   - Verify claim_documents record created
   - Verify download button appears and works

5. REPLICATE FOR OTHER AI FEATURES:
   Once weather works, apply the same pattern to:
   - Claim rebuttal PDFs
   - Depreciation release PDFs
   - Supplement PDFs

   Use the same code structure, just change:
   - title = "AI Rebuttal Report - {date}"
   - description = "Generated rebuttal analysis"

CONSTRAINTS:
- DO NOT break existing AI report generation
- PDF generation logic stays the same
- Only add storage upload + DB record creation
- Use safeOrgContext() for auth

DELIVERABLES:
- Weather report PDFs save to storage
- claim_documents records created
- Download buttons in UI
```

## PHASE 3 — Client Portal Profile & Homeowner Records

### 📋 Documentation

**Goal:** Portal users (homeowners) can edit their contact information

**Required Model:** `HomeownerProfile` (needs to be added to schema)

**Portal Profile Page:** Likely `/src/app/(client-portal)/portal/profile/page.tsx` or similar

### ✅ TODO List

1. **Check if HomeownerProfile model exists:**
   - Search schema.prisma for homeowner/client profile models
   - If exists, use it; if not, create new model

2. **Add HomeownerProfile model to schema.prisma:**

   ```prisma
   model HomeownerProfile {
     id        String   @id @default(cuid())
     userId    String   @unique
     orgId     String?
     fullName  String?
     phone     String?
     address   String?
     city      String?
     state     String?
     zipCode   String?
     email     String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@index([userId])
     @@index([orgId])
   }
   ```

3. **Generate migration:**

   ```bash
   npx prisma migrate dev --name add_homeowner_profile
   ```

4. **Create API route `/api/portal/profile/route.ts`:**
   - GET: Fetch profile by userId
   - POST: Upsert profile data
   - Use safeOrgContext for auth

5. **Update portal profile page:**
   - Add "Contact Information" section
   - Form fields: phone, address, city, state, zipCode
   - Save button with loading state
   - Toast notifications

### 🎯 Done When

- [ ] HomeownerProfile model in schema
- [ ] Migration applied successfully
- [ ] API route returns profile data
- [ ] Portal user can edit and save phone/address
- [ ] Changes persist after page refresh
- [ ] `pnpm build` passes

---

### <PHASE_3_EXEC_PROMPT>

```
You are implementing Phase 3: Client Portal Profile & Homeowner Records.

GOAL: Allow portal users to edit their contact information.

CONTEXT:
- Portal users are homeowners who need to save phone/address
- Profile should be tied to userId from Clerk
- Should support future claim linking

TASKS:

1. ADD HOMEOWNER PROFILE MODEL:
   Add to prisma/schema.prisma:

   model HomeownerProfile {
     id        String   @id @default(cuid())
     userId    String   @unique
     orgId     String?
     fullName  String?
     phone     String?
     address   String?
     city      String?
     state     String?
     zipCode   String?
     email     String?
     avatarUrl String?
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@index([userId])
     @@index([orgId])
   }

2. GENERATE MIGRATION:
   Run: npx prisma migrate dev --name add_homeowner_profile

   IMPORTANT: This is ADDITIVE only - no destructive changes

3. CREATE API ROUTE:
   Create src/app/api/portal/profile/route.ts:

   import { NextResponse } from "next/server";
   import { safeOrgContext } from "@/lib/safeOrgContext";
   import prisma from "@/lib/db/prisma";

   export async function GET() {
     const ctx = await safeOrgContext();
     if (ctx.status === "unauthenticated") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const profile = await prisma.homeownerProfile.findUnique({
       where: { userId: ctx.userId! },
     });

     return NextResponse.json({ profile });
   }

   export async function POST(req: Request) {
     const ctx = await safeOrgContext();
     if (ctx.status === "unauthenticated") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const body = await req.json();
     const { fullName, phone, address, city, state, zipCode } = body;

     const profile = await prisma.homeownerProfile.upsert({
       where: { userId: ctx.userId! },
       create: {
         userId: ctx.userId!,
         orgId: ctx.orgId,
         fullName,
         phone,
         address,
         city,
         state,
         zipCode,
       },
       update: {
         fullName,
         phone,
         address,
         city,
         state,
         zipCode,
       },
     });

     return NextResponse.json({ success: true, profile });
   }

4. UPDATE PORTAL PROFILE PAGE:
   Find src/app/(client-portal)/portal/profile/page.tsx or similar.

   Add contact information section:

   "use client";

   import { useState, useEffect } from "react";
   import { Button } from "@/components/ui/button";
   import { Input } from "@/components/ui/input";
   import { Label } from "@/components/ui/label";
   import { toast } from "sonner";

   export function HomeownerContactInfo() {
     const [loading, setLoading] = useState(false);
     const [profile, setProfile] = useState({
       fullName: "",
       phone: "",
       address: "",
       city: "",
       state: "",
       zipCode: "",
     });

     useEffect(() => {
       fetch("/api/portal/profile")
         .then((res) => res.json())
         .then((data) => {
           if (data.profile) {
             setProfile(data.profile);
           }
         });
     }, []);

     const handleSave = async () => {
       setLoading(true);
       try {
         const res = await fetch("/api/portal/profile", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify(profile),
         });

         if (res.ok) {
           toast.success("Profile updated successfully");
         } else {
           toast.error("Failed to update profile");
         }
       } catch (error) {
         toast.error("An error occurred");
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="rounded-xl border p-6">
         <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
         <div className="space-y-4">
           <div>
             <Label htmlFor="phone">Phone Number</Label>
             <Input
               id="phone"
               value={profile.phone}
               onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
             />
           </div>
           <div>
             <Label htmlFor="address">Address</Label>
             <Input
               id="address"
               value={profile.address}
               onChange={(e) => setProfile({ ...profile, address: e.target.value })}
             />
           </div>
           <div className="grid grid-cols-3 gap-4">
             <div>
               <Label htmlFor="city">City</Label>
               <Input
                 id="city"
                 value={profile.city}
                 onChange={(e) => setProfile({ ...profile, city: e.target.value })}
               />
             </div>
             <div>
               <Label htmlFor="state">State</Label>
               <Input
                 id="state"
                 value={profile.state}
                 onChange={(e) => setProfile({ ...profile, state: e.target.value })}
               />
             </div>
             <div>
               <Label htmlFor="zipCode">Zip</Label>
               <Input
                 id="zipCode"
                 value={profile.zipCode}
                 onChange={(e) => setProfile({ ...profile, zipCode: e.target.value })}
               />
             </div>
           </div>
           <Button onClick={handleSave} disabled={loading}>
             {loading ? "Saving..." : "Save Changes"}
           </Button>
         </div>
       </div>
     );
   }

5. INTEGRATE INTO PROFILE PAGE:
   Add the component to the existing profile page below Clerk user profile.

CONSTRAINTS:
- DO NOT modify existing Clerk auth
- Migration must be non-destructive
- Use safeOrgContext for all auth checks
- Don't break existing portal pages

DELIVERABLES:
- HomeownerProfile model in schema
- Migration applied
- API route functional
- Profile editing UI working
```

## PHASE 4 — Auto-Claim Linking for Homeowners

### 📋 Documentation

**Goal:** Portal users automatically linked to their contractor's claim

**Flow:**

1. Homeowner logs into portal
2. System checks for `ClientPortalAccess` record
3. If none exists, auto-link to first claim in org (demo behavior)
4. Show claim details on portal home/claims page

**Future:** Replace auto-link with invite codes/tokens

### ✅ TODO List

1. **Add ClientPortalAccess model:**

   ```prisma
   model ClientPortalAccess {
     id        String   @id @default(cuid())
     userId    String
     orgId     String
     claimId   String
     grantedBy String?
     grantedAt DateTime @default(now())
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@unique([userId, claimId])
     @@index([userId])
     @@index([orgId])
     @@index([claimId])
   }
   ```

2. **Generate migration**

3. **Create portal claims page:**
   - `/src/app/(client-portal)/portal/claims/page.tsx`
   - Or update existing portal home page
   - Server component that:
     - Gets userId from safeOrgContext
     - Checks for ClientPortalAccess
     - If none, finds first claim and creates access
     - Loads claim data
     - Renders claim info

4. **Create claim detail view for portal:**
   - Show claim address, status, date of loss
   - Show timeline/updates
   - Show files (filtered by visibleToClient=true)

### 🎯 Done When

- [ ] ClientPortalAccess model in schema
- [ ] Migration applied
- [ ] Portal user sees claim automatically
- [ ] Claim details display correctly
- [ ] Files visible to client show properly
- [ ] `pnpm build` passes

---

### <PHASE_4_EXEC_PROMPT>

```
You are implementing Phase 4: Auto-Claim Linking for Homeowners.

GOAL: Portal users automatically see their contractor's claim.

CONTEXT:
- For V1 demo, auto-link portal user to first claim in org
- Future: proper invite system
- Portal users should see claim info, files, updates

TASKS:

1. ADD CLIENT PORTAL ACCESS MODEL:
   Add to prisma/schema.prisma:

   model ClientPortalAccess {
     id        String   @id @default(cuid())
     userId    String
     orgId     String
     claimId   String
     grantedBy String?  // userId of pro who granted access
     grantedAt DateTime @default(now())
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     @@unique([userId, claimId])
     @@index([userId])
     @@index([orgId])
     @@index([claimId])
   }

2. GENERATE MIGRATION:
   Run: npx prisma migrate dev --name add_client_portal_access

3. CREATE OR UPDATE PORTAL CLAIMS PAGE:
   Find or create src/app/(client-portal)/portal/claims/page.tsx:

   import { safeOrgContext } from "@/lib/safeOrgContext";
   import prisma from "@/lib/db/prisma";

   export const dynamic = "force-dynamic";

   export default async function PortalClaimsPage() {
     const ctx = await safeOrgContext();

     if (ctx.status === "unauthenticated") {
       return (
         <div className="p-6">
           <p>Please sign in to view your claims.</p>
         </div>
       );
     }

     // Check for existing access
     let access = await prisma.clientPortalAccess.findFirst({
       where: { userId: ctx.userId! },
       include: {
         // If you add relations to claims table
       },
     });

     // Auto-link demo behavior
     if (!access && ctx.orgId) {
       const firstClaim = await prisma.claims.findFirst({
         where: { orgId: ctx.orgId },
         orderBy: { createdAt: "desc" },
       });

       if (firstClaim) {
         access = await prisma.clientPortalAccess.create({
           data: {
             userId: ctx.userId!,
             orgId: ctx.orgId,
             claimId: firstClaim.id,
           },
         });
       }
     }

     if (!access) {
       return (
         <div className="p-6">
           <div className="rounded-xl border border-border bg-muted/40 p-8 text-center">
             <h2 className="text-lg font-semibold">No Claims Yet</h2>
             <p className="mt-2 text-sm text-muted-foreground">
               Your contractor will connect you to your claim shortly.
             </p>
           </div>
         </div>
       );
     }

     // Load claim data
     const claim = await prisma.claims.findUnique({
       where: { id: access.claimId },
       include: {
         properties: true,
       },
     });

     // Load visible files
     const files = await prisma.claim_documents.findMany({
       where: {
         claimId: access.claimId,
         visibleToClient: true,
       },
       orderBy: { createdAt: "desc" },
     });

     return (
       <main className="container-padding section-spacing space-y-6">
         <div>
           <h1 className="heading-2">My Claim</h1>
           <p className="body-small text-muted-foreground">
             View your claim details and updates
           </p>
         </div>

         <div className="rounded-xl border p-6">
           <h2 className="text-lg font-semibold mb-4">Claim Information</h2>
           <dl className="grid grid-cols-2 gap-4 text-sm">
             <div>
               <dt className="text-muted-foreground">Address</dt>
               <dd className="font-medium">
                 {claim?.properties?.street}, {claim?.properties?.city}
               </dd>
             </div>
             <div>
               <dt className="text-muted-foreground">Status</dt>
               <dd className="font-medium capitalize">{claim?.status}</dd>
             </div>
             <div>
               <dt className="text-muted-foreground">Date of Loss</dt>
               <dd className="font-medium">
                 {claim?.dateOfLoss ? new Date(claim.dateOfLoss).toLocaleDateString() : "N/A"}
               </dd>
             </div>
             <div>
               <dt className="text-muted-foreground">Claim Number</dt>
               <dd className="font-medium">{claim?.claimNumber}</dd>
             </div>
           </dl>
         </div>

         {files.length > 0 && (
           <div className="rounded-xl border p-6">
             <h2 className="text-lg font-semibold mb-4">Documents</h2>
             <div className="space-y-2">
               {files.map((file) => (
                 <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border">
                   <span className="text-sm">{file.title}</span>
                   <a
                     href={file.publicUrl}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="text-sm text-blue-600 hover:underline"
                   >
                     Download
                   </a>
                 </div>
               ))}
             </div>
           </div>
         )}
       </main>
     );
   }

4. UPDATE PORTAL NAVIGATION:
   Ensure portal nav includes link to /portal/claims

CONSTRAINTS:
- DO NOT break existing portal auth
- Auto-link is DEMO ONLY behavior
- Files must be filtered by visibleToClient=true
- Use safeOrgContext for all auth

DELIVERABLES:
- ClientPortalAccess model in schema
- Migration applied
- Portal claims page with auto-link logic
- Claim details rendering correctly
```

---

### **MICRO-PROMPT 5: Portal Messaging (60 min)**

**Goal:** Two-way messages between portal & pro

```
You are implementing portal messaging.

GOAL: Homeowner ↔ Pro messages tied to claim.

STEPS:
1. Reuse existing MessageThread/Message models
2. For each ClientPortalAccess:
   - Ensure one MessageThread exists:
     * orgId, claimId
     * title="Portal - {Claim Address}"
3. Portal /messages page:
   - Fetch thread for current userId + claim
   - Show messages
   - MessageInput to send new messages
4. Pro /messages page:
   - Show portal threads labeled clearly
   - Allow replies

AUTH: safeOrgContext on all endpoints. Users can only access threads for their org/claim.
```

**Test:** Portal user sends message → Pro sees it in /messages

---

## 📋 EXECUTION CHECKLIST

Run each micro-prompt in Cursor/Copilot. After EACH one:

- [ ] **Micro-Prompt 1** → Test photo upload
- [ ] **Micro-Prompt 2** → Test AI PDF download
- [ ] **Micro-Prompt 3** → Test portal profile save
- [ ] **Micro-Prompt 4** → Test portal claim view
- [ ] **Micro-Prompt 5** → Test portal messaging

Between each:

- `pnpm build` (verify no errors)
- Manual test the specific feature
- Git commit

## PHASE 5 — Two-Way Portal Messaging

### 📋 Documentation

**Goal:** Portal users and pros can message each other about claims

**Flow:**

1. Reuse existing MessageThread/Message models
2. Portal users send messages through /portal/messages
3. Pros see portal messages in /messages with "Portal Client" badge
4. Both sides can reply in real-time

**Schema Enhancement:**

- Add `claimId` to MessageThread (optional)
- Add `isPortalThread` flag for filtering
- Add `senderRole` to Message (pro vs homeowner)

### ✅ TODO List

1. **Enhance MessageThread model:**
   - Add `claimId String?` field
   - Add `isPortalThread Boolean @default(false)` field

2. **Enhance Message model:**
   - Add `senderRole String?` field (values: "pro", "homeowner")

3. **Create portal messages page:**
   - `/src/app/(client-portal)/portal/messages/page.tsx`
   - Server component loading threads for current user
   - Client component for message list + reply form

4. **Create portal messages API:**
   - `/src/app/api/portal/messages/route.ts`
   - POST handler to create new messages
   - Validates sender is portal user
   - Creates Message record with senderRole="homeowner"

5. **Update pro messages page:**
   - Add filter/badge for portal threads
   - Show homeowner name + claim address

### 🎯 Done When

- [ ] MessageThread has claimId + isPortalThread fields
- [ ] Message has senderRole field
- [ ] Migration applied
- [ ] Portal user can view threads
- [ ] Portal user can send messages
- [ ] Pro sees portal messages with badge
- [ ] Reply functionality works both ways
- [ ] `pnpm build` passes

---

### <PHASE_5_EXEC_PROMPT>

```
You are implementing Phase 5: Two-Way Portal Messaging.

GOAL: Portal users and pros can message about claims.

CONTEXT:
- Reuse existing MessageThread/Message models
- Add fields for portal context (claimId, isPortalThread, senderRole)
- Portal and pro users see same threads from different views

TASKS:

1. ENHANCE MESSAGETHREAD MODEL:
   In prisma/schema.prisma, add to MessageThread:

   model MessageThread {
     // ... existing fields ...
     claimId        String?
     isPortalThread Boolean @default(false)

     // Add index
     @@index([claimId])
   }

2. ENHANCE MESSAGE MODEL:
   Add to Message:

   model Message {
     // ... existing fields ...
     senderRole String? // "pro" or "homeowner"
   }

3. GENERATE MIGRATION:
   Run: npx prisma migrate dev --name add_portal_messaging_fields

4. CREATE PORTAL MESSAGES PAGE:
   Create src/app/(client-portal)/portal/messages/page.tsx:

   import { safeOrgContext } from "@/lib/safeOrgContext";
   import prisma from "@/lib/db/prisma";
   import { PortalMessagesClient } from "@/components/portal/PortalMessagesClient";

   export const dynamic = "force-dynamic";

   export default async function PortalMessagesPage() {
     const ctx = await safeOrgContext();

     if (ctx.status === "unauthenticated") {
       return <div className="p-6">Please sign in to view messages.</div>;
     }

     // Get portal user's claim
     const access = await prisma.clientPortalAccess.findFirst({
       where: { userId: ctx.userId! },
     });

     if (!access) {
       return (
         <div className="p-6">
           <div className="rounded-xl border p-8 text-center">
             <p>No claim linked yet.</p>
           </div>
         </div>
       );
     }

     // Load threads for this claim
     const threads = await prisma.messageThread.findMany({
       where: {
         claimId: access.claimId,
         isPortalThread: true,
       },
       include: {
         messages: {
           orderBy: { createdAt: "asc" },
           include: {
             sender: true,
           },
         },
       },
       orderBy: { createdAt: "desc" },
     });

     return (
       <main className="container-padding section-spacing">
         <h1 className="heading-2 mb-6">Messages</h1>
         <PortalMessagesClient
           threads={threads}
           currentUserId={ctx.userId!}
           claimId={access.claimId}
         />
       </main>
     );
   }

5. CREATE PORTAL MESSAGES CLIENT COMPONENT:
   Create src/components/portal/PortalMessagesClient.tsx:

   "use client";

   import { useState } from "react";
   import { Button } from "@/components/ui/button";
   import { Textarea } from "@/components/ui/textarea";

   export function PortalMessagesClient({ threads, currentUserId, claimId }) {
     const [activeThreadId, setActiveThreadId] = useState(threads[0]?.id || null);
     const [messageBody, setMessageBody] = useState("");
     const [sending, setSending] = useState(false);

     const activeThread = threads.find(t => t.id === activeThreadId);

     async function sendMessage() {
       if (!messageBody.trim()) return;

       setSending(true);
       try {
         const res = await fetch("/api/portal/messages", {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
             threadId: activeThreadId,
             claimId,
             body: messageBody,
           }),
         });

         if (res.ok) {
           setMessageBody("");
           window.location.reload(); // Simple refresh for demo
         }
       } catch (err) {
         console.error(err);
       } finally {
         setSending(false);
       }
     }

     if (!threads.length) {
       return (
         <div className="rounded-xl border p-8 text-center">
           <p className="text-muted-foreground">No messages yet.</p>
         </div>
       );
     }

     return (
       <div className="grid grid-cols-3 gap-4">
         {/* Thread list */}
         <div className="col-span-1 space-y-2">
           {threads.map(t => (
             <button
               key={t.id}
               onClick={() => setActiveThreadId(t.id)}
               className={`w-full text-left p-3 rounded-lg border ${
                 activeThreadId === t.id ? "bg-muted" : ""
               }`}
             >
               <p className="font-medium text-sm">{t.subject}</p>
               <p className="text-xs text-muted-foreground mt-1">
                 {t.messages.length} messages
               </p>
             </button>
           ))}
         </div>

         {/* Active thread */}
         <div className="col-span-2 border rounded-xl p-4 flex flex-col">
           <div className="flex-1 space-y-3 overflow-y-auto max-h-96 mb-4">
             {activeThread?.messages.map(msg => (
               <div
                 key={msg.id}
                 className={`p-3 rounded-lg ${
                   msg.senderId === currentUserId
                     ? "bg-blue-100 ml-auto max-w-xs"
                     : "bg-muted mr-auto max-w-xs"
                 }`}
               >
                 <p className="text-sm">{msg.body}</p>
                 <p className="text-xs text-muted-foreground mt-1">
                   {new Date(msg.createdAt).toLocaleString()}
                 </p>
               </div>
             ))}
           </div>

           {/* Reply form */}
           <div className="space-y-2">
             <Textarea
               value={messageBody}
               onChange={e => setMessageBody(e.target.value)}
               placeholder="Type your message..."
               rows={3}
             />
             <Button onClick={sendMessage} disabled={sending}>
               {sending ? "Sending..." : "Send"}
             </Button>
           </div>
         </div>
       </div>
     );
   }

6. CREATE PORTAL MESSAGES API:
   Create src/app/api/portal/messages/route.ts:

   import { safeOrgContext } from "@/lib/safeOrgContext";
   import prisma from "@/lib/db/prisma";
   import { NextRequest, NextResponse } from "next/server";

   export async function POST(req: NextRequest) {
     const ctx = await safeOrgContext();

     if (ctx.status === "unauthenticated") {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
     }

     const { threadId, claimId, body } = await req.json();

     // Validate portal user has access to this claim
     const access = await prisma.clientPortalAccess.findFirst({
       where: {
         userId: ctx.userId!,
         claimId,
       },
     });

     if (!access) {
       return NextResponse.json({ error: "No access to this claim" }, { status: 403 });
     }

     // Create or find thread
     let thread;
     if (threadId) {
       thread = await prisma.messageThread.findUnique({ where: { id: threadId } });
     } else {
       // Create new thread
       thread = await prisma.messageThread.create({
         data: {
           subject: "Portal Message",
           claimId,
           isPortalThread: true,
         },
       });
     }

     // Create message
     const message = await prisma.message.create({
       data: {
         body,
         threadId: thread.id,
         senderId: ctx.userId!,
         senderRole: "homeowner",
       },
     });

     return NextResponse.json({ message });
   }

7. UPDATE PRO MESSAGES PAGE:
   In src/app/(app)/messages/page.tsx, add portal thread filtering:

   // In the thread query, include isPortalThread
   const threads = await prisma.messageThread.findMany({
     where: { orgId: ctx.orgId },
     include: {
       messages: {
         orderBy: { createdAt: "asc" },
         include: { sender: true },
       },
     },
   });

   // In the UI, show badge for portal threads:
   {thread.isPortalThread && (
     <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
       Portal Client
     </span>
   )}

CONSTRAINTS:
- DO NOT break existing pro messaging
- Portal users only see their claim's threads
- Pros see all threads including portal
- Use safeOrgContext for auth
- Simple refresh after send (can enhance to SWR later)

DELIVERABLES:
- MessageThread/Message models enhanced
- Migration applied
- Portal messages page functional
- Portal messages API working
- Pro messages page shows portal badge
- Two-way messaging verified
```

---

## 🚨 ROLLBACK PLAN

If any phase breaks the build:

1. `git stash` or `git reset --hard HEAD~1`
2. Report which phase failed + error
3. Get a targeted fix prompt for that specific step

---

## ✅ SUCCESS CRITERIA

After all 5 phases:

**Storage:**

- ✅ Photo uploads create `claim_documents` records
- ✅ Files visible in claim detail panel
- ✅ AI PDFs saved to storage with records
- ✅ Download buttons work

**Portal:**

- ✅ Homeowner can edit profile (phone/address)
- ✅ Homeowner auto-linked to claim
- ✅ Homeowner sees claim details
- ✅ Two-way messaging works

---

## 📦 THEN: Consolidate & Document

After all working, create:

- `docs/STORAGE_STATUS.md` (what's wired)
- `docs/PORTAL_STATUS.md` (what works)

---

## 💡 WHY THIS APPROACH?

**Original prompts = 10 todos = 100+ file changes = high risk**

**This approach:**

- 5 focused phases
- Each testable independently
- Git commit between each
- Easy to rollback if one breaks
- Build confidence incrementally

**Total time:** ~3 hours vs. fighting broken build for 6+ hours

---

## 🚀 NEXT STEPS

**Right now, you have:**

- ✅ Storage architecture documented
- ✅ `claim_documents` model ready (no migration needed!)
- ✅ Supabase storage adapter working
- ✅ Phase-1 patterns established
- ✅ Complete 5-phase implementation plan with execution prompts

**Start with Phase 1.**

Copy <PHASE_1_EXEC_PROMPT> into Cursor, let it work, test, commit, then move to Phase 2.

Send me a message after each phase if you hit any issues!
