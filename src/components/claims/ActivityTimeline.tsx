"use client";

import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type Activity = {
  id: string;
  type: "status_change" | "upload" | "assignment" | "comment" | "supplement";
  description: string;
  userId: string;
  userName: string;
  createdAt: Date;
  metadata?: Record<string, any>;
};

type Props = {
  claimId: string;
  organizationId: string;
};

export function ActivityTimeline({ claimId, organizationId }: Props) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    fetchActivities();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`claim:${claimId}:activities`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "claim_activities",
          filter: `claim_id=eq.${claimId}`,
        },
        (payload) => {
          console.log("Activity change:", payload);

          if (payload.eventType === "INSERT") {
            const newActivity = transformActivity(payload.new);
            setActivities((prev) => [newActivity, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedActivity = transformActivity(payload.new);
            setActivities((prev) =>
              prev.map((a) => (a.id === updatedActivity.id ? updatedActivity : a))
            );
          } else if (payload.eventType === "DELETE") {
            setActivities((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime connection status:", status);
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [claimId]);

  async function fetchActivities() {
    const supabase = createClient();

    // Fetch from claim_activities table (you may need to create this or use existing activities relation)
    const result = await supabase.from("claim_activities").select("*");

    // Stub client doesn't support full chaining; use result directly
    const { data, error } = result as any;

    if (error) {
      console.error("Error fetching activities:", error);
      return;
    }

    setActivities((data || []).map(transformActivity));
  }

  function transformActivity(raw: any): Activity {
    return {
      id: raw.id,
      type: raw.activity_type || "status_change",
      description: raw.description,
      userId: raw.userId,
      userName: raw.user_name || "Unknown User",
      createdAt: new Date(raw.created_at),
      metadata: raw.metadata,
    };
  }

  function getActivityIcon(type: Activity["type"]) {
    switch (type) {
      case "status_change":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
            <svg
              className="h-4 w-4 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
      case "upload":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-4 w-4 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        );
      case "assignment":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
            <svg
              className="h-4 w-4 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        );
      case "comment":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-4 w-4 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
        );
      case "supplement":
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100">
            <svg
              className="h-4 w-4 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
            <svg
              className="h-4 w-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        );
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity Timeline</h3>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-sm text-gray-600">{isConnected ? "Live" : "Connecting..."}</span>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <p className="text-gray-600">No activities yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-4">
              <div className="relative flex flex-col items-center">
                {getActivityIcon(activity.type)}
                {index < activities.length - 1 && <div className="mt-2 h-full w-0.5 bg-gray-200" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{activity.userName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(activity.createdAt, { addSuffix: true })}</span>
                  </div>
                  {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                    <div className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
                      {JSON.stringify(activity.metadata, null, 2)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
