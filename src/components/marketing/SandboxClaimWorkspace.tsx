"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Cloud,
  CloudRain,
  DollarSign,
  FileText,
  Home,
  MapPin,
  Shield,
  Sparkles,
  TrendingUp,
  User,
  Wind,
  Zap,
} from "lucide-react";
import { useState } from "react";

/* ------------------------------------------------------------------ */
/*  Mock claim data                                                    */
/* ------------------------------------------------------------------ */

const CLAIM = {
  id: "CLM-2026-00847",
  status: "In Progress",
  priority: "High",
  address: "4821 N Thunderbird Way, Flagstaff, AZ 86004",
  homeowner: "Michael & Sarah Chen",
  phone: "(928) 555-0147",
  email: "m.chen@email.com",
  dateOfLoss: "Jan 15, 2026",
  dateCreated: "Jan 16, 2026",
  carrier: "State Farm",
  policyNumber: "SF-AZ-2024-88412",
  claimNumber: "48-7291-MC",
  roofSystem: "Architectural Shingle — CertainTeed Landmark Pro",
  squares: "32.4",
  slope: "6/12 hip-and-valley",
  roofAge: "8 years",
  estimatedRCV: "$28,470.00",
  depreciation: "$4,840.00",
  acv: "$23,630.00",
  adjuster: "Tom Brennan — State Farm Field",
};

const PHOTOS = [
  {
    label: "South Slope — Impact Zone",
    tag: "Hail Damage",
    color: "from-red-500/60 to-red-600/40",
  },
  { label: "Ridge Cap — 60% Split", tag: "Critical", color: "from-amber-500/60 to-orange-500/40" },
  {
    label: "Soft Metal — Pipe Boot",
    tag: "Confirmed",
    color: "from-emerald-500/60 to-green-500/40",
  },
  { label: "Gutter Denting — South", tag: "Collateral", color: "from-blue-500/60 to-blue-600/40" },
  {
    label: "Test Square — 47 Marks",
    tag: "Documented",
    color: "from-purple-500/60 to-violet-500/40",
  },
  {
    label: "HVAC Condenser — Dimpling",
    tag: "Collateral",
    color: "from-sky-500/60 to-cyan-500/40",
  },
];

const WEATHER_DATA = {
  event: "Winter Hail Storm",
  date: "January 15, 2026",
  hailSize: '1.25"',
  windSpeed: "58 mph sustained / 72 mph gusts",
  direction: "SW → NE",
  duration: "22 minutes",
  source: "NOAA Storm Prediction Center",
  confidence: "97%",
  radarConfirmed: true,
};

const TIMELINE = [
  {
    date: "Jan 15",
    time: "2:32 PM",
    event: "Storm event — hail confirmed via NOAA radar",
    icon: CloudRain,
    type: "storm" as const,
  },
  {
    date: "Jan 16",
    time: "9:15 AM",
    event: "Claim created — homeowner intake completed",
    icon: FileText,
    type: "action" as const,
  },
  {
    date: "Jan 16",
    time: "10:00 AM",
    event: "Weather intelligence report auto-generated",
    icon: Cloud,
    type: "ai" as const,
  },
  {
    date: "Jan 17",
    time: "8:30 AM",
    event: "Field inspection scheduled — assigned to crew",
    icon: Camera,
    type: "action" as const,
  },
  {
    date: "Jan 17",
    time: "1:45 PM",
    event: "52 photos uploaded + damage annotations",
    icon: Camera,
    type: "action" as const,
  },
  {
    date: "Jan 17",
    time: "2:10 PM",
    event: "AI Damage Builder — narrative generated (2.4s)",
    icon: Sparkles,
    type: "ai" as const,
  },
  {
    date: "Jan 18",
    time: "9:00 AM",
    event: "Proposal PDF exported — sent to homeowner",
    icon: FileText,
    type: "action" as const,
  },
  {
    date: "Jan 20",
    time: "11:30 AM",
    event: "Adjuster meeting — Tom Brennan (State Farm)",
    icon: User,
    type: "action" as const,
  },
  {
    date: "Jan 22",
    time: "3:15 PM",
    event: "Carrier response — partial denial received",
    icon: AlertTriangle,
    type: "warning" as const,
  },
  {
    date: "Jan 22",
    time: "3:20 PM",
    event: "Bad faith pattern detected — documentation flagged",
    icon: Shield,
    type: "ai" as const,
  },
  {
    date: "Jan 22",
    time: "4:00 PM",
    event: "AI supplement generated — rebuttal drafted",
    icon: Zap,
    type: "ai" as const,
  },
  {
    date: "Jan 25",
    time: "10:00 AM",
    event: "Supplement submitted to carrier",
    icon: TrendingUp,
    type: "action" as const,
  },
];

const AI_NARRATIVE = `PROPERTY DAMAGE ASSESSMENT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Property: 4821 N Thunderbird Way, Flagstaff, AZ 86004
Date of Loss: January 15, 2026
Inspector: Field Tech — SkaiScraper AI Engine v3.2

ROOF SYSTEM ANALYSIS
────────────────────
System: Architectural Shingle — CertainTeed Landmark Pro
Roof Age: 8 years  |  Squares: 32.4
Slope: 6/12 hip-and-valley configuration

STORM DAMAGE FINDINGS
────────────────────
Hail Impact: Confirmed — 1.25″ diameter via NOAA radar
Wind Speed: Sustained 58 mph / Gusts 72 mph at 14:32 MST

Damage observed on all four slopes with concentrated impact
zones on south and west exposures. Soft metal test points on
ridge vents, pipe boots, and drip edge confirm hail impact
trajectory consistent with recorded storm path.

SHINGLE DAMAGE DETAIL
────────────────────
✓  47 impact marks per 10×10 test square
✓  Granule displacement — exposed fiberglass mat
✓  Fracturing along bond line on south slope
✓  Bruising confirmed via tactile on north slope
✓  Ridge caps: splits at 60% of test points

COLLATERAL DAMAGE
────────────────────
• Gutters — 18 impacts per 10 LF (south-facing)
• Window screens — 3 screens with perforation
• Fence — 12 pickets with hail scarring (west)
• HVAC condenser — top grille dimpling

RECOMMENDATION
────────────────────
Full roof system replacement recommended.
Damage exceeds repair threshold per manufacturer
warranty guidelines.

Estimated RCV:     $28,470.00
Depreciation:       $4,840.00
ACV:               $23,630.00

— Generated by SkaiScraper AI Engine v3.2`;

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

type Tab = "overview" | "photos" | "narrative" | "weather" | "timeline";

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "weather", label: "Weather Intel", icon: Cloud },
  { id: "timeline", label: "Timeline", icon: Clock },
  { id: "narrative", label: "AI Narrative", icon: Sparkles },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SandboxClaimWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-3 dark:from-slate-800/80 dark:to-slate-800/50">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-1">
            <span className="text-xs text-muted-foreground">
              app.skaiscrape.com/claims/{CLAIM.id}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-gradient-to-r from-[#FFC838] to-[#FFD970] px-3 py-1 text-[10px] font-bold text-slate-900">
            INTERACTIVE DEMO
          </span>
        </div>
      </div>

      {/* Claim header */}
      <div className="border-b border-border bg-gradient-to-r from-[#117CFF]/5 to-transparent px-6 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-foreground">{CLAIM.id}</h3>
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                {CLAIM.status}
              </span>
              <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-600 dark:text-red-400">
                {CLAIM.priority}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {CLAIM.address}
            </div>
          </div>
          <div className="flex items-center gap-4 text-right text-xs text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">{CLAIM.homeowner}</p>
              <p>
                {CLAIM.carrier} — {CLAIM.claimNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto border-b border-border bg-muted/30 px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex shrink-0 items-center gap-1.5 px-4 py-3 text-xs font-semibold transition-colors ${
                isActive ? "text-[#117CFF]" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="sandbox-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#117CFF]"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="min-h-[420px] p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "photos" && <PhotosTab />}
            {activeTab === "narrative" && <NarrativeTab />}
            {activeTab === "weather" && <WeatherTab />}
            {activeTab === "timeline" && <TimelineTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Overview                                                      */
/* ------------------------------------------------------------------ */

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          icon={DollarSign}
          label="Estimated RCV"
          value={CLAIM.estimatedRCV}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          icon={DollarSign}
          label="ACV"
          value={CLAIM.acv}
          color="text-blue-600 dark:text-blue-400"
        />
        <KpiCard
          icon={Calendar}
          label="Date of Loss"
          value={CLAIM.dateOfLoss}
          color="text-amber-600 dark:text-amber-400"
        />
        <KpiCard
          icon={Shield}
          label="Carrier"
          value={CLAIM.carrier}
          color="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Two column detail */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Property info */}
        <div className="rounded-2xl border border-border bg-muted/30 p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Property Details
          </h4>
          <div className="space-y-2.5">
            <DetailRow label="Address" value={CLAIM.address} />
            <DetailRow label="Homeowner" value={CLAIM.homeowner} />
            <DetailRow label="Roof System" value={CLAIM.roofSystem} />
            <DetailRow label="Squares" value={CLAIM.squares} />
            <DetailRow label="Slope" value={CLAIM.slope} />
            <DetailRow label="Roof Age" value={CLAIM.roofAge} />
          </div>
        </div>

        {/* Claim info */}
        <div className="rounded-2xl border border-border bg-muted/30 p-5">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Claim Details
          </h4>
          <div className="space-y-2.5">
            <DetailRow label="Claim #" value={CLAIM.claimNumber} />
            <DetailRow label="Policy #" value={CLAIM.policyNumber} />
            <DetailRow label="Carrier" value={CLAIM.carrier} />
            <DetailRow label="Adjuster" value={CLAIM.adjuster} />
            <DetailRow label="Date Created" value={CLAIM.dateCreated} />
            <DetailRow label="Depreciation" value={CLAIM.depreciation} />
          </div>
        </div>
      </div>

      {/* AI Insights strip */}
      <div className="rounded-2xl border border-[#117CFF]/20 bg-[#117CFF]/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[#117CFF]">
          <Sparkles className="h-4 w-4" />
          AI Insights
        </div>
        <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            Storm verified — 97% confidence
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Bad faith pattern flagged (1)
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-[#117CFF]" />
            Supplement auto-generated
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Photos                                                        */
/* ------------------------------------------------------------------ */

function PhotosTab() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          52 Photos — <span className="text-muted-foreground">6 shown</span>
        </p>
        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          AI Annotated
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PHOTOS.map((photo, i) => (
          <motion.div
            key={photo.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-xl border border-border"
          >
            {/* Placeholder photo */}
            <div className={`flex h-32 items-end bg-gradient-to-br ${photo.color} p-3 sm:h-40`}>
              <Camera className="absolute right-3 top-3 h-5 w-5 text-white/40" />
              <div>
                <span className="mb-1 inline-block rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-slate-800 dark:bg-slate-900/90 dark:text-slate-200">
                  {photo.tag}
                </span>
                <p className="text-[11px] font-medium leading-tight text-white drop-shadow-md">
                  {photo.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Photos are AI-annotated with damage markers, measurements, and GPS coordinates
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: AI Narrative                                                  */
/* ------------------------------------------------------------------ */

function NarrativeTab() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#117CFF]" />
          <p className="text-sm font-semibold text-foreground">AI-Generated Damage Assessment</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> 2.4s generation
          </span>
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-semibold text-emerald-600 dark:text-emerald-400">
            PDF Ready
          </span>
        </div>
      </div>
      {/* Professional PDF-style layout */}
      <div className="max-h-[360px] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-50">
        {/* PDF Header Bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-800">Property Damage Assessment</p>
              <p className="text-[9px] text-slate-500">SkaiScraper AI Engine v3.2</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
            PDF READY
          </span>
        </div>

        {/* PDF Content */}
        <div className="p-5 font-sans text-[12px] leading-relaxed text-slate-800">
          {AI_NARRATIVE.split("\n").map((line, i) => {
            if (
              line.startsWith("PROPERTY DAMAGE") ||
              line.startsWith("ROOF SYSTEM") ||
              line.startsWith("STORM DAMAGE") ||
              line.startsWith("SHINGLE DAMAGE") ||
              line.startsWith("COLLATERAL") ||
              line.startsWith("RECOMMENDATION")
            ) {
              return (
                <h3
                  key={i}
                  className="mb-1 mt-4 text-[13px] font-bold tracking-wide text-blue-900 first:mt-0"
                >
                  {line}
                </h3>
              );
            }
            if (line.startsWith("━") || line.startsWith("─")) {
              return <hr key={i} className="my-1.5 border-blue-200" />;
            }
            if (line.startsWith("✓")) {
              return (
                <p key={i} className="flex items-start gap-1.5 py-0.5 text-emerald-700">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>{line.slice(2).trim()}</span>
                </p>
              );
            }
            if (line.startsWith("•")) {
              return (
                <p key={i} className="py-0.5 pl-3 text-slate-700">
                  {line}
                </p>
              );
            }
            if (
              line.startsWith("Estimated RCV") ||
              line.startsWith("Depreciation") ||
              line.startsWith("ACV")
            ) {
              return (
                <p key={i} className="font-semibold text-slate-900">
                  {line}
                </p>
              );
            }
            if (line.startsWith("— Generated")) {
              return (
                <p
                  key={i}
                  className="mt-3 border-t border-slate-200 pt-2 text-[10px] italic text-slate-400"
                >
                  {line}
                </p>
              );
            }
            if (line.trim() === "") return <div key={i} className="h-2" />;
            return (
              <p key={i} className="text-slate-700">
                {line}
              </p>
            );
          })}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" /> 6 sections
        </span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Storm data cross-referenced
        </span>
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3" /> Code-compliant language
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Weather                                                       */
/* ------------------------------------------------------------------ */

function WeatherTab() {
  return (
    <div className="space-y-6">
      {/* Weather event header */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-sky-500/5 to-blue-500/5 p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 p-3">
            <CloudRain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-foreground">{WEATHER_DATA.event}</h4>
            <p className="text-sm text-muted-foreground">{WEATHER_DATA.date}</p>
          </div>
          <div className="ml-auto">
            {WEATHER_DATA.radarConfirmed && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Radar Confirmed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <WeatherStat icon={Cloud} label="Hail Size" value={WEATHER_DATA.hailSize} />
        <WeatherStat icon={Wind} label="Wind Speed" value={WEATHER_DATA.windSpeed} />
        <WeatherStat icon={TrendingUp} label="Direction" value={WEATHER_DATA.direction} />
        <WeatherStat icon={Clock} label="Duration" value={WEATHER_DATA.duration} />
        <WeatherStat icon={Shield} label="Confidence" value={WEATHER_DATA.confidence} />
        <WeatherStat icon={FileText} label="Source" value={WEATHER_DATA.source} />
      </div>

      {/* Mock radar visualization */}
      <div className="relative overflow-hidden rounded-2xl border border-border">
        <div className="flex h-48 items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          {/* Fake radar rings */}
          <div className="relative">
            <div className="absolute -inset-20 rounded-full border border-emerald-500/10" />
            <div className="absolute -inset-14 rounded-full border border-emerald-500/15" />
            <div className="absolute -inset-8 rounded-full border border-emerald-500/20" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/40">
              <MapPin className="h-5 w-5 text-emerald-400" />
            </div>
            {/* Storm cells */}
            <div className="absolute -left-16 -top-12 h-8 w-12 rounded-full bg-red-500/30 blur-sm" />
            <div className="absolute -left-10 -top-8 h-6 w-10 rounded-full bg-amber-500/30 blur-sm" />
            <div className="absolute -left-6 -top-4 h-4 w-6 rounded-full bg-yellow-500/25 blur-sm" />
          </div>
          <div className="absolute bottom-3 left-3 text-[10px] text-emerald-500/60">
            NOAA NEXRAD — Flagstaff, AZ — 14:32 MST
          </div>
          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-[10px]">
            <span className="flex items-center gap-1 text-red-400/60">■ Severe</span>
            <span className="flex items-center gap-1 text-amber-400/60">■ Moderate</span>
            <span className="flex items-center gap-1 text-yellow-400/60">■ Light</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab: Timeline                                                      */
/* ------------------------------------------------------------------ */

function TimelineTab() {
  const typeColor = {
    storm: "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400",
    action: "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ai: "border-[#FFC838] bg-[#FFC838]/10 text-amber-600 dark:text-amber-400",
    warning: "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Claim Activity</p>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-blue-500">● Manual</span>
          <span className="flex items-center gap-1 text-[#FFC838]">● AI Action</span>
          <span className="flex items-center gap-1 text-red-500">● Storm Event</span>
        </div>
      </div>
      <div className="relative max-h-[360px] space-y-1 overflow-y-auto pl-6">
        {/* Vertical line */}
        <div className="absolute bottom-0 left-[11px] top-2 w-px bg-border" />

        {TIMELINE.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="relative flex items-start gap-3 py-2"
            >
              {/* Dot */}
              <div
                className={`absolute left-[-18px] top-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${typeColor[item.type]}`}
              >
                <Icon className="h-2.5 w-2.5" />
              </div>

              {/* Content */}
              <div className="flex flex-1 items-baseline justify-between gap-4">
                <p className="text-xs leading-relaxed text-foreground">{item.event}</p>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {item.date} · {item.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared sub-components                                              */
/* ------------------------------------------------------------------ */

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className={`h-3.5 w-3.5 ${color}`} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

function WeatherStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Cloud;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-sky-500" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
