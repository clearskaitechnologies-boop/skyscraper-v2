import { Brain, Cloud, Code, FileCheck, ImageIcon,Satellite } from "lucide-react";

import aiAnalysis from "@/assets/ai-analysis.jpg";
import damageInspection from "@/assets/damage-inspection.jpg";
import weatherRadar from "@/assets/weather-radar.jpg";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Satellite,
      title: "JE Shaw Pre-Loss Imagery",
      description:
        "Statewide high-resolution aerial data with continual updates. See what your roof looked like before the storm.",
      image: weatherRadar,
      badge: "Real-Time",
    },
    {
      icon: Brain,
      title: "AI Damage Percentile",
      description:
        "Upload photos and get instant probability analysis. Know before you file with our confidence scoring system.",
      image: aiAnalysis,
      badge: "AI-Powered",
    },
    {
      icon: FileCheck,
      title: "Claims-Ready Reports",
      description:
        "Auto-compiled PDFs with evidence, weather verification, building codes, and manufacturer specs—in under 10 minutes.",
      image: damageInspection,
      badge: "Compliant",
    },
    {
      icon: Cloud,
      title: "NOAA Weather Integration",
      description:
        "Automatic weather verification with hail size, wind speed, and storm path data from official sources.",
      badge: "Verified",
    },
    {
      icon: Code,
      title: "Building Code Detection",
      description:
        "AI identifies applicable IRC codes and manufacturer specifications, auto-inserted with captions.",
      badge: "Automated",
    },
    {
      icon: ImageIcon,
      title: "AI Restoration Mockups",
      description:
        "Show clients their roof restored with AI-generated before/after renderings for professional presentations.",
      badge: "Visual",
    },
  ];

  return (
    <section id="features" className="bg-gradient-subtle py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4" variant="secondary">
            Platform Features
          </Badge>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Everything You Need for
            <span className="block text-primary">Lightning-Fast Claims</span>
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
            From pre-loss imagery to AI damage analysis, we've built the complete roofing
            intelligence platform.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="group overflow-hidden border-border transition-all duration-300 hover:shadow-xl-custom"
              >
                {feature.image && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={(feature.image as any)?.src || feature.image}
                      alt={feature.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="outline" className="border-accent/30 text-accent">
                      {feature.badge}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
