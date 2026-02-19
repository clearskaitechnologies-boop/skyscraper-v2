"use client";

import { logger } from "@/lib/logger";
import { Globe, Heart, Loader2, MessageCircle, Share2, Users } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import PortalPageHero from "@/components/portal/portal-page-hero";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CommunityPost {
  id: string;
  type: string;
  content: string;
  author: { id: string; name: string; avatar: string | null };
  contractor?: { name: string; trade: string } | null;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export default function CommunityFeedPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts(pageNum = 1) {
    try {
      const res = await fetch(`/api/portal/community/feed?limit=20&page=${pageNum}`);
      if (res.ok) {
        const data = await res.json();
        const newPosts = data.posts || [];
        if (pageNum === 1) {
          setPosts(newPosts);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
        }
        setHasMore(newPosts.length >= 20);
      }
    } catch (error) {
      logger.error("Failed to fetch community posts:", error);
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  }

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  }, [page]);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading community feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PortalPageHero
        title="Community Feed"
        subtitle="See what your neighbors and local pros are sharing. Reviews, project updates, and community discussions."
        icon={Globe}
        badge="Community"
        gradient="emerald"
        stats={[{ label: "Posts", value: posts.length }]}
      />

      {posts.length === 0 ? (
        <Card className="border-2 border-dashed bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-900/10 dark:to-slate-900">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-semibold dark:text-white">No community posts yet</h3>
            <p className="mb-6 max-w-md text-slate-500 dark:text-slate-400">
              Be the first to share! Post project updates, leave reviews, or start a discussion in
              the community.
            </p>
            <Link href="/portal/feed">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600">
                Go to Activity Feed
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="transition-all hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    {post.author.avatar && <AvatarImage src={post.author.avatar} />}
                    <AvatarFallback className="bg-emerald-100 text-xs text-emerald-700">
                      {post.author.name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {post.author.name}
                      </span>
                      {post.contractor && (
                        <Badge variant="outline" className="text-xs">
                          reviewed {post.contractor.name}
                        </Badge>
                      )}
                      <span className="text-xs text-slate-400">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                      {post.content.split(/(@\w+)/g).map((part, i) =>
                        part.startsWith("@") ? (
                          <span key={i} className="font-semibold text-emerald-600">
                            {part}
                          </span>
                        ) : (
                          <span key={i}>{part}</span>
                        )
                      )}
                    </p>
                    <div className="mt-3 flex gap-4">
                      <button
                        disabled
                        title="Coming soon"
                        className="flex cursor-not-allowed items-center gap-1 text-xs text-slate-300"
                      >
                        <Heart
                          className={`h-3.5 w-3.5 ${post.isLiked ? "fill-red-500 text-red-500" : ""}`}
                        />
                        {post.likes || 0}
                      </button>
                      <button
                        disabled
                        title="Coming soon"
                        className="flex cursor-not-allowed items-center gap-1 text-xs text-slate-300"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        {post.comments || 0}
                      </button>
                      <button
                        disabled
                        title="Coming soon"
                        className="flex cursor-not-allowed items-center gap-1 text-xs text-slate-300"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={loadMore}>
                Load More Posts
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
