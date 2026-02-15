"use client";

import { ArrowLeft, ArrowRight, CheckCircle2,FileText, Sparkles, UploadCloud } from "lucide-react";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent,CardHeader, CardTitle } from "@/components/ui/card";

type WizardStep = {
  id: string;
  title: string;
  description: string;
  aiKey?: string; // key used for AI suggestion endpoint
};

// Eight-step retail proposal flow
const STEPS: WizardStep[] = [
  { id: "baseline", title: "Property Baseline", description: "Confirm property & claim context for proposal.", aiKey: "baseline" },
  { id: "damage_summary", title: "Damage Summary", description: "High-level summary of observed damage.", aiKey: "damageSummary" },
  { id: "measurements", title: "Measurements", description: "Capture critical dimensional data.", aiKey: "measurements" },
  { id: "materials", title: "Material Recommendations", description: "Optimized material & product recommendations.", aiKey: "materials" },
  { id: "investment_tiers", title: "Investment Tiers", description: "Essential / Recommended / Premium upgrade paths.", aiKey: "investmentTiers" },
  { id: "timeline", title: "Timeline & Scheduling", description: "Projected schedule & phases.", aiKey: "timeline" },
  { id: "insurance_alignment", title: "Insurance Alignment", description: "Align scope with carrier & policy signals.", aiKey: "insuranceAlignment" },
  { id: "signature", title: "Signature & Acceptance", description: "Finalize proposal & capture acceptance." },
];

interface RetailProposalWizardProps {
  reportId?: string;
  claimId: string;
}

export function RetailProposalWizard({ reportId = `retail_${Date.now()}`, claimId }: RetailProposalWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingAI, setLoadingAI] = useState(false);
  const [sections, setSections] = useState<Record<string, string>>({});
  const step = STEPS[currentIndex];

  const goNext = () => setCurrentIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));

  async function fetchAISuggestion() {
    if (!step.aiKey) return;
    setLoadingAI(true);
    try {
      // Generic AI endpoint pattern already used elsewhere (/api/reports/{reportId}/ai/{sectionKey})
      const res = await fetch(`/api/reports/${reportId}/ai/${step.aiKey}`, { method: "POST" });
      if (!res.ok) throw new Error("AI generation failed");
      const data = await res.json();
      setSections((prev) => ({ ...prev, [step.id]: data.content || data.text || JSON.stringify(data) }));
    } catch (e: any) {
      setSections((prev) => ({ ...prev, [step.id]: `⚠️ AI failed: ${e.message}` }));
    } finally {
      setLoadingAI(false);
    }
  }

  function onManualEdit(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setSections((prev) => ({ ...prev, [step.id]: value }));
  }

  async function handleSaveDraft() {
    // Persist draft to backend (simplified: single endpoint pattern)
    await fetch(`/api/reports/${reportId}/draft`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
  }

  async function handleFinalize() {
    // Generate final PDF via existing export pattern
    await fetch(`/api/reports/${reportId}/export`, { method: "POST" });
    alert("✅ Proposal export triggered!");
  }

  return (
    <Card className="border border-[color:var(--border)] bg-[var(--surface-1)]">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 p-2 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Retail Proposal Wizard</CardTitle>
            <p className="text-xs text-[color:var(--muted)]">Claim: {claimId}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {STEPS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentIndex(idx)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                idx === currentIndex
                  ? "border-emerald-600 bg-emerald-500 text-white"
                  : "border-[color:var(--border)] bg-[var(--surface-2)] text-[color:var(--muted)] hover:text-[color:var(--text)]"
              }`}
            >
              {idx + 1}. {s.title}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <FileText className="h-4 w-4 text-emerald-600" /> {step.title}
          </h3>
          <p className="text-sm text-[color:var(--muted)]">{step.description}</p>
          {step.aiKey && (
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAISuggestion}
              disabled={loadingAI}
              className="mt-2 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" /> {loadingAI ? "Generating..." : "AI Suggest"}
            </Button>
          )}
          <textarea
            className="mt-4 min-h-[160px] w-full rounded-md border border-[color:var(--border)] bg-[var(--surface-2)] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Enter or generate content for this section"
            value={sections[step.id] || ""}
            onChange={onManualEdit}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={goPrev} disabled={currentIndex === 0}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Prev
            </Button>
            <Button variant="ghost" size="sm" onClick={goNext} disabled={currentIndex === STEPS.length - 1}>
              Next <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              <UploadCloud className="mr-1 h-4 w-4" /> Save Draft
            </Button>
            {currentIndex === STEPS.length - 1 && (
              <Button size="sm" onClick={handleFinalize}>
                <CheckCircle2 className="mr-1 h-4 w-4" /> Finalize
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
