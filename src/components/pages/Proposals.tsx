export default function Proposals() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Retail Proposals</h1>
          <p className="text-muted-foreground">Branded proposals with mockups & options.</p>
        </div>
        <a
          href="/proposals/new"
          className="rounded-xl border bg-card px-3 py-2 text-foreground hover:bg-accent"
        >
          Build in 60 Seconds →
        </a>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <div className="mb-2 font-medium text-foreground">What's Included</div>
        <ul className="list-disc space-y-1 pl-6 text-sm text-muted-foreground">
          <li>Branding & logo</li>
          <li>Materials & colors</li>
          <li>Code compliance</li>
          <li>AI mockups</li>
          <li>Pricing with taxes</li>
          <li>Warranty & timeline</li>
          <li>E-sign</li>
        </ul>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b px-4 py-3 font-medium text-foreground">All Proposals</div>
        <div className="p-6 text-sm text-muted-foreground">No proposals yet.</div>
      </div>
    </div>
  );
}
