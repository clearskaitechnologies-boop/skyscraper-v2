// BrandingCard.tsx
// Re-export the server-driven branding card to eliminate static placeholder content.
// This keeps existing import paths (`@/components/BrandingCard`) functioning while
// ensuring dynamic organization branding is displayed.

import { BrandingCardServer } from "./dashboard/BrandingCardServer";

export const BrandingCard = BrandingCardServer;
export default BrandingCardServer;