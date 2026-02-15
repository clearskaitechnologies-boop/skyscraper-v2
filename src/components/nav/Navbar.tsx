"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const isAppRoute =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/claims") ||
    pathname?.startsWith("/reports");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight">SkaiScraper</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
          {isAppRoute ? (
            <>
              {/* App Navigation */}
              <Link
                href="/dashboard"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/claims"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname?.startsWith("/claims") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Claims
              </Link>
              <Link
                href="/reports"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname?.startsWith("/reports") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Reports
              </Link>
              <Link
                href="/tools"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname?.startsWith("/tools") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Tools
              </Link>
              <Link
                href="/trades"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname?.startsWith("/trades") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Trades
              </Link>
              <Link
                href="/settings"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname?.startsWith("/settings") ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Settings
              </Link>
            </>
          ) : (
            <>
              {/* Marketing Navigation */}
              <Link
                href="/features"
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-foreground/60 transition-colors hover:text-foreground/80"
              >
                Contact
              </Link>
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {/* Auth Buttons */}
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
