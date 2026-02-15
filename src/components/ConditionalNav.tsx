"use client";

import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingNav from "@/components/marketing/MarketingNav";
import Navbar from "@/components/Navbar";
import { useRouteGroup } from "@/components/RouteGroupProvider";

export default function ConditionalNav() {
  const routeGroup = useRouteGroup();

  // Only show nav for marketing pages - app pages have their own nav in AppShell
  return routeGroup === "marketing" ? <MarketingNav /> : null;
}

export function ConditionalFooter() {
  const routeGroup = useRouteGroup();

  return routeGroup === "marketing" ? <MarketingFooter /> : null;
}
