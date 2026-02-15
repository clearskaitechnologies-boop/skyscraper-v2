# E-Signature & Public Signing Links - Implementation Guide

## Overview

This system provides a complete e-signature workflow with:

- Digital signature capture using canvas
- Public tokenized signing links
- Audit trail of all activities
- Email receipts via Resend
- Secure PDF storage with signatures

## 🗄️ Database Tables

### report_signatures

Stores all signature records with audit information:

- `signer_name`, `signer_email`
- `ip_address`, `user_agent` (for audit)
- `signature_path` (storage path to PNG)
- `signed_pdf_path` (final merged PDF)

### report_public_links

Tokenized public signing links:

- Expires after 7 days by default
- Unique token per link
- Tracks creator and creation time

### report_audit_events

Complete activity timeline:

- `esign.view` - Document viewed
- `esign.sign` - Document signed
- `link.generated` - Public link created
- `report.download` - PDF downloaded

## 📦 Components

### 1. SignaturePad

Canvas-based signature capture with touch support.

```tsx
import SignaturePad from "@/components/SignaturePad";

<SignaturePad
  onChange={(dataUrl) => {
    // dataUrl is the base64-encoded PNG
    console.log("Signature captured:", dataUrl);
  }}
/>;
```

**Features:**

- Touch and mouse support
- High DPI support
- Clear signature button
- Visual feedback when signature captured

### 2. NextStepsSign

Complete signing interface with form and signature pad.

```tsx
import NextStepsSign from "@/components/NextStepsSign";

<NextStepsSign
  reportId={report.id}
  defaultName={lead.client_name}
  defaultEmail={lead.client_email}
  onComplete={(result) => {
    console.log("Signed!", result);
    // result contains: signaturePath, signedPdfPath, receiptUrl
  }}
/>;
```

**Features:**

- Name and email inputs
- Terms acceptance checkbox
- Signature pad integration
- Success state with download link
- Automatic email receipt (if email provided)

### 3. PublicLinkGenerator

Generate and copy public signing links.

```tsx
import PublicLinkGenerator from "@/components/PublicLinkGenerator";

<PublicLinkGenerator reportId={report.id} />;
```

**Features:**

- One-click link generation
- Copy to clipboard
- Shows expiration date
- Audit logging

### 4. AuditTimeline

Real-time activity feed with subscriptions.

```tsx
import AuditTimeline from "@/components/AuditTimeline";

<AuditTimeline reportId={report.id} />;
```

**Features:**

- Live updates via Supabase realtime
- Icon-coded event types
- Expandable metadata
- Chronological ordering

## 🚀 Edge Functions

### create-signature

**Public endpoint** - No JWT required (for client signing).

Creates signature record and merges into PDF.

```typescript
const { data, error } = await supabase.functions.invoke("create-signature", {
  body: {
    reportId: "uuid",
    signerName: "John Doe",
    signerEmail: "john@example.com", // optional
    signatureDataUrl: "data:image/png;base64,...",
  },
});
```

**Returns:**

```json
{
  "ok": true,
  "signaturePath": "signatures/report-id/timestamp.png",
  "signedPdfPath": "signed/report-id/timestamp.pdf",
  "receiptUrl": "https://..."
}
```

### create-public-link

**Protected endpoint** - Requires JWT authentication.

Generates a tokenized public signing link.

```typescript
const { data, error } = await supabase.functions.invoke("create-public-link", {
  body: {
    reportId: "uuid",
    expiresInDays: 7, // optional, default 7
  },
});
```

**Returns:**

```json
{
  "ok": true,
  "link": "https://yourapp.lovable.app/sign/{token}",
  "token": "uuid",
  "expiresAt": "2024-01-15T00:00:00Z"
}
```

### resolve-public-link

**Public endpoint** - No JWT required.

Resolves a token to report data and records view event.

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/resolve-public-link?token=${token}`);
```

**Returns:**

```json
{
  "report": {
    "id": "uuid",
    "title": "Roof Inspection Report",
    "data": { ... }
  },
  "prefill": {
    "name": "Client Name",
    "email": "client@example.com",
    "address": "123 Main St"
  }
}
```

## 📄 Pages

### /sign/:token (PublicSign)

Public signing page - no authentication required.

**URL:** `https://yourapp.lovable.app/sign/abc123...`

**Features:**

- Token validation and expiration check
- Document details display
- Pre-filled client information
- NextStepsSign component integration
- Success confirmation

**Error States:**

- Invalid/expired token
- Report not found
- Network errors

## 💼 Usage Examples

### In Report Workbench

Add these sections to your report builder:

```tsx
import ExportPanelV2 from "@/components/ExportPanelV2";
import MockupPanelV2 from "@/components/MockupPanelV2";
import PublicLinkGenerator from "@/components/PublicLinkGenerator";
import AuditTimeline from "@/components/AuditTimeline";
import NextStepsSign from "@/components/NextStepsSign";
import PricingEditor from "@/components/PricingEditor";
import CodeCalloutsEditor from "@/components/CodeCalloutsEditor";

function ReportBuilder({ report }) {
  return (
    <div className="space-y-8">
      {/* Export section */}
      <section>
        <h2>Export Options</h2>
        <ExportPanelV2 reportId={report.id} />
      </section>

      {/* AI Mockups */}
      <section>
        <h2>AI Mockup Generator</h2>
        <MockupPanelV2 reportId={report.id} defaultAddress={report.data?.address} />
      </section>

      {/* Pricing */}
      <section>
        <h2>Pricing</h2>
        <PricingEditor
          value={report.data?.prices}
          onChange={(prices) => updateReport({ prices })}
        />
      </section>

      {/* Code Compliance */}
      <section>
        <h2>Code Compliance</h2>
        <CodeCalloutsEditor
          value={report.data?.codeCallouts}
          onChange={(callouts) => updateReport({ codeCallouts: callouts })}
        />
      </section>

      {/* Internal signing (for staff) */}
      <section>
        <h2>Sign Document</h2>
        <NextStepsSign reportId={report.id} onComplete={() => toast.success("Signed!")} />
      </section>

      {/* Public link generation */}
      <section>
        <h2>Client Signing</h2>
        <PublicLinkGenerator reportId={report.id} />
      </section>

      {/* Activity log */}
      <section>
        <h2>Activity</h2>
        <AuditTimeline reportId={report.id} />
      </section>
    </div>
  );
}
```

### Workflow Example

1. **Create Report** - Build your inspection report with photos, pricing, etc.
2. **Export PDF** - Use ExportPanelV2 to generate branded PDF
3. **Generate Link** - Use PublicLinkGenerator to create signing link
4. **Share Link** - Send link to client via email/SMS
5. **Client Signs** - Client visits `/sign/:token` page and signs
6. **Track Activity** - Monitor via AuditTimeline
7. **Receive Receipt** - Signed PDF automatically emailed to client

## 🔒 Security Features

### Row-Level Security (RLS)

- Signatures: Only report owner can view
- Public links: Anyone can read valid (non-expired) tokens
- Audit events: Only report owner can view

### Audit Trail

All actions are logged:

- Who accessed the document
- When signatures were captured
- IP addresses and user agents
- Link generation events

### Token Security

- Unique UUID per link
- 7-day expiration (configurable)
- One-time use recommended (regenerate for each client)
- Automatic expiration check

### PDF Security

- All PDFs stored in private `reports` bucket
- Short-lived signed URLs (10-60 min TTL)
- Signature images stored separately
- Original + signed versions preserved

## 📧 Email Configuration

To enable email receipts, add your Resend API key:

```bash
# In Supabase Edge Function Secrets
RESEND_API_KEY=re_xxx
```

**Email is sent when:**

- Client provides email in signing form
- `RESEND_API_KEY` is configured
- Signature successfully created

**Email contains:**

- Thank you message
- Report name
- Link to download signed PDF

## 🎨 Customization

### Signature Pad Styling

```tsx
// Adjust canvas size
canvas.width = 800 * dpr;
canvas.height = 300 * dpr;

// Adjust stroke style
ctx.lineWidth = 3;
ctx.strokeStyle = "#0EA5E9"; // Primary color
```

### Link Expiration

```typescript
// Custom expiration (1-30 days)
await supabase.functions.invoke("create-public-link", {
  body: {
    reportId,
    expiresInDays: 14, // 2 weeks
  },
});
```

### Email Templates

Edit `create-signature/index.ts` to customize email HTML:

```typescript
html: `
  <h1>Custom Header</h1>
  <p>Dear ${data.signerName},</p>
  <p>Your custom message here...</p>
`;
```

## 🐛 Troubleshooting

### Signature not capturing

- Check canvas ref initialization
- Verify touch events on mobile
- Check browser console for errors

### Public link not working

- Verify token hasn't expired
- Check if report exists
- Review edge function logs

### Email not sending

- Verify `RESEND_API_KEY` is set
- Check Resend dashboard for errors
- Ensure "from" email is verified domain

### PDF not downloading

- Check storage bucket permissions
- Verify signed URL generation
- Check file exists at path

## 📊 Analytics & Monitoring

Track key metrics using audit events:

```sql
-- Signing conversion rate
SELECT
  COUNT(DISTINCT CASE WHEN event_type = 'esign.view' THEN report_id END) as views,
  COUNT(DISTINCT CASE WHEN event_type = 'esign.sign' THEN report_id END) as signs,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN event_type = 'esign.sign' THEN report_id END) /
    NULLIF(COUNT(DISTINCT CASE WHEN event_type = 'esign.view' THEN report_id END), 0), 2) as conversion_rate
FROM report_audit_events
WHERE created_at >= NOW() - INTERVAL '30 days';
```

## 🚀 Next Steps

1. **PDF Merging** - Implement actual PDF merging with pdf-lib
2. **Multi-party Signing** - Support multiple signers per document
3. **SMS Notifications** - Send link via Twilio
4. **Document Templates** - Pre-built signature blocks
5. **Biometric Auth** - TouchID/FaceID verification
6. **Blockchain Verification** - Immutable signature records

## 📚 Resources

- [Supabase Storage Docs](https://supabase.com/docs/guides/storage)
- [Resend Email API](https://resend.com/docs)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

**Built with:** React + Vite + Supabase + TypeScript
**Deployed on:** Lovable Cloud
