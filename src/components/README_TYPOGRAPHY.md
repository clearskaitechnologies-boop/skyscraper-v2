# Typography Primitives

Location: `src/components/typography.tsx`

## Components

- `PageTitle`: Page-level heading (rendered as `h1`). Use once per view. Size: `text-3xl md:text-4xl`, weight `font-semibold`.
- `SectionTitle`: Major section heading (rendered as `h2`). Size: `text-xl md:text-2xl`, weight `font-semibold`.
- `MetricValue`: High-emphasis numeric/stat display. Size: `text-2xl md:text-3xl`, weight `font-bold`, uses `tabular-nums` for aligned digits.

## Design Tokens

All components apply `text-text-primary` for reliable contrast on dark panels. Avoid ad hoc `text-2xl font-bold` usages in favor of these primitives.

## Extending

Provide additional spacing or color via `className` prop (e.g. `<PageTitle className="mb-6" />`). Do not alter base sizes unless performing a deliberate global scale change.

## Migration Guidance

1. Replace `h1.text-2xl.font-bold` with `<PageTitle>...`.
2. Replace `h2.text-xl.font-semibold` with `<SectionTitle>...`.
3. Replace large numeric blocks (`p.text-2xl.font-bold`) with `<MetricValue>`.
4. Leave specialized headings (hero marketing, report exports) for a second pass; they may need distinct responsive sizes.

## Accessibility

Preserve semantic order (`h1` then `h2`). Do not nest multiple `PageTitle` components on a single page. If a page lacked an `h1`, adding `PageTitle` improves navigability for assistive tech.
