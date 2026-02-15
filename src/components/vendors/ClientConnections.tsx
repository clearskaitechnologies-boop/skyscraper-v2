/**
 * QA: Client Connections Component
 * Test Steps:
 * 1. Search by client email/name → results appear
 * 2. Click Connect → client added to Connected Clients list
 * 3. Click Open Messages → navigates to /messages/[threadId]
 * 4. Upload document → doc appears in client portal /client/[slug]/shared
 */

"use client";

import { Check, ExternalLink,Loader2, MessageSquare, Search, Upload } from "lucide-react";
import Link from "next/link";
import { useEffect,useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Connection {
  id: string;
  clientId: string;
  status: string;
  createdAt: string;
  client?: Client | null;
}

export default function ClientConnections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Client[]>([]);
  const [searching, setSearching] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    loadConnections();
  }, []);

  async function loadConnections() {
    try {
      const res = await fetch("/api/connections/my");
      const data = await res.json();
      if (data.connections) {
        setConnections(data.connections);
      }
    } catch (error) {
      console.error("Failed to load connections:", error);
    } finally {
      setLoading(false);
    }
  }

  async function searchClients() {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/connections/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.clients || []);
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setSearching(false);
    }
  }

  async function connectClient(clientId: string) {
    setConnecting(clientId);
    try {
      const res = await fetch("/api/connections/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Client connected!");
        await loadConnections();
        setSearchResults([]);
        setSearchQuery("");
      } else {
        toast.error(data.error || "Failed to connect");
      }
    } catch (error) {
      console.error("Connection failed:", error);
      toast.error("Failed to connect client");
    } finally {
      setConnecting(null);
    }
  }

  async function openMessages(clientId: string) {
    try {
      const res = await fetch("/api/connections/thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId }),
      });

      const data = await res.json();

      if (data.success && data.thread) {
        window.location.href = `/messages?threadId=${data.thread.id}`;
      } else {
        toast.error("Failed to open thread");
      }
    } catch (error) {
      console.error("Failed to open messages:", error);
      toast.error("Failed to open messages");
    }
  }

  const connectedClientIds = new Set(connections.map((c) => c.clientId));

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Search & Connect Clients</h3>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchClients()}
              placeholder="Search clients by name or email..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button onClick={searchClients} disabled={searching || searchQuery.length < 2}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 rounded-lg border bg-card p-4">
            <p className="text-sm font-medium text-muted-foreground">Search Results</p>
            {searchResults.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-md border bg-background p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                {connectedClientIds.has(client.id) ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Check className="h-4 w-4" />
                    Connected
                  </div>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => connectClient(client.id)}
                    disabled={connecting === client.id}
                  >
                    {connecting === client.id ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connected Clients */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Connected Clients ({connections.length})
        </h3>

        {loading ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Loading connections...
          </div>
        ) : connections.length === 0 ? (
          <div className="rounded-lg border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No connected clients yet. Search and connect clients above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {connections.map((conn) => (
              <div key={conn.id} className="rounded-lg border bg-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-foreground">
                      {conn.client?.name || "Unknown"}
                    </h4>
                    <p className="text-sm text-muted-foreground">{conn.client?.email}</p>
                    {conn.client?.phone && (
                      <p className="text-sm text-muted-foreground">{conn.client.phone}</p>
                    )}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Connected {new Date(conn.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openMessages(conn.clientId)}>
                      <MessageSquare className="mr-1 h-4 w-4" />
                      Messages
                    </Button>
                    <Link href={`/client/${conn.clientId}`} target="_blank">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="mr-1 h-4 w-4" />
                        Portal
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Named export for compatibility
export { ClientConnections };
