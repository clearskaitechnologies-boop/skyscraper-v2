"use client";

import { useAuth } from "@clerk/nextjs";
import { Clock, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FullAccessBadge, TokenBadge } from "@/components/trades/TokenBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Thread {
  thread_id: string;
  post_id: string | null;
  visibility: string;
  thread_created_at: string;
  last_message_at: string | null;
  message_count: number;
  last_message_body: string | null;
  last_sender_id: string | null;
  other_userId: string | null;
}

export default function InboxPage() {
  const { userId } = useAuth();
  const router = useRouter();

  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [fullAccessExpiresAt, setFullAccessExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    fetchInbox();
    fetchUserStatus();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/trades/inbox");
      const data = await response.json();

      if (response.ok) {
        setThreads(data.threads || []);
      } else {
        toast.error("Failed to load inbox");
      }
    } catch (err) {
      console.error("Inbox fetch error:", err);
      toast.error("Failed to load inbox");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatus = async () => {
    try {
      const tokenRes = await fetch("/api/tokens/balance");
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        setTokenBalance(tokenData.balance || 0);
      }

      const accessRes = await fetch("/api/trades/membership");
      if (accessRes.ok) {
        const accessData = await accessRes.json();
        setHasFullAccess(accessData.hasFullAccess || false);
        setFullAccessExpiresAt(accessData.expiresAt || null);
      }
    } catch (err) {
      console.error("User status fetch error:", err);
    }
  };

  const handleThreadClick = (threadId: string) => {
    router.push(`/network/thread/${threadId}`);
  };

  const getInitials = (id: string | null) => {
    if (!id) return "??";
    return id.slice(0, 2).toUpperCase();
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "No messages";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isUnread = (thread: Thread) => {
    // Simple heuristic: if last sender is not current user, consider unread
    return thread.last_sender_id !== null && thread.last_sender_id !== userId;
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Inbox</h1>
          <p className="mt-1 text-muted-foreground">Your message threads and conversations</p>
        </div>
        <div className="flex items-center gap-3">
          <TokenBadge balance={tokenBalance} />
          <FullAccessBadge expiresAt={fullAccessExpiresAt} variant="compact" />
        </div>
      </div>

      {/* Threads List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No messages yet</h3>
            <p className="mb-6 text-muted-foreground">
              Apply to opportunities to start conversations with contractors
            </p>
            <Button onClick={() => router.push("/network/opportunities")}>
              Browse Opportunities
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Card
              key={thread.thread_id}
              className={cn(
                "cursor-pointer transition-colors hover:border-primary/50",
                isUnread(thread) && "bg-accent/5"
              )}
              onClick={() => handleThreadClick(thread.thread_id)}
            >
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12 shrink-0">
                    <AvatarFallback>{getInitials(thread.other_user_id)}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="truncate text-sm font-semibold">
                        Thread #{thread.thread_id.slice(0, 8)}
                      </h3>
                      {isUnread(thread) && (
                        <Badge variant="default" className="h-5 px-1.5 text-xs">
                          New
                        </Badge>
                      )}
                    </div>

                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {thread.last_message_body || "No messages yet"}
                    </p>

                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {thread.message_count} message
                        {thread.message_count !== 1 ? "s" : ""}
                      </span>
                      {thread.post_id && (
                        <Badge variant="outline" className="h-5 px-1.5 text-xs">
                          From Opportunity
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(thread.last_message_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
