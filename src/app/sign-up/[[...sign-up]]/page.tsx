"use client";

import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpForm() {
  const searchParams = useSearchParams();
  const pendingRedirect = searchParams?.get("redirect_url");

  // Route through /after-sign-in to set identity cookie, then redirect to final destination
  // This preserves invite tokens: /trades/join?token=xxx survives the sign-up flow
  // CRITICAL: mode=pro tells after-sign-in this is a Pro signup (not a homeowner)
  const afterSignInParams = new URLSearchParams();
  afterSignInParams.set("mode", "pro");
  if (pendingRedirect) afterSignInParams.set("redirect_url", pendingRedirect);
  const redirectUrl = `/after-sign-in?${afterSignInParams.toString()}`;

  // Propagate redirect_url to sign-in page so token isn't lost if they switch
  const signInUrl = pendingRedirect
    ? `/sign-in?redirect_url=${encodeURIComponent(pendingRedirect)}`
    : "/sign-in";

  return (
    <SignUp
      routing="path"
      path="/sign-up"
      signInUrl={signInUrl}
      forceRedirectUrl={redirectUrl}
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

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo + Brand */}
        <div className="mb-8 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brand/pro_portal_logo.png"
              alt="SkaiScraper"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
            />
            <span className="bg-gradient-to-r from-[#5BC0F8] to-[#FFC838] bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              SkaiScraper
            </span>
          </Link>
          <p className="mt-2 text-sm text-slate-400">Create Your Pro Account</p>
        </div>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            </div>
          }
        >
          <SignUpForm />
        </Suspense>
      </div>
    </div>
  );
}
