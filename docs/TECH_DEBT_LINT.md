# Lint Technical Debt & Refactor Roadmap

## Purpose

Freeze legacy noise, keep new code clean, and progressively reclaim critical modules without blocking feature velocity.

## Legacy Zones (Ignored by ESLint)

- `src/legacy/*`
- `src/reports-legacy/*`
- `src/pdf-legacy/*`
- `src/supabase/functions-legacy/*`
- Existing old paths still ignored: `src/pdf/**`, `src/reports/**`, `src/modules-old/**`, `server-old/**`

## Core Lint Scope (Stage 0)

Active strict lint enforcement (except temporarily relaxed rules) covers:

- `src/app/(app)/**` selected feature folders (dashboard, maps, supplement, depreciation, rebuttal)
- `src/components/**`
- `src/lib/**`
- `scripts/**`
- `prisma/**/*.ts`

Temporarily relaxed (to be re-tightened later):

- `@typescript-eslint/no-explicit-any` (off)
- `import/order` & `simple-import-sort/*` (off)
- Tailwind ordering & custom classname rules (off during UI consolidation)

## Pending Full Repository Lint Snapshot

A one-time discovery pass will populate offender counts:

```bash
npx eslint . --max-warnings=0 --format json --output-file lint-full.json || true
```

Then summarize rule frequencies:

```bash
grep -o '"ruleId":"[^\"]*"' lint-full.json | cut -d: -f2 | tr -d '"' | sort | uniq -c | sort -nr | head -n 20
```

Current snapshot (broad) offender counts (from `eslint.snapshot.mjs` run):

| Rule                               | Count |
| ---------------------------------- | ----- |
| tailwindcss/classnames-order       | 4785  |
| @typescript-eslint/no-explicit-any | 2300  |
| @typescript-eslint/no-unused-vars  | 764   |
| simple-import-sort/imports         | 163   |
| @next/next/no-img-element          | 7     |
| react-hooks/exhaustive-deps        | 4     |
| simple-import-sort/exports         | 2     |

Interpretation: Classname ordering + any usage dominate; unused vars mostly in peripheral/legacy modules; import sorting relatively low volume.

## Top Offenders (Initial Placeholder)

Will be replaced after snapshot:

- TBD `@typescript-eslint/no-explicit-any`
- TBD `@typescript-eslint/no-unused-vars`
- TBD `import/order`
- TBD `tailwindcss/classnames-order`
- TBD `no-unused-vars` (plain JS scripts)

## Zone Categorization Examples

- PDF modules → unused vars, any
- Supabase functions → JS only, minimal typing
- Old report builders → any + import sorting chaos

## Refactor Waves (Stages 2–5)

1. **Lock New-Code Cleanliness**: lint-staged auto-fix on touched TS/TSX files.
2. **Wave 1 – Live PDF/Report Paths**: move unused to `*-legacy`; clean imports & vars in active.
3. **Wave 2 – Supabase Functions**: type minimal runtime-critical functions; migrate unused to legacy.
4. **Wave 3 – UI/Tailwind Core**: enable tailwind ordering only for `src/components/ui`, `src/app/(app)`.
5. **Wave 4 – Gradual Rule Tightening**: folder-level override to re-enable `no-explicit-any`, `import/order` where stable.
6. **Wave 5 – Deletion Pass**: remove untouched legacy >60 days; document in this file.

## Future ESLint Folder Override (Example for Stage 4)

```js
{
  files: ["src/app/(app)/**/*.{ts,tsx}", "src/components/**/*.{ts,tsx}"],
  rules: {
    "@typescript-eslint/no-explicit-any": "error",
    "import/order": ["warn", { "newlines-between": "always" }]
  }
}
```

## Maintenance Log

Add dated entries here as waves complete.

- (Pending) Initial snapshot & counts.

## Success Checklist (CI / PR Template Seeds)

- ✅ `lint:core` passing
- ✅ `build` successful
- ✅ No unintended edits in `src/legacy/**`
- ✅ Updated this file if refactor wave executed

---

_Last updated: INITIAL DRAFT – awaiting insertion of lint snapshot counts._
