import { Brain, Satellite, Shield, Zap } from "lucide-react";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const values = [
    {
      icon: Zap,
      title: "Speed",
      description: "Generate claims-ready reports in minutes, not hours.",
    },
    {
      icon: Brain,
      title: "Intelligence",
      description: "AI-powered damage detection and compliance automation.",
    },
    {
      icon: Shield,
      title: "Reliability",
      description: "Built on verified data sources and industry standards.",
    },
    {
      icon: Satellite,
      title: "Innovation",
      description: "Cutting-edge aerial imagery and pre-loss mapping technology.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-20">
        <section className="bg-gradient-subtle py-16">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <Badge className="mb-4" variant="secondary">
              About ClearSKai
            </Badge>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Where the Skai Isn't the Limit,
              <span className="block text-primary">It's the Starting Point</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              We're building the future of trades intelligence—combining AI, project data, and
              automation to help trades pros close deals faster and run smarter operations.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-16 grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-3xl font-bold">Our Mission</h2>
                <p className="mb-4 text-muted-foreground">
                  ClearSKai was born from a simple frustration: why does it take days to compile a
                  professional roof inspection report when all the data already exists?
                </p>
                <p className="mb-4 text-muted-foreground">
                  We set out to solve this by uniting pre-loss aerial imagery, weather verification,
                  AI damage analysis, and building code compliance into one seamless platform.
                </p>
                <p className="text-muted-foreground">
                  Today, contractors use ClearSKai to generate retail proposals, insurance claim
                  packets, and inspection reports in under 10 minutes—with professional quality that
                  closes deals and gets claims approved faster.
                </p>
              </div>

              <div className="space-y-4">
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="mb-1 text-4xl font-bold text-primary">&lt;10 min</div>
                    <p className="text-sm text-muted-foreground">Average report generation time</p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="mb-1 text-4xl font-bold text-primary">90%</div>
                    <p className="text-sm text-muted-foreground">
                      Automation rate across workflows
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="mb-1 text-4xl font-bold text-primary">≤10 days</div>
                    <p className="text-sm text-muted-foreground">Faster claim approval times</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="mb-8 text-center text-3xl font-bold">What Drives Us</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {values.map((value, i) => {
                  const Icon = value.icon;
                  return (
                    <Card key={i}>
                      <CardContent className="p-6 text-center">
                        <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-3">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 font-semibold">{value.title}</h3>
                        <p className="text-sm text-muted-foreground">{value.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-muted/50 p-8 text-center">
              <h2 className="mb-3 text-2xl font-bold">Powered by Industry Leaders</h2>
              <p className="mb-6 text-muted-foreground">
                We partner with third-party aerial providers for pre-loss imagery, NOAA for weather
                verification, and leading AI providers for damage detection and code compliance
                automation.
              </p>
              <p className="text-sm text-muted-foreground">
                Trusted data. Proven results. Built for trades professionals.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
