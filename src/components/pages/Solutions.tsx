import { ArrowRight, FileText, Shield, Sparkles } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { SolutionsCTA } from "@/components/solutions/SolutionsCTA";
import TemplatePreview from "@/components/solutions/TemplatePreview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tabs = [
  {
    id: "retail",
    label: "Retail Proposal",
    icon: FileText,
    description: "Professional proposals that close deals faster",
    features: [
      "Custom branding & logo",
      "Material & color options",
      "Build code compliance",
      "AI mockups & visualizations",
      "Pricing breakdown with taxes",
      "Warranty & timeline details",
      "Digital signature collection",
    ],
    preview:
      "Impress homeowners with polished, branded proposals that include AI-restored mockups, material selections, and transparent pricing—all generated in minutes.",
    template: "retail",
  },
  {
    id: "insurance",
    label: "Insurance Claims Folder",
    icon: Shield,
    description: "Claims-ready documentation that adjusters approve",
    features: [
      "Pre-loss aerial imagery",
      "Weather verification (NOAA)",
      "Elevation damage grids",
      "IRC code citations",
      "Line-item scope & pricing",
      "Overhead & profit toggles",
      "Adjuster acknowledgment",
    ],
    preview:
      "Generate comprehensive insurance packets with pre-loss imagery, weather data, code justifications, and detailed scopes—ready for carrier submission.",
    template: "insurance",
  },
  {
    id: "inspection",
    label: "AI Inspection",
    icon: Sparkles,
    description: "Fast, accurate inspection reports with AI analysis",
    features: [
      "Photo upload & EXIF parsing",
      "AI damage detection",
      "Pitch & material identification",
      "Thermal analysis (optional)",
      "Risk scoring & recommendations",
      "Photo boards by elevation",
      "Executive summary",
    ],
    preview:
      "Upload inspection photos and let AI detect damage, identify materials, and generate a comprehensive report with recommendations and risk scoring.",
    template: "inspection",
  },
];

export default function Solutions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "retail";

  const active = tabs.find((t) => t.id === activeTab) || tabs[0];
  const Icon = active.icon;

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        {/* Header */}
        <section className="bg-gradient-subtle py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-8 text-center">
              <Badge className="mb-4" variant="secondary">
                Solutions
              </Badge>
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">
                Three Workflows,
                <span className="block text-primary">One Powerful Platform</span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
                Whether you're selling retail, filing claims, or conducting inspections—ClearSKai
                has you covered.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className={`rounded-2xl border px-6 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Left: Description */}
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-xl bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mb-3 text-3xl font-bold">{active.label}</h2>
                <p className="mb-6 text-lg text-muted-foreground">{active.description}</p>

                <p className="mb-6 text-muted-foreground">{active.preview}</p>

                <div className="mb-8 space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    What's Included
                  </h3>
                  <ul className="space-y-2">
                    {active.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                        <span className="text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link to={`/report-workbench?mode=${active.template}`}>
                  <Button variant={"hero" as any} size="lg" className="group">
                    Build in 60 Seconds
                    <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>

              {/* Right: Preview */}
              <Card className="border-2">
                <CardContent className="p-4">
                  <TemplatePreview
                    mode={active.template as "retail" | "insurance" | "inspection"}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-subtle py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-6 text-lg text-muted-foreground">
              Try any template for free. No credit card required.
            </p>
            <div className="flex justify-center">
              <SolutionsCTA />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
