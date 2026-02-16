"use client";

import { MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { PageContainer } from "@/components/layout/PageContainer";
import { PageHero } from "@/components/layout/PageHero";
import { ContentCard } from "@/components/ui/ContentCard";

interface Thread {
  id: string;
  contactId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  body: string;
  direction: string;
  createdAt: string;
}

interface Message {
  id: string;
  direction: string;
  body: string;
  status: string;
  from: string;
  to: string;
  createdAt: string;
}

export default function SMSPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Load threads
  useEffect(() => {
    fetch("/api/sms")
      .then((r) => r.json())
      .then((data) => {
        setThreads(data.threads || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Load messages for selected contact
  const loadMessages = useCallback((contactId: string) => {
    setSelectedContact(contactId);
    fetch(`/api/sms?contactId=${contactId}`)
      .then((r) => r.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => {});
  }, []);

  // Send message
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedContact || !newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: selectedContact, body: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        loadMessages(selectedContact);
      }
    } catch {
      // Error handling
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
      <PageHero
        title="SMS Conversations"
        subtitle="Two-way text messaging with your contacts via Twilio"
        icon={<MessageCircle className="h-5 w-5" />}
        section="finance"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3" style={{ minHeight: "500px" }}>
        {/* Thread List */}
        <ContentCard header="Conversations" noPadding>
          <div className="max-h-[500px] divide-y divide-slate-200/60 overflow-y-auto dark:divide-slate-700/50">
            {threads.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-500">
                <MessageCircle className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                No conversations yet
              </div>
            )}
            {threads.map((t) => (
              <button
                key={t.contactId}
                onClick={() => loadMessages(t.contactId)}
                className={`w-full px-4 py-3 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                  selectedContact === t.contactId
                    ? "border-l-2 border-emerald-500 bg-slate-50/60 dark:bg-slate-800/40"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white">
                    {(t.firstName || "?")[0]}
                    {(t.lastName || "")[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-slate-900 dark:text-slate-100">
                      {t.firstName} {t.lastName}
                    </div>
                    <div className="truncate text-xs text-slate-500">{t.body}</div>
                  </div>
                  <div className="shrink-0 text-[10px] text-slate-400">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ContentCard>

        {/* Message Thread */}
        <div className="rounded-card flex flex-col overflow-hidden border border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/60 lg:col-span-2">
          {!selectedContact ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center text-slate-500">
                <MessageCircle className="mx-auto mb-3 h-12 w-12" />
                <p className="text-sm">Select a conversation to view messages</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="max-h-[400px] flex-1 space-y-3 overflow-y-auto p-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.direction === "outbound"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                          : "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.body}</p>
                      <div
                        className={`mt-1 text-[10px] ${msg.direction === "outbound" ? "text-white/60" : "text-slate-400"}`}
                      >
                        {new Date(msg.createdAt).toLocaleTimeString()} · {msg.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compose */}
              <form
                onSubmit={handleSend}
                className="flex gap-3 border-t border-slate-200/60 p-4 dark:border-slate-700/50"
              >
                <input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700/50 dark:bg-slate-800 dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-white shadow-sm transition hover:scale-[1.02] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
