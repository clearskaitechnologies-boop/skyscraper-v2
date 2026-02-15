/**
 * Group Actions Component
 * Handles join/leave actions for groups
 */

"use client";

import { Check, Loader2, LogOut, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GroupActionsProps {
  groupId: string;
  isMember: boolean;
  membership: {
    role: string;
    status: string;
  } | null;
}

export default function GroupActions({ groupId, isMember, membership }: GroupActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trades/groups/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });

      if (res.ok) {
        toast.success("Joined group!");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to join group");
      }
    } catch {
      toast.error("Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this group?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/trades/groups/members?groupId=${groupId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Left group");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to leave group");
      }
    } catch {
      toast.error("Failed to leave group");
    } finally {
      setLoading(false);
    }
  };

  if (!membership && !isMember) {
    return (
      <Button onClick={handleJoin} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )}
        Join Group
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          )}
          Joined
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLeave} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Leave Group
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
