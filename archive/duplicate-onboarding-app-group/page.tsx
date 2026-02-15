import { Metadata } from "next";
import Link from "next/link";

import { safeOrgContext } from "@/lib/safeOrgContext";

export const metadata: Metadata = {
  title: "Setup Complete | PreLoss Vision",
  description: "Your account setup is complete",
};

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const orgCtx = await safeOrgContext();

  if (orgCtx.status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-8">
          <h1 className="text-3xl font-bold">Sign In Required</h1>
          <p className="text-sm text-[color:var(--muted)]">
            Please sign in to continue onboarding.
          </p>
          <div className="flex gap-3">
            <Link
              href="/sign-in"
              className="rounded bg-[var(--primary)] px-5 py-2 font-medium text-white"
            >
              🔐 Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Auto-onboarding handled by safeOrgContext - no blocker needed
  // if (orgCtx.status === "noMembership") {
  //   return <div>Setting up workspace...</div>;
  // }

  // Membership exists → show completion confirmation instead of immediate redirect for clarity
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-[color:var(--border)] bg-[var(--surface-1)] p-10 text-center shadow-2xl">
        <h1 className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-4xl font-bold text-transparent">
          Workspace Active ✅
        </h1>
        <p className="text-sm text-[color:var(--muted)]">
          Your organization is initialized. Continue to your dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex rounded bg-green-600 px-6 py-3 font-semibold text-white"
        >
          Go to Dashboard →
        </Link>
      </div>
    </div>
  );
}
