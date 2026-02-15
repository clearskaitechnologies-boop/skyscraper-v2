"use client";

import { format } from "date-fns";
import { Loader2, MessageSquare,Send } from "lucide-react";
import { useEffect, useRef,useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  fromPortal: boolean;
  senderName: string;
}

interface PortalClaimMessagesCardProps {
  claimId: string;
}

export function PortalClaimMessagesCard({ claimId }: PortalClaimMessagesCardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/portal/messages?claimId=${claimId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [claimId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          claimId,
          message: newMessage.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();
      setMessages([...messages, data.message]);
      setNewMessage("");
      toast.success("Message sent");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Handle Enter key to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <span className="text-sm text-neutral-600">Loading messages...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white px-6 py-5">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Messages</h2>
          <p className="text-sm text-slate-600">Chat with your contractor</p>
        </div>
      </div>

      {/* Messages List */}
      <div className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
        {messages.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-500">No messages yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              Send a message to start the conversation with your contractor.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.fromPortal ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.fromPortal ? "bg-blue-600 text-white" : "bg-white text-slate-900 shadow-sm"
                  }`}
                >
                  <p className="text-sm font-medium">{msg.senderName}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{msg.body}</p>
                  <p
                    className={`mt-1 text-xs ${
                      msg.fromPortal ? "text-blue-100" : "text-slate-500"
                    }`}
                  >
                    {format(new Date(msg.createdAt), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="space-y-2">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          className="min-h-[80px] resize-none"
          disabled={sending}
        />
        <div className="flex justify-end">
          <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()} size="sm">
            {sending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
