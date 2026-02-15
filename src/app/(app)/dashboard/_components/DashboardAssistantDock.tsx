"use client";

import { Folder, Send, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { useAssistant } from "@/components/assistant/AssistantProvider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Claim {
  id: string;
  claimNumber: string;
  title: string;
  carrier?: string | null;
  status?: string | null;
}

export default function DashboardAssistantDock() {
  const { send } = useAssistant();
  const [draft, setDraft] = useState("");
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string>("none");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const res = await fetch("/api/claims");
        if (!res.ok) throw new Error("Failed to fetch claims");
        const data = await res.json();
        setClaims(data.claims || []);
      } catch (error) {
        console.error("Error loading claims:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, []);

  const handleSend = () => {
    if (!draft.trim()) return;

    let messageToSend = draft;

    // If a claim is selected, prepend claim context
    if (selectedClaimId && selectedClaimId !== "none") {
      const claim = claims.find((c) => c.id === selectedClaimId);
      if (claim) {
        const claimContext = `For Claim #${claim.claimNumber} (${claim.carrier || "Unknown Carrier"}, Status: ${claim.status || "Unknown"}): `;
        messageToSend = claimContext + draft;
      }
    }

    // Just prefill + open drawer, DON'T auto-send
    send(messageToSend);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[color:var(--text)]">Skai Assistant</h3>
          <p className="text-sm text-[color:var(--text-muted)]">
            Your AI expert for claims, reports & more
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Claim Selector Dropdown */}
        <div className="flex items-center gap-3">
          <Folder className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <Select value={selectedClaimId} onValueChange={setSelectedClaimId} disabled={loading}>
            <SelectTrigger className="w-full border-[color:var(--border)] bg-[var(--surface-1)] text-[color:var(--text)]">
              <SelectValue
                placeholder={loading ? "Loading claims..." : "Select a claim (optional)"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No claim selected</SelectItem>
              {claims.map((claim) => (
                <SelectItem key={claim.id} value={claim.id}>
                  #{claim.claimNumber} - {claim.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Skai Assistant about supplements, weather verification, rebuttals, depreciation, report building…"
          className="focus:ring-[color:var(--primary)]/20 min-h-[120px] w-full resize-none rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] px-4 py-3 text-[color:var(--text)] placeholder-[color:var(--text-muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-2"
          rows={4}
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-[color:var(--text-muted)]">
            Press Enter to send, Shift+Enter for new line
          </p>
          <Button onClick={handleSend} disabled={!draft.trim()} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send to Assistant
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[color:var(--border)] pt-4">
        <button
          onClick={() => {
            setDraft(
              "Write a professional insurance supplement for this claim. Ask me what line items and photos I have, then draft it."
            );
          }}
          className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-left text-sm text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)]"
        >
          📝 Write supplement
        </button>
        <button
          onClick={() => {
            setDraft(
              "Help me calculate depreciation (ACV vs RCV). Ask for roof type, age, policy notes, and scope."
            );
          }}
          className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-left text-sm text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)]"
        >
          🧮 Depreciation help
        </button>
        <button
          onClick={() => {
            setDraft(
              "Draft a strong denial rebuttal. Ask what the carrier said, dates, and what evidence we have."
            );
          }}
          className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-left text-sm text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)]"
        >
          🛡️ Rebuttal / denial
        </button>
        <button
          onClick={() => {
            setDraft(
              "Generate a contractor packet outline for this job: scope, photos list, materials, timeline, and next steps."
            );
          }}
          className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-left text-sm text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)]"
        >
          📦 Contractor packet
        </button>
      </div>
    </div>
  );
}
