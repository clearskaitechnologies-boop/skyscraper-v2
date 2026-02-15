import { Check, Zap } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Pricing = () => {
  return (
    <section id="pricing" className="bg-gradient-subtle py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <Badge className="mb-4" variant="secondary">
            Simple Pricing
          </Badge>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            One Plan.
            <span className="block text-primary">Everything Included.</span>
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground">
            $80 per seat per month. No tiers. No tokens. No limits. Every feature unlocked.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Book a demo → Get a free month</span>
          </div>
        </div>

        <div className="mx-auto max-w-lg">
          <Card className="relative ring-2 ring-primary transition-all duration-300 hover:shadow-xl-custom">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-hero text-primary-foreground">All-Inclusive</Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-2xl">SkaiScraper Pro</CardTitle>
              <CardDescription>Everything your team needs. Period.</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$80</span>
                <span className="text-muted-foreground"> / seat / month</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {[
                  "Unlimited AI reports & mockups",
                  "Unlimited weather verifications",
                  "Unlimited DOL data pulls",
                  "Smart Documents & e-signatures",
                  "AI damage analysis & proposals",
                  "Full Trades Network access",
                  "Company leaderboard & analytics",
                  "QuickBooks integration",
                  "Priority support",
                  "1–500 seats, scale as you grow",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-success" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Link to="/settings/billing" className="w-full">
                <Button variant="default" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>No hidden fees. No feature paywalls. Cancel anytime.</p>
          <p className="mt-2">All prices USD. Volume discounts available for 50+ seats.</p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
