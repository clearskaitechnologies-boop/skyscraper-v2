"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignInForm() {
  const searchParams = useSearchParams();
  const mode = searchParams?.get("mode");
  const pendingRedirect = searchParams?.get("redirect_url");

  // Build the after-sign-in URL, preserving any pending redirect (e.g. invite tokens)
  // This ensures /trades/join?token=xxx survives the auth flow
  const afterSignInParams = new URLSearchParams();
  if (mode === "client") afterSignInParams.set("mode", "client");
  if (pendingRedirect) afterSignInParams.set("redirect_url", pendingRedirect);
  const redirectUrl = `/after-sign-in${afterSignInParams.toString() ? `?${afterSignInParams.toString()}` : ""}`;

  // Propagate redirect_url to sign-up page so token isn't lost if they switch to sign-up
  const signUpUrl = pendingRedirect
    ? `/sign-up?redirect_url=${encodeURIComponent(pendingRedirect)}`
    : "/sign-up";

  return (
    <SignIn
      routing="path"
      path="/sign-in"
      signUpUrl={signUpUrl}
      redirectUrl={redirectUrl}
      appearance={{
        elements: {
          rootBox: "w-full mx-auto",
          card: "bg-white shadow-2xl rounded-xl",
          socialButtonsBlockButton:
            "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50",
          socialButtonsBlockButtonText: "text-gray-700 font-medium",
        },
      }}
    />
  );
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo + Brand */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/">
            <Image
              src="/brand/sign_in_portals_logo.jpg"
              alt="SkaiScraper"
              width={220}
              height={220}
              className="h-32 w-auto object-contain"
              priority
            />
          </Link>
          <p className="mt-3 text-sm text-slate-400">Pro Login — Trades &amp; Contractors</p>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          }
        >
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
