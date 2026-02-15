"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { AnimatePresence,motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { SITE } from "@/app/siteConfig";
import BrandMark from "@/components/BrandMark";

// ============================================================================
// NAVBAR - Phase 5 Production-Ready
// ============================================================================
// Dual navigation: Public marketing vs authenticated app menus

// Public marketing navigation (shown when signed out)
const PUBLIC_NAV = [
  { href: "/features", label: "Features" },
  { href: "/ai-suite", label: "AI Suite" },
  { href: "/pricing", label: "Pricing" },
  { href: "/demo", label: "Demo" },
  { href: "/contact", label: "Contact" },
];

// Authenticated app navigation (shown when signed in)
const APP_NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/app/ai", label: "AI Suite" },
  { href: "/ai/reports", label: "AI Reports" },
  { href: "/trades-network", label: "Trades Network" },
  { href: "/leads", label: "CRM" },
  { href: "/branding", label: "Branding" },
];

function Drop({ item }: { item: (typeof SITE.nav)[number] }) {
  const [open, setOpen] = useState(false);
  if (!item.dropdown) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href={item.href}
        className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-neutral-50 hover:text-[#081A2F]"
      >
        {item.label}
      </Link>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 z-[60] mt-2 w-64 rounded-2xl border border-neutral-200 bg-white/95 p-2 shadow-xl backdrop-blur-sm"
          >
            {item.dropdown.map((d) => (
              <Link
                key={d.href}
                href={d.href}
                className="block rounded-xl px-4 py-3 text-sm text-neutral-700 transition-all duration-200 hover:bg-white/50 hover:text-[#081A2F]"
              >
                <div className="font-medium">{d.label}</div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-50 w-full border-b border-neutral-200/50 bg-white/80 shadow-sm backdrop-blur-sm"
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-3 md:px-4">
        {/* Brand */}
        <Link href="/" className="shrink-0">
          <BrandMark className="text-[#0A1A2F]" />
        </Link>

        {/* Primary nav */}
        <nav className="ml-6 hidden items-center gap-2 lg:flex">
          {/* Show PUBLIC_NAV when signed out, APP_NAV when signed in */}
          <SignedOut>
            {PUBLIC_NAV.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-neutral-100 font-semibold text-[#081A2F]"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-[#081A2F]"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </SignedOut>

          <SignedIn>
            {APP_NAV.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? "bg-neutral-100 font-semibold text-[#081A2F]"
                      : "text-neutral-700 hover:bg-neutral-50 hover:text-[#081A2F]"
                  }`}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </SignedIn>
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          <SignedOut>
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:text-[#081A2F]"
                >
                  Sign in
                </motion.button>
              </SignInButton>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/pricing"
                  className="rounded-lg bg-[#081A2F] px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-[#0A1D35]"
                >
                  Get Started
                </Link>
              </motion.div>
            </div>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-3">
              {/* Optional: quick link to Pricing stays visible */}
              <Link
                href="/pricing"
                className="hidden rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-neutral-50 hover:text-[#081A2F] md:inline-block"
              >
                Plans
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverCard: "z-[60]",
                    userButtonPopoverRootBox: "z-[60]",
                  },
                }}
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>

          {/* Mobile menu button */}
          <button
            className="ml-2 rounded-lg p-2 transition-colors hover:bg-neutral-100 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            title="Toggle navigation menu"
          >
            <div className="flex h-5 w-5 flex-col items-center justify-center">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-5 bg-neutral-700 transition-transform"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="mt-1 block h-0.5 w-5 bg-neutral-700 transition-opacity"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="mt-1 block h-0.5 w-5 bg-neutral-700 transition-transform"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="z-40 border-t border-neutral-200/50 bg-white/95 backdrop-blur-sm lg:hidden"
          >
            <div className="space-y-2 px-4 py-4">
              {/* Show PUBLIC_NAV when signed out, APP_NAV when signed in */}
              <SignedOut>
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      pathname === item.href
                        ? "bg-neutral-100 text-[#081A2F]"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-[#081A2F]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </SignedOut>

              <SignedIn>
                {APP_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                      pathname === item.href
                        ? "bg-neutral-100 text-[#081A2F]"
                        : "text-neutral-700 hover:bg-neutral-50 hover:text-[#081A2F]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </SignedIn>

              <div className="space-y-2 border-t border-neutral-200/50 pt-2">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="w-full rounded-lg border border-neutral-200 px-4 py-3 text-center text-sm font-medium transition-all hover:bg-neutral-50">
                      Sign in
                    </button>
                  </SignInButton>
                  <Link
                    href="/pricing"
                    className="block w-full rounded-lg bg-[#081A2F] px-4 py-3 text-center text-sm font-medium text-white transition-all hover:bg-[#0A1D35]"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </SignedOut>

                <SignedIn>
                  <Link
                    href="/pricing"
                    className="block w-full rounded-lg border border-neutral-200 px-4 py-3 text-center text-sm font-medium transition-all hover:bg-neutral-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Plans
                  </Link>
                </SignedIn>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
