# Accessibility & Empty State Audit

> **Date:** 2025-02-13 • **Methodology:** Manual review of critical paths
> **Standard:** WCAG 2.1 Level AA

## Summary

| Page              | Empty State      | aria-labels      | Loading                | Rating |
| ----------------- | ---------------- | ---------------- | ---------------------- | ------ |
| Claims            | ✅ Good          | 🟡 Partial       | ✅                     | B+     |
| Reports Hub       | ✅ N/A (static)  | 🟡 Needs labels  | ❌ Missing loading.tsx | B      |
| Dashboard         | 🔴 No onboarding | 🟡 Needs labels  | ✅ Suspense            | B-     |
| Settings          | ✅ Has CTA       | 🟡 Needs labels  | ✅                     | B      |
| Vendors           | 🟡 Minimal text  | ✅ Partial       | ✅                     | B      |
| Auth (sign-in/up) | ✅ N/A           | ✅ Clerk handles | ✅                     | A      |

## Critical Findings

### 🔴 P1 — Dashboard has no onboarding empty state

- New org with zero claims sees zeroed-out stat cards
- **Fix:** Add "Get Started" CTA when org has zero claims
- **Impact:** First impression for Titan onboarding

### 🟡 P2 — Search inputs lack proper labels

- Claims search and vendors search use placeholder only
- **Fix:** Add `aria-label` to search inputs
- **Impact:** Screen reader users can't identify input purpose

### 🟡 P3 — Reports Hub missing loading.tsx

- Server-side fetch with no Suspense boundary
- **Fix:** Add `loading.tsx` with skeleton cards

### 🟢 What's Working Well

- Claims has polished empty state with icon + message + "New Claim" CTA
- Settings handles missing org with redirect to onboarding
- Error states have retry + navigation escape hatches throughout
- Auth pages delegate to Clerk which handles a11y natively
- Dashboard uses Suspense with skeleton fallbacks
- loading.tsx exists for Claims, Dashboard, Settings, Vendors

## Remediation Plan

| Finding                    | Priority | Sprint  | LOE    |
| -------------------------- | -------- | ------- | ------ |
| Dashboard onboarding state | P1       | Current | 1 hr   |
| Search input aria-labels   | P2       | Next    | 30 min |
| Reports Hub loading.tsx    | P3       | Next    | 15 min |
| Button aria-disabled attrs | P3       | Next    | 30 min |

## Notes

- Clerk components provide WCAG-compliant auth forms out of the box
- Tailwind UI components generally have good semantic structure
- No dead-end screens found — all error states have escape hatches
