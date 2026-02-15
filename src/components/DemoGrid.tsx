export default function DemoGrid() {
  const cards = [
    {
      title: "AI Suite",
      bullets: ["One-click PDF generation", "Smart damage summaries", "Carrier-ready formatting"],
    },
    {
      title: "Trades Network",
      bullets: [
        "Vendor onboarding & sync",
        "Read-only sharing for free accounts",
        "Upsell to full SkaiScraper access",
      ],
    },
    {
      title: "AI Proposals",
      bullets: ["Material & labor breakdowns", "Branding auto-applied", "E-sign & share links"],
    },
    {
      title: "AI Quick Claims Reports",
      bullets: ["NOAA/PLRB verification", "Date-of-Loss cross-checks", "IRC code citations"],
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((c) => (
          <div key={c.title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-medium">{c.title}</h3>
            <ul className="mt-3 space-y-2 text-gray-700">
              {c.bullets.map((b) => (
                <li key={b} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-900" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
