"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  participants: { userId: string; user?: { name?: string; headshot_url?: string } }[];
  lastMessage?: {
    content: string;
    createdAt: Date;
  };
  unreadCount?: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 24) {
      return new Date(date).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    } else if (hours < 48) {
      return "Yesterday";
    } else {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {conversations.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No conversations yet</div>
        ) : (
          conversations.map((conv) => {
            const otherParticipant = conv.participants[0]; // Simplified
            const name = otherParticipant?.user?.name || "User";
            const avatar = otherParticipant?.user?.headshot_url;
            const initials = name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={cn(
                  "w-full rounded-lg p-3 text-left transition-colors",
                  "hover:bg-muted/70",
                  selectedId === conv.id && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    {avatar && <AvatarImage src={avatar} alt={name} />}
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{name}</span>
                      {conv.lastMessage && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {conv.lastMessage && (
                      <p className="truncate text-sm text-muted-foreground">
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {conv.unreadCount ? (
                    <Badge
                      variant="destructive"
                      className="flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
                    >
                      {conv.unreadCount}
                    </Badge>
                  ) : null}
                </div>
              </button>
            );
          })
        )}
      </div>
    </ScrollArea>
  );
}
