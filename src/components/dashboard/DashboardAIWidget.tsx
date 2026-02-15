"use client";

import { Calculator, Cloud, FileCheck,FileText, Send, Sparkles } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function DashboardAIWidget() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Skai Assistant. Ask me about supplements, weather verification, depreciation, or report building.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<string | null>(null);

  const quickActions = [
    { icon: FileText, label: "Write Supplement", prompt: "Help me write a supplement request for" },
    { icon: Cloud, label: "Weather Check", prompt: "Check weather and storm data for" },
    { icon: Calculator, label: "Depreciation Help", prompt: "Help me calculate depreciation for" },
    {
      icon: FileCheck,
      label: "Build Report",
      prompt: "Help me build a contractor packet report for",
    },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt + " ");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          claimId: selectedClaim,
          history: messages.slice(-5),
        }),
      });

      if (!response.ok) throw new Error("AI service unavailable");

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response || data.reply || "I'm here to help!",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Assistant error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--surface-glass)] shadow-[0_0_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[color:var(--border)] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[color:var(--text)]">Skai Assistant</h3>
          <p className="text-sm text-[color:var(--text-muted)]">
            Your AI expert for claims & reports
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="max-h-[400px] space-y-4 overflow-y-auto p-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[color:var(--primary)] text-white"
                  : "border border-[color:var(--border)] bg-[var(--surface-1)] text-[color:var(--text)]"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p
                className={`mt-1 text-xs ${msg.role === "user" ? "text-white/70" : "text-[color:var(--text-muted)]"}`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-[color:var(--text-muted)]">
                <div className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)] [animation-delay:0.2s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-[color:var(--primary)] [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-[color:var(--border)] p-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about claims, reports, or tools..."
              className="focus:ring-[color:var(--primary)]/20 flex-1 rounded-xl border border-[color:var(--border)] bg-[var(--surface-1)] px-4 py-3 text-[color:var(--text)] placeholder-[color:var(--text-muted)] focus:border-[color:var(--primary)] focus:outline-none focus:ring-2"
              disabled={loading}
            />
            <Button type="submit" disabled={!input.trim() || loading} className="px-6">
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => handleQuickAction(action.prompt)}
                className="flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface-1)] px-3 py-2 text-left text-sm text-[color:var(--text)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50"
                disabled={loading}
              >
                <action.icon className="h-4 w-4 text-[color:var(--primary)]" />
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
