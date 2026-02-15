// ROOT PAGE - Render marketing landing directly to avoid blank redirects
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { MarketingLanding } from "@/components/marketing/MarketingLanding";
import MarketingNavbar from "@/components/nav/MarketingNavbar";

export default function RootPage() {
  return (
    <>
      <MarketingNavbar />
      <MarketingLanding />
      <MarketingFooter />
    </>
  );
}
