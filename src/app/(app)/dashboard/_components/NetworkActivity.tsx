"use client";
import {
  Briefcase,
  Building2,
  Heart,
  MapPin,
  MessageCircle,
  Plus,
  Star,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

const fetcher = async (u: string) => {
  try {
    const r = await fetch(u);
    if (!r.ok) return { likes: 0, comments: 0 };
    const json = await r.json();
    return json || { likes: 0, comments: 0 };
  } catch {
    return { likes: 0, comments: 0 };
  }
};

const profileFetcher = async (u: string) => {
  try {
    const r = await fetch(u);
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};

export default function NetworkActivity() {
  const { data, isLoading } = useSWR("/api/me/network-metrics", fetcher);
  const { data: profileData, isLoading: profileLoading } = useSWR(
    "/api/trades/profile/me",
    profileFetcher
  );

  const hasTradeProfile = profileData?.profile?.id;
  const profile = profileData?.profile;
  const hasActivity = (data?.likes ?? 0) > 0 || (data?.comments ?? 0) > 0;

  return (
    <div className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white to-slate-50 p-6 shadow-xl backdrop-blur-sm transition-all hover:shadow-2xl dark:border-slate-700/50 dark:from-slate-900 dark:to-slate-800">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Network Activity
        </h3>
        {hasTradeProfile && (
          <Link
            href="/network/trades"
            className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
          >
            View Network
          </Link>
        )}
      </div>

      {isLoading || profileLoading ? (
        <div className="space-y-3">
          <div className="h-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="h-8 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
        </div>
      ) : !hasTradeProfile ? (
        // Setup Trade Profile CTA
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 dark:border-amber-800 dark:from-amber-900/20 dark:to-yellow-900/20">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                <Briefcase className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-200">
                  Set Up Your Trade Profile
                </p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Create your contractor profile to connect with other pros and receive job
                  opportunities.
                </p>
              </div>
            </div>
            <Link
              href="/trades/setup"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-amber-700 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Create Trade Profile
            </Link>
          </div>
        </div>
      ) : (
        // Has profile - show mini card + activity
        <div className="space-y-4">
          {/* Mini Trade Profile Card */}
          <Link
            href="/trades/profile"
            className="block rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
                {profile?.avatar || profile?.profilePhoto ? (
                  <Image
                    src={profile.avatar || profile.profilePhoto}
                    alt={profile.firstName || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                    {(profile?.firstName?.[0] || "P").toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900 dark:text-white">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                  {profile?.tradeType || profile?.title || "Trade Professional"}
                </p>
                {(profile?.city || profile?.state) && (
                  <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {[profile.city, profile.state].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>

              {/* Company badge */}
              {profile?.companyName && (
                <div className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 dark:bg-blue-900/30">
                  <Building2 className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {profile.companyName.length > 15
                      ? profile.companyName.substring(0, 15) + "..."
                      : profile.companyName}
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Activity Metrics */}
          {hasActivity ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50 p-4 shadow-sm dark:border-pink-900/30 dark:from-pink-900/10 dark:to-rose-900/10">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                  <Heart className="h-5 w-5" />
                  <span className="text-sm font-medium">Likes</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-pink-700 dark:text-pink-300">
                  {data?.likes ?? 0}
                </p>
              </div>

              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-sm dark:border-blue-900/30 dark:from-blue-900/10 dark:to-indigo-900/10">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Comments</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {data?.comments ?? 0}
                </p>
              </div>
            </div>
          ) : (
            // No activity yet - show engage CTA
            <div className="text-center">
              <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                Start engaging with the network to see your activity stats here.
              </p>
              <Link
                href="/network/trades"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Star className="h-4 w-4" />
                Explore Network
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
