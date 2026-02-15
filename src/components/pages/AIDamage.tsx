export default function AIDamage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold text-foreground">AI Damage Analysis</h1>
      <p className="text-muted-foreground">
        Analyze photos for hail hits, missing shingles, and material issues.
      </p>
      <a
        href="/inspection/start?mode=analysis"
        className="inline-block rounded-xl border bg-card px-3 py-2 text-foreground hover:bg-accent"
      >
        Analyze Photos →
      </a>
    </div>
  );
}
