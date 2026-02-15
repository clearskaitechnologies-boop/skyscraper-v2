"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Check, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CardShell } from "@/components/ui/card-shell";

const features = [
  "Unlimited AI Mockups",
  "Unlimited DOL Pulls",
  "Unlimited Weather Reports",
  "Unlimited Claim Drafting",
  "Unlimited Photo Analysis",
  "Smart Documents Hub",
  "Measurements & Takeoffs",
  "CRM & Pipeline Management",
  "Team Collaboration",
  "Custom Branding",
  "Report Builder",
  "Community & Batch Reports",
  "Client Portal",
  "Priority Support",
];

export default function Pricing({ refCode }: { refCode?: string }) {
  const checkoutUrl = refCode
    ? `/api/billing/create-subscription?ref=${encodeURIComponent(refCode)}`
    : "/settings/billing";

  return (
    <section className="bg-slate-50 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-600">
            $80 per seat per month. No tiers. No minimums. No hidden fees.
            <br />
            Every feature. Unlimited usage. Scale from 1 to 500 seats.
          </p>
        </motion.div>

        {/* Single Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mx-auto mt-16 max-w-lg"
        >
          <CardShell className="bg-blue-600 text-white">
            <div className="mb-2 flex justify-center">
              <span className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-blue-600">
                One Plan — Everything Included
              </span>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight">SkaiScraper Pro</h3>
            </div>

            <div className="mt-6">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold">$80</span>
                <span className="ml-2 text-blue-100">/seat/month</span>
              </div>
              <p className="mt-2 text-sm text-blue-100">
                Everything your team needs. Unlimited usage on every feature.
              </p>
            </div>

            <ul className="mt-8 space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <Check className="h-5 w-5 flex-shrink-0 text-blue-200" />
                  <span className="ml-3 text-sm text-blue-100">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <SignedOut>
                <Button asChild variant="secondary" size="lg" className="w-full">
                  <Link href="/sign-up">Start Free Trial</Link>
                </Button>
              </SignedOut>

              <SignedIn>
                <Button asChild variant="secondary" size="lg" className="w-full">
                  <Link href={checkoutUrl}>Get Started</Link>
                </Button>
              </SignedIn>
            </div>
          </CardShell>
        </motion.div>

        {/* Why Flat Pricing */}
        <div className="mx-auto mt-20 grid max-w-5xl gap-8 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CardShell>
              <Users className="h-8 w-8 text-blue-600" />
              <h4 className="mt-4 text-lg font-semibold text-slate-900">Scale Freely</h4>
              <p className="mt-2 text-sm text-slate-600">
                Add seats as your team grows. Every person gets full access to every feature. No
                upgrade pressure, no feature walls.
              </p>
            </CardShell>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <CardShell>
              <Zap className="h-8 w-8 text-blue-600" />
              <h4 className="mt-4 text-lg font-semibold text-slate-900">Unlimited Everything</h4>
              <p className="mt-2 text-sm text-slate-600">
                No quotas. No overage charges. No throttling. Use every AI tool, report, and
                analysis as much as you need.
              </p>
            </CardShell>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <CardShell>
              <Shield className="h-8 w-8 text-blue-600" />
              <h4 className="mt-4 text-lg font-semibold text-slate-900">Predictable Billing</h4>
              <p className="mt-2 text-sm text-slate-600">
                Know exactly what you'll pay every month. No surprises. No hidden fees. Cancel
                anytime.
              </p>
            </CardShell>
          </motion.div>
        </div>

        {/* Book a Demo CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mx-auto mt-16 max-w-2xl text-center"
        >
          <p className="text-lg text-slate-600">Need a custom enterprise agreement?</p>
          <Button asChild variant="outline" size="lg" className="mt-4">
            <Link href="/contact">Book a Demo</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
