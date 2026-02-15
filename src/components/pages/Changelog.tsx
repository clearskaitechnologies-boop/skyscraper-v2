import { useEffect, useState } from "react";

import Footer from "@/components/Footer";
import Navigation from "@/components/Navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type Release = {
  version: string;
  date: string;
  title?: string;
  items?: string[];
};

export default function Changelog() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch("/changelog.json")
      .then((r) => {
        if (!r.ok) throw new Error("missing changelog.json");
        return r.json();
      })
      .then((j) => setReleases(Array.isArray(j.releases) ? j.releases : []))
      .catch((e) => setError(String(e?.message || e)));
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="container mx-auto max-w-4xl flex-1 px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold">Changelog</h1>

        {error && <Card className="border-red-200 bg-red-50 p-4 text-red-700">{error}</Card>}

        <div className="space-y-6">
          {releases.map((rel) => (
            <Card key={rel.version} className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline">v{rel.version}</Badge>
                    {rel.title && <h2 className="text-xl font-semibold">{rel.title}</h2>}
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{rel.date}</span>
              </div>

              {rel.items && rel.items.length > 0 && (
                <ul className="space-y-2">
                  {rel.items.map((it, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
