"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ContactSearchResult = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
};

export function ClientsNetworkClient() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ContactSearchResult[]>([]);

  const canSearch = useMemo(() => query.trim().length >= 2, [query]);

  async function runSearch() {
    const q = query.trim();
    if (q.length < 2) return;

    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(body || `Search failed (${res.status})`);
      }
      const data = (await res.json()) as { contacts?: ContactSearchResult[] };
      setResults(Array.isArray(data.contacts) ? data.contacts : []);
    } catch (e) {
      setError(e?.message || "Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>Find a client by name, email, or phone.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search clients…"
              className="sm:flex-1"
            />
            <Button onClick={runSearch} disabled={!canSearch || isSearching}>
              {isSearching ? "Searching…" : "Search"}
            </Button>
          </div>
          {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      {results.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No results</CardTitle>
            <CardDescription>
              Search for a client above. Accepted connections will appear in your contact list.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/contacts" className="text-sm font-medium text-primary underline">
              View contacts
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="truncate">
                  {[c.firstName, c.lastName].filter(Boolean).join(" ") || "Contact"}
                </CardTitle>
                <CardDescription className="truncate">{c.email || c.phone || ""}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/contacts/${c.id}`}
                    className="text-sm font-medium text-primary underline"
                  >
                    View
                  </Link>
                  <Button variant="secondary" disabled>
                    Invite
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
