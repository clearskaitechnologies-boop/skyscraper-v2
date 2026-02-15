import { getCurrentUserPermissions } from "@/lib/permissions";
import prisma from "@/lib/prisma";

// Prisma singleton imported from @/lib/db/prisma

export async function StatsCards() {
  const { orgId } = await getCurrentUserPermissions();

  if (!orgId) {
    return null;
  }

  // Get stats in parallel
  const [leadsCount, projectsCount, claimsCount, tokensRemaining, activeTasksCount] =
    await Promise.all([
      prisma.leads.count({
        where: { orgId, stage: { in: ["new", "qualified"] } },
      }),
      prisma.projects.count({
        where: { orgId, status: { notIn: ["PAID", "WARRANTY"] } },
      }),
      prisma.claims.count({
        where: { orgId, status: { in: ["new", "inspected", "scoped"] } },
      }),
      prisma.tokenWallet
        .findUnique({
          where: { orgId },
          select: { aiRemaining: true },
        })
        .then((wallet) => wallet?.aiRemaining || 0),
      prisma.tasks.count({
        where: {
          orgId,
          status: { in: ["TODO", "IN_PROGRESS"] },
          dueAt: { lte: new Date() },
        },
      }),
    ]);

  const stats = [
    {
      title: "Active Leads",
      value: leadsCount,
      description: "New & qualified leads",
      color: "blue",
      icon: "👥",
    },
    {
      title: "Projects",
      value: projectsCount,
      description: "In progress",
      color: "green",
      icon: "🏗️",
    },
    {
      title: "Claims",
      value: claimsCount,
      description: "Under review",
      color: "orange",
      icon: "📋",
    },
    {
      title: "Tokens Left",
      value: tokensRemaining,
      description: "AI operations",
      color: "purple",
      icon: "🎯",
    },
    {
      title: "Tasks Due",
      value: activeTasksCount,
      description: "Overdue or due today",
      color: "red",
      icon: "⏰",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      {stats.map((stat) => (
        <div key={stat.title} className="rounded-lg border bg-white p-4 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.description}</p>
            </div>
            <div className="text-2xl">{stat.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
