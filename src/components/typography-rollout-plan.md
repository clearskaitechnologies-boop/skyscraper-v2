# Typography Rollout Plan (Phase 2)

## High-Priority Targets (Next Pass)

- CRM related: `src/app/(app)/crm/pipelines/page.tsx`, `src/app/(app)/leads/[id]/page.tsx`
- Intelligence & Metrics: `src/app/(app)/intelligence/[id]/page.tsx`, `src/app/(app)/dev/ai-metrics/page.tsx`
- Property & Claims: `src/app/(app)/claims/tracker/page.tsx`, `src/app/(app)/property-profiles/page.tsx`, `src/app/(app)/property-profiles/[id]/page.tsx`
- Exports (user-facing quality): `src/app/(app)/exports/reports/*`, `src/app/(app)/exports/estimates/*`, `src/app/(app)/exports/supplements/*`
- Auth & Onboarding: `src/components/pages/SignUp.tsx`, `src/components/pages/AdminSignIn.tsx`

## Secondary Targets

- Weather tools & wizards: `src/components/weather/*`
- AI panels: `src/components/ai/*`
- Geometry / Vision panels: `src/components/geometry/*`, `src/components/vision/*`

## Strategy

1. Replace headings (h1/h2) first using `PageTitle` / `SectionTitle`.
2. Migrate large numeric values to `MetricValue`.
3. Leave specialized PDF / export formatting that relies on exact pixel alignment for a dedicated audit to avoid layout shifts.
4. Each replacement should avoid changing semantic tag levels.
5. After conversions, perform dark-mode contrast check (Chromium DevTools > Lighthouse accessibility) ensuring WCAG AA for body text (≥4.5) and large text (≥3.0).

## Contrast Remediation Note

If any remaining large headings appear “washed” or low-contrast on deep panels, enforce `text-text-primary` or consider adding `drop-shadow-sm` for subtle lift—avoid pure white unless background luminance < 15%.
