import React from "react";

const items = [
  { slug: "ai-damage", title: "AI Damage Builder" },
  { slug: "scope-summary", title: "Scope Summary" },
  { slug: "weather-code", title: "Weather + Code Panel" },
  { slug: "code-compliance", title: "Code Compliance & Justification" },
  { slug: "production-plan", title: "Production Plan & Timeline" },
  { slug: "warranty", title: "Warranty & Final Closeout" },
  { slug: "company-profile", title: "Company Profile & Credentials" },
  { slug: "homeowner", title: "Homeowner Impact Reports" },
];

function ImgWithFallback({ slug, title }: { slug: string; title: string }) {
  const candidates = [
    `/mockups/${slug}/hero.jpg`,
    `/mockups/${slug}/hero.png`,
    `/mockups/${slug}/hero.svg`,
  ];
  const [srcIdx, setIdx] = React.useState(0);
  return (
    <figure style={{ maxWidth: 1200, margin: "2rem auto", padding: "0 1rem" }}>
      <h3 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "0.75rem" }}>{title}</h3>
      <img
        src={candidates[srcIdx]}
        alt={title}
        style={{ width: "100%", height: "auto", display: "block", borderRadius: 10 }}
        onError={() => setIdx((i) => Math.min(i + 1, candidates.length - 1))}
      />
    </figure>
  );
}

export default function MockupLaunchGallery() {
  return (
    <main style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #eee" }}>
        <h1 style={{ margin: 0, fontSize: "1.75rem" }}>SkaiScraper — Mockups</h1>
      </header>
      {items.map((m) => (
        <ImgWithFallback key={m.slug} slug={m.slug} title={m.title} />
      ))}
      <footer style={{ padding: "2rem 1.25rem", color: "#666" }}>
        © {new Date().getFullYear()} SkaiScraper
      </footer>
    </main>
  );
}
