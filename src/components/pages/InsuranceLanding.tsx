import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function InsuranceLanding() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="pb-16 pt-24">
        <div className="container mx-auto max-w-5xl px-4">
          <h1 className="mb-4 text-4xl font-bold">
            Insurance contractors — faster estimates & compliant reports
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Tailored workflows for insurance scope, fast report generation, JE Shaw sync, and robust
            audit trails.
          </p>
          <div className="mb-12 flex gap-4">
            <Link
              to="/insurance/build"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Insurance Proposal
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              See Plans
            </Link>
          </div>

          <section className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Compliance-first</h3>
              <p className="text-sm text-muted-foreground">
                Export compliant PDFs & track changes for audits.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">Faster turnarounds</h3>
              <p className="text-sm text-muted-foreground">
                AI-assisted summaries and photo annotations speed your workflow.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-2 font-semibold">JE Shaw integration</h3>
              <p className="text-sm text-muted-foreground">
                Sync proposals and pricing to JE Shaw for seamless handoff.
              </p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
