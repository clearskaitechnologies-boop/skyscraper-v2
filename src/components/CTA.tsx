import { ArrowRight, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-hero py-24">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-primary-glow blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center text-primary-foreground">
          <h2 className="mb-6 text-4xl font-bold md:text-6xl">
            Ready to Take Your
            <span className="block">Trades Operation to the Next Level?</span>
          </h2>
          <p className="mb-8 text-xl opacity-90 md:text-2xl">
            Join trades pros already using ClearSKai's AI-powered intelligence to win more jobs,
            close deals faster, and work smarter.
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <Button variant="default" size="lg" className="px-8 text-lg">
              Start Free Trial <ArrowRight className="ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/10 px-8 text-lg text-white hover:bg-white/20"
            >
              <Calendar className="mr-2" /> Book a Demo
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm opacity-80">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Setup in 5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-accent" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
