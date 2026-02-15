import Link from "next/link";

import GlassCard from "@/components/ui/GlassCard";

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] py-12 px-4 flex items-center justify-center">
      <div className="max-w-xl mx-auto text-center">
        <GlassCard>
          <div className="py-8">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-[color:var(--text)] mb-4">
              Thank You!
            </h1>
            <p className="text-slate-700 dark:text-slate-700 dark:text-slate-300 text-lg mb-6">
              Your inquiry has been received. Verified contractors in your area will review your project and reach out soon.
            </p>
            <div className="space-y-4">
              <div className="text-sm text-slate-700 dark:text-slate-700 dark:text-slate-300">
                <p>📧 Check your email for confirmation</p>
                <p>📞 Expect to hear from contractors within 24-48 hours</p>
              </div>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:scale-[1.02] transition shadow-[var(--glow)] mt-4"
              >
                Return Home
              </Link>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
