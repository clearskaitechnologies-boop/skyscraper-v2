"use client";

import { CheckCircle2, FileSignature } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalModalProps {
  approvalId: string;
  title: string;
  description: string | null;
  onComplete: () => void;
}

export default function ApprovalModal({
  approvalId,
  title,
  description,
  onComplete,
}: ApprovalModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState("");

  const handleApprove = async () => {
    if (!signature.trim()) {
      alert("Please type your full name to sign");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/claim-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action: "approve",
          signedBy: signature,
        }),
      });

      if (res.ok) {
        setOpen(false);
        onComplete();
      }
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to reject this?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/claim-approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvalId,
          action: "reject",
        }),
      });

      if (res.ok) {
        setOpen(false);
        onComplete();
      }
    } catch (error) {
      console.error("Rejection error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <FileSignature className="h-4 w-4" />
        Review & Sign
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription className="whitespace-pre-wrap">{description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                By typing your name below and clicking "Approve & Sign", you are providing your
                electronic signature and agreeing to the terms outlined above.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Type your full name to sign
              </label>
              <input
                type="text"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleReject} disabled={loading}>
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading || !signature.trim()}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve & Sign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
