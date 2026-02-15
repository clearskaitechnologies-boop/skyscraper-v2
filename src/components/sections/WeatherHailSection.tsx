import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type WeatherEvent = {
  date: string;
  hailMaxIn?: number;
  windMaxMph?: number;
  distanceMi?: number;
  source?: string;
  summary?: string;
};

export type WeatherReport = {
  address: string;
  eventWindowStart?: string;
  eventWindowEnd?: string;
  radiusMi: number;
  events: WeatherEvent[];
  providerNote?: string;
  aiSummary?: string;
};

export type WeatherHailProps = {
  address: string;
  value: WeatherReport;
  onChange: (v: WeatherReport) => void;
};

export default function WeatherHailSection({ address, value, onChange }: WeatherHailProps) {
  const [busy, setBusy] = useState(false);
  const v = useMemo<WeatherReport>(() => {
    const defaults = { radiusMi: 5, events: [] };
    return { ...defaults, ...value, address };
  }, [address, value]);

  function upd(patch: Partial<WeatherReport>) {
    onChange({ ...v, ...patch });
  }

  function addEvent() {
    const today = new Date().toISOString().slice(0, 10);
    const ev: WeatherEvent = { date: today };
    upd({ events: [...(v.events || []), ev] });
  }

  function delEvent(ix: number) {
    const next = [...(v.events || [])];
    next.splice(ix, 1);
    upd({ events: next });
  }

  function updEvent(ix: number, patch: Partial<WeatherEvent>) {
    const next = [...(v.events || [])];
    next[ix] = { ...next[ix], ...patch };
    upd({ events: next });
  }

  async function aiSummarize() {
    setBusy(true);
    try {
      const r = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/weatherhail-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report: v }),
      });
      const j = await r.json();
      if (j.summary) upd({ aiSummary: j.summary });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Weather & Hail Report</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={addEvent}>
            + Add event
          </Button>
          <Button size="sm" onClick={aiSummarize} disabled={busy}>
            🤖 AI Summarize
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Input
          type="date"
          value={v.eventWindowStart || ""}
          onChange={(e) => upd({ eventWindowStart: e.target.value })}
          placeholder="Start"
        />
        <Input
          type="date"
          value={v.eventWindowEnd || ""}
          onChange={(e) => upd({ eventWindowEnd: e.target.value })}
          placeholder="End"
        />
        <Input
          type="number"
          value={v.radiusMi}
          onChange={(e) => upd({ radiusMi: Number(e.target.value) })}
          placeholder="Radius (mi)"
        />
        <Input
          value={v.providerNote || ""}
          onChange={(e) => upd({ providerNote: e.target.value })}
          placeholder="Provider note"
        />
      </div>

      {v.events?.length ? (
        <div className="space-y-2">
          <div className="text-[13px] uppercase tracking-wide opacity-60">Events</div>
          {v.events.map((ev, ix) => (
            <div key={ix} className="grid items-center gap-2 rounded-xl border p-3 md:grid-cols-8">
              <Input
                type="date"
                value={ev.date || ""}
                onChange={(e) => updEvent(ix, { date: e.target.value })}
              />
              <Input
                type="number"
                value={ev.hailMaxIn || ("" as any)}
                onChange={(e) => updEvent(ix, { hailMaxIn: Number(e.target.value) })}
                placeholder="Hail (in)"
              />
              <Input
                type="number"
                value={ev.windMaxMph || ("" as any)}
                onChange={(e) => updEvent(ix, { windMaxMph: Number(e.target.value) })}
                placeholder="Wind (mph)"
              />
              <Input
                type="number"
                value={ev.distanceMi || ("" as any)}
                onChange={(e) => updEvent(ix, { distanceMi: Number(e.target.value) })}
                placeholder="Distance (mi)"
              />
              <Input
                value={ev.source || ""}
                onChange={(e) => updEvent(ix, { source: e.target.value })}
                placeholder="Source"
              />
              <Input
                className="md:col-span-2"
                value={ev.summary || ""}
                onChange={(e) => updEvent(ix, { summary: e.target.value })}
                placeholder="Summary"
              />
              <Button size="sm" variant="ghost" onClick={() => delEvent(ix)}>
                ✕
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm opacity-70">
          Add weather events manually or use AI to generate a summary.
        </p>
      )}

      {v.aiSummary && (
        <div className="rounded-xl border bg-muted/50 p-3">
          <div className="mb-1 text-[13px] uppercase tracking-wide opacity-60">AI Summary</div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed">{v.aiSummary}</pre>
        </div>
      )}
    </section>
  );
}
