export default function Claims() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Insurance Claims Folder</h1>
          <p className="text-muted-foreground">
            Claims-ready documentation that adjusters approve.
          </p>
        </div>
        <a
          href="/claims/new"
          className="rounded-xl border bg-card px-3 py-2 text-foreground hover:bg-accent"
        >
          Build in 60 Seconds →
        </a>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 opacity-60">
          <div className="font-medium text-foreground">Weather Context</div>
          <div className="text-xs text-muted-foreground">/weather/context</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 opacity-60">
          <div className="font-medium text-foreground">Map Enrichment</div>
          <div className="text-xs text-muted-foreground">/maps/enrich</div>
        </div>
        <div className="rounded-2xl border bg-card p-4 opacity-60">
          <div className="font-medium text-foreground">Client Folder</div>
          <div className="text-xs text-muted-foreground">/folders/client</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        <div className="border-b px-4 py-3 font-medium text-foreground">Active Claims</div>
        <div className="p-6">
          <table className="w-full text-sm">
            <thead className="bg-accent text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">Claim #</th>
                <th className="px-3 py-2 text-left">Property</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Last Updated</th>
                <th className="px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  No claims yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
