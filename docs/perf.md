# Performance Budgets & Optimization

## Overview

This document defines performance targets for skaiscrape.com and provides tooling for monitoring bundle size and Core Web Vitals.

---

## 1. Performance Budgets

### JavaScript Bundle Targets

| Route Type                                  | First Load JS        | Target   | Max    |
| ------------------------------------------- | -------------------- | -------- | ------ |
| Marketing pages (`/`, `/pricing`, `/about`) | **Current**: ~220 KB | < 220 KB | 250 KB |
| Dashboard (`/dashboard`)                    | **Current**: ~300 KB | < 300 KB | 350 KB |
| Settings (`/settings/*`)                    | **Current**: ~280 KB | < 280 KB | 330 KB |

**Rationale**:

- Marketing pages load minimal interactivity → tight budget
- Dashboard loads data tables, charts → moderate budget
- Settings has complex forms, file uploads → moderate budget

### Core Web Vitals Targets

| Metric                             | Good    | Needs Improvement | Poor     |
| ---------------------------------- | ------- | ----------------- | -------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | 2.5s - 4.0s       | > 4.0s   |
| **FID** (First Input Delay)        | < 100ms | 100ms - 300ms     | > 300ms  |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | 0.1 - 0.25        | > 0.25   |
| **FCP** (First Contentful Paint)   | < 1.8s  | 1.8s - 3.0s       | > 3.0s   |
| **TTFB** (Time to First Byte)      | < 800ms | 800ms - 1800ms    | > 1800ms |

**Test conditions**:

- Network: Fast 3G or 4G
- CPU: 4x slowdown
- Location: US East (Vercel edge function)

---

## 2. Bundle Analysis

### Running Bundle Analyzer

**Command**:

```bash
ANALYZE=true pnpm build
```

**Output**:

- Opens browser with interactive bundle visualization
- Shows size of each chunk (server, client, edge)
- Highlights largest dependencies

**What to look for**:

- ❌ **Large third-party packages** (> 50 KB gzipped)
- ❌ **Duplicate dependencies** (e.g., two date libraries)
- ❌ **Unused code** (tree-shaking failures)
- ✅ **Code splitting** (chunks under 150 KB)

### Current Bundle Breakdown

**Marketing pages** (~220 KB):

- Next.js framework runtime: ~90 KB
- React + React DOM: ~40 KB
- Shared components (shadcn/ui): ~50 KB
- Page-specific code: ~40 KB

**Dashboard** (~300 KB):

- Framework + React: ~130 KB
- Data tables (Radix, react-table): ~80 KB
- Charts (recharts): ~60 KB
- Page-specific code: ~30 KB

**Optimization opportunities**:

- [ ] Lazy load charts (`next/dynamic`)
- [ ] Code-split settings pages
- [ ] Tree-shake unused Radix components
- [ ] Replace heavy date library with lighter alternative

---

## 3. Monitoring Tools

### Lighthouse CI (Automated)

**Setup**: Already configured in `.github/workflows/` (see `10: Lighthouse CI` task)

**Triggered on**: Every PR, every push to main

**Reports**:

- Performance score (0-100)
- Core Web Vitals (LCP, FID, CLS)
- Accessibility, SEO, Best Practices scores
- Budget warnings if JS bundles exceed targets

**Viewing results**:

1. Go to GitHub Actions → Lighthouse CI
2. Download artifact: `lighthouse-report.html`
3. Open in browser

**Thresholds** (configured in `lighthouserc.json` if exists):

```json
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["warn", { "maxNumericValue": 300 }]
      }
    }
  }
}
```

### Real User Monitoring (RUM)

**Vercel Analytics** (if enabled):

- Real user LCP, FID, CLS data
- Geographic breakdown
- Device type (mobile, desktop, tablet)
- **Enable**: Vercel dashboard → Analytics → Enable

**Sentry Performance Monitoring**:

- Already integrated via `@sentry/nextjs`
- Tracks transaction durations
- Identifies slow API routes
- **View**: sentry.io → Performance

**Google Analytics 4** (optional):

- Custom events for Core Web Vitals
- Requires `web-vitals` package + GA4 snippet

---

## 4. Optimization Strategies

### Code Splitting

**Dynamic imports**:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/HeavyChart"), {
  loading: () => <Skeleton className="h-64" />,
  ssr: false, // Don't render on server if client-only
});
```

**Route-based splitting**:
Next.js automatically splits by route. No action needed.

**Component-based splitting**:

```tsx
// Only load PDF viewer when needed
const PDFViewer = dynamic(() => import("react-pdf-viewer"));
```

### Image Optimization

**Next.js Image component** (already in use):

```tsx
import Image from "next/image";

<Image
  src="/hero.webp"
  alt="Hero image"
  width={1200}
  height={630}
  priority // For LCP images
  quality={85} // Balance quality vs size
/>;
```

**Best practices**:

- Use WebP format for photos
- Provide `width` and `height` to prevent CLS
- Mark above-the-fold images with `priority`
- Lazy load off-screen images (default behavior)

### Font Optimization

**Already configured in `app/layout.tsx`**:

```tsx
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });
```

**`display: swap`** prevents FOIT (Flash of Invisible Text).

### Tree Shaking

**Ensure side-effect-free modules**:

```json
// package.json of library
{
  "sideEffects": false
}
```

**Import only needed components**:

```tsx
// ❌ Bad: imports entire library
import { Button, Dialog, Dropdown, ... } from '@radix-ui/react';

// ✅ Good: imports only Button
import { Button } from '@radix-ui/react-button';
```

---

## 5. Performance Testing

### Local Performance Audit

**Lighthouse (Chrome DevTools)**:

1. Open production site: https://skaiscrape.com
2. Right-click → Inspect → Lighthouse tab
3. Select "Performance", "Desktop" or "Mobile"
4. Click "Analyze page load"

**What to check**:

- LCP element (should be hero image or headline)
- Blocking resources (defer non-critical JS/CSS)
- Image formats (WebP vs JPEG)
- Cache headers (should be `immutable` for static assets)

### Load Testing

**Simple test with `curl`**:

```bash
time curl -o /dev/null -s https://skaiscrape.com
```

**Artillery load test**:

```bash
npm install -g artillery
artillery quick --count 100 --num 10 https://skaiscrape.com
```

**Expected results**:

- p50 latency: < 500ms
- p95 latency: < 1.5s
- p99 latency: < 3s

---

## 6. Bundle Size Trends

### Tracking Over Time

**GitHub Actions artifact comparison**:

1. Download bundle stats from previous build
2. Compare with current build
3. Flag regressions > 10%

**Manual tracking** (spreadsheet or docs):
| Date | Route | First Load JS | Delta |
|------|-------|---------------|-------|
| 2025-01-15 | `/` | 220 KB | +5 KB |
| 2025-01-10 | `/` | 215 KB | -3 KB |
| 2025-01-05 | `/` | 218 KB | baseline |

**Regression threshold**:

- **Alert** if any route increases > 20 KB
- **Block deploy** if any route exceeds max budget

---

## 7. Common Performance Issues

### Issue: Large LCP

**Symptoms**:

- LCP > 2.5s on mobile
- Hero image loads slowly

**Fixes**:

- Add `priority` to hero image
- Optimize image (compress, resize, WebP)
- Use CDN for image hosting (Cloudinary, Vercel)
- Preload LCP image: `<link rel="preload" as="image" href="/hero.webp">`

### Issue: High CLS

**Symptoms**:

- Layout shifts when images/fonts load
- CLS > 0.1

**Fixes**:

- Specify `width` and `height` for all images
- Use `font-display: swap` for fonts
- Reserve space for dynamic content (skeletons)
- Avoid inserting content above existing content

### Issue: Slow TTFB

**Symptoms**:

- TTFB > 800ms
- Server-side rendering takes too long

**Fixes**:

- Optimize database queries (indexes, LIMIT, WHERE)
- Cache API responses (Redis, Vercel KV)
- Use Static Site Generation (SSG) instead of SSR
- Enable Vercel Edge Functions for geo-proximity

### Issue: Large JS Bundle

**Symptoms**:

- First Load JS > 300 KB
- Slow page interactivity

**Fixes**:

- Lazy load non-critical components
- Remove unused dependencies (`pnpm prune`)
- Tree-shake libraries (check `sideEffects: false`)
- Code-split vendor bundles

---

## 8. Quick Reference

**Run bundle analyzer**:

```bash
ANALYZE=true pnpm build
```

**Run Lighthouse CI**:

```bash
pnpm run test:pw:sb  # Requires Storybook + Playwright
npx lhci autorun
```

**Check production build size**:

```bash
pnpm build
# Look for "First Load JS" column in output
```

**Measure Core Web Vitals (local)**:

1. Open production site
2. Chrome DevTools → Lighthouse → Run
3. Check "Performance" score and metrics

**Target**: Performance score > 90

---

**Last updated**: January 2025  
**Maintainer**: DevOps Team
