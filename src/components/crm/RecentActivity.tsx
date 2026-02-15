import { formatDistanceToNow } from "date-fns";

import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export async function RecentActivity() {
  const { orgId } = await getCurrentUserPermissions();

  if (!orgId) {
    return null;
  }

  const activities = await prisma.activities.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      projects: {
        select: {
          title: true,
          properties: {
            select: {
              street: true,
              city: true,
            },
          },
        },
      },
      contacts: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "stage_change":
        return "🔄";
      case "inspection_completed":
        return "✅";
      case "estimate_sent":
        return "📊";
      case "claim_approved":
        return "🎉";
      case "call":
        return "📞";
      case "email":
        return "📧";
      case "note":
        return "📝";
      case "task":
        return "✅";
      case "meeting":
        return "🤝";
      case "ai_action":
        return "🤖";
      default:
        return "📌";
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "stage_change":
        return "text-blue-600 bg-blue-50";
      case "inspection_completed":
        return "text-green-600 bg-green-50";
      case "estimate_sent":
        return "text-purple-600 bg-purple-50";
      case "claim_approved":
        return "text-emerald-600 bg-emerald-50";
      case "call":
        return "text-orange-600 bg-orange-50";
      case "email":
        return "text-indigo-600 bg-indigo-50";
      case "note":
        return "text-gray-600 bg-gray-50";
      case "task":
        return "text-teal-600 bg-teal-50";
      case "meeting":
        return "text-pink-600 bg-pink-50";
      case "ai_action":
        return "text-violet-600 bg-violet-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="border-b p-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <p className="text-sm text-gray-500">Latest updates across your projects</p>
      </div>

      <div className="p-6 pb-8">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <div className="mb-2 text-4xl text-gray-400">📭</div>
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400">
              Activity will appear here as you work on projects
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {activity.description && (
                    <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                  )}

                  <div className="mt-1 flex items-center space-x-2">
                    {activity.projects && (
                      <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {activity.projects.title}
                      </span>
                    )}

                    {activity.contacts && (
                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                        {activity.contacts.firstName} {activity.contacts.lastName}
                      </span>
                    )}

                    <span className="text-xs text-gray-500">by {activity.userName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activities.length > 0 && (
          <div className="mt-8 border-t pt-4 text-center">
            <a
              href="/activity"
              className="inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View all activity →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
