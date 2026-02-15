import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import heroImage from "@/assets/hero-aerial-roofs.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}/auth/callback`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) alert(error.message);
}

const Hero = () => {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={(heroImage as any)?.src || heroImage}
          alt="Aerial view of residential rooftops"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 py-32">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
            <span className="font-semibold text-accent">AI-Powered Roofing Intelligence</span>
            <span className="text-muted-foreground">Where the Skai Isn't the Limit</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
            Where the Skai Isn't the Limit,
            <span className="block text-primary">It's the Starting Point</span>
          </h1>

          <p className="mb-8 text-xl leading-relaxed text-muted-foreground md:text-2xl">
            Unite ClearSKai's aerial data, AI analysis, and claim automation to elevate your roofing
            business. Generate claims-ready reports, AI mockups, and compliance documentation in
            minutes.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/book-demo">
              <Button variant={"hero" as any} size="lg" className="px-8 text-lg">
                Request a Demo <ArrowRight className="ml-2" />
              </Button>
            </Link>

            <Button
              variant="outline"
              size="lg"
              className="bg-background/80 px-8 text-lg"
              onClick={signInWithGoogle}
            >
              Continue with Google
            </Button>

            <Link to="/quickstart?mode=inspection">
              <Button variant="outline" size="lg" className="bg-background/80 px-8 text-lg">
                Try Demo Report
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>3 free reports/month</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span>Instant setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 py-6 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">{"<10"} min</div>
              <div className="text-sm text-muted-foreground">Report Generation</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">90%</div>
              <div className="text-sm text-muted-foreground">AI Automation</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">$2K+</div>
              <div className="text-sm text-muted-foreground">Avg. Job Value Increase</div>
            </div>
            <div>
              <div className="mb-1 text-3xl font-bold text-primary">≤10 days</div>
              <div className="text-sm text-muted-foreground">Claim Approval Time</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
