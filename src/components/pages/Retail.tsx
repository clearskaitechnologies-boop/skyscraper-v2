import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function Retail() {
  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pb-16 pt-24">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="mb-4 text-4xl font-bold text-foreground">
            Retail proposals, done in minutes.
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Cover page, overview, code & compliance, AI mockups, timeline, price breakdown,
            materials/colors, and warranties — in one PDF.
          </p>
          <div className="mb-12 flex gap-4">
            <Link
              to="/retail/build"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Retail Proposal
            </Link>
            <a
              href="#retail-intake"
              className="rounded-xl bg-secondary px-6 py-3 font-semibold text-secondary-foreground transition-opacity hover:opacity-90"
            >
              Request Inspection
            </a>
          </div>

          <form
            id="retail-intake"
            className="mt-10 grid gap-4 rounded-xl border border-border bg-card p-8 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const address = formData.get("address") as string;
              window.location.href = `/lead/new?address=${encodeURIComponent(address)}&leadType=retail&source=web_form`;
            }}
          >
            <h2 className="mb-4 text-2xl font-semibold sm:col-span-2">Request an Inspection</h2>
            <input
              name="name"
              placeholder="Full name"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              required
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              required
            />
            <input
              name="phone"
              type="tel"
              placeholder="Phone"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground"
              required
            />
            <input
              name="address"
              placeholder="Property address"
              className="rounded-lg border border-input bg-background px-4 py-3 text-foreground sm:col-span-2"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90 sm:col-span-2"
            >
              Create Lead
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}
