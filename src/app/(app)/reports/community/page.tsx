/**
 * Community Reports Page (Server Wrapper)
 * Checks auth and redirects to client component
 */

import { getOrg } from "@/lib/org/getOrg";

import CommunityReportsPageClient from "./page-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CommunityReportsPage() {
  // Use mode: "required" - redirects to /sign-in or /onboarding as needed
  const orgResult = await getOrg({ mode: "required" });

  // If we get here, org exists (otherwise would have redirected)
  return <CommunityReportsPageClient />;
}
