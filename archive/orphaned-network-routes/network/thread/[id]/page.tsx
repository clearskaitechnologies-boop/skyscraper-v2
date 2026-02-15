"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowLeft, Users } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import { toast } from "sonner";

import { MessageThread } from "@/components/trades/MessageThread";
import { FullAccessBadge,TokenBadge } from "@/components/trades/TokenBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent,CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Thread {
  id: string;
  post_id: string | null;
  visibility: string;
  post_title?: string | null;
}

interface Participant {
  userId: string;
  role: string;
}

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  attachments?: any;
  created_at: string;
}

export default function ThreadPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();

  const threadId = (params?.id ?? '') as string;

  const [thread, setThread] = useState<Thread | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [fullAccessExpiresAt, setFullAccessExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    if (threadId) {
      fetchThread();
      fetchUserStatus();
    }
  }, [threadId]);

  const fetchThread = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trades/thread/${threadId}`);
      const data = await response.json();

      if (response.ok) {
        setThread(data.thread);
        setParticipants(data.participants || []);
        setMessages(data.messages || []);
      } else {
        toast.error(data.error || "Failed to load thread");
        if (response.status === 403) {
          router.push("/network/inbox");
        }
      }
    } catch (err) {
      console.error("Thread fetch error:", err);
      toast.error("Failed to load thread");
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

  const handleMessageSent = (message: Message) => {
    setMessages((prev) => [...prev, message]);
    // Refresh token balance
    fetchUserStatus();
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/network/inbox")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            {loading ? (
              <Skeleton className="h-7 w-64" />
            ) : (
              <>
                <h1 className="text-2xl font-bold">
                  {thread?.post_title || `Thread #${threadId.slice(0, 8)}`}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {participants.length} participant
                    {participants.length !== 1 ? "s" : ""}
                  </p>
                  {thread?.post_id && (
                    <Badge variant="outline" className="h-5 px-2 text-xs">
                      From Opportunity
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TokenBadge balance={tokenBalance} />
          <FullAccessBadge expiresAt={fullAccessExpiresAt} variant="compact" />
        </div>
      </div>

      {/* Thread Content */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : !thread ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="mb-2 text-lg font-semibold">Thread not found</h3>
            <p className="mb-6 text-muted-foreground">
              This thread may have been deleted or you don't have access to it.
            </p>
            <Button onClick={() => router.push("/network/inbox")}>Back to Inbox</Button>
          </CardContent>
        </Card>
      ) : (
        <MessageThread
          threadId={threadId}
          messages={messages}
          participants={participants}
          hasFullAccess={hasFullAccess}
          tokenBalance={tokenBalance}
          onMessageSent={handleMessageSent}
        />
      )}
    </div>
  );
}
