"use client";
import Link from "next/link";

import AuthMenu from "./AuthMenu";

export default function SiteHeader() {
  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-semibold transition-opacity hover:opacity-80">
          SkaiScraper
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/features" className="transition-colors hover:text-blue-600">
            Features
          </Link>
          <Link href="/pricing" className="transition-colors hover:text-blue-600">
            Pricing
          </Link>
          <Link href="/contact" className="transition-colors hover:text-blue-600">
            Contact
          </Link>
          <AuthMenu />
        </nav>
      </div>
    </header>
  );
}
