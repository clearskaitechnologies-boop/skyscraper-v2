"use client";

import { Heart } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface FollowButtonProps {
  partnerId: string;
  clientId: string;
  initialFollowing: boolean;
}

export default function FollowButton({ partnerId, clientId, initialFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client-follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: partnerId, action: isFollowing ? "unfollow" : "follow" }),
      });

      if (res.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="gap-2"
    >
      <Heart className={`h-4 w-4 ${isFollowing ? "fill-current" : ""}`} />
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
}
