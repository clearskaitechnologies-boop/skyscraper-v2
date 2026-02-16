# 🧹 COMPONENT REDUNDANCY MASTER PLAN

## UI Duplication Sweep — Pro Side + Client Side

> **Generated:** 2026-02-15
> **Scope:** Full codebase audit of `src/components/`, `src/app/`, `src/layouts/`, `src/features/`, `src/modules/`, `src/client/`
> **Goal:** Eliminate every duplicate UI component, unify design system, delete dead code

---

## SEVERITY LEGEND

| Tag              | Meaning                                                   |
| ---------------- | --------------------------------------------------------- |
| 🔴 P0 — CRITICAL | 5+ duplicates OR active tech-debt bomb (fix first)        |
| 🟠 P1 — HIGH     | 2–4 duplicates, actively imported, user-facing divergence |
| 🟡 P2 — MEDIUM   | Low-usage duplication or style inconsistency              |
| ⚪ P3 — CLEANUP  | Dead code, 0 importers — safe delete                      |

---

## PHASE 0 · DEAD CODE PURGE ⚪

> **Effort:** 1 day · **Risk:** None · **Do this FIRST**

Delete every component with **0 importers**. No consolidation needed — just delete.

| #    | File to Delete                                        | Component                       | Reason                                                          |
| ---- | ----------------------------------------------------- | ------------------------------- | --------------------------------------------------------------- |
| 0-1  | `src/components/ConditionalNav.tsx`                   | `ConditionalNav`                | 0 importers                                                     |
| 0-2  | `src/components/UnifiedNavigation.tsx`                | `UnifiedNavigation`             | 0 importers                                                     |
| 0-3  | `src/components/ui/GradientButton.tsx`                | `GradientButton`                | 0 importers, redundant with `StandardButton`                    |
| 0-4  | `src/components/ui/PageShell.tsx`                     | `PageShell`                     | 0 importers                                                     |
| 0-5  | `src/app/(marketing)/_components/MarketingHeader.tsx` | `MarketingHeader`               | 0 importers                                                     |
| 0-6  | `src/components/RecentActivity.tsx`                   | `RecentActivity` (root)         | 2 importers but stub with mock data — migrate to `ActivityFeed` |
| 0-7  | `src/client/` directory (all files)                   | `ClientLayout`, `Sidebar`, etc. | React Router + Supabase auth — entire legacy SPA shell          |
| 0-8  | `src/components/TopNav.jsx`                           | `TopNav`                        | Legacy JSX, old "Preloss Vision" branding                       |
| 0-9  | `src/app/(site)/layout.tsx`                           | Site layout                     | Duplicate `<html>/<body>` tags, no child pages                  |
| 0-10 | `src/app/(portal)/` directory                         | Portal legacy routes            | Token-based resolve, deprecated                                 |
| 0-11 | `src/app/(client-portal)/layout.tsx` + children       | Bare client-portal              | No nav, no auth, abandoned experiment                           |

**Verification step:** After each delete, run `pnpm build` to confirm no broken imports.

- [ ] 0-1: Delete `ConditionalNav.tsx`
- [ ] 0-2: Delete `UnifiedNavigation.tsx`
- [ ] 0-3: Delete `GradientButton.tsx`
- [ ] 0-4: Delete `PageShell.tsx`
- [ ] 0-5: Delete `MarketingHeader.tsx`
- [ ] 0-6: Delete root `RecentActivity.tsx` (update 2 importers → `ActivityFeed`)
- [ ] 0-7: Delete `src/client/` directory
- [ ] 0-8: Delete `TopNav.jsx`
- [ ] 0-9: Delete `src/app/(site)/` directory
- [ ] 0-10: Delete `src/app/(portal)/` directory
- [ ] 0-11: Delete `src/app/(client-portal)/` directory
- [ ] 0-12: Run `pnpm build` — verify zero breakage

---

## PHASE 1 · NOTIFICATION BELL 🔴 P0

> **5 implementations → 1** · Effort: 2–3 hours

### Current State

| File                                              | Data Source                             | Used In       |
| ------------------------------------------------- | --------------------------------------- | ------------- |
| `src/components/NotificationBell.tsx`             | Fetches `/api/notifications`            | Unknown       |
| `src/components/ui/NotificationBell.tsx`          | localStorage `proactive_alerts`         | Unknown       |
| `src/app/(app)/_components/NotificationBell.tsx`  | Fetches `/api/notifications`, polls 30s | App layout    |
| `src/app/portal/_components/NotificationBell.tsx` | Fetches `/api/notifications`, Popover   | Portal layout |
| `src/modules/navigation/NotificationBell.tsx`     | Fetches `/api/notifications`, Popover   | Module nav    |

### Target

**Single file:** `src/components/notifications/NotificationBell.tsx`

```
Props:
  - variant: 'pro' | 'client'      // controls badge styling & empty text
  - pollInterval?: number            // default 30000
  - maxVisible?: number              // default 5
  - onNotificationClick?: (id) => void
```

### Execution

- [ ] 1-1: Create `src/components/notifications/NotificationBell.tsx` — unified component
- [ ] 1-2: Update `src/app/(app)/layout.tsx` → import from new path
- [ ] 1-3: Update `src/app/portal/layout.tsx` → import from new path
- [ ] 1-4: Update `src/modules/navigation/` → import from new path
- [ ] 1-5: Delete all 5 old files
- [ ] 1-6: `pnpm build` — verify

---

## PHASE 2 · STAT / KPI CARD EXPLOSION 🔴 P0

> **8+ variants → 2 (primitive + data-wrapper)** · Effort: 4–6 hours

### Current State

| File                                                  | Export               |        Importers         | Notes                        |
| ----------------------------------------------------- | -------------------- | :----------------------: | ---------------------------- |
| `src/components/ui/StatCard.tsx`                      | `StatCard`           |            4             | 179 lines, gradients, trends |
| `src/components/ui/StatsCard.tsx`                     | `StatsCard`          |            2             | 67 lines, intent colors      |
| `src/components/ui/KpiCard.tsx`                       | `KpiCard`            |            2             | Framer-motion animated       |
| `src/components/ui/GlassCard.tsx`                     | `GlassCard`          |            6             | Glass morphism card          |
| `src/components/crm/StatsCards.tsx`                   | `StatsCards`         | Server component, Prisma |
| `src/app/(app)/dashboard/_components/StatsCards.tsx`  | `StatsCards`         |   Client, fetches API    |
| `src/components/DashboardKPIs.tsx`                    | `DashboardKPIs`      |            3             | KPI grid                     |
| `src/components/kpi-dashboard/KPIDashboardClient.tsx` | `KPIDashboardClient` |       SWR wrapper        |
| `src/components/dashboard/KpiCardsClient.tsx`         | `KpiCardsClient`     |     Another KPI grid     |

### Target

**Primitive:** `src/components/ui/MetricCard.tsx`

```
Props:
  - label: string
  - value: string | number
  - trend?: { direction: 'up' | 'down' | 'flat'; value: string }
  - icon?: LucideIcon
  - variant?: 'default' | 'glass' | 'gradient' | 'outline'
  - intent?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  - sparkData?: number[]
  - animate?: boolean
```

**Data wrapper:** `src/components/dashboard/MetricGrid.tsx`

```
Props:
  - metrics: MetricCardProps[]
  - columns?: 2 | 3 | 4
  - loading?: boolean
```

### Execution

- [ ] 2-1: Build `MetricCard.tsx` — merge best of StatCard (gradients/trends) + GlassCard (glass variant) + KpiCard (animation)
- [ ] 2-2: Build `MetricGrid.tsx` — layout wrapper
- [ ] 2-3: Migrate 4 `StatCard` importers → `MetricCard`
- [ ] 2-4: Migrate 2 `StatsCard` importers → `MetricCard`
- [ ] 2-5: Migrate 2 `KpiCard` importers → `MetricCard`
- [ ] 2-6: Migrate 6 `GlassCard` importers → `MetricCard variant="glass"`
- [ ] 2-7: Consolidate `DashboardKPIs`, `KpiCardsClient`, `KPIDashboardClient` into `MetricGrid` + data hooks
- [ ] 2-8: Delete all 9 old files
- [ ] 2-9: `pnpm build` — verify

---

## PHASE 3 · TOAST SYSTEM WAR 🔴 P0

> **3 toast systems → 1 (sonner)** · Effort: 3–4 hours

### Current State

| System                                                              | Mechanism                   |          Usage           |
| ------------------------------------------------------------------- | --------------------------- | :----------------------: |
| **sonner** (`src/components/ui/sonner.tsx`)                         | `toast()` from `sonner`     | **100+ files** ✅ Winner |
| **shadcn toast** (`src/components/ui/use-toast.ts` + `toaster.tsx`) | `useToast()` hook           |        ~20 files         |
| **Custom context** (`src/components/toast/ToastProvider.tsx`)       | `useToast()` custom context |   ~1 file (app layout)   |
| **Root ToastProvider** (`src/components/ToastProvider.tsx`)         | Another custom wrapper      |         Unknown          |

### Target

**Keep only:** `sonner` via `src/components/ui/sonner.tsx`

### Execution

- [ ] 3-1: Grep all `useToast()` consumers (from shadcn `use-toast.ts`)
- [ ] 3-2: Migrate each to `import { toast } from 'sonner'` — ~20 files
- [ ] 3-3: Remove `ToastProvider` from `src/app/(app)/layout.tsx`
- [ ] 3-4: Delete `src/components/ui/use-toast.ts`
- [ ] 3-5: Delete `src/components/ui/toaster.tsx` (shadcn Toaster)
- [ ] 3-6: Delete `src/components/toast/` directory
- [ ] 3-7: Delete `src/components/ToastProvider.tsx`
- [ ] 3-8: `pnpm build` — verify

---

## PHASE 4 · EMPTY / ERROR / LOADING STATE CHAOS 🔴 P0

> **9+ state components → 3 canonical** · Effort: 3–4 hours

### 4A: EmptyState (3 → 1)

| File                                        | Importers |
| ------------------------------------------- | :-------: |
| `src/components/ui/EmptyState.tsx`          |    ≥3     |
| `src/components/ui/empty-state.tsx`         |    ≥2     |
| `src/app/portal/_components/EmptyState.tsx` |    ≥2     |

**Winner:** `src/components/ui/EmptyState.tsx` — richest API (presets, sizes, icons, actions)

- [ ] 4A-1: Merge best features into `src/components/ui/EmptyState.tsx`
- [ ] 4A-2: Migrate all `empty-state` importers
- [ ] 4A-3: Migrate portal `EmptyState` importers
- [ ] 4A-4: Delete `empty-state.tsx` and portal duplicate
- [ ] 4A-5: Verify build

### 4B: ErrorBoundary (2 generic → 1)

| File                                      |         Importers         |
| ----------------------------------------- | :-----------------------: |
| `src/components/system/ErrorBoundary.tsx` | Many (app/portal layouts) |
| `src/components/ErrorBoundary.tsx`        |          Unknown          |

**Winner:** `src/components/system/ErrorBoundary.tsx`
**Keep:** Domain-specific error boundaries (AI, payment, upload) — they serve real purposes

- [ ] 4B-1: Migrate any importers of root `ErrorBoundary` → `system/ErrorBoundary`
- [ ] 4B-2: Delete `src/components/ErrorBoundary.tsx`

### 4C: ErrorState (2 → 1)

| File                                  | Notes              |
| ------------------------------------- | ------------------ |
| `src/components/ui/ErrorState.tsx`    | 279 lines, presets |
| `src/components/system/PageError.tsx` | 61 lines, simpler  |

**Winner:** `src/components/ui/ErrorState.tsx`

- [ ] 4C-1: Migrate `PageError` importers → `ErrorState`
- [ ] 4C-2: Delete `PageError.tsx`

### 4D: Loading / Skeleton (4+ → 2)

| File                                         | Notes                          |
| -------------------------------------------- | ------------------------------ |
| `src/components/ui/skeleton.tsx`             | Shadcn primitive ✅ Keep       |
| `src/components/ui/LoadingState.tsx`         | Spinner + skeleton combos      |
| `src/components/ui/page-skeleton.tsx`        | Page-level skeletons           |
| `src/components/ui/SkeletonList.tsx`         | List skeletons                 |
| `src/components/system/LoadingSkeletons.tsx` | Re-implements everything above |

**Keep:** `skeleton.tsx` (primitive) + `LoadingState.tsx` (composed states)
**Merge into LoadingState:** page-skeleton, SkeletonList patterns as variants

- [ ] 4D-1: Add `variant: 'page' | 'list' | 'card' | 'grid'` to `LoadingState.tsx`
- [ ] 4D-2: Migrate `page-skeleton` importers
- [ ] 4D-3: Migrate `SkeletonList` importers
- [ ] 4D-4: Migrate `system/LoadingSkeletons` importers
- [ ] 4D-5: Delete 3 redundant files
- [ ] 4D-6: `pnpm build` — verify all Phase 4

---

## PHASE 5 · NAVIGATION / HEADER / LAYOUT SHELLS 🟠 P1

> **7+ nav components → 3 (Pro shell, Client shell, Marketing header)** · Effort: 6–8 hours

### 5A: Pro Side Shell

**Current (working):** `src/app/(app)/_components/` → `SkaiCRMNavigation` + `Sidebar` + `AppShell`

Already consolidated. ✅ No action needed on the Pro side shell itself.

**Dead nav code to delete:**

- [ ] 5A-1: Delete `src/components/TopNav.jsx` (legacy JSX, React Router)
- [ ] 5A-2: Delete `src/client/Sidebar.tsx` (Supabase auth, React Router)
- [ ] 5A-3: Delete `src/client/ClientLayout.tsx` (React Router layout)
- [ ] 5A-4: Verify `src/components/AppShell.tsx` — if it just re-exports `modules/navigation`, delete it

### 5B: Client Side Shell

**Current:** `src/app/portal/layout.tsx` imports from `src/components/portal/`

- `PortalNav` — used, keep ✅
- `PortalShell` — used, keep ✅

**Competing dead client shells:**

- [ ] 5B-1: Delete `src/app/(client-portal)/` — bare layout, no auth, abandoned
- [ ] 5B-2: Delete `src/app/client/` — no layout, fragments only → evaluate if routes should move to `/portal/`
- [ ] 5B-3: Delete `src/app/(portal)/` — legacy token-based resolve

### 5C: Marketing Headers

**Current:** `(marketing)/layout.tsx` uses its own `MarketingNavbar`

Competing headers:
| File | Importers | Action |
|------|:---------:|--------|
| Marketing inline in layout | 1 | Keep ✅ |
| `(public)/layout.tsx` inline header | 1 | Refactor → use `MarketingNavbar` |
| `MarketingHeader.tsx` | 0 | Already deleted in Phase 0 |
| Landing `Header.tsx` | Unknown | Evaluate merge |

- [ ] 5C-1: Extract `(public)` inline header → use `MarketingNavbar` component
- [ ] 5C-2: Audit landing `Header.tsx` — merge into `MarketingNavbar` or delete
- [ ] 5C-3: `pnpm build` — verify all Phase 5

---

## PHASE 6 · ACTIVITY / TIMELINE COMPONENTS 🟠 P1

> **8 components → 2** · Effort: 3 hours

### Current State

| File                                                            | Type                    |    Importers    |
| --------------------------------------------------------------- | ----------------------- | :-------------: |
| `src/components/RecentActivity.tsx`                             | Client, fetches API     | 2 (both legacy) |
| `src/components/crm/RecentActivity.tsx`                         | Server, Prisma          |        1        |
| `src/features/reports/components/ActivityFeed.tsx`              | Mock data stub          |        0        |
| `src/app/(app)/claims/[claimId]/_components/ActivityFeed.tsx`   | Real claim activities   |       ≥1        |
| `src/app/portal/_components/ActivityFeed.tsx`                   | Takes `activities` prop |       ≥1        |
| `src/app/(app)/trades/profile/_components/ActivityTimeline.tsx` | Timeline with icons     |        0        |
| `src/components/dashboard/ActivityStream.tsx`                   | Supabase realtime       |     Unknown     |
| `src/components/dashboard/JobHistoryPanel.tsx`                  | SWR polling             |     Unknown     |

### Target

**Presentational:** `src/components/activity/ActivityFeed.tsx`

```
Props:
  - activities: Activity[]
  - variant: 'feed' | 'timeline' | 'compact'
  - maxItems?: number
  - emptyMessage?: string
```

**Data wrappers stay domain-specific** but import the shared presentational component.

- [ ] 6-1: Build unified `ActivityFeed.tsx` presentational component
- [ ] 6-2: Refactor claim `ActivityFeed` → use shared component
- [ ] 6-3: Refactor portal `ActivityFeed` → use shared component
- [ ] 6-4: Delete root `RecentActivity.tsx` (already in Phase 0)
- [ ] 6-5: Delete features `ActivityFeed.tsx` (mock stub)
- [ ] 6-6: Delete `ActivityTimeline.tsx` (0 importers)
- [ ] 6-7: Evaluate `ActivityStream` and `JobHistoryPanel` — merge or keep (domain-specific realtime)
- [ ] 6-8: `pnpm build` — verify

---

## PHASE 7 · PDF PREVIEW MODALS 🟠 P1

> **3 → 1** · Effort: 2 hours

### Current State

| File                                     | Description              |
| ---------------------------------------- | ------------------------ |
| `src/components/pdf/PdfPreviewModal.tsx` | Modal + zoom + download  |
| `src/components/pdf/PDFPreview.tsx`      | Minimal `<embed>` viewer |
| `src/components/esign/PdfPreview.tsx`    | E-sign specific          |

### Target

**Single file:** `src/components/pdf/PdfPreviewModal.tsx`

```
Props:
  - url: string
  - title?: string
  - showDownload?: boolean
  - showZoom?: boolean
  - mode?: 'view' | 'sign'     // esign mode adds signature overlay
  - onClose: () => void
```

- [ ] 7-1: Merge `PDFPreview` embed logic into `PdfPreviewModal` as `variant="inline"`
- [ ] 7-2: Add `mode="sign"` support from esign `PdfPreview`
- [ ] 7-3: Migrate 3 importers
- [ ] 7-4: Delete `PDFPreview.tsx` and esign `PdfPreview.tsx`
- [ ] 7-5: `pnpm build` — verify

---

## PHASE 8 · CONFIRM DIALOGS 🟠 P1

> **2 → 1** · Effort: 1 hour

| File                                     | Importers |
| ---------------------------------------- | :-------: |
| `src/components/ConfirmDeleteDialog.tsx` |     8     |
| `src/components/ui/ConfirmModal.tsx`     |  Unknown  |

- [ ] 8-1: Audit both — merge into `ConfirmDeleteDialog` (has 8 active importers)
- [ ] 8-2: Add `variant: 'delete' | 'archive' | 'generic'` prop
- [ ] 8-3: Delete `ConfirmModal.tsx`
- [ ] 8-4: `pnpm build` — verify

---

## PHASE 9 · FORMS & UPLOADS 🟡 P2

> **Effort:** 3–4 hours total

### 9A: Branding Upload (3 → 1)

| File                                                      | Mechanism          |
| --------------------------------------------------------- | ------------------ |
| `src/components/uploads/BrandingUpload.tsx`               | Form POST          |
| `src/app/(app)/settings/branding/BrandingUpload.tsx`      | Supabase storage   |
| `src/app/(app)/onboarding/_components/BrandingUpload.tsx` | Supabase + preview |

- [ ] 9A-1: Unify into `src/components/uploads/BrandingUpload.tsx`
- [ ] 9A-2: Add preview + validation from onboarding version
- [ ] 9A-3: Migrate 2 importers
- [ ] 9A-4: Delete 2 route-specific copies

### 9B: Contact Form (2 → 1)

| File                                          |
| --------------------------------------------- |
| `src/components/ContactForm.tsx`              |
| `src/app/(marketing)/contact/ContactForm.tsx` |

- [ ] 9B-1: Keep `src/components/ContactForm.tsx`, delete marketing copy
- [ ] 9B-2: Update marketing contact page import

### 9C: Token Purchase Modal (2 → 1)

| File                                |
| ----------------------------------- |
| `src/components/BuyTokensModal.tsx` |
| `src/components/AddTokensModal.tsx` |

- [ ] 9C-1: Keep `BuyTokensModal.tsx` (richer UI), delete `AddTokensModal.tsx`
- [ ] 9C-2: Migrate importers

---

## PHASE 10 · DASHBOARD AI WIDGETS 🟡 P2

> **4 → 1** · Effort: 2–3 hours

| File                                                             | Description           |
| ---------------------------------------------------------------- | --------------------- |
| `src/components/dashboard/DashboardAIWidget.tsx`                 | 301-line AI assistant |
| `src/components/AIToolsPanel.tsx`                                | AI tools panel        |
| `src/app/(app)/dashboard/_components/DashboardAIPanel.tsx`       | Another AI panel      |
| `src/app/(app)/dashboard/_components/DashboardAssistantDock.tsx` | Docked assistant      |

- [ ] 10-1: Audit all 4 — determine which is actively rendered
- [ ] 10-2: Consolidate into `src/components/dashboard/DashboardAIWidget.tsx`
- [ ] 10-3: Delete 3 redundant files
- [ ] 10-4: `pnpm build` — verify

---

## PHASE 11 · TOKEN BADGE 🟡 P2

> **2 → 1** · Effort: 1 hour

| File                                                | Type                    |
| --------------------------------------------------- | ----------------------- |
| `src/components/TokenBadge.tsx` (fetching)          | SWR, shows top-up modal |
| `src/components/ui/TokenBadge.tsx` (presentational) | Takes `balance` prop    |

- [ ] 11-1: Merge — keep SWR version, use presentational as render layer
- [ ] 11-2: Single file: `src/components/tokens/TokenBadge.tsx`
- [ ] 11-3: Delete both old files, update importers

---

## PHASE 12 · ROUTE CONSOLIDATION — CLIENT SIDE 🟠 P1

> **5 client surfaces → 1 (`/portal/`)** · Effort: 1–2 days

### Current Competing Client Surfaces

| Route               | Auth        | Nav             | Status                                         |
| ------------------- | ----------- | --------------- | ---------------------------------------------- |
| `/portal/*`         | Clerk ✅    | PortalNav ✅    | **CANONICAL** — keep                           |
| `(client-portal)/*` | None ❌     | None ❌         | DELETE (Phase 0)                               |
| `/client/*`         | None ❌     | None ❌         | EVALUATE — move routes to `/portal/` or DELETE |
| `(portal)/*`        | None ❌     | None ❌         | DELETE (Phase 0)                               |
| `src/client/*`      | Supabase ❌ | React Router ❌ | DELETE (Phase 0)                               |

### Overlapping Route Features

| Feature       | Pro Side (`/app/`)     | Client Side (`/portal/`) |             Duplicated?              |
| ------------- | ---------------------- | ------------------------ | :----------------------------------: |
| Claims        | `/claims/[id]`         | `/portal/claims/[id]`    |   ✅ Intentional (different views)   |
| Messages      | `/messages`            | `/portal/messages`       |            ✅ Intentional            |
| Settings      | `/settings` (26 pages) | `/portal/settings`       | ⚠️ Client settings should be minimal |
| Notifications | `/notifications`       | `/portal/notifications`  |    ⚠️ Potential shared component     |
| Jobs          | `/jobs`                | `/portal/jobs`           |            ✅ Intentional            |
| Network       | `/network`             | `/portal/network`        |           ⚠️ Review scope            |
| Onboarding    | `/onboarding`          | `/portal/onboarding`     |   ✅ Intentional (different flows)   |
| Profile       | `/settings/profile`    | `/portal/profile`        |        ⚠️ Share `ProfileForm`        |

### Execution

- [ ] 12-1: Audit `/client/*` routes — which are live? Move needed routes to `/portal/`
- [ ] 12-2: Delete dead `/client/*` routes
- [ ] 12-3: Ensure `/portal/` has all client features (claims, messages, settings, notifications, jobs)
- [ ] 12-4: Share components where Pro/Client differ only in data scope (NotificationBell ✅ done in Phase 1)
- [ ] 12-5: Document intentional Pro vs Client differences in `ARCHITECTURE.md`

---

## PHASE 13 · BREADCRUMBS AUDIT ✅

> **No duplication found.** `src/components/ui/Breadcrumbs.tsx` + `src/components/ui/breadcrumb.tsx` (shadcn primitive) — different layers, both valid.

---

## EXECUTION TIMELINE

| Week       | Phases                                                 | Effort | Impact                                           |
| ---------- | ------------------------------------------------------ | ------ | ------------------------------------------------ |
| **Week 1** | Phase 0 (Dead Code) + Phase 3 (Toast)                  | 2 days | 🟢 Removes ~15 files, eliminates toast confusion |
| **Week 2** | Phase 1 (NotificationBell) + Phase 2 (Cards)           | 3 days | 🟢 Eliminates 13+ redundant components           |
| **Week 3** | Phase 4 (States) + Phase 5 (Nav/Layout)                | 3 days | 🟢 Unifies error/loading UX across all surfaces  |
| **Week 4** | Phase 6 (Activity) + Phase 7 (PDF) + Phase 8 (Dialogs) | 2 days | 🟢 Cleans up mid-tier duplication                |
| **Week 5** | Phase 9 (Forms) + Phase 10 (AI) + Phase 11 (Token)     | 2 days | 🟢 Final component-level cleanup                 |
| **Week 6** | Phase 12 (Route Consolidation)                         | 2 days | 🟢 Single source of truth for client portal      |

**Total estimated effort: ~14 working days (3 weeks at pace)**

---

## VERIFICATION PROTOCOL

After **every phase**:

1. `pnpm build` — must pass with 0 errors
2. `grep -rn 'OLD_COMPONENT_NAME' src/` — must return 0 results
3. Visual spot-check: open Pro dashboard + Client portal in browser
4. Run existing tests: `pnpm test` (if available)
5. Commit with message: `refactor(ui): Phase X — [description]`

---

## FILES TO DELETE (COMPLETE LIST)

```
# Phase 0 — Dead code
src/components/ConditionalNav.tsx
src/components/UnifiedNavigation.tsx
src/components/ui/GradientButton.tsx
src/components/ui/PageShell.tsx
src/components/TopNav.jsx
src/app/(marketing)/_components/MarketingHeader.tsx
src/app/(site)/                          # entire directory
src/app/(portal)/                        # entire directory
src/app/(client-portal)/                 # entire directory
src/client/                              # entire directory

# Phase 1 — NotificationBell (5 files)
src/components/NotificationBell.tsx
src/components/ui/NotificationBell.tsx
src/app/(app)/_components/NotificationBell.tsx
src/app/portal/_components/NotificationBell.tsx
src/modules/navigation/NotificationBell.tsx

# Phase 2 — Stat/KPI Cards (9 files)
src/components/ui/StatCard.tsx
src/components/ui/StatsCard.tsx
src/components/ui/KpiCard.tsx
src/components/ui/GlassCard.tsx
src/components/crm/StatsCards.tsx
src/app/(app)/dashboard/_components/StatsCards.tsx
src/components/DashboardKPIs.tsx
src/components/kpi-dashboard/KPIDashboardClient.tsx
src/components/dashboard/KpiCardsClient.tsx

# Phase 3 — Toast (4 files)
src/components/ui/use-toast.ts
src/components/ui/toaster.tsx
src/components/toast/                    # entire directory
src/components/ToastProvider.tsx

# Phase 4 — States (6 files)
src/components/ui/empty-state.tsx
src/app/portal/_components/EmptyState.tsx
src/components/ErrorBoundary.tsx
src/components/system/PageError.tsx
src/components/ui/page-skeleton.tsx
src/components/ui/SkeletonList.tsx
src/components/system/LoadingSkeletons.tsx

# Phase 6 — Activity (3 files)
src/components/RecentActivity.tsx
src/features/reports/components/ActivityFeed.tsx
src/app/(app)/trades/profile/_components/ActivityTimeline.tsx

# Phase 7 — PDF (2 files)
src/components/pdf/PDFPreview.tsx
src/components/esign/PdfPreview.tsx

# Phase 9 — Forms (4 files)
src/app/(app)/settings/branding/BrandingUpload.tsx
src/app/(app)/onboarding/_components/BrandingUpload.tsx
src/app/(marketing)/contact/ContactForm.tsx
src/components/AddTokensModal.tsx

# Phase 10 — AI Widgets (3 files)
src/components/AIToolsPanel.tsx
src/app/(app)/dashboard/_components/DashboardAIPanel.tsx
src/app/(app)/dashboard/_components/DashboardAssistantDock.tsx

# Phase 11 — Token Badge (merge, delete originals)
src/components/TokenBadge.tsx
src/components/ui/TokenBadge.tsx
```

**Total files to delete: ~50+**
**Total files to create: ~6 unified components**
**Net reduction: ~44 files**

---

## NEW UNIFIED COMPONENTS TO CREATE

| #   | Path                                                | Replaces                                                  |
| --- | --------------------------------------------------- | --------------------------------------------------------- |
| 1   | `src/components/notifications/NotificationBell.tsx` | 5 NotificationBell files                                  |
| 2   | `src/components/ui/MetricCard.tsx`                  | StatCard, StatsCard, KpiCard, GlassCard                   |
| 3   | `src/components/dashboard/MetricGrid.tsx`           | DashboardKPIs, KpiCardsClient, KPIDashboardClient         |
| 4   | `src/components/activity/ActivityFeed.tsx`          | 3 ActivityFeed + 2 RecentActivity + ActivityTimeline      |
| 5   | `src/components/pdf/PdfPreviewModal.tsx`            | (enhance existing — absorb PDFPreview + esign PdfPreview) |
| 6   | `src/components/tokens/TokenBadge.tsx`              | 2 TokenBadge files                                        |

---

## SUCCESS METRICS

| Metric                           | Before  | After |
| -------------------------------- | :-----: | :---: |
| Total component files            |  ~250+  | ~200  |
| Duplicate component sets         |   15+   |   0   |
| Toast systems                    |    3    |   1   |
| NotificationBell implementations |    5    |   1   |
| Stat/KPI card variants           |    9    |   2   |
| EmptyState implementations       |    3    |   1   |
| Loading/skeleton implementations |    5    |   2   |
| Dead nav/layout components       |    7    |   0   |
| Client portal surfaces           |    5    |   1   |
| Dead React Router code           | 4 files |   0   |

---

> **🎯 End state:** Every UI concept has ONE canonical implementation. Pro and Client sides share a unified component library via `src/components/`, with only layout shells and data-fetching wrappers remaining route-specific.
