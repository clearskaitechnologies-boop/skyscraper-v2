"use client";

import { Bot, User } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type AssistantMessageListProps = {
  messages: Message[];
};

export function AssistantMessageList({ messages }: AssistantMessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-gray-500">
        <p>Start a conversation with Skai Assistant...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-4">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {msg.role === "assistant" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <Bot className="h-5 w-5" />
            </div>
          )}
          <div
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-900"
            }`}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            <span className="mt-1 block text-xs opacity-70">
              {msg.timestamp.toLocaleTimeString()}
            </span>
          </div>
          {msg.role === "user" && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
              <User className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
