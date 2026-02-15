"use client";

import { Clock, Mail, RefreshCw, Send,XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { useHasPermission } from "@/hooks/usePermissions";

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export function PendingInvitationsPanel() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const canManageInvitations = useHasPermission("team:invite");

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    try {
      const response = await fetch("/api/team/invitations");
      if (!response.ok) throw new Error("Failed to fetch invitations");
      
      const data = await response.json();
      setInvitations(data.filter((inv: Invitation) => inv.status === "pending"));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function revokeInvitation(id: string) {
    if (!confirm("Are you sure you want to revoke this invitation?")) return;

    try {
      const response = await fetch(`/api/team/invitations/${id}/revoke`, {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to revoke invitation");
      
      // Refresh list
      fetchInvitations();
    } catch (err: any) {
      alert(err.message || "Failed to revoke invitation");
    }
  }

  async function resendInvitation(id: string, email: string) {
    try {
      const response = await fetch(`/api/team/invitations/${id}/resend`, {
        method: "POST",
      });
      
      if (!response.ok) throw new Error("Failed to resend invitation");
      
      alert(`Invitation resent to ${email}`);
    } catch (err: any) {
      alert(err.message || "Failed to resend invitation");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
        <h2 className="mb-4 text-lg font-semibold text-[color:var(--text)]">Pending Invitations</h2>
        <p className="text-sm text-[color:var(--muted)]">Loading invitations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-50 p-4 dark:bg-red-950/30">
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show panel if no pending invitations
  }

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] p-6 backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[color:var(--text)]">Pending Invitations</h2>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {invitations.length} pending
        </span>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => {
          const expiresAt = new Date(invitation.expires_at);
          const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const isExpiringSoon = daysLeft <= 2;

          return (
            <div
              key={invitation.id}
              className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Mail className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-[color:var(--text)]">{invitation.email}</p>
                  <div className="flex items-center gap-2 text-xs text-[color:var(--muted)]">
                    <span className="capitalize">{invitation.role}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span className={isExpiringSoon ? "text-amber-600" : ""}>
                        Expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {canManageInvitations && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resendInvitation(invitation.id, invitation.email)}
                    className="rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] p-2 text-[color:var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    title="Resend invitation"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => revokeInvitation(invitation.id)}
                    className="rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:hover:bg-red-900/50"
                    title="Revoke invitation"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
