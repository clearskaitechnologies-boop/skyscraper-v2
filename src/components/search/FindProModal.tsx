"use client";

import { Building2,Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ProSearchResult {
  id: string;
  companyName: string | null;
  type: string;
  planTier: string;
}

interface FindProModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (pro: ProSearchResult) => void;
}

export function FindProModal({ open, onClose, onSelect }: FindProModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProSearchResult[]>([]);

  const handleSearch = async () => {
    if (query.length < 2) {
      toast.error("Please enter at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/search/pros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data.results || []);

      if (data.results?.length === 0) {
        toast.info("No companies found");
      }
    } catch (error) {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find Pro Company</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by company name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {results.length === 0 && !loading && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Enter a company name to search
              </div>
            )}

            {results.map((pro) => (
              <div
                key={pro.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pro.companyName || "Unnamed Company"}</span>
                    <Badge variant="outline">{pro.planTier}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSelect?.(pro);
                      toast.success(`Selected ${pro.companyName}`);
                      onClose();
                    }}
                  >
                    Send Invite
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
