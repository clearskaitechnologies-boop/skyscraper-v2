"use client";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { SkaiLogo } from "@/components/SkaiLogo";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="border-b border-slate-800 bg-[#0A1A2F]/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <SkaiLogo size={24} />
          <span className="font-semibold">SkaiScraper™</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/pricing">Pricing</Link>
          <Link href="/case-study">Case study</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <div className="flex items-center gap-2">
          <SignedOut>
            <SignUpButton mode="modal">
              <Button variant="outline" size="sm">
                Sign up
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button variant="default" size="sm">
                Log in
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link href="/dashboard" className="rounded bg-white px-3 py-1.5 text-black">
              Go to app
            </Link>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: { border: "1px solid #334155" },
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
