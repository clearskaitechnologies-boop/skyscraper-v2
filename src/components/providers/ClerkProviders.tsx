"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { logger } from "@/lib/logger";
import * as React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // ALWAYS redirect to /after-sign-in which:
  // 1. Reads user type from database
  // 2. Sets the x-user-type cookie for middleware routing
  // 3. Redirects to /dashboard (pro) or /portal (client)
  const afterSignInUrl = "/after-sign-in";
  const afterSignUpUrl = "/after-sign-in";

  if (!publishableKey) {
    logger.warn("⚠️ Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY at runtime.");
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl={afterSignInUrl}
      afterSignUpUrl={afterSignUpUrl}
      signInForceRedirectUrl={afterSignInUrl}
      signUpForceRedirectUrl={afterSignUpUrl}
    >
      {children}
    </ClerkProvider>
  );
}
