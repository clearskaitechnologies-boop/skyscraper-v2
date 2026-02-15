# Premium Template Assets (Marketplace)

This folder contains **deterministic, committed** premium blank-layout assets used by the Template Marketplace.

## Folder convention

Each marketplace template slug gets a folder:

- `public/templates/<premiumFolder>/preview.pdf` — premium blank layout preview (AI-friendly)
- `public/templates/<premiumFolder>/thumbnail.png` — deterministic thumbnail (1200×630)
- `public/templates/<premiumFolder>/template.hbs` — canonical Handlebars layout
- `public/templates/<premiumFolder>/styles.css` — canonical PDF CSS

Where `<premiumFolder>` is:

- `<slug>-premium` for most templates
- `<slug>` when the slug already ends with `-premium`

Category fallback thumbnails live here:

- `public/templates/_defaults/<category>.png`

`<category>` is slugified (e.g. `Retail & Quotes` → `retail-and-quotes.png`).

## Generate / refresh assets

Run:

- `pnpm gen:premium-previews`

This regenerates **all** premium previews + thumbnails from fixed demo data.

## How previews are served

Marketplace previews use the proxy route:

- `/api/templates/<templateId>/pdf?preview=1`

That route serves the premium blank layout `preview.pdf` from the normalized `<premiumFolder>` when present, ensuring previews are always “premium blank layouts” (not tiny placeholder PDFs).
