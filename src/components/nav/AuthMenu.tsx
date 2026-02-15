"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton,UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function AuthMenu() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        {/* Modal buttons (Clerk) */}
        <SignInButton mode="modal">
          <button className="rounded-lg border px-4 py-2 transition-colors hover:bg-gray-50">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800">
            Get started
          </button>
        </SignUpButton>
        {/* Fallback hard links if Clerk JS can't load */}
        <Link href="/sign-in" className="hidden text-sm underline">
          Sign in (fallback)
        </Link>
        <Link href="/sign-up" className="hidden text-sm underline">
          Sign up (fallback)
        </Link>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
