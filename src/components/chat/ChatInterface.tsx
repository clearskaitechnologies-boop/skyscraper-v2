/**
 * Real-Time Chat Component
 * Beautiful chat interface for client-pro communication
 * Supports conversations, messages, typing indicators, and attachments
 */

"use client";

import {
  ArrowLeft,
  Check,
  CheckCheck,
  ImageIcon,
  Loader2,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Video,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Participant {
  userId: string;
  role: "client" | "pro";
  name: string;
  avatarUrl?: string;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: "client" | "pro";
  content: string;
  messageType: "text" | "image" | "file" | "system";
  attachments?: { url: string; name: string; type: string; size: number }[];
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  type: "direct" | "claim" | "project";
  referenceId?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ChatInterfaceProps {
  currentUserId: string;
  currentUserRole: "client" | "pro";
  onClose?: () => void;
  defaultConversationId?: string;
}

export default function ChatInterface({
  currentUserId,
  currentUserRole,
  onClose,
  defaultConversationId,
}: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileConversationList, setShowMobileConversationList] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversations
  useEffect(() => {
    loadConversations();
  }, []);

  // Auto-select conversation if defaultConversationId is provided
  useEffect(() => {
    if (defaultConversationId && conversations.length > 0) {
      const convo = conversations.find((c) => c.id === defaultConversationId);
      if (convo) {
        selectConversation(convo);
      }
    }
  }, [defaultConversationId, conversations]);

  // Poll for new messages
  useEffect(() => {
    if (selectedConversation) {
      pollIntervalRef.current = setInterval(() => {
        loadMessages(selectedConversation.id, true);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [selectedConversation?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/chat/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string, silent = false) => {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      if (!silent) {
        console.error("Failed to load messages:", error);
      }
    }
  };

  const selectConversation = async (convo: Conversation) => {
    setSelectedConversation(convo);
    setShowMobileConversationList(false);
    await loadMessages(convo.id);

    // Mark as read
    try {
      await fetch("/api/chat/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convo.id }),
      });
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    const content = newMessage.trim();
    setNewMessage("");
    setSendingMessage(true);

    // Optimistically add message
    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      conversationId: selectedConversation.id,
      senderId: currentUserId,
      senderRole: currentUserRole,
      content,
      messageType: "text",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMessage]);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content,
          messageType: "text",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace temp message with real one
        setMessages((prev) => prev.map((m) => (m.id === tempMessage.id ? data.message : m)));
      } else {
        throw new Error("Failed to send");
      }
    } catch (error) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempMessage.id));
      toast.error("Failed to send message");
      setNewMessage(content); // Restore message
    } finally {
      setSendingMessage(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getOtherParticipant = (convo: Conversation) => {
    return convo.participants.find((p) => p.userId !== currentUserId);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredConversations = conversations.filter((convo) => {
    if (!searchQuery) return true;
    const other = getOtherParticipant(convo);
    return other?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden rounded-xl border bg-white shadow-lg">
      {/* Conversation List - Desktop always visible, Mobile conditional */}
      <div
        className={`w-full border-r md:w-80 ${
          showMobileConversationList ? "block" : "hidden md:block"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Conversations */}
        <ScrollArea className="h-[calc(100%-120px)]">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500">
              <p>No conversations yet</p>
              <p className="mt-1 text-sm">Start a conversation with a contractor!</p>
            </div>
          ) : (
            filteredConversations.map((convo) => {
              const other = getOtherParticipant(convo);
              const isSelected = selectedConversation?.id === convo.id;

              return (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo)}
                  className={`flex w-full items-center gap-3 border-b p-4 text-left transition hover:bg-slate-50 ${
                    isSelected ? "bg-emerald-50" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={other?.avatarUrl} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {other?.name?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-slate-900">{other?.name || "Unknown"}</span>
                      <span className="text-xs text-slate-500">
                        {convo.lastMessage && formatTime(convo.lastMessage.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-slate-500">
                        {convo.lastMessage?.content || "No messages yet"}
                      </p>
                      {convo.unreadCount > 0 && (
                        <Badge className="ml-2 bg-emerald-500">{convo.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div
        className={`flex flex-1 flex-col ${
          !showMobileConversationList ? "block" : "hidden md:flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between border-b p-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowMobileConversationList(true)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={getOtherParticipant(selectedConversation)?.avatarUrl} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700">
                    {getOtherParticipant(selectedConversation)?.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-slate-900">
                    {getOtherParticipant(selectedConversation)?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {getOtherParticipant(selectedConversation)?.role === "pro"
                      ? "Contractor"
                      : "Client"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => {
                  const isOwn = message.senderId === currentUserId;
                  const showAvatar =
                    !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex max-w-[70%] gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                        {!isOwn && showAvatar && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={getOtherParticipant(selectedConversation)?.avatarUrl}
                            />
                            <AvatarFallback className="bg-slate-100 text-sm">
                              {getOtherParticipant(selectedConversation)?.name?.[0] || "?"}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isOwn && !showAvatar && <div className="w-8" />}
                        <div>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-900"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          <div
                            className={`mt-1 flex items-center gap-1 text-xs text-slate-400 ${
                              isOwn ? "justify-end" : ""
                            }`}
                          >
                            <span>{formatMessageTime(message.createdAt)}</span>
                            {isOwn && (
                              <span>
                                {message.isRead ? (
                                  <CheckCheck className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t p-4">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  disabled={sendingMessage}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="shrink-0 bg-emerald-500 hover:bg-emerald-600"
                  size="icon"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Send className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-slate-900">Your Messages</h3>
            <p className="text-slate-500">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
