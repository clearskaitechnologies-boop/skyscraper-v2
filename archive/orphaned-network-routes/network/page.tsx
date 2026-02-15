import Link from "next/link";

export default function NetworkPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 space-y-16">
      <h1 className="text-4xl font-bold">SkaiScraper Network</h1>
      <p className="text-muted-foreground max-w-2xl">
        Meet the Trades Network and Client Home Portal — the place where 
        homeowners can view their pros, projects, updates, and documents.
      </p>
      <div className="grid md:grid-cols-2 gap-8">
        <Link href="/network/vendors" className="border rounded-lg p-6 hover:bg-muted/40">
          <h2 className="font-semibold">Trades & Vendor Directory</h2>
          <p className="text-sm text-muted-foreground">
            Explore pros your contractor works with — vetted and saved into their network.
          </p>
        </Link>
        <Link href="/network/trades" className="border rounded-lg p-6 hover:bg-muted/40">
          <h2 className="font-semibold">Trade Types</h2>
          <p className="text-sm text-muted-foreground">
            Roofing, painting, HVAC, electrical, plumbing, restoration and more.
          </p>
        </Link>
      </div>
    </div>
  );
}