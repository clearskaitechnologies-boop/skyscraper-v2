"use client";

import { Store } from "lucide-react";
import Link from "next/link";
import React from "react";

import { AuthCta } from "@/components/auth/AuthCta";

export default function PublicAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/60 p-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-semibold">
              Skai
            </Link>
            <nav className="hidden gap-2 md:flex">
              <Link
                href="/reports/templates/marketplace"
                className="text-sm text-muted-foreground hover:underline"
              >
                <Store className="mr-1 inline-block h-3 w-3" />
                Marketplace
              </Link>
            </nav>
          </div>

          <AuthCta variant="full" showBackToDashboard />
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-6">{children}</main>

      <footer className="border-t p-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Skai
      </footer>
    </div>
  );
}
