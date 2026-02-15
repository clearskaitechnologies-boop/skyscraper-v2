# Typing Backlog (priority)

This file lists files that use `any` or have `any`-like patterns found by a quick scan. Prioritize fixes in this order:

1. Authentication & onboarding (high impact)
   - `src/pages/OAuthCallback.tsx`
   - `src/components/ProtectedRoute.tsx`
   - `src/pages/AuthLogin.tsx`
   - `src/pages/Onboarding.tsx`

2. Client-facing & auth flows
   - `src/client/ClientDashboard.tsx`
   - `src/client/ClientOnly.tsx`
   - `src/client/ClientSignIn.tsx`

3. Core libraries & hooks
   - `src/lib/api.ts`
   - `src/lib/branding.ts`
   - `src/lib/track.ts`
   - `src/lib/theme.ts`
   - `src/hooks/useReportDraft.ts`
   - `src/hooks/useAiFill.ts`
   - `src/hooks/useDictation.ts`

4. Pages with large `any` surface area
   - `src/pages/ReportWorkbench.tsx`
   - `src/pages/ProposalBuilder.tsx`
   - `src/pages/CRM/Dashboard.tsx`
   - `src/pages/CRM/Revenue.tsx`
   - `src/pages/PublicView.tsx`

5. Components with prop `any` or callbacks
   - `src/components/BrandingUploader.tsx`
   - `src/components/PublicLinkGenerator.tsx`
   - `src/components/MockupPanelV2.tsx`
   - `src/components/workbench/PhotoActions.tsx`

How to proceed (recommended incremental approach)

- Step 0: Add a baseline commit that enables `@typescript-eslint/no-explicit-any` as `warn` and run lint to generate a detailed list.
- Step 1: Fix the auth/onboarding set (items in section 1). Replace `any` with precise types from Supabase or project types (e.g., `User`, `Session`, `Profile`).
- Step 2: Fix core libs and hooks. Add small helper types to `src/types/` if needed.
- Step 3: Fix pages/components in batches of ~10 files, creating one PR per batch.

Tooling tips

- Use `pnpm exec eslint "src/**" --rule '@typescript-eslint/no-explicit-any: 2' --format json > any-report.json` to produce a machine-readable list of `any` occurrences.
- Consider `ts-migrate` or `tslint-to-eslint-config` only as helpers — manual review is preferred for critical areas (auth, DB).

If you want, I can now:

- (A) Turn `no-explicit-any` back to `warn` and produce an exhaustive file-by-file count and JSON report.
- (B) Start fixing the top 10 files (auth/onboarding) in a single batch.

Tell me which option (A or B) to run next and I'll proceed.
