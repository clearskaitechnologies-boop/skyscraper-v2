"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthCtaProps {
  /**
   * Whether to show "Back to Dashboard" link when signed in
   * @default false
   */
  showBackToDashboard?: boolean;

  /**
   * Custom href for "Back to Dashboard" link
   * @default "/dashboard"
   */
  backHref?: string;

  /**
   * Where to redirect after sign-in (defaults to current pathname)
   */
  redirectTo?: string;

  /**
   * Display variant
   * - "compact": Just UserButton or SignInButton
   * - "full": Includes Back to Dashboard link
   * @default "compact"
   */
  variant?: "compact" | "full";

  /**
   * Custom class name for the container
   */
  className?: string;
}

/**
 * AuthCta — Single Source of Truth for Auth UI in Public Routes
 *
 * Consolidates auth-aware navigation patterns:
 * - Shows UserButton when signed in
 * - Shows SignInButton modal when signed out
 * - Optional "Back to Dashboard" link
 * - Always redirects back to current page after sign-in
 *
 * Usage:
 * ```tsx
 * // Compact mode (just auth button)
 * <AuthCta />
 *
 * // Full mode with dashboard link
 * <AuthCta variant="full" showBackToDashboard />
 *
 * // Custom redirect
 * <AuthCta redirectTo="/specific-page" />
 * ```
 */
export function AuthCta({
  showBackToDashboard = false,
  backHref = "/dashboard",
  redirectTo,
  variant = "compact",
  className = "",
}: AuthCtaProps) {
  const pathname = usePathname();
  const redirectUrl = redirectTo || pathname || "/dashboard";

  // Determine if we should show dashboard link in full variant
  const shouldShowDashboardLink = variant === "full" && showBackToDashboard;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Back to Dashboard - only show when signed in and enabled */}
      {shouldShowDashboardLink && (
        <SignedIn>
          <Link
            href={backHref}
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Dashboard
          </Link>
        </SignedIn>
      )}

      {/* Auth State - Always visible */}
      <SignedIn>
        <UserButton
          afterSignOutUrl={pathname || "/"}
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal" forceRedirectUrl={redirectUrl} fallbackRedirectUrl={redirectUrl}>
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
