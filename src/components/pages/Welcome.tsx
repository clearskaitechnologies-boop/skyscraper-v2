import { ArrowRight, FileCheck, Map, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND, PRODUCT_FEATURES } from "@/lib/brand";

const Welcome = () => {
  const features = [
    {
      icon: Map,
      title: "Map-based CRM",
      description: "Track every property, storm event, and proposal on one interactive map.",
    },
    {
      icon: Zap,
      title: "AI Proposal Engine",
      description: PRODUCT_FEATURES.instantGeneration.description,
    },
    {
      icon: FileCheck,
      title: "Codes & Compliance",
      description: "Auto-attach local building codes and manufacturer specs.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mx-auto mb-20 max-w-4xl text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80">
            <span className="text-3xl font-bold text-primary-foreground">CS</span>
          </div>

          <h1 className="mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
            Built by tradesmen, for tradesmen.
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            {BRAND.values.vision}
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/map">
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 grid gap-6 md:grid-cols-3">
          {features.map((feature, idx) => (
            <Card key={idx} className="border-2 transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="p-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">{BRAND.tagline}</h2>
            <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
              Generate complete, claims-ready proposals in under 60 seconds with AI-powered damage
              assessment and weather integration.
            </p>
            <Link to="/">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Launch Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Welcome;
