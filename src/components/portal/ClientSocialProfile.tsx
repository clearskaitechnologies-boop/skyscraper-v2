/**
 * Client Social Profile Component
 * Beautiful social-like profile matching the Trades Pro design
 * Facebook/LinkedIn-style with cover photo, avatar, bio, posts, connections
 */

"use client";

import { useUser } from "@clerk/nextjs";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  Edit,
  Heart,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Share2,
  Star,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface ClientProfile {
  id?: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  bio?: string;
  category: string;
  avatarUrl?: string | null;
  coverPhotoUrl?: string | null;
  propertyPhotos?: string[];
  verified?: boolean;
  onboardingComplete?: boolean;
  connectionCount?: number;
  reviewCount?: number;
  projectCount?: number;
}

interface Post {
  id: string;
  type: string;
  content: string;
  images?: string[];
  contractor?: {
    id: string;
    name: string;
    trade?: string;
    logo?: string;
  };
  rating?: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface ClientSocialProfileProps {
  profile: ClientProfile;
  isOwnProfile: boolean;
  onProfileUpdate?: (profile: ClientProfile) => void;
}

export default function ClientSocialProfile({
  profile,
  isOwnProfile,
  onProfileUpdate,
}: ClientSocialProfileProps) {
  const { user } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatarUrl || null);
  const [coverUrl, setCoverUrl] = useState<string | null>(profile.coverPhotoUrl || null);
  const [uploading, setUploading] = useState<"avatar" | "cover" | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  // Post composer
  const [showPostComposer, setShowPostComposer] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const postImageInputRef = useRef<HTMLInputElement>(null);

  const displayName =
    profile.displayName ||
    `${profile.firstName} ${profile.lastName}`.trim() ||
    profile.email.split("@")[0];
  const initials =
    (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "") ||
    profile.email?.[0]?.toUpperCase() ||
    "C";
  const locationString = [profile.city, profile.state].filter(Boolean).join(", ");

  // Load posts
  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch("/api/portal/posts");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading("avatar");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "avatar");

      const res = await fetch("/api/portal/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setAvatarUrl(url);
      onProfileUpdate?.({ ...profile, avatarUrl: url });
      toast.success("Profile photo updated!");
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(null);
    }
  };

  // Handle cover upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image must be less than 10MB");
      return;
    }

    setUploading("cover");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "cover");

      const res = await fetch("/api/portal/upload-photo", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setCoverUrl(url);
      onProfileUpdate?.({ ...profile, coverPhotoUrl: url });
      toast.success("Cover photo updated!");
    } catch (error) {
      toast.error("Failed to upload cover photo");
    } finally {
      setUploading(null);
    }
  };

  // Handle creating a post
  const handleCreatePost = async () => {
    if (!postContent.trim()) {
      toast.error("Please write something to share");
      return;
    }

    setPosting(true);
    try {
      const res = await fetch("/api/portal/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update",
          content: postContent,
          images: postImages,
        }),
      });

      if (!res.ok) throw new Error("Failed to create post");

      const { post } = await res.json();
      setPosts((prev) => [
        {
          id: post.id,
          type: post.type,
          content: post.content,
          images: post.images || [],
          likeCount: 0,
          commentCount: 0,
          isLiked: false,
          createdAt: post.createdAt,
        },
        ...prev,
      ]);

      setPostContent("");
      setPostImages([]);
      setShowPostComposer(false);
      toast.success("Post shared!");
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  // Handle like
  const handleLike = async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );

    try {
      await fetch("/api/portal/posts/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
    } catch (error) {
      // Revert on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likeCount: p.isLiked ? p.likeCount + 1 : p.likeCount - 1,
              }
            : p
        )
      );
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return then.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/20">
      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload avatar"
        className="hidden"
        onChange={handleAvatarUpload}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        aria-label="Upload cover photo"
        className="hidden"
        onChange={handleCoverUpload}
      />
      <input
        ref={postImageInputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="Upload post images"
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            // Handle image upload for posts
            Array.from(files).forEach((file) => {
              const reader = new FileReader();
              reader.onloadend = () => {
                setPostImages((prev) => [...prev, reader.result as string]);
              };
              reader.readAsDataURL(file);
            });
          }
        }}
      />

      {/* Cover Photo */}
      <div className="relative h-48 overflow-hidden rounded-t-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 md:h-64">
        {coverUrl && <Image src={coverUrl} alt="Cover" fill className="object-cover" priority />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {isOwnProfile && (
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={uploading === "cover"}
            className="absolute right-4 top-4 rounded-lg bg-black/40 px-3 py-2 text-sm text-white backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-50"
          >
            {uploading === "cover" ? (
              <>Uploading...</>
            ) : (
              <>
                <Camera className="mr-2 inline h-4 w-4" />
                Edit Cover
              </>
            )}
          </button>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-12">
        {/* Profile Header */}
        <div className="-mt-16 mb-6 flex flex-col gap-6 md:-mt-20 md:flex-row md:items-end md:gap-8">
          {/* Avatar */}
          <div className="relative z-10">
            <div className="h-32 w-32 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl md:h-40 md:w-40">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white md:text-5xl">
                  {initials}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploading === "avatar"}
                className="absolute -bottom-2 -right-2 rounded-full bg-white p-2 shadow-lg transition hover:scale-110 disabled:opacity-50"
              >
                {uploading === "avatar" ? (
                  <Upload className="h-4 w-4 animate-pulse text-emerald-600" />
                ) : (
                  <Camera className="h-4 w-4 text-slate-600" />
                )}
              </button>
            )}
          </div>

          {/* Name & Info */}
          <div className="flex-1 pt-4 md:pt-0">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-slate-900">{displayName}</h1>
              {profile.verified && (
                <Badge className="bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verified
                </Badge>
              )}
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-4 text-slate-600">
              {profile.category && (
                <span className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  {profile.category}
                </span>
              )}
              {locationString && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {locationString}
                </span>
              )}
            </div>

            {/* Bio */}
            {profile.bio && <p className="mb-4 max-w-2xl text-slate-600">{profile.bio}</p>}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="text-center">
                <span className="block text-xl font-bold text-slate-900">
                  {profile.connectionCount || 0}
                </span>
                <span className="text-slate-500">Connections</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold text-slate-900">
                  {profile.reviewCount || 0}
                </span>
                <span className="text-slate-500">Reviews</span>
              </div>
              <div className="text-center">
                <span className="block text-xl font-bold text-slate-900">
                  {profile.projectCount || 0}
                </span>
                <span className="text-slate-500">Projects</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {isOwnProfile ? (
              <>
                <Link href="/portal/profile">
                  <Button variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowPostComposer(true)}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </>
            ) : (
              <>
                <Button className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700">
                  <UserPlus className="h-4 w-4" />
                  Connect
                </Button>
                <Button variant="outline" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-xl bg-white p-1 dark:bg-slate-800">
            <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-white">
              Posts
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-white">
              Reviews
            </TabsTrigger>
            <TabsTrigger value="photos" className="rounded-lg data-[state=active]:bg-white">
              Photos
            </TabsTrigger>
            <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-white">
              About
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Feed */}
              <div className="space-y-6 lg:col-span-2">
                {/* Post Composer */}
                {isOwnProfile && (
                  <Card>
                    <CardContent className="p-4">
                      {showPostComposer ? (
                        <div className="space-y-4">
                          <Textarea
                            placeholder="What's on your mind?"
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                          {postImages.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {postImages.map((img, i) => (
                                <div key={i} className="relative h-20 w-20">
                                  <Image
                                    src={img}
                                    alt=""
                                    fill
                                    className="rounded-lg object-cover"
                                  />
                                  <button
                                    onClick={() =>
                                      setPostImages((prev) => prev.filter((_, j) => j !== i))
                                    }
                                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => postImageInputRef.current?.click()}
                              className="flex items-center gap-2 text-sm text-slate-600 hover:text-emerald-600"
                            >
                              <ImageIcon className="h-5 w-5" />
                              Add Photo
                            </button>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setShowPostComposer(false);
                                  setPostContent("");
                                  setPostImages([]);
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleCreatePost}
                                disabled={posting || !postContent.trim()}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowPostComposer(true)}
                          className="flex w-full items-center gap-3 rounded-lg bg-slate-50 p-3 text-left text-slate-500 transition hover:bg-slate-100"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200">
                            {avatarUrl ? (
                              <Image
                                src={avatarUrl}
                                alt=""
                                width={40}
                                height={40}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold">{initials}</span>
                            )}
                          </div>
                          What&apos;s on your mind?
                        </button>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Posts Feed */}
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="py-12 text-center">
                    <p className="text-slate-500">No posts yet</p>
                    {isOwnProfile && (
                      <Button
                        variant="link"
                        onClick={() => setShowPostComposer(true)}
                        className="mt-2"
                      >
                        Share your first update
                      </Button>
                    )}
                  </Card>
                ) : (
                  posts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        {/* Post Header */}
                        <div className="mb-3 flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-full bg-emerald-100">
                              {avatarUrl ? (
                                <Image
                                  src={avatarUrl}
                                  alt=""
                                  width={40}
                                  height={40}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center font-semibold text-emerald-600">
                                  {initials}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{displayName}</p>
                              <p className="text-xs text-slate-500">
                                {formatTimeAgo(post.createdAt)}
                                {post.type === "review" && " • Left a review"}
                              </p>
                            </div>
                          </div>
                          <button
                            aria-label="More options"
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Contractor Badge (if review) */}
                        {post.contractor && (
                          <div className="mb-3 flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                              <Briefcase className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{post.contractor.name}</p>
                              {post.contractor.trade && (
                                <p className="text-xs text-slate-500">{post.contractor.trade}</p>
                              )}
                            </div>
                            {post.rating && (
                              <div className="ml-auto flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`h-4 w-4 ${
                                      s <= post.rating!
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content */}
                        <p className="mb-3 whitespace-pre-wrap text-slate-700">{post.content}</p>

                        {/* Images */}
                        {post.images && post.images.length > 0 && (
                          <div className="mb-3 grid gap-2">
                            {post.images.slice(0, 4).map((img, i) => (
                              <div
                                key={i}
                                className="relative aspect-video overflow-hidden rounded-lg"
                              >
                                <Image src={img} alt="" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-4 border-t border-slate-100 pt-3">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center gap-2 ${
                              post.isLiked ? "text-red-500" : "text-slate-500 hover:text-red-500"
                            }`}
                          >
                            <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                            <span className="text-sm">{post.likeCount}</span>
                          </button>
                          <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600">
                            <MessageCircle className="h-5 w-5" />
                            <span className="text-sm">{post.commentCount}</span>
                          </button>
                          <button
                            aria-label="Share post"
                            className="flex items-center gap-2 text-slate-500 hover:text-blue-600"
                          >
                            <Share2 className="h-5 w-5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Links */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link
                      href="/portal/find-a-pro"
                      className="flex items-center gap-3 rounded-lg p-2 text-slate-600 transition hover:bg-slate-50"
                    >
                      <Users className="h-5 w-5" />
                      Find a Pro
                    </Link>
                    <Link
                      href="/portal/my-claims"
                      className="flex items-center gap-3 rounded-lg p-2 text-slate-600 transition hover:bg-slate-50"
                    >
                      <Briefcase className="h-5 w-5" />
                      My Claims
                    </Link>
                    <Link
                      href="/portal/messages"
                      className="flex items-center gap-3 rounded-lg p-2 text-slate-600 transition hover:bg-slate-50"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Messages
                    </Link>
                  </CardContent>
                </Card>

                {/* Suggested Pros */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Suggested Pros</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                      Connect with verified contractors in your area
                    </p>
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Link href="/portal/find-a-pro">Browse Pros</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card className="py-12 text-center">
              <Star className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-slate-500">No reviews yet</p>
              <p className="mt-2 text-sm text-slate-400">
                Reviews you leave for contractors will appear here
              </p>
            </Card>
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos">
            {profile.propertyPhotos && profile.propertyPhotos.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {profile.propertyPhotos.map((photo, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg">
                    <Image src={photo} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="py-12 text-center">
                <ImageIcon className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">No photos yet</p>
                {isOwnProfile && (
                  <Button variant="link" className="mt-2">
                    Upload your first photo
                  </Button>
                )}
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.email && (
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  )}
                  {profile.phone && (
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  )}
                  {profile.address && (
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium">
                        {profile.address}
                        {profile.city && `, ${profile.city}`}
                        {profile.state && `, ${profile.state}`}
                        {profile.zip && ` ${profile.zip}`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.bio ? (
                    <p className="text-slate-600">{profile.bio}</p>
                  ) : (
                    <p className="text-slate-400">No bio added yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
