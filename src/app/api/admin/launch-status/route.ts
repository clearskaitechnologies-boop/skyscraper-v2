import { clerkClient } from "@clerk/nextjs/server";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

import { safeOrgContext } from "@/lib/safeOrgContext";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const ctx = await safeOrgContext();
    if (ctx.status !== "ok" || !ctx.userId) {
      return NextResponse.json({ error: ctx.reason || "Unauthorized" }, { status: 401 });
    }
    const { userId } = ctx;

    // Verify admin role from Clerk metadata
    const clerkUser = await clerkClient().users.getUser(userId);
    const isAdmin = clerkUser.publicMetadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const launchTimeEnv = process.env.NEXT_PUBLIC_SUBSCRIPTIONS_OPEN_AT;
    const forceOpenEnv = process.env.SUBSCRIPTIONS_FORCE_OPEN === "true";

    let launchTime: string | null = null;
    let isOpen = forceOpenEnv;
    let countdown = "";

    if (launchTimeEnv) {
      const parsed = Date.parse(launchTimeEnv);
      if (!isNaN(parsed)) {
        launchTime = new Date(parsed).toISOString();
        const remaining = parsed - Date.now();

        if (remaining <= 0 || forceOpenEnv) {
          isOpen = true;
          countdown = "Launch time reached";
        } else {
          const s = Math.floor(remaining / 1000);
          const d = Math.floor(s / 86400);
          const h = Math.floor((s % 86400) / 3600);
          const m = Math.floor((s % 3600) / 60);
          const sec = s % 60;
          countdown = `${d}d ${h}h ${m}m ${sec}s remaining`;
        }
      }
    }

    // Mock recent activity data (in production, you'd query your logs/database)
    const activity = {
      checkoutBlocks: [
        {
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          ip: "192.168.1.100",
          route: "/api/billing/checkout",
        },
        {
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          ip: "10.0.0.25",
          route: "/api/checkout",
        },
      ],
      feedbackBonuses: [
        {
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          email: "user@example.com",
          tokensAdded: 10,
        },
        {
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          email: "beta@tester.com",
          tokensAdded: 10,
        },
      ],
    };

    return NextResponse.json({
      status: {
        launchTime,
        isOpen,
        countdown,
        forceOpen: forceOpenEnv,
      },
      activity,
    });
  } catch (error) {
    logger.error("Launch status error:", error);
    return NextResponse.json({ error: "Failed to get launch status" }, { status: 500 });
  }
}
