"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto max-w-[1200px] px-3 md:px-4">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/pro_portal_logo.png"
              alt="SkaiScraper"
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold text-[#0A1A2F]">SkaiScraper</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            <Link
              href="/features"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
            >
              Pricing
            </Link>
            <Link
              href="/demo"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
            >
              Demo
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
            >
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <Link
                href="/sign-in"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-lg bg-gradient-indigo px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-95 hover:shadow-lg"
              >
                Get Started
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-blue-600"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  );
}
