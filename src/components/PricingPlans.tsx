"use client";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPlans() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Simple, transparent pricing</h1>
        <p className="mt-2 text-gray-600">
          $80 per seat per month. No tiers. No tokens. No limits.
        </p>
      </header>

      <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h3 className="text-xl font-medium">SkaiScraper Pro</h3>
          <div className="text-lg font-semibold">$80/seat/mo</div>
        </div>
        <p className="mt-2 text-gray-600">Everything your team needs. No upsells, no surprises.</p>
        <ul className="mt-6 space-y-2 text-gray-700">
          {[
            "Unlimited AI reports & mockups",
            "Unlimited weather verifications",
            "Unlimited DOL data pulls",
            "Smart Documents & e-signatures",
            "AI damage analysis & proposals",
            "Full Trades Network access",
            "Company leaderboard & analytics",
            "QuickBooks integration",
            "Priority support",
            "1–500 seats",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              {f}
            </li>
          ))}
        </ul>
        <Link
          href="/settings/billing"
          className="mt-8 inline-block w-full rounded-lg bg-gray-900 px-4 py-3 text-center text-white hover:bg-black"
        >
          Get Started
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        No hidden fees. Cancel anytime. Volume discounts for 50+ seats.
      </p>
    </section>
  );
}
