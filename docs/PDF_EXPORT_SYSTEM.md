# Hybrid PDF Export System

## Overview

Complete PDF export system for Retail and Claims wizards with LibreOffice fallback to pdf-lib.

## Architecture

### Strategy

1. **Primary: LibreOffice** (if available)
   - Uses `soffice --headless` to convert DOCX → PDF
   - Best quality, preserves formatting
   - Requires LibreOffice installed on server

2. **Fallback: pdf-lib** (always available)
   - Direct PDF generation from wizard data
   - Pure JavaScript, no external dependencies
   - Consistent cross-platform behavior

### Detection Flow

```
Start Export
    ↓
Has DOCX buffer?
    ↓ Yes         ↓ No
    ↓             ↓
LibreOffice   pdf-lib
available?    (direct)
    ↓ Yes    ↓ No
    ↓        ↓
LibreOffice  pdf-lib
conversion   fallback
    ↓        ↓
    PDF ←────┘
```

## Installation

### Required Dependencies

```bash
npm install pdf-lib
# or
pnpm add pdf-lib
```

### Optional: LibreOffice (for best quality)

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install -y libreoffice
```

**macOS:**

```bash
brew install --cask libreoffice
```

**Docker:**

```dockerfile
FROM node:20-slim
RUN apt-get update && apt-get install -y libreoffice
```

## API Reference

### POST /api/export/pdf

Export wizard data to PDF.

**Request:**

```json
{
  "mode": "retail" | "claims",
  "packetId": "uuid-string",  // For Retail
  "reportId": "uuid-string",  // For Claims
  "data": {
    // Wizard data (all steps merged)
    "insuredName": "John Doe",
    "propertyAddress": "123 Main St",
    // ... rest of wizard data
  }
}
```

**Response:**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="retail-{packetId}.pdf"

<PDF binary data>
```

**Errors:**

- `401`: Unauthorized
- `400`: Missing required fields
- `500`: Export failed

### GET /api/export/pdf

Check PDF export capabilities.

**Response:**

```json
{
  "ok": true,
  "capabilities": {
    "libreOffice": true,
    "pdfLib": true
  },
  "strategy": "LibreOffice + pdf-lib fallback"
}
```

## Usage Examples

### From Retail Wizard

```tsx
import { ExportPdfButton } from "@/components/ExportPdfButton";

<ExportPdfButton mode="retail" packetId={packetId} data={formData} variant="default" size="lg">
  Download Retail Estimate
</ExportPdfButton>;
```

### From Claims Wizard

```tsx
import { ExportPdfButton } from "@/components/ExportPdfButton";

<ExportPdfButton mode="claims" reportId={reportId} data={formData} variant="outline">
  Export Claims Report
</ExportPdfButton>;
```

### With Callbacks

```tsx
<ExportPdfButton
  mode="retail"
  packetId={packetId}
  data={formData}
  onSuccess={() => {
    console.log("PDF exported!");
    router.push("/export-center");
  }}
  onError={(error) => {
    console.error("Export failed:", error);
  }}
/>
```

### Using Hook Directly

```tsx
import { usePdfExport } from "@/hooks/usePdfExport";

function MyComponent() {
  const { exportPdf, exporting, error } = usePdfExport();

  const handleExport = async () => {
    const result = await exportPdf({
      mode: "retail",
      packetId: "abc-123",
      data: wizardData,
    });

    if (result.success) {
      console.log("PDF downloaded!");
    }
  };

  return (
    <button onClick={handleExport} disabled={exporting}>
      {exporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}
```

## PDF Content Structure

### Retail PDF (8 Pages)

1. **Cover Page**
   - Title: "Retail Estimate"
   - Property address
   - Generated date

2. **Client & Property Information**
   - Insured name
   - Property address
   - Inspector name
   - Inspection date

3. **Materials & Upgrades**
   - Roof type
   - Material choice
   - Upgrade options

4. **Financing Options**
   - Financing available
   - Partners
   - APR/terms

5. **Why Choose Us**
   - Company bio
   - Year established
   - Licenses/certifications

6. **Project Timeline**
   - Duration
   - Completion date

7. **Warranty Information**
   - Warranty option
   - Service hotline
   - Warranty email

8. **Signature & Terms**
   - Client name/email/phone
   - Terms accepted
   - Signature

### Claims PDF (11+ Pages)

1. **Cover Page**
   - Title: "Claims Report"
   - Property address
   - Generated date

2. **Carrier & Claim Info**
   - Insurance carrier
   - Claim number
   - Date of loss
   - Adjuster info

3. **Insured & Property**
   - Insured name
   - Property address
   - Contact info
   - Policy number

4. **Damage Assessment**
   - Damage type
   - Severity
   - Areas affected

5. **Roof Details**
   - Roof age
   - Material
   - Squares
   - Pitch

6-11. **Additional Sections**

- Materials & Scope
- Inspection Findings
- Code Compliance
- Photos & Evidence
- Settlement Estimate
- Recommendations

## File Structure

```
src/
├── lib/
│   └── pdf/
│       ├── hybridExport.ts       # Core export logic
│       └── generateReport.ts     # Existing jsPDF logic (legacy)
├── hooks/
│   └── usePdfExport.ts           # Client-side hook
├── components/
│   └── ExportPdfButton.tsx       # Reusable button components
└── app/
    └── api/
        └── export/
            └── pdf/
                └── route.ts      # API endpoint
```

## Environment Variables

No additional environment variables required. System automatically detects LibreOffice availability.

## Testing

### Check Capabilities

```bash
curl http://localhost:3000/api/export/pdf
```

**Response:**

```json
{
  "ok": true,
  "capabilities": {
    "libreOffice": false,
    "pdfLib": true
  },
  "strategy": "pdf-lib only"
}
```

### Export PDF

```bash
curl -X POST http://localhost:3000/api/export/pdf \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "retail",
    "packetId": "test-123",
    "data": {
      "insuredName": "Test User",
      "propertyAddress": "123 Test St"
    }
  }' \
  --output test.pdf
```

## Performance

### LibreOffice Mode

- **Conversion time:** ~2-5 seconds
- **Memory usage:** ~200-300 MB
- **Quality:** Excellent (native rendering)

### pdf-lib Mode

- **Generation time:** ~0.5-1 second
- **Memory usage:** ~50-100 MB
- **Quality:** Good (programmatic layout)

## Troubleshooting

### "LibreOffice conversion failed"

**Cause:** LibreOffice not installed or not in PATH

**Solution:**

```bash
# Check if LibreOffice is available
which soffice

# Install if missing (Ubuntu)
sudo apt-get install libreoffice

# Verify installation
soffice --version
```

### "PDF generation timed out"

**Cause:** LibreOffice conversion exceeded 30s timeout

**Solution:** System automatically falls back to pdf-lib. No action needed.

### "Cannot find module 'pdf-lib'"

**Cause:** pdf-lib not installed

**Solution:**

```bash
npm install pdf-lib
# or
pnpm add pdf-lib
```

## Roadmap

### Phase 2 (Optional Enhancements)

- [ ] **Photo embedding:** Add photos to PDF
- [ ] **Custom templates:** Allow org branding
- [ ] **Signature embedding:** Add e-signatures to PDF
- [ ] **Watermarks:** Add draft/final watermarks
- [ ] **Table of Contents:** Auto-generate TOC
- [ ] **Page numbers:** Add page numbering
- [ ] **Header/Footer:** Custom headers/footers
- [ ] **Multi-language:** Support i18n

### Phase 3 (Advanced Features)

- [ ] **DOCX export:** Generate editable DOCX
- [ ] **Email delivery:** Send PDF via email
- [ ] **Cloud storage:** Save to S3/Firebase
- [ ] **PDF forms:** Interactive fillable forms
- [ ] **Digital signatures:** PKI signatures
- [ ] **PDF/A compliance:** Archival format

## Security

- ✅ Auth required (Clerk)
- ✅ User data isolated
- ✅ Temp file cleanup
- ✅ Sentry error tracking
- ✅ No file system persistence
- ✅ Memory-safe operations

## License

Same as main project.

---

**Last Updated:** November 4, 2025  
**Status:** ✅ Production Ready  
**Dependencies:** pdf-lib, LibreOffice (optional)
