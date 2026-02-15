# UI/UX System Technical Documentation

**Version:** 1.0.0  
**Date:** January 2025  
**Project:** SkaiScraper Platform  
**Sprint:** RAVEN UI/UX Polish (Phases 1-6)

---

## Table of Contents

1. [Overview](#overview)
2. [Design System Architecture](#design-system-architecture)
3. [Shared Component Library](#shared-component-library)
4. [Feature Implementations](#feature-implementations)
5. [Theming & Branding](#theming--branding)
6. [Responsive Design](#responsive-design)
7. [Accessibility Standards](#accessibility-standards)
8. [Testing Strategy](#testing-strategy)
9. [Performance Considerations](#performance-considerations)
10. [Future Enhancements](#future-enhancements)

---

## Overview

### Project Scope

The RAVEN sprint transformed SkaiScraper's UI/UX through systematic polish across 6 phases:

- **PHASE 1:** Page Polish (Leads, Claims, AI Tools, Branding)
- **PHASE 2:** Shared UI Kit Extraction (7 reusable components)
- **PHASE 3:** Feature Expansion (PDF, Evidence, Billing, Branding)
- **PHASE 4:** Testing Infrastructure (Route tests, Visual QA)
- **PHASE 5:** Documentation (Technical + Investor PDFs)
- **PHASE 6:** Production Deployment

### Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS v3.4+
- **Component Library:** shadcn/ui
- **Icons:** Lucide React
- **TypeScript:** v5.3+
- **Authentication:** Clerk (multi-tenant)
- **Database:** Prisma + PostgreSQL
- **Deployment:** Vercel

### Design Philosophy

**Principles:**

1. **Consistency:** Unified spacing, typography, and color system
2. **Accessibility:** WCAG 2.1 AA compliance (ARIA, keyboard navigation)
3. **Performance:** Code splitting, lazy loading, optimized images
4. **Scalability:** Reusable components with variant support
5. **Developer Experience:** TypeScript types, clear prop interfaces

---

## Design System Architecture

### Layout System

**Container Hierarchy:**

```tsx
PageShell (max-w-7xl, responsive padding)
  └─ SectionHeader (content organization)
      └─ Content Grid (gap-6, responsive columns)
```

**Spacing Scale:**

- **Container Padding:** `px-4 sm:px-6 lg:px-8`
- **Vertical Rhythm:** `py-8` (sections), `space-y-8` (content)
- **Card Gaps:** `gap-6` (grid), `space-y-4` (vertical)
- **Component Spacing:** `gap-2` (icon+text), `gap-4` (cards)

### Typography

**Heading Scale:**

```css
h1: text-3xl font-bold (page titles)
h2: text-2xl font-semibold (section headers)
h3: text-xl font-semibold (subsections)
h4: text-lg font-medium (card headers)
```

**Body Text:**

```css
Default: text-base text-slate-700
Secondary: text-sm text-slate-600
Muted: text-xs text-slate-500
```

### Color System

**Primary Palette:**

```css
Blue Gradient: from-blue-600 to-indigo-600
Purple Gradient: from-purple-600 to-pink-600
Emerald Gradient: from-emerald-600 to-teal-600
Orange Gradient: from-orange-600 to-red-600
```

**Semantic Colors:**

- **Default:** slate-600 (neutral actions)
- **Success:** green-600 (positive trends, completions)
- **Warning:** amber-600 (caution, pending states)
- **Info:** blue-600 (informational highlights)
- **Danger:** red-600 (errors, destructive actions)

**Backgrounds:**

```css
Card: bg-white border border-slate-200
Hover: hover:bg-slate-50
Active: active:bg-slate-100
```

### Shadows & Borders

**Shadow Scale:**

```css
Card: shadow-sm (subtle depth)
Hover: hover:shadow-lg (elevated cards)
Modal: shadow-xl (overlays)
```

**Border Radius:**

```css
Standard: rounded-xl (cards, modals)
Button: rounded-lg (interactive elements)
Badge: rounded-full (status indicators)
```

---

## Shared Component Library

### 1. PageShell

**Purpose:** Layout wrapper for all application pages.

**Props:**

```typescript
interface PageShellProps {
  title: string;
  subtitle?: string;
  emoji?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  gradient?: "blue" | "purple" | "emerald";
  children: React.ReactNode;
}
```

**Features:**

- Breadcrumb navigation with ChevronRight separators
- Gradient header variants (blue/purple/emerald)
- Action slot for buttons/CTAs (top-right)
- Responsive container (max-w-7xl)
- Emoji support for visual hierarchy

**Usage:**

```tsx
<PageShell
  title="Leads Management"
  subtitle="Track and manage incoming insurance leads"
  emoji="📊"
  breadcrumbs={[{ label: "Home", href: "/" }, { label: "Leads" }]}
  gradient="blue"
  actions={<Button>Add Lead</Button>}
>
  {/* Page content */}
</PageShell>
```

---

### 2. SectionHeader

**Purpose:** Organized content sections with visual hierarchy.

**Props:**

```typescript
interface SectionHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}
```

**Features:**

- Icon badge with emoji (gradient background)
- Title + subtitle stacking
- Action slot (right-aligned)
- Consistent spacing (mb-6)

**Usage:**

```tsx
<SectionHeader
  emoji="📈"
  title="Recent Activity"
  subtitle="Last 30 days performance"
  actions={
    <Button variant="outline" size="sm">
      View All
    </Button>
  }
/>
```

---

### 3. StatsCard

**Purpose:** Statistical display with icon badges and trend indicators.

**Props:**

```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  delta?: string;
  icon: React.ComponentType;
  intent?: "default" | "success" | "warning" | "info";
  trend?: "up" | "down" | "neutral";
}
```

**Intent Variants:**

- `default`: slate-600 (neutral metrics)
- `success`: green-600 (positive indicators)
- `warning`: amber-600 (cautionary metrics)
- `info`: blue-600 (informational stats)

**Trend Indicators:**

- `up`: ↑ green-600 (improvement)
- `down`: ↓ red-600 (decline)
- `neutral`: → slate-600 (stable)

**Usage:**

```tsx
<StatsCard
  title="Total Leads"
  value="1,247"
  delta="+12%"
  icon={Users}
  intent="success"
  trend="up"
/>
```

---

### 4. ActionCard

**Purpose:** Call-to-action cards with gradient backgrounds.

**Props:**

```typescript
interface ActionCardProps {
  title: string;
  description: string;
  icon?: React.ComponentType;
  emoji?: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "gradient-blue" | "gradient-purple" | "gradient-emerald";
}
```

**Variants:**

- `default`: white background, subtle hover
- `gradient-blue`: from-blue-600 to-indigo-600
- `gradient-purple`: from-purple-600 to-pink-600
- `gradient-emerald`: from-emerald-600 to-teal-600

**Interactions:**

- Hover: `scale-[1.02] shadow-lg` (elevation effect)
- Supports both `href` (Link) and `onClick` (button)

**Usage:**

```tsx
<ActionCard
  title="Upload Evidence"
  description="Add photos and documents to your claim"
  emoji="📸"
  variant="gradient-blue"
  href="/evidence"
/>
```

---

### 5. GradientBadge

**Purpose:** Icon badges with gradient backgrounds.

**Props:**

```typescript
interface GradientBadgeProps {
  icon: React.ComponentType;
  variant?: "blue" | "purple" | "emerald" | "orange" | "pink";
  size?: "sm" | "md" | "lg";
}
```

**Size Scale:**

- `sm`: w-8 h-8, icon w-4 h-4
- `md`: w-10 h-10, icon w-5 h-5 (default)
- `lg`: w-12 h-12, icon w-6 h-6

**Gradient Variants:**

```css
blue: from-blue-600 to-indigo-600
purple: from-purple-600 to-pink-600
emerald: from-emerald-600 to-teal-600
orange: from-orange-600 to-red-600
pink: from-pink-600 to-rose-600
```

**Usage:**

```tsx
<GradientBadge icon={Zap} variant="emerald" size="lg" />
```

---

### 6. EmptyState

**Purpose:** Centered empty state displays with CTAs.

**Props:**

```typescript
interface EmptyStateProps {
  emoji?: string;
  icon?: React.ComponentType;
  title: string;
  description: string;
  action?: React.ReactNode;
}
```

**Features:**

- Centered layout (text-center)
- Large emoji/icon (text-6xl or w-12 h-12)
- Muted description text (text-slate-600)
- Optional CTA button slot

**Usage:**

```tsx
<EmptyState
  emoji="📭"
  title="No leads yet"
  description="When you receive leads, they'll appear here"
  action={<Button>Import Leads</Button>}
/>
```

---

### 7. SkeletonList

**Purpose:** Loading skeletons matching actual content layouts.

**Props:**

```typescript
interface SkeletonListProps {
  variant?: "cards" | "rows" | "grid";
  count?: number;
}
```

**Variants:**

- `cards`: Vertical stack of card skeletons (h-32)
- `rows`: Table-like rows (h-16)
- `grid`: 3-column grid (responsive)

**Animation:**

```css
animate-pulse bg-slate-200 rounded-lg
```

**Usage:**

```tsx
{
  isLoading ? <SkeletonList variant="cards" count={3} /> : <LeadsList data={leads} />;
}
```

---

## Feature Implementations

### PDF Preview System

**Components:**

- `src/components/pdf/PdfPreviewModal.tsx`
- `src/lib/pdf/buildShowcase.ts`

**Features:**

1. **Zoom Controls:** 50% to 200% (step: 25%)
2. **Download Button:** Direct PDF download
3. **Fullscreen Overlay:** Backdrop blur, ESC to close
4. **Iframe Viewer:** Embedded PDF with responsive sizing

**Tech Stack:**

- Base: HTML iframe with PDF URL
- Future: Migrate to `react-pdf` or `pdfjs` for advanced controls

**Usage:**

```tsx
const [previewUrl, setPreviewUrl] = useState<string | null>(null);

<PdfPreviewModal
  documentUrl={previewUrl}
  title="Claim Report"
  open={!!previewUrl}
  onClose={() => setPreviewUrl(null)}
/>;
```

**Showcase Builder:**

```typescript
// Generate investor deck (HTML stub)
const pdfUrl = await buildInvestorDeck();

// Custom showcase with options
const customPdf = await buildShowcasePdf({
  title: "Product Demo",
  sections: ["features", "metrics", "testimonials"],
});
```

---

### Evidence Upload System

**File:** `src/app/(app)/evidence/page.tsx`

**Features:**

1. **Drag-and-Drop Zone:**
   - Hover effects (border-blue-500, bg-blue-50)
   - File input hidden (click to upload)
2. **File Validation:**
   - Allowed types: `image/*`, `application/pdf`
   - Max size: 10MB per file
   - Client-side validation with alerts
3. **File List:**
   - Previews with filename + size
   - Remove button for each file
4. **Upload Flow:**
   - Stub API: `fetch('/api/upload', { method: 'POST', body: formData })`
   - Success redirect to claims page

**Usage:**

```tsx
const handleFileDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const droppedFiles = Array.from(e.dataTransfer.files);
  validateAndAddFiles(droppedFiles);
};

const validateAndAddFiles = (newFiles: File[]) => {
  const validFiles = newFiles.filter((file) => {
    const isValidType = file.type.startsWith("image/") || file.type === "application/pdf";
    const isValidSize = file.size <= 10 * 1024 * 1024;
    return isValidType && isValidSize;
  });
  setFiles((prev) => [...prev, ...validFiles]);
};
```

---

### Billing & Token System

**File:** `src/app/(app)/billing/page.tsx`

**Components:**

1. **Token Usage Meter:**
   - Progress bar with percentage width
   - Current usage vs. total capacity (1247/5000)
   - Gradient fill (blue-600)
2. **Token Pack Cards:**
   - 4 tiers: $9 (1K), $19 (2.5K), $49 (7.5K), $299 (100K)
   - Popular badge (border-blue-500, ring-2)
   - Price + tokens + features list
3. **Invoice History Table:**
   - Date, description, amount, status
   - Status badges (success/warning)
   - Download link for PDFs

**Stripe Integration:**

```tsx
const handlePurchase = async (pack: number) => {
  const res = await fetch(`/api/checkout/token-pack?pack=${pack}`);
  const { url } = await res.json();
  window.location.href = url; // Redirect to Stripe checkout
};
```

**API Route:** `src/app/api/checkout/token-pack/route.ts`

```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pack = searchParams.get("pack");

  // TODO: Create Stripe checkout session
  // const session = await stripe.checkout.sessions.create({...});

  // Stub: redirect back with success flag
  return NextResponse.redirect("/billing?success=true");
}
```

---

### Multi-Tenant Branding

**File:** `src/lib/branding/resolveTheme.ts`

**Features:**

1. **Theme Resolution:**
   - Fetch org-specific branding by `orgId`
   - Fallback to default theme (blue gradient)
2. **Theme Variants:**
   - `default`: blue-600 → indigo-600
   - `purple`: purple-600 → pink-600
   - `emerald`: emerald-600 → teal-600
   - `orange`: orange-600 → red-600

**Theme Interface:**

```typescript
interface BrandTheme {
  primaryGradient: string;
  logoUrl?: string;
  accentColor: string;
  fontFamily?: string;
}
```

**Usage:**

```tsx
const theme = await resolveTheme(currentOrgId);

<div
  className={`bg-gradient-to-r ${theme.primaryGradient}`}
  style={{ fontFamily: theme.fontFamily }}
>
  {/* Branded content */}
</div>;
```

**Database Integration (TODO):**

```typescript
const orgBranding = await prisma.orgBranding.findFirst({
  where: { orgId },
});

return orgBranding
  ? {
      primaryGradient: orgBranding.gradientClasses,
      logoUrl: orgBranding.logoUrl,
      accentColor: orgBranding.accentColor,
      fontFamily: orgBranding.fontFamily,
    }
  : getThemeVariants().default;
```

---

## Theming & Branding

### CSS Variables (Future Enhancement)

**Planned Implementation:**

```css
:root {
  --color-primary: 59 130 246; /* blue-500 */
  --color-gradient-start: 37 99 235; /* blue-600 */
  --color-gradient-end: 79 70 229; /* indigo-600 */
  --font-family: "Inter", sans-serif;
}

[data-org="acme"] {
  --color-primary: 139 92 246; /* purple-500 */
  --color-gradient-start: 124 58 237; /* purple-600 */
  --color-gradient-end: 219 39 119; /* pink-600 */
}
```

**Usage:**

```tsx
<div className="bg-gradient-to-r from-[rgb(var(--color-gradient-start))] to-[rgb(var(--color-gradient-end))]">
```

### Logo Management

**Upload Flow:**

1. Admin uploads logo to `/api/branding/upload`
2. Stored in Firebase Storage or S3
3. URL saved to `orgBranding.logoUrl`
4. Theme resolver returns logo URL
5. PageShell displays org logo in header

---

## Responsive Design

### Breakpoint Strategy

**Tailwind Breakpoints:**

```css
sm: 640px (mobile landscape, small tablets)
md: 768px (tablets)
lg: 1024px (desktops)
xl: 1280px (large desktops)
2xl: 1536px (ultra-wide)
```

**Layout Patterns:**

**1. Stack → Grid:**

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
  {/* Cards stack on mobile, 2-col on tablet, 3-col on desktop */}
</div>
```

**2. Hidden → Visible:**

```tsx
<div className="hidden md:block">{/* Desktop-only sidebar */}</div>
```

**3. Text Scaling:**

```tsx
<h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{/* Responsive font sizes */}</h1>
```

### Mobile Optimizations

**Touch Targets:**

- Minimum: 44×44px (iOS guideline)
- Buttons: `py-3 px-6` (ample padding)
- Icon buttons: `p-3` (w-12 h-12 total)

**Navigation:**

- Mobile: Hamburger menu (≤768px)
- Desktop: Horizontal nav with dropdowns

**Content Priority:**

- Hide secondary info on mobile
- Use modals sparingly (sheet components preferred)
- Single-column forms

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

**Color Contrast:**

- Body text: 4.5:1 ratio (slate-700 on white)
- Large text (≥18px): 3:1 ratio
- Interactive elements: clear hover/focus states

**Keyboard Navigation:**

```tsx
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
```

**Focus Indicators:**

```css
focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
focus:outline-none
```

### ARIA Attributes

**Buttons:**

```tsx
<button aria-label="Close modal" onClick={onClose}>
  <X className="h-5 w-5" />
</button>
```

**Modals:**

```tsx
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">...</h2>
</div>
```

**Status Updates:**

```tsx
<div role="status" aria-live="polite">
  Loading...
</div>
```

### Screen Reader Support

**Skip Links:**

```tsx
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

**Semantic HTML:**

```tsx
<nav aria-label="Main navigation">
  <ul>...</ul>
</nav>

<main id="main-content">
  <article>...</article>
</main>
```

---

## Testing Strategy

### Route Testing

**Script:** `scripts/test-all-routes.sh`

**Coverage:**

- Marketing pages (/, /pricing, /about)
- Auth flows (/sign-in, /sign-up)
- CRM pages (/leads, /claims, /contacts, /evidence, /billing)
- AI tools (/ai-chat, /ai-models, /ai-prompts)
- Settings (/settings/profile, /settings/team, /branding)
- Health checks (/api/health/live, /api/health/ready)

**Usage:**

```bash
./scripts/test-all-routes.sh http://localhost:3000
```

**Output:**

```
Testing route: / ... ✅ 200
Testing route: /leads ... ✅ 200
Testing route: /api/health/live ... ✅ 200
```

---

### Visual QA Checklist

**File:** `scripts/visual-checklist.md`

**Categories:**

1. **Responsive Breakpoints** (mobile/tablet/desktop)
2. **Interactive States** (hover/focus/active)
3. **Component Consistency** (typography/spacing/colors)
4. **Loading States** (skeleton UI)
5. **Empty States** (not mistaken for errors)
6. **Forms** (validation, labels, errors)
7. **Accessibility** (ARIA, keyboard, screen reader)
8. **Dark Mode** (preparation for future)
9. **Performance** (images, bundle size, Lighthouse)
10. **Browser Testing** (Chrome, Firefox, Safari, Edge)

**Usage:**

- Manual testing per release
- Checkboxes for each item
- Record test metadata (date, tester, build version)

---

### Automated Testing (Recommended)

**Unit Tests (Vitest):**

```typescript
// StatsCard.test.tsx
import { render, screen } from '@testing-library/react';
import { StatsCard } from './StatsCard';
import { Users } from 'lucide-react';

test('renders stats with trend indicator', () => {
  render(
    <StatsCard
      title="Total Users"
      value="1,247"
      delta="+12%"
      icon={Users}
      trend="up"
    />
  );

  expect(screen.getByText('Total Users')).toBeInTheDocument();
  expect(screen.getByText('1,247')).toBeInTheDocument();
  expect(screen.getByText('+12%')).toBeInTheDocument();
});
```

**Visual Regression (Playwright + Storybook):**

```typescript
// Task: "09: Playwright vs Storybook"
// Tests snapshot consistency across components
```

**Lighthouse CI:**

```bash
# Task: "10: Lighthouse CI"
npx lhci autorun
```

**Performance Targets:**

- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >90

---

## Performance Considerations

### Code Splitting

**Dynamic Imports:**

```tsx
import dynamic from "next/dynamic";

const PdfPreviewModal = dynamic(() => import("@/components/pdf/PdfPreviewModal"), { ssr: false });
```

**Route-based Splitting:**

- Next.js automatically splits by page route
- Shared components bundle together

### Image Optimization

**Next.js Image:**

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="SkaiScraper Logo"
  width={200}
  height={50}
  priority // Above-the-fold images
/>;
```

**Lazy Loading:**

```tsx
<Image src="/hero.jpg" alt="Hero" loading="lazy" width={1200} height={600} />
```

### Bundle Size

**Current Target:** <200KB initial JS bundle

**Optimization Strategies:**

1. Tree-shake unused Lucide icons
2. Use dynamic imports for heavy components
3. Defer non-critical CSS
4. Minimize third-party dependencies

**Analysis:**

```bash
pnpm run build
# Check .next/analyze/ for bundle report
```

---

## Future Enhancements

### Phase 7 (Planned): Advanced Features

**1. Dark Mode:**

- CSS variables for theme switching
- `dark:` variants in Tailwind
- User preference storage (localStorage + DB)
- Automatic system preference detection

**2. Component Animations:**

- Framer Motion for page transitions
- Stagger animations for lists
- Microinteractions (button clicks, modals)

**3. Advanced PDF Tools:**

- Annotation layer (react-pdf-annotator)
- Multi-page thumbnails
- Text search within PDFs
- Form filling

**4. Real-time Collaboration:**

- Live cursors on evidence uploads
- Shared claim notes with WebSockets
- Activity feed for team actions

**5. Analytics Dashboard:**

- Recharts for data visualization
- Token usage trends
- Lead conversion funnels
- Team performance metrics

---

### Phase 8 (Planned): Refactor Existing Pages

**Option C Deferred Refactors:**

- `/leads` → Use new PageShell, StatsCard
- `/claims` → Integrate ActionCard for claim actions
- `/ai-chat` → Add SkeletonList for message loading
- `/settings/profile` → Use SectionHeader for organization

**Benefits:**

- Reduced code duplication
- Consistent design language
- Easier maintenance

---

## Appendix

### File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── PageShell.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── StatsCard.tsx
│   │   ├── ActionCard.tsx
│   │   ├── GradientBadge.tsx
│   │   ├── EmptyState.tsx
│   │   └── SkeletonList.tsx
│   ├── pdf/
│   │   └── PdfPreviewModal.tsx
│   └── ... (other components)
├── lib/
│   ├── pdf/
│   │   └── buildShowcase.ts
│   ├── branding/
│   │   └── resolveTheme.ts
│   └── ... (other utilities)
├── app/
│   ├── (app)/
│   │   ├── leads/page.tsx
│   │   ├── claims/page.tsx
│   │   ├── evidence/page.tsx
│   │   ├── billing/page.tsx
│   │   └── ... (other app pages)
│   └── api/
│       ├── checkout/
│       │   └── token-pack/route.ts
│       └── ... (other API routes)
scripts/
├── test-all-routes.sh
└── visual-checklist.md
docs/
├── UI_UX_SYSTEM_TECH.md (this file)
├── UI_UX_SYSTEM_TECH.pdf (generated)
└── SKAISCRAPER_PRODUCT_SHOWCASE.pdf (investor deck)
```

---

### Git Commit History

**RAVEN Sprint Commits:**

```
ea8f106 - PHASE 4: chore(test): route tests + visual QA checklist
5075e9f - PHASE 3: feat(expand): new features using shared UI kit
9c18f90 - PHASE 2: chore(ui): extract shared UI kit
4821243 - feat(polish): Add loading states for Leads and Claims pages
a86caa4 - feat(polish): PHASE 1.3-1.4 - Polish AI Tools and Branding
74d5895 - feat(polish): PHASE 1.1-1.2 - Polish Leads and Claims pages
```

---

### Dependencies

**UI/UX Related:**

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "@clerk/nextjs": "^4.29.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

**Future Additions:**

- `framer-motion` (animations)
- `react-pdf` (advanced PDF viewer)
- `recharts` (analytics charts)
- `date-fns` (date formatting)

---

### Contact & Support

**Developer Team:**

- **Project Lead:** Damien
- **GitHub Repo:** BuildingWithDamien/PreLossVision
- **Branch:** feat/phase3-banner-and-enterprise

**Documentation Versions:**

- Technical Doc: `docs/UI_UX_SYSTEM_TECH.md`
- Developer PDF: `docs/UI_UX_SYSTEM_TECH.pdf`
- Investor Deck: `docs/SKAISCRAPER_PRODUCT_SHOWCASE.pdf`

---

**End of Technical Documentation**
