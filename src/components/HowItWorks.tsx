import {
  BarChart,
  Brain,
  CheckCircle,
  FileText,
  Search,
  Share2,
  Thermometer,
  Upload,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      number: "01",
      title: "Address Lookup & Pre-Loss Data",
      description:
        "Enter property address to auto-load JE Shaw aerial imagery and property details. AI labels slopes, penetrations, and drainage zones.",
    },
    {
      icon: Upload,
      number: "02",
      title: "Select Date of Loss",
      description:
        "System suggests storms from NOAA/NWS with hail size and wind speed overlays for accurate verification.",
    },
    {
      icon: Brain,
      number: "03",
      title: "Capture & AI Analysis",
      description:
        "Upload photos or capture live. AI detects hail hits, wind lift, pooling, and suggests 2-4 caption options with code snippets.",
    },
    {
      icon: BarChart,
      number: "04",
      title: "Damage Percentile Score",
      description:
        "Get 0-100% insurance qualification likelihood. AI correlates visible damage with weather data and thermal scans.",
    },
    {
      icon: Thermometer,
      number: "05",
      title: "Thermal & Moisture Analysis",
      description:
        "Upload FLIR imagery for AI to highlight active leaks and saturated zones with precise mapping.",
    },
    {
      icon: FileText,
      number: "06",
      title: "Add Codes & Manufacturer Specs",
      description:
        "Pull OneClick Code data and attach manufacturer PDF specs (GAF, Westlake) automatically.",
    },
    {
      icon: CheckCircle,
      number: "07",
      title: "Generate AI Estimate",
      description:
        "AI compiles editable estimates, material take-offs, crew tasks, shopping lists, and job overview PDFs instantly.",
    },
    {
      icon: Share2,
      number: "08",
      title: "Export & Share",
      description:
        "Claims-Ready Folder with damage %, codes, thermals, mockups, weather summary, and secure sharing links.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            From Inspection to
            <span className="block text-primary">Claims-Ready Report</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            Our streamlined 8-step workflow takes you from property address to complete insurance
            report in under 10 minutes.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="group relative border-border transition-all duration-300 hover:shadow-lg-custom"
              >
                <div className="absolute -top-4 left-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-hero font-bold text-primary-foreground shadow-lg">
                  {step.number}
                </div>
                <CardContent className="p-6 pt-10">
                  <div className="mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-bold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-6 py-3">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="font-semibold text-success">Average completion time: 8 minutes</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
