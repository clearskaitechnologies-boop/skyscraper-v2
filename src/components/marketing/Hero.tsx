"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-grid-slate-100 absolute inset-0 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-2xl text-center"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl"
          >
            AI-Powered{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Operations Hub
            </span>{" "}
            for Trades Pros
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-lg leading-8 text-slate-600"
          >
            Complete AI-powered project management for trades professionals. Generate proposals,
            analyze job sites, and streamline your workflow — from claims to retail to out-of-pocket
            work.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-x-6"
          >
            <SignedOut>
              <Link
                href="/sign-up"
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Get Started Free
              </Link>
            </SignedOut>

            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Go to Dashboard
              </Link>
            </SignedIn>

            <Link
              href="/demo"
              className="text-sm font-semibold leading-6 text-slate-900 transition-colors duration-200 hover:text-blue-600"
            >
              Watch Demo <span aria-hidden="true">→</span>
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mt-16 max-w-4xl"
        >
          <div className="relative rounded-xl bg-white p-2 shadow-2xl ring-1 ring-slate-900/10">
            <div className="rounded-lg bg-slate-50 px-6 py-8">
              <div className="mx-auto max-w-3xl text-center">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">
                  Trusted by Trades Professionals Nationwide
                </h3>
                <div className="grid grid-cols-3 gap-8 opacity-60">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-24 rounded bg-slate-300"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-24 rounded bg-slate-300"></div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-24 rounded bg-slate-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
