import {
  Building2,
  CheckCircle2,
  Cloud,
  FileText,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";

export function MarketingLanding() {
  return (
    <div className="space-y-32 pb-24">
      {/* Hero Section - Tesla-Polished */}
      <section className="relative overflow-hidden px-4 py-16 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#117CFF]/5 via-transparent to-[#FFC838]/5" />
        <div className="relative mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-block rounded-full border border-[#117CFF]/20 bg-[#117CFF]/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#117CFF]">
            Live in Production • Built for Trades Professionals
          </div>
          <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-7xl lg:text-8xl">
            <span className="bg-gradient-to-r from-[#117CFF] via-[#1E88FF] to-[#FFC838] bg-clip-text text-transparent">
              Your Trades Operation
            </span>
            <br />
            <span className="text-slate-900 dark:text-white">Runs on AI</span>
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-lg leading-relaxed text-slate-600 dark:text-slate-400 md:text-xl md:leading-relaxed">
            SkaiScraper is the command center for the modern tradesman. From insurance claims to
            retail jobs, financing to out-of-pocket repairs — manage every project, track every
            dollar, and keep clients in the loop with AI-powered tools built for speed.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="group w-full rounded-full bg-gradient-blue px-10 py-5 text-base font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-xl sm:w-auto"
            >
              Start Free Today
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/sign-in"
              className="w-full rounded-full border-2 border-[#117CFF] bg-white px-10 py-5 text-base font-bold text-[#117CFF] transition-all hover:bg-[#117CFF] hover:text-white dark:bg-slate-900 dark:hover:bg-[#117CFF] sm:w-auto"
            >
              Pro Sign In
            </Link>
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-500">
            No credit card required • Full feature access • Cancel anytime
          </p>
        </div>
      </section>

      {/* Built for Trades Professionals */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#117CFF]/10 px-4 py-2">
              <Building2 className="h-4 w-4 text-[#117CFF]" />
              <span className="text-sm font-bold uppercase tracking-wider text-[#117CFF]">
                For Trades Professionals
              </span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              Built for Scale, Designed for Speed
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Everything you need to run a modern trades operation — roofing, restoration, HVAC,
              solar, and beyond
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Zap className="h-6 w-6" />,
                title: "AI Project Intelligence",
                desc: "Upload photos, get instant AI-generated assessments with measurements, material estimates, and scope recommendations — for claims or retail jobs.",
              },
              {
                icon: <Cloud className="h-6 w-6" />,
                title: "Weather Verification",
                desc: "High-fidelity storm data using Iowa Mesonet integration. Prove date of loss for claims or document conditions for any project.",
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Smart Documentation",
                desc: "AI-generated proposals, supplements, and rebuttals. Professional documents that write themselves — saving hours on every file.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Trades Network",
                desc: "Connect with verified trades, manage sub work orders, and build your professional network all in one place.",
              },
              {
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "Client Portal",
                desc: "Branded portal for clients to view progress, upload photos, approve estimates, and stay connected 24/7. Total transparency builds trust.",
              },
              {
                icon: <TrendingUp className="h-6 w-6" />,
                title: "Complete Job Tracking",
                desc: "From lead intake to final payment — claims, retail, financing, out-of-pocket. Track every job and every dollar in real-time.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#117CFF] to-[#0D63CC] text-white shadow-lg">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Homeowners */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-[#FFC838]/20 bg-gradient-to-br from-amber-50 to-orange-50 p-12 dark:from-amber-950/20 dark:to-orange-950/20 md:p-16">
            <div className="mb-12 text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#FFC838]/20 px-4 py-2">
                <Users className="h-4 w-4 text-[#FFC838]" />
                <span className="text-sm font-bold uppercase tracking-wider text-[#FFC838]">
                  For Your Clients
                </span>
              </div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
                Clients Stay Connected, Stay Informed
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700 dark:text-slate-300">
                Give your clients the experience they deserve — complete visibility into their
                project from start to finish
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "🏡 Track Their Project",
                  desc: "Clients see real-time updates on every job. From initial inspection to final walkthrough, they always know where things stand.",
                },
                {
                  title: "📸 Upload Photos Instantly",
                  desc: "Clients document issues directly from their phone. Photos sync instantly so your team is always up to speed.",
                },
                {
                  title: "💬 Direct Communication",
                  desc: "In-app messaging means no more phone tag or email chains. Questions get answered, approvals happen fast.",
                },
                {
                  title: "✅ Transparent Process",
                  desc: "Know what's happening and why. Clear timelines, estimates, and progress tracking you can understand.",
                },
              ].map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="text-3xl">{feature.title.split(" ")[0]}</div>
                  <div>
                    <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                      {feature.title.split(" ").slice(1).join(" ")}
                    </h3>
                    <p className="leading-relaxed text-slate-700 dark:text-slate-300">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Simple Steps */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              From first contact to final payment — in three simple steps
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Capture & Document",
                desc: "Take photos from your phone or upload from desktop. Our AI immediately analyzes the scope — whether it's storm damage, a renovation, or routine repair.",
                icon: "📸",
              },
              {
                step: "2",
                title: "AI Does the Heavy Lifting",
                desc: "SkaiScraper AI generates professional assessments, verifies weather data, and produces ready-to-send proposals. Hours of work done in minutes.",
                icon: "🤖",
              },
              {
                step: "3",
                title: "Close & Get Paid",
                desc: "Send proposals, get approvals, track progress. Your client sees everything. You get paid faster. Everyone wins.",
                icon: "💰",
              },
            ].map((step) => (
              <div
                key={step.step}
                className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#117CFF] to-[#0D63CC] text-lg font-bold text-white shadow-lg">
                  {step.icon}
                </div>
                <div className="text-sm font-semibold text-[#117CFF]">Step {step.step}</div>
                <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try It Live — Demo Teaser */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/features#live-demo"
            className="group block overflow-hidden rounded-3xl border border-[#117CFF]/20 bg-gradient-to-r from-[#117CFF]/5 via-white to-[#FFC838]/5 p-12 text-center transition-all hover:border-[#117CFF]/40 hover:shadow-xl dark:from-[#117CFF]/10 dark:via-slate-900 dark:to-[#FFC838]/10"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#117CFF]/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#117CFF]">
              <Sparkles className="h-3.5 w-3.5" />
              Live Interactive Demo
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
              See the AI in Action — No Sign-Up Required
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Watch SkaiScraper generate a real damage assessment in real-time, then explore an
              interactive claim workspace with all five modules.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-lg font-semibold text-[#117CFF] transition-transform group-hover:translate-x-1">
              Try the Live Demo
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust + Stats */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl rounded-3xl border border-slate-200 bg-white p-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { label: "AI-generated project documents", value: "1,200+" },
              { label: "Hours saved per job (avg.)", value: "14+" },
              { label: "Trades professionals powered", value: "600+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-[#117CFF] via-[#1E88FF] to-[#FFC838] p-12 text-center text-white shadow-2xl">
          <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Ready to work smarter?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
            Join trades professionals who are cutting hours off every job. Upload photos, generate
            proposals, and close deals faster — whether it's insurance work, retail, or
            out-of-pocket.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-10 py-4 text-base font-bold text-[#117CFF] shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              Start Free Today
            </Link>
            <Link
              href="/sign-in"
              className="rounded-full border-2 border-white/80 px-10 py-4 text-base font-bold text-white transition-all hover:-translate-y-1 hover:bg-white/10"
            >
              Pro Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
