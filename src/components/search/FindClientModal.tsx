"use client";

import { Loader2, Mail, MapPin, Search, UserCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ClientSearchResult {
  id: string;
  clientEmail: string;
  clientName: string | null;
  status: string;
  claimNumber?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface FindClientModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (client: ClientSearchResult) => void;
}

export function FindClientModal({ open, onClose, onSelect }: FindClientModalProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ClientSearchResult[]>([]);

  const handleSearch = async () => {
    if (query.length < 2) {
      toast.error("Please enter at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/search/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setResults(data.results || []);

      if (data.results?.length === 0) {
        toast.info("No clients found");
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
          <DialogTitle>Find Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search by email, name, or address..."
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
                Enter a client name, email, or address to search
              </div>
            )}

            {results.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{client.clientName || "Unnamed Client"}</span>
                    <Badge variant={client.status === "CONNECTED" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    {client.clientEmail}
                  </div>
                  {client.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {client.address}, {client.city}, {client.state}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onSelect?.(client);
                      toast.success(`Selected ${client.clientName || client.clientEmail}`);
                      onClose();
                    }}
                  >
                    Select
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
