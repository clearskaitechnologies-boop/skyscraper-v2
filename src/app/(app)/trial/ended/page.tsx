"use client";

import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function TrialEndedPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Lock Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <Lock className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Main Content */}
        <div className="rounded-2xl bg-[var(--surface-1)] p-8 text-center shadow-lg md:p-12">
          <h1 className="mb-4 text-4xl font-bold text-[color:var(--text)]">Your Trial Has Ended</h1>

          <p className="mb-8 text-lg text-slate-700 dark:text-slate-300">
            Your 72-hour trial has expired. To continue using SkaiScraper and access all your data,
            please subscribe to a plan.
          </p>

          {/* Plan Summary */}
          <div className="mb-8 rounded-lg bg-[var(--surface-2)] p-6 text-left">
            <h2 className="mb-4 font-semibold text-[color:var(--text)]">Choose a Plan</h2>

            <div className="space-y-3 text-sm text-[color:var(--text)]">
              <div className="flex justify-between">
                <span className="font-medium">Solo</span>
                <span>$29.99/month</span>
              </div>
              <div className="pl-4 text-xs text-slate-700 dark:text-slate-300">
                3 mockups • 3 DOL reports • 2 weather reports
              </div>

              <div className="flex justify-between border-t border-[color:var(--border)] pt-3">
                <span className="font-medium">Business</span>
                <span>$80/seat/month</span>
              </div>
              <div className="pl-4 text-xs text-slate-700 dark:text-slate-300">
                10 mockups • 10 DOL reports • 7 weather reports
              </div>

              <div className="flex justify-between border-t border-[color:var(--border)] pt-3">
                <span className="font-medium">Enterprise</span>
                <span>$80/seat/month</span>
              </div>
              <div className="pl-4 text-xs text-slate-700 dark:text-slate-300">
                25 mockups • 25 DOL reports • 15 weather reports
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <Button
            asChild
            className="mb-4 inline-flex w-full items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700"
          >
            <Link href="/pricing">
              <CreditCard className="h-5 w-5" />
              Subscribe Now
            </Link>
          </Button>

          {/* Secondary Actions */}
          <div className="flex flex-col justify-center gap-3 text-sm sm:flex-row">
            <a
              href="mailto:sales@skaiscrape.com?subject=Enterprise%20Plan%20Inquiry"
              className="inline-flex items-center justify-center gap-2 text-slate-700 transition hover:text-[color:var(--text)] dark:text-slate-300"
            >
              <Mail className="h-4 w-4" />
              Talk to Sales
            </a>

            <Link
              href="/pricing"
              className="inline-flex items-center justify-center gap-2 text-slate-700 transition hover:text-[color:var(--text)] dark:text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
              View All Plans
            </Link>
          </div>

          {/* Help Text */}
          <p className="mt-8 text-xs text-slate-700 dark:text-slate-300">
            Questions? Email us at{" "}
            <a
              href="mailto:support@skaiscrape.com"
              className="text-blue-600 underline hover:text-blue-700"
            >
              support@skaiscrape.com
            </a>
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-slate-700 dark:text-slate-300">
          <p>Your data is safe and will be accessible once you subscribe.</p>
        </div>
      </motion.div>
    </div>
  );
}
