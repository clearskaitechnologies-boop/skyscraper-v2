import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import clearSkaiLogo from "@/assets/clearskai-logo.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

import OnboardingProgress from "./OnboardingProgress";

const Navigation = () => {
  const [email, setEmail] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setEmail(session?.user?.email || undefined)
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src={(clearSkaiLogo as any)?.src || clearSkaiLogo}
              alt="ClearSKai - SKai Scraper"
              className="h-12 w-auto"
            />
          </Link>

          <div
            className="hidden items-center gap-8 md:flex"
            role="navigation"
            aria-label="Main navigation"
          >
            <Link
              to="/retail"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="Retail"
            >
              Retail
            </Link>
            <Link
              to="/insurance"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="Insurance"
            >
              Insurance
            </Link>
            <Link
              to="/service-network"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="The Service Network"
            >
              The Service Network™
            </Link>
            <Link
              to="/crm"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="SkaiScraper CRM"
            >
              SkaiScraper CRM
            </Link>
            <Link
              to="/book-demo"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="Demo"
            >
              Demo
            </Link>
            <Link
              to="/about"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="About Us"
            >
              About Us
            </Link>
            <Link
              to="/contact"
              className="font-medium text-foreground transition-colors hover:text-primary"
              aria-label="Contact Us"
            >
              Contact Us
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {email && <OnboardingProgress />}
            {email ? (
              <>
                <span className="hidden text-sm text-muted-foreground md:inline">{email}</span>
                <Link to="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    const redirectTo = `${window.location.origin}/auth/callback`;
                    const { error } = await supabase.auth.signInWithOAuth({
                      provider: "google",
                      options: { redirectTo },
                    });
                    if (error) alert(error.message);
                  }}
                >
                  Sign in with Google
                </Button>
                <Link to="/auth/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/auth/login?mode=signup">
                  <Button variant="default">Start Free</Button>
                </Link>
              </>
            )}
            <Link to="/book-demo">
              <Button variant="default">Book a Demo</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
