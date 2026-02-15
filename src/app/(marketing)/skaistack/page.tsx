// src/app/(marketing)/skaistack/page.tsx
import { Bird, ChevronRight, Eye, Glasses, Layers, Monitor, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { CardShell } from "@/components/ui/card-shell";

const products = [
  {
    icon: Monitor,
    name: "SkaiScraper",
    tagline: "Command Center for Trades",
    description:
      "Centralizes inspections, storm data, homeowner reports, claims documentation, CRM workflows, and contractor communications in one AI-powered platform. From first knock to final invoice — this is where your operation lives.",
    highlights: [
      "AI Damage Builder & Smart Supplements",
      "Weather Intelligence & Storm Verification",
      "Trades Network & Team Collaboration",
      "Bad Faith Detection & Carrier Analytics",
    ],
    color: "from-blue-500 to-blue-600",
    status: "live" as const,
    href: "/features",
    ctaLabel: "Explore Features",
  },
  {
    icon: Glasses,
    name: "EyAi Inspect",
    tagline: "Autonomous Field Inspection Glasses",
    description:
      "Hands-free smart glasses with AR overlays, voice-activated notes, automatic damage detection, and instant cloud sync. Your inspection files are ready before you leave the roof.",
    highlights: [
      "AR damage overlays in real-time",
      "Voice-activated field notes",
      "Automatic damage detection & tagging",
      "Instant sync to SkaiScraper workspace",
    ],
    color: "from-emerald-500 to-teal-500",
    status: "coming-soon" as const,
    href: null,
    ctaLabel: "Coming Soon",
  },
  {
    icon: Bird,
    name: "BirdsEyAi",
    tagline: "Storm Intelligence, Reimagined",
    description:
      "Disguised camera birds with 4K sensors and AI processors monitor your property 24/7. Timestamped storm evidence, thermal detection, and instant SkaiScraper integration — proof before you even get the call.",
    highlights: [
      "24/7 autonomous property monitoring",
      "4K sensors with AI damage processors",
      "Timestamped storm evidence capture",
      "Thermal detection & instant alerts",
    ],
    color: "from-amber-500 to-orange-500",
    status: "coming-soon" as const,
    href: null,
    ctaLabel: "Coming Soon",
  },
];

const workflow = [
  {
    step: "01",
    icon: Bird,
    title: "Detect",
    description:
      "BirdsEyAi monitors properties and captures timestamped storm evidence autonomously.",
  },
  {
    step: "02",
    icon: Glasses,
    title: "Inspect",
    description: "EyAi Inspect glasses give your field team hands-free AR damage documentation.",
  },
  {
    step: "03",
    icon: Monitor,
    title: "Command",
    description:
      "SkaiScraper brings it all together — AI proposals, supplements, and claims management.",
  },
  {
    step: "04",
    icon: Zap,
    title: "Close",
    description:
      "From rooftop evidence to signed contract — faster closes, stronger claims, more wins.",
  },
];

export const metadata = {
  title: "SkaiStack™ – The Intelligence Platform",
  description:
    "One ecosystem. Total jobsite intelligence. SkaiScraper, EyAi Inspect, and BirdsEyAi — the complete trades technology stack.",
};

export default function SkaiStackPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#117CFF] via-[#0066DD] to-[#004AAD] py-24 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-[#FFC838]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-[#FFC838]" />
            <span className="text-sm font-medium">Intelligence Platform</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            The{" "}
            <span className="bg-gradient-to-r from-[#FFC838] to-[#FFD970] bg-clip-text text-transparent">
              SkaiStack™
            </span>{" "}
            Intelligence Platform
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            One ecosystem. Total jobsite intelligence. From rooftops to claims desks, from storm
            events to homeowner analytics — three products, one connected platform.
          </p>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#117CFF] shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Get Started with SkaiScraper
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/10"
            >
              Request Early Access
            </Link>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#117CFF]/20 bg-[#117CFF]/5 px-4 py-1.5 text-sm font-medium text-[#117CFF]">
            <Layers className="h-4 w-4" />
            The Stack
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Three products. <span className="text-[#117CFF]">One connected platform.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Each tool in the SkaiStack is powerful on its own — but together they create an
            intelligence loop that gives trades professionals an unbeatable edge.
          </p>
        </div>

        <div className="space-y-8">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <CardShell
                key={product.name}
                className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Coming Soon badge */}
                {product.status === "coming-soon" && (
                  <div className="absolute right-4 top-4 z-10 rounded-full bg-gradient-to-r from-[#FFC838] to-[#FFD970] px-3 py-1 text-xs font-bold text-slate-900 shadow-md">
                    Coming Soon
                  </div>
                )}
                {product.status === "live" && (
                  <div className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Live Now
                  </div>
                )}

                <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
                  {/* Icon */}
                  <div
                    className={`inline-flex shrink-0 rounded-xl bg-gradient-to-br ${product.color} p-4`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold tracking-tight text-foreground">
                      {product.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-[#117CFF]">{product.tagline}</p>
                    <p className="mt-3 leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>

                    {/* Highlights */}
                    <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                      {product.highlights.map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#117CFF]" />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {product.href ? (
                      <Link
                        href={product.href}
                        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#117CFF] transition-colors hover:text-[#0066DD]"
                      >
                        {product.ctaLabel}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                        {product.ctaLabel}
                      </span>
                    )}
                  </div>
                </div>
              </CardShell>
            );
          })}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="border-t bg-gradient-to-b from-slate-50 to-white py-24 dark:from-slate-900 dark:to-slate-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <Eye className="mx-auto mb-4 h-12 w-12 text-[#117CFF]" />
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How the <span className="text-[#117CFF]">SkaiStack</span> works
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              From autonomous storm detection to signed contracts — the intelligence loop that
              closes more jobs, faster.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="group rounded-3xl border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#117CFF]/10 text-sm font-bold text-[#117CFF]">
                    {step.step}
                  </div>
                  <div className="mx-auto mb-4 inline-flex rounded-xl bg-gradient-to-br from-[#117CFF] to-[#004AAD] p-3">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ecosystem Tagline */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#117CFF] to-[#004AAD] p-12 text-white shadow-2xl">
          <Layers className="mx-auto mb-4 h-10 w-10 text-[#FFC838]" />
          <h2 className="text-3xl font-bold sm:text-4xl">
            One Ecosystem. Total Jobsite Intelligence.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            From rooftops to claims desks, from storm events to homeowner analytics — the SkaiStack
            gives trades professionals the tools to move faster, document better, and win more work.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-[#117CFF] shadow-lg transition-all hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/contact"
              className="rounded-full border-2 border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Talk to Our Team
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
