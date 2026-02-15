import { Check } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const tiers = [
  {
    name: "Free",
    price: "$0",
    period: "",
    description: "Best to try the flow",
    features: ["3 reports per month", "Basic PDF export", "Portal access", "AI photo captions"],
    cta: { label: "Try it now", to: "/quickstart?mode=inspection" },
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    description: "Solo inspectors & small teams",
    features: [
      "Unlimited reports",
      "Server PDFs",
      "JE Shaw Sync",
      "AI summaries & code suggestions",
    ],
    cta: { label: "Try it now", to: "/quickstart?mode=insurance" },
  },
  {
    name: "Plus",
    price: "$99",
    period: "/mo",
    description: "Growing contractors",
    features: ["Roles & signatures", "Share links", "Priority support", "Custom branding"],
    cta: { label: "Try it now", to: "/quickstart?mode=retail" },
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Large or multi-region orgs",
    features: ["SAML/SSO", "Custom templates", "SLAs & training", "Dedicated account manager"],
    cta: { label: "Talk to Sales", to: "/book-demo" },
  },
];

export default function Pricing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">Simple, Transparent Pricing</h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground">
              Plans that grow with your team
            </p>
          </div>

          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier) => (
              <Card key={tier.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="mb-6 text-4xl font-bold">
                    {tier.price}
                    {tier.period && (
                      <span className="text-xl text-muted-foreground">{tier.period}</span>
                    )}
                  </div>
                  <ul className="space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link to={tier.cta.to} className="w-full">
                    <Button className="w-full" size="lg">
                      {tier.cta.label}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>

          <p className="mt-12 text-center text-muted-foreground">
            All plans include AI summary, photo captions, and PDF exports. JE Shaw sync included in
            Pro+.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
