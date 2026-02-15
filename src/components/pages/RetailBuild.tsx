import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import MockupPreview from "@/components/MockupPreview";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

export default function RetailBuild() {
  const [sp] = useSearchParams();
  const leadId = sp.get("leadId");
  const [cover, setCover] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [codes, setCodes] = useState<unknown | null>(null);
  const [mockup, setMockup] = useState<unknown | null>(null);
  const [estimate, setEstimate] = useState<unknown | null>(null);
  const [startDate, setStart] = useState("");
  const [endDate, setEnd] = useState("");
  const [system, setSystem] = useState("gaf_shingle");
  const [color, setColor] = useState("charcoal");
  const [laborYears, setLabor] = useState("5");
  const [manuYears, setManu] = useState("30");
  const [pdfUrl, setPdfUrl] = useState("");

  async function api<T>(path: string, body?: unknown): Promise<T> {
    const base =
      (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ||
      process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pb-16 pt-24">
        <div className="mx-auto max-w-5xl space-y-8 px-4">
          <h1 className="text-3xl font-bold text-foreground">Retail Proposal Builder</h1>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">1) Cover Page</h2>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              className="text-foreground"
            />
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">2) Overview of Damage</h2>
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await api<{ text: string }>("/analysis/retail-summary", { leadId });
                setSummary(r.text);
              }}
            >
              AI Summary
            </Button>
            <textarea
              className="min-h-[120px] w-full rounded-lg border border-input bg-background p-3 text-foreground"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="AI-generated summary will appear here..."
            />
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">3) Code & Compliance</h2>
            <Button
              variant="secondary"
              onClick={async () => {
                const apiBase =
                  (process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined) ||
                  process.env.NEXT_PUBLIC_API_BASE_URL;
                const r = await fetch(
                  `${apiBase}/codes?address=${encodeURIComponent("from-property")}`
                ).then((r) => r.json());
                setCodes(r);
              }}
            >
              Fetch Codes
            </Button>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm text-foreground">
              {codes ? JSON.stringify(codes, null, 2) : "—"}
            </pre>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">4) AI Restored Mockup</h2>
            <div className="flex flex-wrap gap-3">
              <select
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="gaf_shingle">GAF Shingle</option>
                <option value="westlake_tile">Westlake Tile</option>
                <option value="nano_recoat">Flat Recoat (Nano)</option>
              </select>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              >
                <option value="charcoal">Charcoal</option>
                <option value="weathered_wood">Weathered Wood</option>
                <option value="mission_red">Mission Red</option>
              </select>
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await api("/mockups/generate", {
                    cover: cover ? { name: cover.name } : null,
                    system,
                    color,
                  });
                  setMockup(r);
                }}
              >
                Generate Mockup
              </Button>
            </div>
            <div className="overflow-auto rounded-lg bg-muted p-4 text-sm text-foreground">
              <MockupPreview mockup={mockup} />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">5) Timeline</h2>
            <div className="flex flex-wrap gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
              />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">6) Price Breakdown</h2>
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await api("/estimate", { leadId });
                setEstimate(r);
              }}
            >
              AI Estimate
            </Button>
            <pre className="overflow-auto rounded-lg bg-muted p-4 text-sm text-foreground">
              {estimate ? JSON.stringify(estimate, null, 2) : "—"}
            </pre>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">7) Materials & Colors</h2>
            <div className="text-muted-foreground">
              System: {system} • Color: {color}
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">8) Warranties & Guarantees</h2>
            <div className="flex flex-wrap gap-3">
              <input
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                placeholder="Labor (years)"
                value={laborYears}
                onChange={(e) => setLabor(e.target.value)}
              />
              <input
                className="rounded-lg border border-input bg-background px-3 py-2 text-foreground"
                placeholder="Manufacturer (years)"
                value={manuYears}
                onChange={(e) => setManu(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3 rounded-xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Export</h2>
            <Button
              onClick={async () => {
                const body = {
                  leadId,
                  cover: cover ? { name: cover.name } : null,
                  summary,
                  codes,
                  mockup,
                  timeline: { start: startDate, end: endDate },
                  estimate,
                  materials: { system, color },
                  warranty: { laborYears, manufacturerYears: manuYears },
                };
                const r = await api<{ url: string }>("/proposal/retail/pdf", body);
                setPdfUrl(r.url);
              }}
            >
              Generate Retail PDF
            </Button>
            {pdfUrl && (
              <a
                className="block text-primary underline"
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF
              </a>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
