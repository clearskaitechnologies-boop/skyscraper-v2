import { Link } from "react-router-dom";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";

export default function Features() {
  const blocks = [
    {
      title: "AI Inspection Workbench",
      mode: "inspection",
      points: [
        "6-step flow: Property → Data → Photos → Findings → Pricing → Preview",
        "AI summary from inspector notes + JE Shaw layers",
        "Auto photo captions and elevation boards",
      ],
    },
    {
      title: "Insurance-Ready Reports",
      mode: "insurance",
      points: [
        "Damage summary with map overlays",
        "Code items & justifications (IRC/local)",
        "One-click PDF export (client + server)",
      ],
    },
    {
      title: "Retail Proposals",
      mode: "retail",
      points: [
        "Materials & options with SKUs",
        "Price approval & countersign",
        "Signed PDF versioning",
      ],
    },
    {
      title: "JE Shaw Mapping",
      mode: null,
      points: [
        "Sync hail/wind/roof-risk layers",
        "Per-property snapshot freezes into report",
        "Admin: Sync Now + logs",
      ],
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1">
        <section className="px-4 py-20">
          <div className="container mx-auto max-w-6xl">
            <header className="mb-16 text-center">
              <h1 className="mb-4 text-4xl font-bold md:text-5xl">ClearSKai Features</h1>
              <p className="text-xl text-muted-foreground">
                AI-powered roofing intelligence & reporting
              </p>
            </header>

            <div className="mb-16 grid gap-8 md:grid-cols-2">
              {blocks.map((b) => (
                <article
                  key={b.title}
                  className="rounded-xl border p-8 transition-shadow hover:shadow-lg"
                >
                  <h2 className="mb-4 text-2xl font-bold">{b.title}</h2>
                  <ul className="mb-6 space-y-2">
                    {b.points.map((p) => (
                      <li key={p} className="flex items-start">
                        <span className="mr-2">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    {b.mode ? (
                      <>
                        <Link
                          to={`/quickstart?mode=${b.mode}`}
                          className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
                        >
                          Try it now →
                        </Link>
                        <Link
                          to={`/report-workbench?mode=${b.mode}`}
                          className="inline-block rounded-lg border px-6 py-3 transition-colors hover:bg-accent"
                        >
                          Pro mode
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/status-check"
                        className="inline-block rounded-lg bg-primary px-6 py-3 text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        View Status →
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>

            <section className="space-x-4 text-center">
              <Link
                to="/report-workbench"
                className="inline-block rounded-lg bg-primary px-8 py-4 text-primary-foreground transition-opacity hover:opacity-90"
              >
                Start a Report
              </Link>
              <Link
                to="/book-demo"
                className="inline-block rounded-lg border px-8 py-4 transition-colors hover:bg-accent"
              >
                Book a Demo
              </Link>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
