"use client";
import { useState } from 'react';

const STEPS = [
  'Import First Claim',
  'Upload Damage Photos',
  'Run AI Analysis',
  'Generate Scope',
  'Export PDF',
  'Retail Proposal Handoff'
];

export function OnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const [idx, setIdx] = useState(0);
  return (
    <div className="space-y-4 rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-6">
      <h3 className="text-lg font-semibold">Welcome — Guided Setup</h3>
      <ol className="ml-5 list-decimal space-y-1 text-sm">
        {STEPS.map((s,i)=> <li key={s} className={i===idx? 'font-medium text-indigo-600': 'text-[color:var(--muted)]'}>{s}</li>)}
      </ol>
      <button
        onClick={() => { if (idx < STEPS.length - 1) setIdx(idx+1); else onComplete?.(); }}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white"
      >{idx < STEPS.length - 1 ? 'Next' : 'Finish'}</button>
    </div>
  );
}
