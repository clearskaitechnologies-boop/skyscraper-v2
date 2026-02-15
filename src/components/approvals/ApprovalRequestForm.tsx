"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalRequestFormProps {
  claimId: string;
  onSuccess?: () => void;
}

export function ApprovalRequestForm({ claimId, onSuccess }: ApprovalRequestFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/approvals/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          title,
          description,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to request approval");
      }

      setTitle("");
      setDescription("");
      alert("Approval request sent!");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to request approval:", error);
      alert("Failed to send approval request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Approve roof replacement"
          required
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Additional details..."
          rows={3}
          maxLength={2000}
        />
      </div>
      <Button type="submit" disabled={loading || !title}>
        {loading ? "Sending..." : "Request Approval"}
      </Button>
    </form>
  );
}
