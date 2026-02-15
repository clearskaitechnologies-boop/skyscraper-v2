# Template Preview Assets

This directory contains preview assets for the Template Marketplace.

## Structure

```
template-previews/
├── pdfs/                 # PDF preview files
│   ├── water-damage-restoration.pdf
│   ├── roofing-specialist-report.pdf
│   └── public-adjuster-premium.pdf
└── thumbnails/           # Thumbnail images (SVG/PNG)
    ├── water-damage-restoration.svg
    ├── roofing-specialist-report.svg
    └── public-adjuster-premium.svg
```

## Adding New Templates

1. **Create PDF Preview**
   - Generate a sample PDF showing the template layout
   - Name it with a URL-safe slug: `my-template-name.pdf`
   - Place in `pdfs/`

2. **Create Thumbnail**
   - Create a 400x300px image (PNG or SVG)
   - Should represent the first page or key visual
   - Name it to match the PDF: `my-template-name.svg`
   - Place in `thumbnails/`

3. **Update Database**
   - Add `thumbnailUrl` and `previewPdfUrl` to the Template record
   - URLs should be: `/template-previews/pdfs/filename.pdf` and `/template-previews/thumbnails/filename.svg`

## Current Templates

| Template                  | Thumbnail | PDF |
| ------------------------- | --------- | --- |
| Water Damage Restoration  | ✅        | ✅  |
| Roofing Specialist Report | ✅        | ✅  |
| Public Adjuster Premium   | ✅        | ✅  |

## Notes

- All assets are served statically from `/public/template-previews/`
- SVG thumbnails are preferred for smaller file size and crisp rendering
- PDF files should be optimized for web viewing (< 500KB each)
- These are sample previews - production templates will have real generated content
