"use client";
import { card, glow } from "@/lib/theme";

type Activity = {
  id: string;
  type: string;
  message: string | null;
  createdAt: Date;
  user?: {
    id: string;
    email?: string | null;
  };
};

export default function ClaimActivity({ activities = [] }: { activities: Activity[] }) {
  const activityIcons: Record<string, string> = {
    STATUS_CHANGE: "🔄",
    SUPPLEMENT_ADDED: "📊",
    PAYMENT_RECEIVED: "💰",
    NOTE: "📝",
    FILE_UPLOADED: "📎",
    MESSAGE_SENT: "💬",
  };

  const groupByDate = (activities: Activity[]) => {
    const groups: Record<string, Activity[]> = {};
    activities.forEach((activity) => {
      const date = new Date(activity.createdAt).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    return Object.entries(groups).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    );
  };

  const grouped = groupByDate(activities);

  return (
    <div className={`${card} ${glow}`}>
      <h3 className="mb-4 text-lg font-semibold text-[color:var(--text)]">
        Activity Timeline
      </h3>

      {activities.length === 0 ? (
        <p className="text-sm italic text-[color:var(--muted)]">
          No activity yet. Actions will appear here as they happen.
        </p>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, dateActivities]) => (
            <div key={date}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--muted)]">
                {date}
              </div>
              <div className="space-y-3">
                {dateActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex gap-3 border-b border-[color:var(--border)] pb-3 last:border-0"
                  >
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-lg">
                      {activityIcons[activity.type] || "•"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-[color:var(--text)]">
                        {activity.message || "No message"}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-[color:var(--muted)]">
                        <span>
                          {new Date(activity.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {activity.user?.email && (
                          <>
                            <span>•</span>
                            <span>{activity.user.email}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
