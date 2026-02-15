"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: Date;
  readAt?: Date | null;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  otherUserName?: string;
  otherUserAvatar?: string;
}

export function MessageThread({
  messages,
  currentUserId,
  otherUserName = "User",
  otherUserAvatar,
}: MessageThreadProps) {
  const otherInitials = otherUserName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === currentUserId;

          return (
            <div
              key={message.id}
              className={cn("flex items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
            >
              {!isOwn && (
                <Avatar className="h-8 w-8 shrink-0">
                  {otherUserAvatar && <AvatarImage src={otherUserAvatar} alt={otherUserName} />}
                  <AvatarFallback className="text-xs">{otherInitials}</AvatarFallback>
                </Avatar>
              )}

              <div
                className={cn(
                  "max-w-[70%] rounded-2xl px-4 py-2",
                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                )}
              >
                <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1 text-[10px]",
                    isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                >
                  <span>
                    {new Date(message.createdAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  {isOwn && message.readAt && <span className="ml-1">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
