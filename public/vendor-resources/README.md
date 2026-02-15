# Vendor Resources

This directory contains locally hosted PDF resources for vendor profiles.

## Why Local Hosting?

External vendor URLs often:

- Return 404 errors due to content reorganization
- Require session/authentication
- Are geo-gated by location
- Change without notice
- Break during demos

By hosting PDFs locally, we guarantee 100% uptime for vendor resource downloads.

## Directory Structure

```
/vendor-resources/
├── gaf/
│   ├── timberline-hdz-shingles-brochure.pdf
│   ├── system-warranty-guide.pdf
│   └── residential-installation-manual.pdf
├── abc-supply/
│   ├── 2024-product-catalog.pdf
│   └── accessories-guide.pdf
├── elite/
│   └── product-line-card.pdf
├── srs/
│   └── residential-catalog.pdf
└── westlake/
    ├── product-catalog.pdf
    └── installation-guide-vinyl-siding.pdf
```

## Adding New Resources

1. Create PDF file (real content, not placeholder)
2. Place in `/public/vendor-resources/{vendor-slug}/`
3. Update `prisma/seed-vendors.ts` with new resource entry
4. Run `pnpm seed:vendors` to update database
5. Test download works in production

## URL Format

All resources use absolute paths from domain root:

```
/vendor-resources/{vendor-slug}/{filename}.pdf
```

Examples:

- `/vendor-resources/gaf/timberline-hdz-shingles-brochure.pdf`
- `/vendor-resources/westlake/product-catalog.pdf`

## Production URLs

After deployment, resources are accessible at:

- `https://skaiscraper.vercel.app/vendor-resources/gaf/timberline-hdz-shingles-brochure.pdf`
- `https://skaiscraper.vercel.app/vendor-resources/westlake/product-catalog.pdf`

## Testing

Run self-test script:

```bash
node scripts/test-vendor-resources.cjs
```

This checks:

- All PDF files exist
- Files are valid PDFs
- File sizes are reasonable
- URLs in database match files on disk

## File Size Guidelines

- Product brochures: 1-3 MB
- Installation guides: 2-5 MB
- Full catalogs: 5-10 MB
- Keep files under 15 MB when possible

## Content Guidelines

PDFs should contain:

- Vendor branding
- Product information
- Real content (not lorem ipsum)
- Contact information
- Copyright notice
- Current year

## Regenerating PDFs

To regenerate all vendor PDFs:

```bash
node scripts/create-vendor-resource-pdfs.cjs
```

This creates fresh PDFs with updated content and current year.

---

**Last Updated:** December 2025  
**Maintained By:** SkaiScraper Development Team
