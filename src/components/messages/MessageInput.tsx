"use client";

import { Send } from "lucide-react";
import { logger } from "@/lib/logger";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  threadId: string;
  onMessageSent?: () => void;
}

export default function MessageInput({ threadId, onMessageSent }: MessageInputProps) {
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId,
          body: body.trim(),
        }),
      });

      if (res.ok) {
        setBody("");
        onMessageSent?.();
      } else {
        const error = await res.json().catch(() => ({ error: "Unknown error" }));
        logger.error("[MessageInput] Send failed:", error);
        toast.error(error.error || "Failed to send message");
      }
    } catch (error) {
      logger.error("Send message error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Type a message to your client or partner…"
        className="flex-1 resize-none"
        rows={3}
        disabled={sending}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button type="submit" disabled={!body.trim() || sending} size="icon">
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
