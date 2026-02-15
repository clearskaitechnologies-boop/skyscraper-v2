# Template Pipeline Map (Marketplace → Preview → Generate)

This document is a quick, repo-local route map for the premium template system. It is intended to prevent regressions where preview PDFs look like “.txt” (tiny placeholder PDFs) or API routes redirect to HTML sign-in.

## Public Marketplace (signed-out supported)

- `GET /api/templates/marketplace`
  - Source: DB `template` (published) → fallback: registry `ALL_TEMPLATES`
  - Always returns same-origin proxy URLs:
    - `thumbnailUrl: /api/templates/{id}/thumbnail`
    - `previewPdfUrl: /api/templates/{id}/pdf?preview=1`

- `GET /reports/templates/marketplace`
  - Public page that fetches `/api/templates/marketplace` and renders cards.
  - Preview link: `/reports/templates/{slugOrId}/preview`

- `GET /api/templates/marketplace/[slug]`
  - Public template lookup by slug for the preview page.
  - Returns proxy URLs for thumbnail + preview PDF.

## PDF Preview Serving (embed-safe)

- `GET /api/templates/[templateId]/pdf?preview=1[&download=1][&claimId=…]`
  - Must always return `Content-Type: application/pdf`.
  - Must never return HTML (no redirects).
  - Responsibilities:
    - Signed-out or missing context: serve a premium static preview PDF (from `public/templates/*-premium/preview.pdf`).
    - Signed-in + context: generate branded/claim-aware preview PDF via HTML→PDF.
    - Always fallback to a premium static preview if dynamic render fails.
    - Only use a tiny placeholder PDF as an ultra-last resort.

## Thumbnail Serving (never 404 in normal use)

- `GET /api/templates/[templateId]/thumbnail`
  - Must always return 200 with a valid image payload.
  - Strategy:
    - Prefer DB `thumbnailUrl` if present (http or public-relative).
    - Otherwise check registry / local public / R2 candidates.
    - Final fallback: deterministic placeholder SVG (includes template name/id).

## Org-scoped Template Preview (signed-in)

- `GET /api/templates/[templateId]/preview`
  - Org-scoped endpoint used to merge template layout + org branding.
  - Uses `withOrgScope` and pulls `org_branding`.

## Report Generation (claim-aware, tokened)

- `POST /api/reports/generate`
  - Master generation pipeline:
    1. `POST /api/reports/context`
    2. `POST /api/reports/compose`
    3. Render HTML via `renderReportHtml`
    4. HTML→PDF via `generatePDFWithTimeout`
    5. Upload to Supabase exports
    6. Return signed URL

## Claims Workspace (API JSON only)

- `GET /api/claims/[claimId]/workspace`
  - Must return JSON `401` for unauthenticated API requests (never `307` → `/sign-in`).
  - Supports demo-safe payload when `claimId=test` or `DEMO_MODE=true`.
