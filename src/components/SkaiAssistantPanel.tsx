"use client";

import { MessageCircle, Mic, MicOff, Send, X } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function SkaiAssistantPanel() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "👋 Hi! I'm SkaiAssistant. How can I help you today?",
    },
  ]);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message;
    setMessages([...messages, { role: "user", content: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          voiceEnabled,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response || "I'm here to help!",
        },
      ]);

      // Voice output if enabled
      if (voiceEnabled && data.audioUrl) {
        const audio = new Audio(data.audioUrl);
        audio.play();
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${error.message || "Sorry, something went wrong. Please try again."}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-full bg-gradient-indigo px-5 py-3 font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl`}
      >
        {open ? (
          <>
            <X className="h-5 w-5" />
            Close
          </>
        ) : (
          <>
            <MessageCircle className="h-5 w-5" />
            Ask SkaiAssistant
          </>
        )}
      </button>

      {/* Chat Panel */}
      {open && (
        <div
          className={`absolute bottom-16 right-0 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border shadow-2xl ${
            isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
          }`}
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-gradient-indigo p-4 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl">
              🤖
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">SkaiAssistant</h3>
              <p className="text-xs text-blue-100">Always here to help</p>
            </div>
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className="rounded-full p-2 transition-colors hover:bg-white/20"
              title={voiceEnabled ? "Disable voice" : "Enable voice"}
            >
              {voiceEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
            </button>
          </div>

          {/* Messages */}
          <div
            className={`flex-1 space-y-4 overflow-y-auto p-4 ${
              isDark ? "bg-gray-900" : "bg-gray-50"
            }`}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === "user"
                      ? isDark
                        ? "bg-blue-500 text-white"
                        : "bg-blue-600 text-white"
                      : isDark
                        ? "border border-gray-700 bg-gray-800 text-gray-100"
                        : "border border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isDark
                      ? "border border-gray-700 bg-gray-800"
                      : "border border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex gap-1">
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
                      style={{ animationDelay: "150ms" }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-blue-600"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className={`border-t p-4 ${
              isDark ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything..."
                disabled={loading}
                className={`flex-1 rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 ${
                  isDark
                    ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                    : "border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className={`rounded-full px-4 py-2 transition-colors ${
                  loading || !message.trim()
                    ? "cursor-not-allowed bg-gray-400"
                    : isDark
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
                aria-label="Send message"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
