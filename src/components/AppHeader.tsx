"use client";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

import { btn, glow } from "@/lib/theme";

import GlobalKbd from "./GlobalKbd";
import ThemeToggle from "./ThemeToggle";
import NotificationBell from "./ui/NotificationBell";
import VersionBadge from "./VersionBadge";

const isDev = process.env.NODE_ENV !== "production";

export default function AppHeader() {
  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[color:var(--border)] bg-[var(--surface-1)] px-3 backdrop-blur ${glow}`}
    >
      <GlobalKbd />
      <Link href="/dashboard" className="flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/pro_portal_logo.png" alt="SkaiScraper" className="h-8 w-8" />
        <span className="font-semibold tracking-wide text-[color:var(--primary)]">SkaiScraper</span>
      </Link>
      {/* Removed legacy build badge */}
      <div className="ml-auto flex items-center gap-2">
        <input
          data-global-search
          className="w-64 rounded-lg border border-[color:var(--border)] bg-[var(--surface-2)] px-3 py-1 text-sm text-[color:var(--text)] placeholder-[color:var(--muted)] focus:outline-none focus:ring-1 focus:ring-[color:var(--primary)]"
          placeholder="Search (⌘/Ctrl + K)"
        />
        <Link
          href="/trades"
          className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[color:var(--text)] transition-colors hover:bg-[var(--surface-1)]"
        >
          Trades Network
        </Link>
        <Link href="/leads/new" className={btn}>
          New Lead
        </Link>
        <Link href="/claims/new" className={btn}>
          New Claim
        </Link>

        {/* Auth Controls */}
        <SignedOut>
          <SignInButton mode="redirect">
            <button className="rounded-full bg-blue-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-600">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>

        {/* Notification Bell */}
        <SignedIn>
          <NotificationBell />
        </SignedIn>

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-9 h-9",
              },
            }}
          />
        </SignedIn>

        {/* Build Info - Dev Only */}
        {isDev && (
          <div className="hidden md:flex">
            <VersionBadge />
          </div>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
