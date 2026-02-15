"use client";

const STAGES = [
  "Filed",
  "Adjuster Review",
  "Pending Approval",
  "Supplement",
  "Build",
  "Completion",
  "Closed",
];

export function ClaimStageTracker({ currentStage }: { currentStage: string }) {
  return (
    <nav className="space-y-4 p-4">
      <h2 className="mb-2 text-sm font-semibold text-[color:var(--muted)]">
        Claim Progress
      </h2>
      {STAGES.map((stage) => {
        const active = stage === currentStage;
        return (
          <div
            key={stage}
            className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-all ${
              active
                ? "bg-[var(--primary-weak)] text-[color:var(--primary)] shadow-[var(--glow)]"
                : "text-[color:var(--muted)] hover:bg-[var(--surface-2)]"
            }`}
          >
            {stage}
          </div>
        );
      })}
    </nav>
  );
}
