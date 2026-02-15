import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { MARKETING_NAV_LINKS } from "@/constants/marketing-links";

export default function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto max-w-[1200px] px-3 md:px-4" aria-label="Top">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/pro_portal_logo.png"
              alt="SkaiScraper"
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold text-[#0A1A2F]">SkaiScraper</span>
          </Link>

          <div className="hidden md:flex md:items-center md:space-x-8">
            {MARKETING_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}

            <SignedOut>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                Pro Sign In
              </Link>
              <span className="text-sm text-slate-400">|</span>
              <Link
                href="/client/sign-in"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                Client Sign In
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-500"
              >
                Get Started
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu */}
          <div className="flex items-center gap-2 md:hidden">
            <SignedOut>
              <Link
                href="/client/sign-in"
                className="rounded-md border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-50"
              >
                Client
              </Link>
              <Link
                href="/sign-in"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-500"
              >
                Pro
              </Link>
            </SignedOut>

            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>
    </header>
  );
}
