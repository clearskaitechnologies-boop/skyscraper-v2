"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-blue-600">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to transform your trades operation?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
            Join trades professionals who are already using SkaiScraper to streamline their workflow
            and close more jobs — from insurance claims to retail projects.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  Start Free Trial
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm transition-all duration-200 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Go to Dashboard
              </Link>
            </SignedIn>

            <Link
              href="/contact"
              className="text-sm font-semibold leading-6 text-white transition-colors duration-200 hover:text-blue-100"
            >
              Contact Sales <span aria-hidden="true">→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
