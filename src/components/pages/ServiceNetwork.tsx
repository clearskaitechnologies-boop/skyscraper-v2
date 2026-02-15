import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function ServiceNetwork() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pb-16 pt-24">
        <div className="container mx-auto max-w-6xl px-4">
          <h1 className="mb-4 text-4xl font-bold">The Service Network™</h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Connect contractors, suppliers, and insurers. Post jobs, manage leads, and collaborate
            on projects.
          </p>
          <div className="mb-12 flex gap-4">
            <Link
              to="/crm/jobs"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Explore Jobs
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              Get Started
            </Link>
          </div>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Supplier Directory</h3>
              <p className="text-sm text-muted-foreground">
                Find vetted suppliers and view brand preferences.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Job Board</h3>
              <p className="text-sm text-muted-foreground">
                Post jobs, invite contractors, and manage bids.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Secure Messaging</h3>
              <p className="text-sm text-muted-foreground">
                Chat with attachments and token-based actions.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
