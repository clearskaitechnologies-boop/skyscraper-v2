# CLIENT PORTAL DOCUMENT INGESTION FLOW

## Executive Summary

This document maps the complete flow for AI-generated outputs to reach the client portal, including document creation, notifications, and tracking.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD AI ASSISTANT                    │
│  User selects action → AI generates output → User clicks    │
│             "Send to Client Portal"                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               API: /api/portal/documents                     │
│  1. Validate claim ownership                                 │
│  2. Create document record                                   │
│  3. Generate PDF (optional)                                  │
│  4. Store in S3/Vercel Blob                                  │
│  5. Link to claim                                            │
│  6. Create notification                                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE RECORDS CREATED                    │
│  - portal_documents                                          │
│  - claim_documents (optional)                                │
│  - notifications                                             │
│  - activity_log                                              │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   EMAIL NOTIFICATION                         │
│  Send to client email with:                                  │
│  - Subject: "New document available"                         │
│  - Portal link                                               │
│  - Document preview                                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT PORTAL ACCESS                      │
│  Client logs in → sees notification → views document         │
│  Can: Download, Comment, Request Changes                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Implementation

### STEP 1: API Endpoint - Create Portal Document

**File**: `/src/app/api/portal/documents/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getResolvedOrgId } from "@/lib/auth/getResolvedOrgId";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db/prisma";
import { createPortalNotification } from "@/lib/portal/notifications";
import { sendDocumentEmail } from "@/lib/email/sendDocumentEmail";

export const dynamic = "force-dynamic";

interface CreatePortalDocumentRequest {
  claimId: string;
  content: string;
  type: "supplement" | "depreciation" | "estimate" | "report";
  title?: string;
  sendEmail?: boolean;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify org access
    const orgId = await getResolvedOrgId();

    // 3. Parse request
    const body: CreatePortalDocumentRequest = await req.json();
    const { claimId, content, type, title, sendEmail = true } = body;

    // 4. Verify claim ownership
    const claim = await prisma.claims.findFirst({
      where: {
        id: claimId,
        orgId,
      },
      select: {
        id: true,
        claimNumber: true,
        clientName: true,
        clientEmail: true,
        propertyAddress: true,
      },
    });

    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // 5. Generate document title if not provided
    const documentTitle =
      title ||
      `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleDateString()}`;

    // 6. Convert content to PDF (optional but recommended)
    let pdfUrl = null;
    try {
      const pdfBuffer = await generatePDF({
        content,
        title: documentTitle,
        claimNumber: claim.claimNumber,
        propertyAddress: claim.propertyAddress,
      });

      // Upload to storage
      pdfUrl = await uploadToStorage(pdfBuffer, {
        orgId,
        claimId,
        filename: `${type}-${Date.now()}.pdf`,
      });
    } catch (pdfError) {
      console.error("[Portal Documents] PDF generation failed:", pdfError);
      // Continue without PDF - store as text
    }

    // 7. Create portal document record
    const portalDoc = await prisma.portal_documents.create({
      data: {
        orgId,
        claimId,
        title: documentTitle,
        content,
        contentType: pdfUrl ? "application/pdf" : "text/plain",
        fileUrl: pdfUrl,
        category: type,
        status: "published",
        visibleToClient: true,
        requiresSignature: type === "estimate", // Estimates need signatures
        createdBy: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // 8. Create notification for client
    await createPortalNotification({
      orgId,
      claimId,
      recipientEmail: claim.clientEmail,
      type: "document_available",
      title: `New ${type} available`,
      message: `A new ${type} has been uploaded to your claim portal.`,
      actionUrl: `/portal/${orgId}/claims/${claimId}/documents/${portalDoc.id}`,
    });

    // 9. Send email notification if requested
    if (sendEmail && claim.clientEmail) {
      try {
        await sendDocumentEmail({
          to: claim.clientEmail,
          clientName: claim.clientName || "Valued Client",
          claimNumber: claim.claimNumber,
          documentTitle,
          documentType: type,
          portalUrl: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${orgId}/claims/${claimId}`,
        });
      } catch (emailError) {
        console.error("[Portal Documents] Email failed:", emailError);
        // Don't fail the whole request if email fails
      }
    }

    // 10. Log activity
    await prisma.activity_log.create({
      data: {
        orgId,
        userId: user.id,
        entityType: "portal_document",
        entityId: portalDoc.id,
        action: "created",
        description: `Sent ${type} to client portal`,
        metadata: {
          claimId,
          claimNumber: claim.claimNumber,
          documentType: type,
        },
      },
    });

    return NextResponse.json({
      success: true,
      document: {
        id: portalDoc.id,
        title: documentTitle,
        url: pdfUrl,
        portalUrl: `/portal/${orgId}/claims/${claimId}/documents/${portalDoc.id}`,
      },
    });
  } catch (error) {
    console.error("[Portal Documents API] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

### STEP 2: PDF Generation

**File**: `/src/lib/pdf/generateDocumentPDF.ts`

```typescript
import puppeteer from "puppeteer";
import { formatCurrency } from "@/lib/utils";

interface PDFOptions {
  content: string;
  title: string;
  claimNumber: string;
  propertyAddress: string;
  companyLogo?: string;
  companyName?: string;
}

export async function generatePDF(options: PDFOptions): Promise<Buffer> {
  const { content, title, claimNumber, propertyAddress, companyLogo, companyName } = options;

  // Create HTML template
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      color: #1e40af;
    }
    .meta {
      color: #666;
      font-size: 14px;
    }
    .content {
      white-space: pre-wrap;
      font-size: 14px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    ${
      companyLogo
        ? `
    .logo {
      max-width: 200px;
      margin-bottom: 20px;
    }
    `
        : ""
    }
  </style>
</head>
<body>
  ${companyLogo ? `<img src="${companyLogo}" class="logo" />` : ""}
  
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">
      <strong>Claim:</strong> ${claimNumber}<br>
      <strong>Property:</strong> ${propertyAddress}<br>
      <strong>Generated:</strong> ${new Date().toLocaleDateString()}
    </div>
  </div>
  
  <div class="content">${content.replace(/\n/g, "<br>")}</div>
  
  <div class="footer">
    ${companyName || "Property Restoration Services"}<br>
    Document generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
  </div>
</body>
</html>
  `;

  // Generate PDF with Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html);

  const pdfBuffer = await page.pdf({
    format: "A4",
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
    printBackground: true,
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
}
```

---

### STEP 3: Storage Upload

**File**: `/src/lib/storage/uploadPortalDocument.ts`

```typescript
import { put } from "@vercel/blob";

interface UploadOptions {
  orgId: string;
  claimId: string;
  filename: string;
}

export async function uploadToStorage(buffer: Buffer, options: UploadOptions): Promise<string> {
  const { orgId, claimId, filename } = options;

  // Create path: portal-docs/{orgId}/{claimId}/{filename}
  const path = `portal-docs/${orgId}/${claimId}/${filename}`;

  // Upload to Vercel Blob
  const blob = await put(path, buffer, {
    access: "public",
    contentType: "application/pdf",
  });

  return blob.url;
}
```

---

### STEP 4: Email Notification

**File**: `/src/lib/email/sendDocumentEmail.ts`

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DocumentEmailOptions {
  to: string;
  clientName: string;
  claimNumber: string;
  documentTitle: string;
  documentType: string;
  portalUrl: string;
}

export async function sendDocumentEmail(options: DocumentEmailOptions) {
  const { to, clientName, claimNumber, documentTitle, documentType, portalUrl } = options;

  const emailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #2563eb;">New Document Available</h2>
    
    <p>Hello ${clientName},</p>
    
    <p>A new <strong>${documentType}</strong> has been uploaded to your claim portal.</p>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <strong>Claim:</strong> ${claimNumber}<br>
      <strong>Document:</strong> ${documentTitle}<br>
      <strong>Date:</strong> ${new Date().toLocaleDateString()}
    </div>
    
    <p>
      <a href="${portalUrl}" 
         style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
        View Document
      </a>
    </p>
    
    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      If you have any questions, please contact your claim representative.
    </p>
  </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: "Claims Portal <noreply@skaiscrape.com>",
    to,
    subject: `New ${documentType} - Claim ${claimNumber}`,
    html: emailHtml,
  });
}
```

---

### STEP 5: Client Portal View

**File**: `/src/app/(client-portal)/portal/[slug]/claims/[claimId]/documents/page.tsx`

```typescript
import prisma from "@/lib/db/prisma";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PortalDocumentsPage({
  params,
}: {
  params: Promise<{ slug: string; claimId: string }>;
}) {
  const { slug: orgId, claimId } = await params;

  // Fetch portal documents for this claim
  const documents = await prisma.portal_documents.findMany({
    where: {
      orgId,
      claimId,
      visibleToClient: true,
      status: "published",
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Documents</h1>

      {documents.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No documents available yet.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle className="text-lg">{doc.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Uploaded {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="flex gap-3">
              {doc.fileUrl && (
                <>
                  <Button asChild variant="outline">
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </a>
                  </Button>
                  <Button asChild>
                    <a href={doc.fileUrl} download>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## Database Schema

### portal_documents Table

```sql
CREATE TABLE portal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES org(id),
  claim_id UUID NOT NULL REFERENCES claims(id),

  title VARCHAR(255) NOT NULL,
  content TEXT,
  content_type VARCHAR(100) DEFAULT 'text/plain',
  file_url TEXT,

  category VARCHAR(50), -- 'supplement', 'depreciation', 'estimate', 'report'
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'

  visible_to_client BOOLEAN DEFAULT true,
  requires_signature BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  signature_data JSONB,

  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_portal_documents_org FOREIGN KEY (org_id) REFERENCES org(id) ON DELETE CASCADE,
  CONSTRAINT fk_portal_documents_claim FOREIGN KEY (claim_id) REFERENCES claims(id) ON DELETE CASCADE
);

CREATE INDEX idx_portal_documents_org_claim ON portal_documents(org_id, claim_id);
CREATE INDEX idx_portal_documents_visible ON portal_documents(visible_to_client, status);
```

---

## Tracking & Analytics

### Document View Tracking

```typescript
// Log when client views document
await prisma.portal_document_views.create({
  data: {
    documentId,
    viewedBy: clientEmail,
    viewedAt: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  },
});
```

### Metrics Dashboard

Track:

- Documents sent per claim
- Client view rate (% opened)
- Average time to view
- Signature completion rate
- Download count

---

## Security Considerations

1. **Access Control**: Verify client owns claim before showing documents
2. **URL Signing**: Use signed URLs for S3/Blob storage (expire after 7 days)
3. **Audit Logging**: Log all document accesses with timestamp/IP
4. **PII Protection**: Ensure documents don't expose unintended data
5. **Rate Limiting**: Limit document sends to prevent spam

---

## Implementation Checklist

- [ ] Create `/api/portal/documents` endpoint
- [ ] Implement PDF generation with Puppeteer
- [ ] Set up Vercel Blob storage
- [ ] Configure Resend for email notifications
- [ ] Create `portal_documents` table
- [ ] Build client portal document viewer
- [ ] Add signature capture (for estimates)
- [ ] Implement view tracking
- [ ] Set up analytics dashboard
- [ ] Test end-to-end flow

---

**Status**: Ready for implementation
**Estimated Time**: 6-8 hours
**Dependencies**: Vercel Blob, Resend, Puppeteer
