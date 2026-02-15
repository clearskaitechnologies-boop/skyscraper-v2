import { redirect } from "next/navigation";

import { getOrgContext } from "@/lib/org/getOrgContext";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * /onboarding/start - Entry point for onboarding flow
 * Redirects to appropriate page based on user state.
 *
 * Uses safeOrgContext, which will auto-heal/create org + membership
 * when possible. If an org is present, we send the user to dashboard;
 * otherwise, we drop them into the onboarding UI.
 */
export default async function OnboardingStartPage() {
  // getOrgContext() will:
  // - redirect to /sign-in if unauthenticated
  // - auto-create or attach an org+membership when missing
  const ctx = await getOrgContext();

  // If we can resolve an org at all, onboarding is complete enough
  // to send the user into the main app.
  if (ctx.orgId) {
    redirect("/dashboard");
  }

  // In the unlikely case getOrgContext() returned without an orgId,
  // fall back to the legacy onboarding flow.
  redirect("/onboarding");
}
