# 🗺️ SKAISCRAPER ROUTE MAP - DEMO BASELINE

**Created:** December 24, 2025  
**Branch:** fix/demo-lockdown  
**Purpose:** Baseline for comprehensive demo fixes

---

## 📍 CRITICAL ROUTES FOR DEMO

### Vendors System

- **Index:** `/network/vendors` → Shows vendor cards
- **Detail:** `/vendors/[slug]` → Individual vendor page
- **Source of Truth:** `src/data/vendors.ts` (static registry)
- **Issue:** Some "Visit Website" links broken, missing Elite/Westlake/GAF measurements

### Claims Workspace

- **List:** `/claims` → Claims dashboard
- **Detail:** `/claims/[claimId]` → Tabs: Overview, Documents, Reports, AI, etc.
- **Force Seed:** `/api/debug/force-seed` → Emergency reseed endpoint
- **AI Sidebar:** `src/app/(app)/claims/[claimId]/_components/ClaimAIColumn.tsx`
- **AI Tab:** `/claims/[claimId]/ai` → Separate AI interface (BROKEN)
- **Issue:** Duplicate AI implementations, one works (sidebar), one errors (tab)

### Templates & Marketplace

- **Marketplace:** `/reports/templates/marketplace` → Browse templates
- **Preview:** `/reports/templates/marketplace/[slug]` → Template preview
- **Company Templates:** `/reports/templates` → Org-specific templates
- **Issue:** Preview stuck "Not Available Yet", Dashboard link causes white screen

### Navigation

- **Main Nav:** `src/components/layout/Sidebar.tsx` (likely)
- **Issue:** Mis-grouped items (Job Board in Networks), inconsistent spacing

---

## 🔍 DUPLICATE/LEGACY PATHS IDENTIFIED

### Claims AI (TWO IMPLEMENTATIONS)

1. **NEW (Working):**
   - Component: `SmartClaimAssistant`
   - Location: Right sidebar in claim detail
   - API: `/api/ai/claim-assistant` (likely)
2. **LEGACY (Broken):**
   - Component: `ClaimAIChat` or similar
   - Location: `/claims/[claimId]/ai` tab
   - API: `/api/ai/claim/*` (different endpoint)
   - **ACTION:** Remove legacy, route tab to SmartClaimAssistant

### Dashboard Routes

- Possible duplicates: `/dashboard` vs `/(app)/dashboard`
- **Issue:** Hard-coded `/dashboard` links break after template preview

---

## 📦 DATA SOURCES

### Vendors

- **File:** `src/data/vendors.ts`
- **Type:** Static TypeScript array
- **Missing:** Elite Roofing Supply, Westlake Royal, GAF Measurements section

### Demo Claims

- **Seed Function:** `src/lib/demoSeed.ts`
- **Endpoint:** `/api/debug/force-seed`
- **Issue:** Existing claims not deleted before reseed, all show "John Smith"

### Templates

- **Storage:** Database (UniversalTemplate table)
- **Preview Generation:** Unknown pipeline (needs investigation)

---

## 🎯 ROOT CAUSES SUMMARY

1. **Vendor System:** Static registry incomplete + bad URLs (no normalization)
2. **Claims AI:** Two separate implementations, different APIs, different data sources
3. **Templates:** Preview generation broken, route state not preserved on navigation
4. **Demo Data:** Force reseed doesn't purge old claims first
5. **Navigation:** No consistent grouping logic, items mis-categorized

---

## ✅ NEXT STEPS

**Phase 1:** Fix vendor registry (add missing, normalize URLs)  
**Phase 2:** Clean up navigation grouping  
**Phase 3:** Unify Claims AI (remove duplicate)  
**Phase 4:** Fix template preview + routing  
**Phase 5:** Fix demo data persistence

---

**Baseline established. Ready for systematic fixes.**
