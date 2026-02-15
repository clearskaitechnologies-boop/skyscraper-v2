// ============================================================================
// H-11: Contractor Self-Signup Flow
// ============================================================================
//
// Public signup page for contractors to create accounts
// Flow:
//   1. Enter email (Clerk authentication)
//   2. Company information (name, address, phone)
//   3. Email verification (Clerk handles)
//   4. Create organization with Starter tier
//   5. Create admin user linked to organization
//   6. Redirect to onboarding/dashboard
//
// Features:
//   - Email/password signup via Clerk
//   - Company information collection
//   - Automatic Starter tier assignment
//   - Welcome email trigger
//   - Referral code tracking (optional)
//
// Route: /signup (public, not in app directory)
// ============================================================================

import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up | SkaiScrape - Insurance Claims Platform",
  description:
    "Create your contractor account and start managing insurance claims faster with AI-powered tools.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-block">
            <h1 className="text-3xl font-bold text-blue-600">SkaiScrape</h1>
          </Link>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">Start Managing Claims Smarter</h2>
          <p className="text-slate-600">
            Join thousands of contractors using AI to close claims faster
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          {/* Benefits Column */}
          <div className="rounded-2xl bg-white p-8 shadow-xl lg:p-12">
            <h3 className="mb-6 text-2xl font-bold text-slate-900">What You Get with SkaiScrape</h3>

            <div className="space-y-6">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900">AI Damage Analysis</h4>
                  <p className="text-sm text-slate-600">
                    Upload photos and get instant damage reports with scope of work recommendations
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900">Weather Reports</h4>
                  <p className="text-sm text-slate-600">
                    Automatic weather verification for hail, wind, and storm damage claims
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900">Client Portal</h4>
                  <p className="text-sm text-slate-600">
                    Give homeowners real-time access to their claim status and documents
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900">Supplement Management</h4>
                  <p className="text-sm text-slate-600">
                    Track and document supplemental items with photo evidence and pricing
                  </p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900">Trades Network</h4>
                  <p className="text-sm text-slate-600">
                    Connect with qualified sub-contractors and manage service requests
                  </p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <div>
                  <h4 className="mb-1 font-semibold text-slate-900">Mobile Ready</h4>
                  <p className="text-sm text-slate-600">
                    Upload photos and manage claims from your phone on the job site
                  </p>
                </div>
              </div>
            </div>

            {/* Pricing Preview */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <div className="rounded-lg bg-blue-50 p-6">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-lg font-semibold text-slate-900">Starter Plan</span>
                  <span className="text-2xl font-bold text-blue-600">$49/mo</span>
                </div>
                <p className="mb-3 text-sm text-slate-600">
                  Start with 10 claims/month, 100 AI credits, and 5GB storage
                </p>
                <ul className="space-y-1 text-sm text-slate-700">
                  <li>✓ All core features included</li>
                  <li>✓ Email support</li>
                  <li>✓ Upgrade anytime as you grow</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Signup Form Column */}
          <div className="flex items-center justify-center rounded-2xl bg-white p-8 shadow-xl lg:p-12">
            <div className="w-full max-w-md">
              <SignUp
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
                    card: "shadow-none",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    socialButtonsBlockButton: "border-slate-300 hover:bg-slate-50",
                    formFieldInput: "border-slate-300 focus:border-blue-500 focus:ring-blue-500",
                    footerActionLink: "text-blue-600 hover:text-blue-700",
                  },
                }}
                routing="path"
                path="/signup"
                signInUrl="/sign-in"
                afterSignUpUrl="/after-signup"
                redirectUrl="/after-signup"
              />

              {/* Additional Links */}
              <div className="mt-6 text-center text-sm text-slate-600">
                <p>
                  Already have an account?{" "}
                  <Link href="/sign-in" className="font-medium text-blue-600 hover:text-blue-700">
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-4 text-center text-xs text-slate-500">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="underline hover:text-slate-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-slate-700">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="mb-4 text-sm text-slate-600">Trusted by contractors nationwide</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="font-semibold text-slate-400">🏗️ 1,000+ Contractors</div>
            <div className="font-semibold text-slate-400">📊 50,000+ Claims Processed</div>
            <div className="font-semibold text-slate-400">⭐ 4.9/5 Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
}
