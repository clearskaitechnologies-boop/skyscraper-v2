// src/app/(app)/claims/[claimId]/_components/ClientConnectSection.tsx
"use client";

import { CheckCircle2, Copy, Loader2, Search, Send, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Contact {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
}

interface ClientConnectSectionProps {
  claimId: string;
  currentClientId?: string | null;
}

export function ClientConnectSection({ claimId, currentClientId }: ClientConnectSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachedClient, setAttachedClient] = useState<Contact | null>(null);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch current attached client
  useEffect(() => {
    if (currentClientId) {
      fetchAttachedClient(currentClientId);
    }
  }, [currentClientId]);

  const fetchAttachedClient = async (clientId: string) => {
    try {
      const res = await fetch(`/api/contacts/${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setAttachedClient(data.contact);
      }
    } catch (error) {
      console.error("Failed to fetch attached client:", error);
    }
  };

  const searchContacts = async () => {
    if (!searchQuery.trim()) {
      setContacts([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/contacts/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const attachClient = async (contactId: string) => {
    try {
      const res = await fetch(`/api/claims/${claimId}/attach-contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to attach client");
      }

      const data = await res.json();
      setAttachedClient(contacts.find((c) => c.id === contactId) || null);
      setSearchQuery("");
      setContacts([]);
      toast.success("Client attached successfully!");
    } catch (error: any) {
      console.error("Attach client failed:", error);
      toast.error(error.message || "Failed to attach client. Please try again.");
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter the client's email address");
      return;
    }

    setInviting(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/invite-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientEmail: inviteEmail.trim(),
          clientName: inviteName.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to send invite");
      }

      const data = await res.json();
      // Build the invite link from the returned link ID
      const appUrl = window.location.origin;
      const linkId = data.link?.id;
      if (linkId) {
        setInviteLink(`${appUrl}/client/accept-invite?token=${linkId}`);
      }
      toast.success("Invite sent successfully!");
      setInviteEmail("");
      setInviteName("");
    } catch (error: any) {
      console.error("Send invite failed:", error);
      toast.error(error.message || "Failed to send invite. Please try again.");
    } finally {
      setInviting(false);
    }
  };

  const copyInviteLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Attached Client */}
      {attachedClient && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2 text-sm text-green-800 dark:text-green-300">
            <CheckCircle2 className="h-5 w-5" />
            <div>
              <p className="font-medium">
                Client Attached: {attachedClient.firstName} {attachedClient.lastName}
              </p>
              {attachedClient.email && (
                <p className="text-xs text-green-700 dark:text-green-400">{attachedClient.email}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search Existing Clients */}
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Search Existing Clients
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchContacts()}
              placeholder="Search by name, email, or phone..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            onClick={searchContacts}
            disabled={loading || !searchQuery.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {contacts.length > 0 && (
        <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Search Results
          </p>
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {contact.firstName} {contact.lastName}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {contact.email || contact.phone || "No contact info"}
                </p>
              </div>
              <button
                onClick={() => attachClient(contact.id)}
                className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
              >
                <UserPlus className="mr-1 inline-block h-3 w-3" />
                Attach
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Send Invite Section */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
        <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
          Or Send New Invite
        </h4>
        <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
          Enter the client&apos;s email to send them an invite to access this claim
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              placeholder="Client name (optional)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Client email (required)"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            onClick={sendInvite}
            disabled={inviting || !inviteEmail.trim()}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {inviting ? (
              <>
                <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
                Sending Invite...
              </>
            ) : (
              <>
                <Send className="mr-2 inline-block h-4 w-4" />
                Send Invite
              </>
            )}
          </button>
        </div>

        {inviteLink && (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="mb-2 text-xs font-medium text-blue-900 dark:text-blue-300">
              Invite Link Generated:
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 rounded border border-blue-300 bg-white px-2 py-1 text-xs text-slate-700 dark:border-blue-700 dark:bg-slate-800 dark:text-slate-200"
                aria-label="Invite Link"
                title="Invite Link"
                placeholder="Invite Link"
              />
              <button
                onClick={copyInviteLink}
                className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-1 inline-block h-3 w-3" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 inline-block h-3 w-3" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
