import clearSkaiLogo from "@/assets/clearskai-logo.jpg";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div>
            <img
              src={(clearSkaiLogo as any)?.src || clearSkaiLogo}
              alt="ClearSKai - SKai Scraper"
              className="mb-4 h-12 w-auto"
            />
            <p className="text-sm text-muted-foreground">
              SKai Scraper by ClearSKai™. AI-powered roofing intelligence platform helping
              contractors, adjusters, and restoration pros generate claims-ready reports in minutes.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#features" className="transition-colors hover:text-primary">
                  Features
                </a>
              </li>
              <li>
                <a href="/#pricing" className="transition-colors hover:text-primary">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/integrations" className="transition-colors hover:text-primary">
                  Integrations
                </a>
              </li>
              <li>
                <a href="/docs" className="transition-colors hover:text-primary">
                  API Docs
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/about" className="transition-colors hover:text-primary">
                  About Us
                </a>
              </li>
              <li>
                <a href="/careers" className="transition-colors hover:text-primary">
                  Careers
                </a>
              </li>
              <li>
                <a href="/contact" className="transition-colors hover:text-primary">
                  Contact
                </a>
              </li>
              <li>
                <a href="/blog" className="transition-colors hover:text-primary">
                  Blog
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/help" className="transition-colors hover:text-primary">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/docs" className="transition-colors hover:text-primary">
                  Documentation
                </a>
              </li>
              <li>
                <a href="/training" className="transition-colors hover:text-primary">
                  Training
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <div className="text-center md:text-left">
            <p>© {new Date().getFullYear()} ClearSKai™. All rights reserved.</p>
            <p className="mt-1 text-xs">Where the skai isn't the limit—it's the starting point.</p>
          </div>
          <div className="flex gap-6">
            <a href="/privacy" className="transition-colors hover:text-primary">
              Privacy Policy
            </a>
            <a href="/terms" className="transition-colors hover:text-primary">
              Terms of Service
            </a>
            <a href="/cookies" className="transition-colors hover:text-primary">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
