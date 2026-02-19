/**
 * AcceptDeclineButtons Component
 * Action buttons for accepting or declining connection requests
 */

"use client";

import { useState } from "react";
import { toast } from "sonner";

import { AttachToClaimDialog } from "@/components/trades/AttachToClaimDialog";
import { Button } from "@/components/ui/button";
import { logger } from "@/lib/logger";

interface AcceptDeclineButtonsProps {
  requestId: string;
  clientName?: string;
  onResolved?: () => void;
}

export default function AcceptDeclineButtons({
  requestId,
  clientName = "Client",
  onResolved,
}: AcceptDeclineButtonsProps) {
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);

  async function accept() {
    setAccepting(true);

    try {
      const res = await fetch("/api/trades/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: requestId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept request");
      }

      toast.success("Connection accepted! Lead created in your CRM.");

      // Show attach to claim dialog after successful accept
      setShowAttachDialog(true);
    } catch (error: any) {
      logger.error("Accept failed:", error);
      toast.error(error.message || "Failed to accept request");
      setAccepting(false);
    }
  }

  function handleAttachDialogClose() {
    setShowAttachDialog(false);
    setAccepting(false);
    onResolved?.();
  }

  function handleClaimAttached() {
    setShowAttachDialog(false);
    setAccepting(false);
    onResolved?.();
  }

  async function decline() {
    setDeclining(true);

    try {
      const res = await fetch("/api/trades/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: requestId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to decline request");
      }

      toast.success("Request declined");
      onResolved?.();
    } catch (error: any) {
      logger.error("Decline failed:", error);
      toast.error(error.message || "Failed to decline request");
    } finally {
      setDeclining(false);
    }
  }

  return (
    <>
      <div className="flex gap-3 pt-2">
        <Button
          onClick={accept}
          disabled={accepting || declining}
          className="flex-1 rounded-2xl bg-green-500/90 shadow-lg shadow-green-500/20 hover:bg-green-400"
        >
          {accepting ? "Accepting..." : "Accept & Create Lead"}
        </Button>

        <Button
          onClick={decline}
          disabled={accepting || declining}
          className="flex-1 rounded-2xl bg-red-500/90 shadow-lg shadow-red-500/20 hover:bg-red-400"
        >
          {declining ? "Declining..." : "Decline"}
        </Button>
      </div>

      {/* Attach to Claim Dialog */}
      <AttachToClaimDialog
        open={showAttachDialog}
        onOpenChange={handleAttachDialogClose}
        connectionId={requestId}
        clientName={clientName}
        onSuccess={handleClaimAttached}
      />
    </>
  );
}
