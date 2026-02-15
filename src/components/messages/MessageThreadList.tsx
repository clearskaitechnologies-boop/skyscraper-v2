"use client";

import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import Image from "next/image";

interface MessageThread {
  id: string;
  title: string | null;
  updatedAt: Date;
  claims: {
    id: string;
    claimNumber: string;
    title: string;
  } | null;
  messages: Array<{
    id: string;
    body: string;
    senderType: string;
    createdAt: Date;
  }>;
  // Enriched participant data from API
  participantName?: string;
  participantAvatar?: string | null;
  isPortalThread?: boolean;
  isClientThread?: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
}

interface MessageThreadListProps {
  threads: MessageThread[];
  selectedThreadId?: string;
  onSelectThread: (threadId: string) => void;
}

export default function MessageThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
}: MessageThreadListProps) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {threads.length === 0 ? (
        <div className="py-12 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm text-slate-500">No messages yet</p>
        </div>
      ) : (
        threads.map((thread) => {
          const lastMessage = thread.messages?.[0];
          const isSelected = thread.id === selectedThreadId;
          const displayName =
            thread.participantName || thread.title || thread.claims?.title || "Conversation";
          const initial = (displayName || "C")[0].toUpperCase();
          const previewText = thread.lastMessage || lastMessage?.body || "";

          return (
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={`group w-full p-4 text-left transition-all ${
                isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {thread.participantAvatar ? (
                  <Image
                    src={thread.participantAvatar}
                    alt={displayName}
                    width={44}
                    height={44}
                    className="h-11 w-11 shrink-0 rounded-full object-cover shadow-sm ring-2 ring-white dark:ring-slate-800"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-base font-bold text-white">
                    {initial}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white">
                      {displayName}
                    </h3>
                    <span className="shrink-0 whitespace-nowrap text-xs text-slate-400">
                      {thread.lastMessageAt
                        ? formatDistanceToNow(new Date(thread.lastMessageAt), { addSuffix: true })
                        : formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  {thread.claims && (
                    <p className="text-xs font-medium text-slate-500">
                      Claim #{thread.claims.claimNumber}
                    </p>
                  )}
                  {previewText && (
                    <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">
                      {previewText}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  );
}
