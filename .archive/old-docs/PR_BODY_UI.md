Title: feat(ui): update top nav, add Insurance & Service Network landing, pricing token packs

Summary
This PR updates the public top navigation to the new copy and adds small landing pages for Insurance and The Service Network™. It also enhances the Pricing page with token pack offerings and a sticky "Start Solo" CTA for quick signups.

Files changed

- `src/components/Navigation.tsx` — update nav links to: Retail | Insurance | The Service Network™ | Demo | About Us | Contact Us
- `src/pages/InsuranceLanding.tsx` — new simple landing for insurance customers
- `src/pages/ServiceNetwork.tsx` — new landing for Service Network
- `src/pages/Pricing.tsx` — add token packs (10/$10, 50/$40, 150/$100) and sticky Start Solo CTA
- `src/App.tsx` — register the new routes

How to test locally

1. Start dev server: `pnpm dev` or `pnpm build && pnpm start`
2. Visit `/retail`, `/insurance`, `/service-network`, and `/pricing`
3. Verify navigation shows the new menu and links route correctly

Notes

- This is a UI-first PR: no backend behavior changes are included. Token purchase flows are placeholders that link to `/book-demo` or `/signup` — integrate payment flows in a follow-up.
- Accessibility: links include ARIA labels; keyboard navigation should work with existing header patterns.
